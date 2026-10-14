import { NextResponse } from "next/server";
import { localSetupStatus, verifyBearerToken } from "@/lib/local-auth";
export const runtime="nodejs";
export async function GET(request:Request){try{const setup=await localSetupStatus();if(setup.setupRequired)return NextResponse.json({ok:true,authenticated:false,...setup},{headers:{"Cache-Control":"no-store"}});try{const user=await verifyBearerToken(request);return NextResponse.json({ok:true,authenticated:true,username:user.username},{headers:{"Cache-Control":"no-store"}})}catch{return NextResponse.json({ok:true,authenticated:false,setupRequired:false},{headers:{"Cache-Control":"no-store"}})}}catch{return NextResponse.json({error:"Local database unavailable"},{status:503})}}
