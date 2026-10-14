export const runtime = "nodejs";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { verifyBearerToken } from "@/lib/firebase-admin";
import { issueApprovalToken } from "@/lib/orchestrator/approval";
import type { MissionRecord } from "@/lib/orchestrator/mission";

export async function POST(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const body = await req.json();
    const action = body?.action === "approve" ? "approve" : body?.action === "request" ? "request" : null;
    const missionId = typeof body?.missionId === "string" ? body.missionId : "";
    if (!action || !/^[A-Za-z0-9_-]{8,100}$/.test(missionId)) {
      return NextResponse.json({ error: "A valid action and missionId are required" }, { status: 400 });
    }

    const db = getFirestore();
    const missionRef = db.collection("users").doc(user.uid).collection("missions").doc(missionId);
    const missionSnapshot = await missionRef.get();
    if (!missionSnapshot.exists) return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    const mission = missionSnapshot.data() as MissionRecord;

    if (action === "request") {
      if (mission.status !== "awaiting_approval" && mission.status !== "approved" && mission.status !== "verification_failed" && mission.status !== "failed") {
        return NextResponse.json({ error: "Mission is not awaiting approval" }, { status: 409 });
      }
      const approvalId = randomUUID();
      const now = Date.now();
      await db.collection("users").doc(user.uid).collection("approvals").doc(approvalId).set({
        id: approvalId, missionId, planHash: mission.planHash, actions: mission.actions,
        status: "pending", requestedBy: user.uid, requestedAt: now, expiresAt: now + 30 * 60_000
      });
      await missionRef.update({ approvalId, status: "awaiting_approval", updatedAt: now });
      return NextResponse.json({ ok: true, approvalId, status: "pending", expiresAt: now + 30 * 60_000 });
    }

    if (!mission.approvalId) return NextResponse.json({ error: "Request approval before approving this mission" }, { status: 409 });
    const approvalRef = db.collection("users").doc(user.uid).collection("approvals").doc(mission.approvalId);
    const approvalSnapshot = await approvalRef.get();
    if (!approvalSnapshot.exists) return NextResponse.json({ error: "Approval request not found" }, { status: 404 });
    const approval = approvalSnapshot.data()!;
    if (approval.status !== "pending" || approval.missionId !== mission.id || approval.planHash !== mission.planHash ||
        approval.expiresAt <= Date.now() || JSON.stringify(approval.actions) !== JSON.stringify(mission.actions)) {
      return NextResponse.json({ error: "Approval request expired or no longer matches the mission plan" }, { status: 409 });
    }

    // This endpoint is the explicit approval action. The resulting token is
    // short-lived and bound to the current user, exact mission, plan hash, and actions.
    const issued = issueApprovalToken({ uid: user.uid, missionId: mission.id, planHash: mission.planHash, actions: mission.actions });
    await approvalRef.update({
      status: "approved", approvedBy: user.uid, approvedAt: Date.now(),
      tokenJti: issued.claims.jti, tokenExpiresAt: issued.expiresAt
    });
    await missionRef.update({ status: "approved", updatedAt: Date.now() });
    return NextResponse.json({ ok: true, missionId, status: "approved", approvalToken: issued.token, expiresAt: issued.expiresAt });
  } catch (error) {
    console.error("mission_approval_error", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Approval service unavailable; verify THARA_APPROVAL_SECRET is configured" }, { status: 503 });
  }
}
