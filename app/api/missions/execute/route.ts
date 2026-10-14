export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { verifyBearerToken } from "@/lib/local-auth";
import { verifyApprovalToken } from "@/lib/orchestrator/approval";
import { executeApprovedTool } from "@/lib/orchestrator/executor";
import { verifyToolResult } from "@/lib/orchestrator/verification";
import type { MissionAction, MissionRecord, MissionStatus } from "@/lib/orchestrator/mission";

export async function POST(req: Request) {
  let ownerId = "", missionId = "";
  try {
    const user = await verifyBearerToken(req); ownerId = user.uid;
    const body = await req.json();
    missionId = typeof body?.missionId === "string" ? body.missionId : "";
    const action = body?.action as MissionAction;
    const approvalToken = typeof body?.approvalToken === "string" ? body.approvalToken : "";
    if (!/^[A-Za-z0-9_-]{8,100}$/.test(missionId) || !["engineering.plan", "artifact.sha256"].includes(action) || !approvalToken) {
      return NextResponse.json({ error: "missionId, registered action, and approvalToken are required" }, { status: 400 });
    }

    const { mission, claims } = await db.$transaction(async tx => {
      const record = await tx.mission.findFirst({ where: { id: missionId, ownerId } });
      if (!record) throw new Error("Mission not found");
      const m = { ...record, plan: record.plan as string[], actions: record.actions as MissionAction[], approvalRequired: true } as unknown as MissionRecord;
      const tokenClaims = verifyApprovalToken(approvalToken, { uid: ownerId, missionId, planHash: m.planHash, action });
      if (!m.approvalId) throw new Error("Mission has no approval record");
      const approval = await tx.approval.findFirst({ where: { id: m.approvalId, ownerId, missionId } });
      if (!approval || approval.status !== "approved" || approval.tokenJti !== tokenClaims.jti ||
          !approval.tokenExpiresAt || approval.tokenExpiresAt <= Date.now() || approval.usedAt !== null ||
          approval.planHash !== m.planHash || JSON.stringify(approval.actions) !== JSON.stringify(m.actions)) {
        throw new Error("Approval token is invalid, expired, already used, or out of scope");
      }
      if (m.status !== "approved") throw new Error("Mission must be approved before execution");
      const consumed = await tx.approval.updateMany({ where: { id: approval.id, status: "approved", tokenJti: tokenClaims.jti, usedAt: null }, data: { usedAt: Date.now(), status: "consumed" } });
      if (consumed.count !== 1) throw new Error("Approval token already used");
      const started = await tx.mission.updateMany({ where: { id: missionId, ownerId, status: "approved" }, data: { status: "running", updatedAt: Date.now() } });
      if (started.count !== 1) throw new Error("Mission state changed concurrently");
      return { mission: m, claims: tokenClaims };
    });

    let result: Awaited<ReturnType<typeof executeApprovedTool>>;
    let verification: ReturnType<typeof verifyToolResult>;
    try {
      result = await executeApprovedTool({ uid: ownerId, mission, action, approvalToken, toolInput: body?.toolInput ?? {} });
      verification = verifyToolResult(result, action);
    } catch (error) {
      await db.mission.updateMany({ where: { id: missionId, ownerId, status: "running" }, data: { status: "failed", updatedAt: Date.now() } });
      throw error;
    }
    const status: MissionStatus = verification.passed ? "verified" : "verification_failed";
    await db.$transaction(async tx => {
      await tx.mission.update({ where: { id: missionId }, data: {
        status, updatedAt: Date.now(), verifiedAt: verification.passed ? verification.completedAt : null,
        verification: verification as unknown as Prisma.InputJsonValue
      }});
      await tx.missionRun.create({ data: {
        ownerId, missionId, action, result: result as Prisma.InputJsonValue,
        verification: verification as unknown as Prisma.InputJsonValue,
        createdAt: Date.now(), executionMode: "bounded-in-process"
      }});
    });
    return NextResponse.json({ ok: verification.passed, missionId, status, result, verification });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Execution rejected";
    const status = /not found/i.test(message) ? 404 : /approval|scope|expired|already used|registered action|approved|concurrently/i.test(message) ? 403 : 503;
    return NextResponse.json({ error: status === 403 || status === 404 ? message : "Mission execution rejected safely" }, { status });
  }
}
