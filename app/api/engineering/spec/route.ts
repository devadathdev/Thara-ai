import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/firebase-admin";
import { ENGINEERING_OUTPUTS } from "@/lib/engineering-schemas";
import { planEngineeringMission } from "@/lib/engineering-planner";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const body = await req.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message || message.length > 4000) return NextResponse.json({error:"message must be 1–4000 characters"},{status:400});
    const mission = planEngineeringMission(message);
    return NextResponse.json({
      ok:true,
      userId:user.uid,
      mission,
      outputs:ENGINEERING_OUTPUTS,
      execution:{mode:"specification",machineControl:false,productionWrite:false}
    });
  } catch {
    return NextResponse.json({error:"Engineering specification service unavailable"},{status:502});
  }
}
