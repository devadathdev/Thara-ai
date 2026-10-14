export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyBearerToken } from "@/lib/local-auth";
const MAX_MEMORY = 4000;
const MAX_EVENT = 2000;
export async function GET(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const rows = await db.memory.findMany({ where: { ownerId: user.uid }, orderBy: { createdAt: "desc" }, take: 20 });
    return NextResponse.json({ ok: true, presence: "present", modes: ["Companion","Focus","Builder","Guardian","Workshop","Silent"], memories: rows.map(({ ownerId: _ownerId, ...m }) => m) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { console.error("companion_get_error", error); return NextResponse.json({ error: "Companion context unavailable" }, { status: 503 }); }
}
export async function POST(req: Request) {
  try {
    const user = await verifyBearerToken(req), body = await req.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const importance = Math.max(0, Math.min(1, Number(body.importance ?? 0.8)));
    if (!content || content.length > MAX_MEMORY) return NextResponse.json({ error: "Memory must be 1–4000 characters" }, { status: 400 });
    const createdAt = Date.now();
    const memory = await db.memory.create({ data: { ownerId: user.uid, content, importance: Number.isFinite(importance) ? importance : 0.8, createdAt } });
    const { ownerId: _ownerId, ...safeMemory } = memory;
    return NextResponse.json({ ok: true, memory: safeMemory }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { console.error("companion_memory_error", error); return NextResponse.json({ error: "Unable to save companion memory" }, { status: 503 }); }
}
export async function PUT(req: Request) {
  try {
    const user = await verifyBearerToken(req), body = await req.json();
    const type = typeof body.type === "string" ? body.type.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!type || !message || message.length > MAX_EVENT) return NextResponse.json({ error: "Invalid companion event" }, { status: 400 });
    await db.companionEvent.create({ data: { ownerId: user.uid, type: type.slice(0,80), message, createdAt: Date.now() } });
    return NextResponse.json({ ok: true });
  } catch (error) { console.error("companion_event_error", error); return NextResponse.json({ error: "Unable to record companion event" }, { status: 503 }); }
}
