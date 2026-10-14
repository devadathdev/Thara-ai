export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { verifyBearerToken } from "@/lib/firebase-admin";
import { verifyApprovalToken } from "@/lib/orchestrator/approval";
import { executeApprovedTool } from "@/lib/orchestrator/executor";
import { verifyToolResult } from "@/lib/orchestrator/verification";
import type { MissionAction, MissionRecord } from "@/lib/orchestrator/mission";

export async function POST(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const body = await req.json();
    const missionId = typeof body?.missionId === "string" ? body.missionId : "";
    const action = body?.action as MissionAction;
    const approvalToken = typeof body?.approvalToken === "string" ? body.approvalToken : "";
    if (!/^[A-Za-z0-9_-]{8,100}$/.test(missionId) || !["engineering.plan", "artifact.sha256"].includes(action) || !approvalToken) {
      return NextResponse.json({ error: "missionId, registered action, and approvalToken are required" }, { status: 400 });
    }

    const db = getFirestore();
    const userRef = db.collection("users").doc(user.uid);
    const missionRef = userRef.collection("missions").doc(missionId);
    const missionSnapshot = await missionRef.get();
    if (!missionSnapshot.exists) return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    const mission = missionSnapshot.data() as MissionRecord;
    const claims = verifyApprovalToken(approvalToken, { uid: user.uid, missionId, planHash: mission.planHash, action });
    if (!mission.approvalId) return NextResponse.json({ error: "Mission has no approval record" }, { status: 403 });

    const approvalRef = userRef.collection("approvals").doc(mission.approvalId);
    await db.runTransaction(async transaction => {
      const snapshot = await transaction.get(approvalRef);
      const approval = snapshot.data();
      if (!snapshot.exists || !approval || approval.status !== "approved" ||
          approval.tokenJti !== claims.jti || approval.tokenExpiresAt <= Date.now() ||
          approval.usedAt || approval.missionId !== missionId || approval.planHash !== mission.planHash) {
        throw new Error("Approval token is invalid, expired, already used, or out of scope");
      }
      transaction.update(approvalRef, { usedAt: Date.now(), status: "consumed" });
      transaction.update(missionRef, { status: "running", updatedAt: Date.now() });
    });

    const result = await executeApprovedTool({
      uid: user.uid, mission, action, approvalToken, toolInput: body?.toolInput ?? {}
    });
    const verification = verifyToolResult(result, action);
    const status = verification.passed ? "verified" : "verification_failed";
    await missionRef.update({
      status, updatedAt: Date.now(), verifiedAt: verification.passed ? verification.completedAt : null,
      verification: { ...verification, passed: verification.passed }
    });
    await userRef.collection("missionRuns").add({
      missionId, action, result, verification, createdAt: Date.now(), executionMode: "bounded-in-process"
    });
    return NextResponse.json({ ok: verification.passed, missionId, status, result, verification });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Execution rejected";
    const status = /not found/i.test(message) ? 404 : /approval|scope|expired|already used|registered action/i.test(message) ? 403 : 502;
    return NextResponse.json({ error: status === 403 ? message : "Mission execution rejected safely" }, { status });
  }
}
