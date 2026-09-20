export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/firebase-admin";
import { autonomousResearch } from "@/lib/research";

export async function POST(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const body = await req.json();
    const query = typeof body.query === "string" ? body.query.trim() : "";

    if (!query || query.length > 2000) {
      return NextResponse.json({ error: "Research query must be 1–2000 characters" }, { status: 400 });
    }

    const report = await autonomousResearch(query);

    return NextResponse.json({
      ok: true,
      user: user.uid,
      report,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("research_api_error", error);
    return NextResponse.json({ error: "Research service unavailable" }, { status: 502 });
  }
}
