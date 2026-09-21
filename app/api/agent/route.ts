import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/firebase-admin";
import { executeMission, orchestratorSummary, planMission } from "@/lib/agent-orchestrator";
import { listTools } from "@/lib/agent-tools";
import { getFirestore } from "firebase-admin/firestore";

export const runtime="nodejs";

export async function GET(req:Request){
 try{await verifyBearerToken(req);return NextResponse.json({ok:true,tools:listTools(),orchestrator:orchestratorSummary()})}
 catch{return NextResponse.json({error:"Authentication failed"},{status:401})}
}

export async function POST(req:Request){
 try{
  const user=await verifyBearerToken(req),body=await req.json();
  const objective=typeof body.objective==="string"?body.objective.trim():"";
  if(!objective||objective.length>4000)return NextResponse.json({error:"objective must be 1–4000 characters"},{status:400});
  const plan=planMission(objective),result=body.execute===true?await executeMission(plan):plan;
  await getFirestore().collection("users").doc(user.uid).collection("tharaTelemetry").add({createdAt:Date.now(),event:"agent-mission",missionId:plan.id,execute:body.execute===true,status:result.status,stepCount:result.steps.length});
  return NextResponse.json({ok:true,mission:result});
 }catch{return NextResponse.json({error:"Agent orchestration unavailable"},{status:502})}
}
