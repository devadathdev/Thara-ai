import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/firebase-admin";
import { THARA_CAPABILITIES, capabilitySummary, routeCapability, getCapabilityTelemetry } from "@/lib/thara-v5";
import { getFirestore } from "firebase-admin/firestore";
import { ENGINEERING_TOOLS, ENGINEERING_WORKFLOWS, engineeringToolSummary, routeEngineering } from "@/lib/engineering";
import { planEngineeringMission } from "@/lib/engineering-planner";
import { allTharaCapabilities, completeCapabilitySummary } from "@/lib/thara-complete";
import { allTharaCapabilities, completeCapabilitySummary } from "@/lib/thara-complete";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const telemetry = await getCapabilityTelemetry(user.uid).catch(()=>[]);
    return NextResponse.json({ok:true,version:"V7",capabilities:THARA_CAPABILITIES,summary:capabilitySummary(),completeCapabilities:allTharaCapabilities(),completeSummary:completeCapabilitySummary(),engineering:{tools:ENGINEERING_TOOLS,workflows:ENGINEERING_WORKFLOWS,summary:engineeringToolSummary()},telemetry});
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
    await getFirestore().collection("users").doc(user.uid).collection("tharaTelemetry").add({
      createdAt: Date.now(), event:"capability-route", domains, messageLength:message.length, success:true
    });
    return NextResponse.json({ok:true,domains,engineering,engineeringMission,capabilities:THARA_CAPABILITIES.filter(c=>domains.includes(c.domain)),matchedCompleteCapabilities:allTharaCapabilities().filter(c=>domains.includes(c.domain))});
  } catch {
    return NextResponse.json({error:"Capability service unavailable"},{status:502});
  }
}
