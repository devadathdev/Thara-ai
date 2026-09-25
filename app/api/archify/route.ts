import { NextRequest, NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/auth";
import { archifyCapabilities, archifyRuntimeStatus, tharaArchitectureSource } from "@/lib/archify";

export async function GET(request: NextRequest) {
  try {
    await verifyBearerToken(request);
    return NextResponse.json({
      ok: true,
      capability: archifyCapabilities(),
      runtime: archifyRuntimeStatus(),
      tharaArchitecture: tharaArchitectureSource(),
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await verifyBearerToken(request);
    const body = await request.json().catch(() => ({}));
    const type = body?.type ?? "architecture";

    if (!["architecture", "workflow", "sequence", "dataflow", "lifecycle"].includes(type)) {
      return NextResponse.json({ error: "Unsupported Archify diagram type" }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      diagramType: type,
      source: tharaArchitectureSource(),
      renderer: archifyRuntimeStatus(),
      message: "Archify specification accepted. Rendering is performed by the repository CI renderer; no live infrastructure is inferred.",
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
