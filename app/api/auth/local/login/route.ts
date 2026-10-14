import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { cookieHeader, createLocalSession } from "@/lib/local-auth";
export const runtime="nodejs";
export async function POST(request:Request){try{const body=await request.json(),username=typeof body?.username==="string"?body.username.trim().toLowerCase():"",password=typeof body?.password==="string"?body.password:"";if(!username||!password||username.length>32||password.length>256)return NextResponse.json({error:"Invalid username or password."},{status:400});const owner=await db.owner.findUnique({where:{username}}),valid=owner?await compare(password,owner.passwordHash):false;if(!owner||!valid)return NextResponse.json({error:"Invalid username or password."},{status:401});const session=await createLocalSession(owner.id);return NextResponse.json({ok:true,username:owner.username},{headers:{"Cache-Control":"no-store","Set-Cookie":cookieHeader(session.token,request)}})}catch{return NextResponse.json({error:"Local authentication service unavailable."},{status:503})}}
