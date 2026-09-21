import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/firebase-admin";
import { executePreparedEngineeringCommand, type SupportedEngine } from "@/lib/engineering-execution";

export const runtime = "nodejs";

const engines=new Set<SupportedEngine>(["openscad","freecad","openfoam","calculix"]);

export async function POST(req:Request){
  try{
    const user=await verifyBearerToken(req);
    const body=await req.json();
    if(body.approval!==true) return NextResponse.json({error:"Explicit engineering execution approval is required."},{status:403});
    const engine=typeof body.engine==="string"?body.engine as SupportedEngine:null;
    if(!engine||!engines.has(engine)) return NextResponse.json({error:"Unsupported engine"},{status:400});
    const filename=typeof body.filename==="string"?body.filename:"input.txt";
    const content=typeof body.content==="string"?body.content:"";
    const command=typeof body.command==="string"?body.command:"";
    const result=await executePreparedEngineeringCommand(engine,filename,content,command);
    return NextResponse.json({ok:true,userId:user.uid,result,safety:{machineControl:false,productionWrite:false,externalExecution:false}});
  }catch(e){
    return NextResponse.json({error:e instanceof Error?e.message:"Engineering execution failed"},{status:502});
  }
}
