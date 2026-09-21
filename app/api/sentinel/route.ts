import {NextResponse} from "next/server";
import {verifyBearerToken} from "@/lib/firebase-admin";
import {requireLineClearProof} from "@/lib/protected-auth";
export const runtime="nodejs";
export async function GET(req:Request){
 try{const u=await verifyBearerToken(req);requireLineClearProof(req,"sentinel",u.uid);return NextResponse.json({ok:true,area:"sentinel",verified:true});}
 catch{return NextResponse.json({error:"Fingerprint Line Clear authentication required"},{status:401});}
}
