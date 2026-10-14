import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookieHeader, createLocalSession } from "@/lib/local-auth";
export const runtime = "nodejs";
const failures = new Map<string,{count:number;resetAt:number}>();
export async function POST(request:Request){
 try{
  const body=await request.json(),username=typeof body?.username==="string"?body.username.trim().toLowerCase():"",password=typeof body?.password==="string"?body.password:"";
  if(!username||!password||username.length>32||password.length>256)return NextResponse.json({error:"Invalid username or password."},{status:400});
  const now=Date.now(),bucket=failures.get(username);
  if(bucket&&now<bucket.resetAt&&bucket.count>=5)return NextResponse.json({error:"Too many login attempts. Wait 15 minutes and try again."},{status:429});
  const owner=await db.owner.findUnique({where:{username}}),valid=owner?await compare(password,owner.passwordHash):false;
  if(!owner||!valid){const current=failures.get(username);if(!current||now>=current.resetAt)failures.set(username,{count:1,resetAt:now+15*60_000});else current.count++;return NextResponse.json({error:"Invalid username or password."},{status:401});}
  failures.delete(username);
  const session=await createLocalSession(owner.id);
  return NextResponse.json({ok:true,username:owner.username},{headers:{"Cache-Control":"no-store","Set-Cookie":cookieHeader(session.token,request)}});
 }catch{return NextResponse.json({error:"Local authentication service unavailable."},{status:503});}
}
