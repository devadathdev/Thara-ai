import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { getFirestore } from "firebase-admin/firestore";
import { verifyBearerToken } from "@/lib/firebase-admin";
import { issueLineClearToken } from "@/lib/line-clear";
import { webAuthnConfig } from "@/lib/webauthn";
import { isProtectedArea } from "@/lib/protected-auth";
export const runtime="nodejs";
export async function POST(req:Request){
 try{
  const u=await verifyBearerToken(req); const body=await req.json(); const db=getFirestore(); const challengeRef=db.collection("users").doc(u.uid).collection("lineClearChallenges").doc("authentication"); const challengeSnap=await challengeRef.get(); const current=challengeSnap.data(); if(!current||Date.now()-Number(current.createdAt)>300000)throw new Error("Authentication challenge expired");
  const credRef=db.collection("users").doc(u.uid).collection("lineClearCredentials").doc(String(body.id)); const credSnap=await credRef.get(); if(!credSnap.exists)throw new Error("Unknown Line Clear credential"); const stored=credSnap.data()!;
  const v=await verifyAuthenticationResponse({response:body,expectedChallenge:current.challenge,expectedOrigin:webAuthnConfig(req).origin,expectedRPID:webAuthnConfig(req).rpID,requireUserVerification:true,credential:{id:String(body.id),publicKey:Uint8Array.from(Buffer.from(String(stored.publicKey),"base64url")),counter:Number(stored.counter||0),transports:stored.transports||[]}});
  if(!v.verified)throw new Error("Fingerprint Line Clear verification failed");
  await credRef.update({counter:v.authenticationInfo.newCounter,lastUsedAt:Date.now()}); await challengeRef.delete();
  const area=typeof body.area==="string"&&isProtectedArea(body.area)?body.area:"private-memory";
  const token=issueLineClearToken(u.uid,area);
  return NextResponse.json({ok:true,verified:true,feature:"Fingerprint Line Clear Authentication",token,expiresInMs:300000});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Authentication failed"},{status:401});}
}
