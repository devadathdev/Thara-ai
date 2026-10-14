import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/local-auth";
import { authenticationOptions } from "@/lib/webauthn";
export const runtime="nodejs";
export async function GET(req:Request){try{const u=await verifyBearerToken(req);return NextResponse.json(await authenticationOptions(u.uid,req));}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Unable to create authentication options"},{status:401});}}
