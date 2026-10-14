export const runtime = "nodejs";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { verifyBearerToken } from "@/lib/local-auth";
import { issueApprovalToken } from "@/lib/orchestrator/approval";
import type { MissionAction, MissionStatus } from "@/lib/orchestrator/mission";

export async function POST(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const body = await req.json();
    const action = body?.action === "approve" ? "approve" : body?.action === "request" ? "request" : null;
    const missionId = typeof body?.missionId === "string" ? body.missionId : "";
    if (!action || !/^[A-Za-z0-9_-]{8,100}$/.test(missionId)) return NextResponse.json({ error: "A valid action and missionId are required" }, { status: 400 });

    if (action === "request") {
      const outcome = await db.$transaction(async tx => {
        const mission = await tx.mission.findFirst({ where: { id: missionId, ownerId: user.uid } });
        if (!mission) throw new Error("Mission not found");
        if (!["awaiting_approval", "approved", "verification_failed", "failed"].includes(mission.status)) throw new Error("Mission is not eligible for a new approval request");
        const now = Date.now(), approvalId = randomUUID(), expiresAt = now + 30 * 60_000;
        await tx.approval.create({ data: {
          id: approvalId, ownerId: user.uid, missionId, planHash: mission.planHash,
          actions: mission.actions as Prisma.InputJsonValue, status: "pending",
          requestedBy: user.uid, requestedAt: now, expiresAt
        }});
        await tx.mission.update({ where: { id: missionId }, data: { approvalId, status: "awaiting_approval", updatedAt: now } });
        return { approvalId, status: "pending", expiresAt };
      });
      return NextResponse.json({ ok: true, ...outcome });
    }

    const issued = await db.$transaction(async tx => {
      const mission = await tx.mission.findFirst({ where: { id: missionId, ownerId: user.uid } });
      if (!mission) throw new Error("Mission not found");
      if (!mission.approvalId) throw new Error("Request approval before approving this mission");
      const approval = await tx.approval.findFirst({ where: { id: mission.approvalId, ownerId: user.uid, missionId } });
      if (!approval) throw new Error("Approval request not found");
      if (approval.status !== "pending" || approval.missionId !== mission.id || approval.planHash !== mission.planHash ||
          approval.expiresAt <= Date.now() || JSON.stringify(approval.actions) !== JSON.stringify(mission.actions)) {
        throw new Error("Approval request expired or no longer matches the mission plan");
      }
      const token = issueApprovalToken({ uid: user.uid, missionId: mission.id, planHash: mission.planHash, actions: mission.actions as MissionAction[] });
      const updated = await tx.approval.updateMany({ where: { id: approval.id, ownerId: user.uid, status: "pending", tokenJti: null }, data: {
        status: "approved", approvedBy: user.uid, approvedAt: Date.now(), tokenJti: token.claims.jti, tokenExpiresAt: token.expiresAt
      }});
      if (updated.count !== 1) throw new Error("Approval was changed concurrently; request a new approval");
      await tx.mission.update({ where: { id: missionId }, data: { status: "approved", updatedAt: Date.now() } });
      return token;
    });
    return NextResponse.json({ ok: true, missionId, status: "approved", approvalToken: issued.token, expiresAt: issued.expiresAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Approval rejected";
    const status = /not found/i.test(message) ? 404 : /eligible|expired|matches|concurrently|approval before/i.test(message) ? 409 : 503;
    console.error("mission_approval_error", message);
    return NextResponse.json({ error: status === 503 ? "Approval service unavailable; verify THARA_APPROVAL_SECRET is configured" : message }, { status });
  }
}
