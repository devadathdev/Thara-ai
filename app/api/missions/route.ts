export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { verifyBearerToken } from "@/lib/local-auth";
import { DEFAULT_PERMISSIONS } from "@/lib/v4-autonomy";
import { createMissionRecord, isAllowedMissionTransition, type MissionStatus } from "@/lib/orchestrator/mission";

export async function GET(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const missions = await db.mission.findMany({ where: { ownerId: user.uid }, orderBy: { updatedAt: "desc" }, take: 50 });
    return NextResponse.json({ ok: true, missions: missions.map(({ ownerId: _ownerId, ...m }) => ({ ...m, plan: m.plan, actions: m.actions, approvalRequired: true })), permissions: DEFAULT_PERMISSIONS }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("mission_list_error", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Mission service unavailable" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const body = await req.json();
    if (typeof body?.goal !== "string" || !body.goal.trim() || body.goal.length > 4000) return NextResponse.json({ error: "Mission goal must be 1–4000 characters" }, { status: 400 });
    const mission = createMissionRecord(body);
    await db.mission.create({ data: {
      id: mission.id, ownerId: user.uid, title: mission.title, goal: mission.goal,
      plan: mission.plan as Prisma.InputJsonValue, planHash: mission.planHash,
      actions: mission.actions as unknown as Prisma.InputJsonValue, status: mission.status,
      createdAt: mission.createdAt, updatedAt: mission.updatedAt
    }});
    return NextResponse.json({ ok: true, mission }, { status: 201 });
  } catch (error) {
    console.error("mission_create_error", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Unable to create mission" }, { status: 503 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const body = await req.json();
    const id = typeof body?.id === "string" ? body.id : "";
    const target = body?.status as MissionStatus;
    if (!/^[A-Za-z0-9_-]{8,100}$/.test(id) || target !== "cancelled") return NextResponse.json({ error: "Only explicit mission cancellation is available through this endpoint" }, { status: 400 });
    const result = await db.$transaction(async tx => {
      const mission = await tx.mission.findFirst({ where: { id, ownerId: user.uid } });
      if (!mission) throw new Error("Mission not found");
      if (!isAllowedMissionTransition(mission.status as MissionStatus, "cancelled")) throw new Error("Mission cannot be cancelled from its current state");
      const updated = await tx.mission.updateMany({ where: { id, ownerId: user.uid, status: mission.status }, data: { status: "cancelled", updatedAt: Date.now() } });
      if (updated.count !== 1) throw new Error("Mission changed concurrently; retry");
      return { id, status: "cancelled" };
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mission update failed";
    const status = /not found/i.test(message) ? 404 : /cannot be cancelled|concurrently/i.test(message) ? 409 : 503;
    return NextResponse.json({ error: status === 503 ? "Unable to update mission" : message }, { status });
  }
}
