export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    assistant: "THARA",
    timestamp: new Date().toISOString(),
    capabilities: ["voice", "command-routing", "security", "self-rewrite", "engineering-team", "workshop"],
    runtime: process.env.VERCEL ? "vercel" : "node",
  }, { headers: { "Cache-Control": "no-store" } });
}