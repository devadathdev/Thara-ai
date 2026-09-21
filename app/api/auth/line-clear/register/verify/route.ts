import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { getFirestore } from "firebase-admin/firestore";
import { verifyBearerToken } from "@/lib/firebase-admin";
import { webAuthnConfig } from "@/lib/webauthn";
export const runtime="nodejs";
export async function POST(req:Request){
 try{
  const u=await verifyBearerToken(req); const body=await req.json(); const db=getFirestore(); const ref=db.collection("users").doc(u.uid).collection("lineClearChallenges").doc("registration"); const snap=await ref.get(); const current=snap.data(); if(!current||Date.now()-Number(current.createdAt)>300000)throw new Error("Registration challenge expired");
  const v=await verifyRegistrationResponse({response:body,expectedChallenge:current.challenge,expectedOrigin:webAuthnConfig(req).origin,expectedRPID:webAuthnConfig(req).rpID,requireUserVerification:true,supportedAlgorithmIDs:[-7,-257]});
  if(!v.verified||!v.registrationInfo)throw new Error("Biometric registration verification failed");
  const info:any=v.registrationInfo; const credential:any=info.credential; await db.collection("users").doc(u.uid).collection("lineClearCredentials").doc(credential.id).set({publicKey:Buffer.from(credential.publicKey).toString("base64url"),counter:credential.counter,transports:body.response?.transports||[],createdAt:Date.now()}); await ref.delete();
  return NextResponse.json({ok:true,verified:true,feature:"Fingerprint Line Clear Authentication"});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Registration failed"},{status:400});}
}
