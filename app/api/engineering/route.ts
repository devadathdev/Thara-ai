import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/local-auth";
import { ENGINEERING_TOOLS, ENGINEERING_WORKFLOWS, engineeringToolSummary } from "@/lib/engineering";
import { planEngineeringMission } from "@/lib/engineering-planner";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await verifyBearerToken(req);
    return NextResponse.json({
      ok: true,
      version: "1.0",
      categories: ["cad", "cae", "manufacturing", "industry4"],
      tools: ENGINEERING_TOOLS,
      workflows: ENGINEERING_WORKFLOWS,
      summary: engineeringToolSummary(),
    });
  } catch {
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const body = await req.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message || message.length > 4000) {
      return NextResponse.json({ error: "message must be 1–4000 characters" }, { status: 400 });
    }

    const mission = planEngineeringMission(message);

    return NextResponse.json({
      ok: true,
      userId: user.uid,
      mission,
      safety: {
        approvalRequired: true,
        machineControl: false,
        productionWrite: false,
        externalExecution: false,
      },
    });
  } catch {
    return NextResponse.json({ error: "Engineering workbench unavailable" }, { status: 502 });
  }
}
