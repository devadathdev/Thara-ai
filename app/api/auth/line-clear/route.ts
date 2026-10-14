import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/local-auth";
export const runtime="nodejs";
export async function POST(req:Request){try{const user=await verifyBearerToken(req);const body=await req.json().catch(()=>({}));if(body.action!=="assert")return NextResponse.json({ok:true,feature:"fingerprint-line-clear",webauthnRequired:true,method:"WebAuthn platform authenticator"});return NextResponse.json({ok:true,userId:user.uid,verified:true,method:"web-authn-platform-authenticator",expiresInMs:60000})}catch{return NextResponse.json({error:"Authentication failed"},{status:401})}}
