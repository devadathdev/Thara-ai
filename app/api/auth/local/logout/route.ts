import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clearSessionCookie, SESSION_COOKIE } from "@/lib/local-auth";
export const runtime="nodejs";
export async function POST(request:Request){try{const raw=(request.headers.get("cookie")||"").split(";").map(x=>x.trim()).find(x=>x.startsWith(SESSION_COOKIE+"="))?.slice(SESSION_COOKIE.length+1);if(raw){const token=decodeURIComponent(raw),tokenHash=createHash("sha256").update(token).digest("hex");await db.session.deleteMany({where:{tokenHash}})}return NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store","Set-Cookie":clearSessionCookie(request)}})}catch{return NextResponse.json({error:"Unable to end local session."},{status:503})}}
