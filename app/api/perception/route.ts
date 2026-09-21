import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/firebase-admin";
import { planPerception, type PerceptionModality } from "@/lib/perception";

export const runtime="nodejs";

export async function POST(req:Request){
 try{
  const user=await verifyBearerToken(req);
  const body=await req.json();
  const modality=body.modality as PerceptionModality;
  const source=typeof body.source==="string"?body.source:"upload";
  const result=planPerception({modality,source,name:typeof body.name==="string"?body.name:undefined,metadata:body.metadata});
  return NextResponse.json({ok:true,perception:result,userId:user.uid});
 }catch(error){
  return NextResponse.json({error:error instanceof Error?error.message:"Perception unavailable"},{status:400});
 }
}
