import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/firebase-admin";
import { registrationOptions } from "@/lib/webauthn";
export const runtime="nodejs";
export async function GET(req:Request){try{const u=await verifyBearerToken(req);return NextResponse.json(await registrationOptions(u.uid,req));}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Unable to create registration options"},{status:401});}}
