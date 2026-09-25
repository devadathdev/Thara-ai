import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/firebase-admin";
import { planSatelliteAnalysis, satelliteIntelligenceCapabilities } from "@/lib/satellite-intelligence";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await verifyBearerToken(req);
    return NextResponse.json({ ok: true, feature: "satellite-intelligence", ...satelliteIntelligenceCapabilities() });
  } catch {
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await verifyBearerToken(req);
    const body = await req.json();
    const insight = planSatelliteAnalysis(body);
    return NextResponse.json({
      ok: true,
      insight,
      note: "This endpoint plans and analyzes external satellite data; it does not control satellites or spacecraft."
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Satellite analysis failed" }, { status: 400 });
  }
}
