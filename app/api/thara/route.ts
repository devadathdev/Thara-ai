import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/firebase-admin";
import { THARA_CAPABILITIES, capabilitySummary, routeCapability, getCapabilityTelemetry } from "@/lib/thara-v5";
import { getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const telemetry = await getCapabilityTelemetry(user.uid).catch(()=>[]);
    return NextResponse.json({ok:true,version:"V5",capabilities:THARA_CAPABILITIES,summary:capabilitySummary(),telemetry});
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
    await getFirestore().collection("users").doc(user.uid).collection("tharaTelemetry").add({
      createdAt: Date.now(), event:"capability-route", domains, messageLength:message.length
    });
    return NextResponse.json({ok:true,domains,capabilities:THARA_CAPABILITIES.filter(c=>domains.includes(c.domain))});
  } catch {
    return NextResponse.json({error:"Capability service unavailable"},{status:502});
  }
}
