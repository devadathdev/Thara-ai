export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { verifyBearerToken } from "@/lib/firebase-admin";
import { DEFAULT_PERMISSIONS } from "@/lib/v4-autonomy";
import { createMissionRecord, isAllowedMissionTransition, type MissionRecord, type MissionStatus } from "@/lib/orchestrator/mission";

export async function GET(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const snapshot = await getFirestore().collection("users").doc(user.uid).collection("missions").orderBy("updatedAt", "desc").limit(50).get();
    return NextResponse.json({ ok: true, missions: snapshot.docs.map(doc => doc.data()), permissions: DEFAULT_PERMISSIONS });
  } catch (error) {
    console.error("mission_list_error", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Mission service unavailable" }, { status: 502 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const body = await req.json();
    if (typeof body?.goal !== "string" || !body.goal.trim() || body.goal.length > 4000) {
      return NextResponse.json({ error: "Mission goal must be 1–4000 characters" }, { status: 400 });
    }
    const mission = createMissionRecord(body);
    const db = getFirestore();
    await db.collection("users").doc(user.uid).collection("missions").doc(mission.id).create(mission);
    return NextResponse.json({ ok: true, mission }, { status: 201 });
  } catch (error) {
    console.error("mission_create_error", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Unable to create mission" }, { status: 502 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const body = await req.json();
    const id = typeof body?.id === "string" ? body.id : "";
    const target = body?.status as MissionStatus;
    if (!/^[A-Za-z0-9_-]{8,100}$/.test(id) || target !== "cancelled") {
      return NextResponse.json({ error: "Only explicit mission cancellation is available through this endpoint" }, { status: 400 });
    }
    const ref = getFirestore().collection("users").doc(user.uid).collection("missions").doc(id);
    const result = await getFirestore().runTransaction(async transaction => {
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists) throw new Error("Mission not found");
      const mission = snapshot.data() as MissionRecord;
      if (!isAllowedMissionTransition(mission.status, "cancelled")) throw new Error("Mission cannot be cancelled from its current state");
      transaction.update(ref, { status: "cancelled", updatedAt: Date.now() });
      return { id, status: "cancelled" };
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mission update failed";
    const status = /not found/i.test(message) ? 404 : /cannot be cancelled/i.test(message) ? 409 : 502;
    return NextResponse.json({ error: status === 502 ? "Unable to update mission" : message }, { status });
  }
}
