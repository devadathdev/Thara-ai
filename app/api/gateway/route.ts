import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/local-auth";
import { hardwareGatewaySummary, listGatewayDevices, registerGatewayDevice, executeGatewayCommand } from "@/lib/hardware-gateway";
import { requireLineClearProof } from "@/lib/protected-auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await verifyBearerToken(req);
    return NextResponse.json({ ok: true, gateway: hardwareGatewaySummary(), devices: listGatewayDevices() });
  } catch {
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const body = await req.json();
    const action = body.action ?? "command";

    if (action === "register") {
      if (body.approval !== true) return NextResponse.json({ error: "Explicit gateway approval is required." }, { status: 403 });
      requireLineClearProof(req, "equipment-control", user.uid);
      const device = registerGatewayDevice({
        id: body.id,
        name: body.name,
        protocol: body.protocol,
        endpoint: body.endpoint,
        enabled: body.enabled !== false,
        simulation: body.simulation !== false
      });
      return NextResponse.json({ ok: true, device });
    }

    if (body.approval !== true) return NextResponse.json({ error: "Explicit gateway approval is required." }, { status: 403 });
    requireLineClearProof(req, "equipment-control", user.uid);

    const result = executeGatewayCommand(
      { ...body.command, requestedBy: user.uid },
      { approvalVerified: true, lineClearVerified: true, simulationOnly: body.simulationOnly !== false }
    );

    return NextResponse.json({ ok: result.status !== "rejected", result, gateway: hardwareGatewaySummary() }, { status: result.status === "rejected" ? 403 : 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gateway request failed" }, { status: 400 });
  }
}
