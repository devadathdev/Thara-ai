import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/local-auth";
import { equipmentControlCapabilities, validateEquipmentCommand } from "@/lib/equipment-control";
import { requireLineClearProof } from "@/lib/protected-auth";

export const runtime="nodejs";

export async function GET(req:Request){
  try{await verifyBearerToken(req);return NextResponse.json({ok:true,feature:"equipment-control",...equipmentControlCapabilities()});}
  catch{return NextResponse.json({error:"Authentication failed"},{status:401});}
}

export async function POST(req:Request){
  try{
    const user=await verifyBearerToken(req);
    const body=await req.json();
    if(body.approval!==true) return NextResponse.json({error:"Explicit equipment-control approval is required."},{status:403});
    requireLineClearProof(req,"equipment-control",user.uid);
    const command=validateEquipmentCommand(body);
    return NextResponse.json({
      ok:true,
      userId:user.uid,
      command,
      execution:{queued:false,executed:false,requiresIndustrialGateway:true},
      safety:{directMachineExecution:false,productionWrite:false,auditRequired:true}
    });
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Invalid equipment command"},{status:400});}
}
