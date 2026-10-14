import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/local-auth";
import { THARA_CAPABILITIES, capabilitySummary, routeCapability, getCapabilityTelemetry } from "@/lib/thara-v5";
import { db } from "@/lib/db";
import { ENGINEERING_TOOLS, ENGINEERING_WORKFLOWS, engineeringToolSummary, routeEngineering } from "@/lib/engineering";
import { planEngineeringMission } from "@/lib/engineering-planner";
import { allTharaCapabilities, completeCapabilitySummary, capabilityExecutionSummary, getMasterCapabilities } from "@/lib/thara-complete";
import { buildAutonomyPlan } from "@/lib/orchestrator/autonomy";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const telemetry = await getCapabilityTelemetry(user.uid).catch(()=>[]);
    return NextResponse.json({ok:true,version:"V7",runtime:{deployment:"local",localOnly:process.env.THARA_LOCAL_ONLY!=="false",localInferenceConfigured:Boolean(process.env.THARA_LOCAL_MODEL_URL)||process.env.THARA_LOCAL_ONLY!=="false",preferLocal:true,cloudInferenceConfigured:process.env.THARA_LOCAL_ONLY==="false"&&Boolean(process.env.GEMINI_API_KEY||process.env.OPENROUTER_API_KEY)},capabilities:THARA_CAPABILITIES,summary:capabilitySummary(),completeCapabilities:allTharaCapabilities(),completeSummary:completeCapabilitySummary(),executionSummary:capabilityExecutionSummary(),masterCapabilities:getMasterCapabilities(),engineering:{tools:ENGINEERING_TOOLS,workflows:ENGINEERING_WORKFLOWS,summary:engineeringToolSummary()},telemetry});
  } catch {
    return NextResponse.json({error:"Authentication failed"},{status:401});
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const body = await req.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message || message.length > 4000) return NextResponse.json({error:"message must be 1–4000 characters"},{status:400});
    const domains = routeCapability(message);
    const engineering = routeEngineering(message);
    const engineeringMission = planEngineeringMission(message);
    const autonomy = buildAutonomyPlan(message);
    await db.telemetryEvent.create({data:{ownerId:user.uid,category:"capability-route",payload:{domains,messageLength:message.length,success:true},createdAt:Date.now()}});
    return NextResponse.json({ok:true,domains,engineering,engineeringMission,autonomy,capabilities:THARA_CAPABILITIES.filter(c=>domains.includes(c.domain)),matchedCompleteCapabilities:allTharaCapabilities().filter(c=>domains.includes(c.domain))});
  } catch {
    return NextResponse.json({error:"Capability service unavailable"},{status:502});
  }
}
