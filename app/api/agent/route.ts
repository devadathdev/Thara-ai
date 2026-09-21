import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { verifyBearerToken } from "@/lib/firebase-admin";
import { executeMission, planMission, listTools } from "@/lib/agents/orchestrator";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await verifyBearerToken(req);
    return NextResponse.json({ ok: true, tools: listTools() });
  } catch {
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const body = await req.json();
    const goal = typeof body.goal === "string" ? body.goal.trim() : "";
    if (!goal || goal.length > 4000) return NextResponse.json({ error: "goal must be 1–4000 characters" }, { status: 400 });

    const plan = planMission(goal, Array.isArray(body.toolIds) ? body.toolIds : undefined);
    const approved = body.approved === true;
    const result = await executeMission(plan, { uid: user.uid, approved, traceId: randomUUID() });

    return NextResponse.json({ ok: true, mission: result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Agent service unavailable" }, { status: 502 });
  }
}
