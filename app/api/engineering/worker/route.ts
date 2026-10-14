import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/local-auth";
import { prepareEngineeringRun, type EngineeringRun } from "@/lib/engineering-worker";

export const runtime = "nodejs";

const tools = new Set<EngineeringRun["tool"]>(["openscad","freecad","openfoam","calculix"]);

export async function POST(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const body = await req.json();
    const tool = typeof body.tool === "string" ? body.tool as EngineeringRun["tool"] : null;
    if (!tool || !tools.has(tool)) return NextResponse.json({error:"Unsupported engineering tool"},{status:400});
    const input = body.input && typeof body.input === "object" ? body.input as Record<string,unknown> : {};
    const run = await prepareEngineeringRun(tool,input);
    return NextResponse.json({ok:true,userId:user.uid,run});
  } catch {
    return NextResponse.json({error:"Engineering worker unavailable"},{status:502});
  }
}
