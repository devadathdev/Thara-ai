import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyBearerToken } from "@/lib/local-auth";
import { requireLineClearProof } from "@/lib/protected-auth";
export const runtime = "nodejs";
export async function GET(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    requireLineClearProof(req, "private-memory", user.uid);
    const rows = await db.memory.findMany({ where: { ownerId: user.uid }, orderBy: { createdAt: "desc" }, take: 50 });
    return NextResponse.json({ ok: true, memories: rows.map(({ ownerId: _ownerId, ...m }) => m) }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Fingerprint Line Clear authentication required" }, { status: 401 }); }
}
