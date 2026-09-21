import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/firebase-admin";
import { verifyAuthenticationResponse, verifyRegistrationResponse } from "@simplewebauthn/server";
import { getFirestore } from "firebase-admin/firestore";
import { issueLineClearToken } from "@/lib/line-clear";
import { isProtectedArea } from "@/lib/protected-auth";

export const runtime="nodejs";
const rpID=process.env.THARA_WEBAUTHN_RP_ID || "localhost";
const origin=process.env.THARA_WEBAUTHN_ORIGIN || "http://localhost:3000";

export async function POST(req:Request){
 try{
  const user=await verifyBearerToken(req); const body=await req.json();
  const area=body.area; if(!isProtectedArea(area))return NextResponse.json({error:"Invalid protected area"},{status:400});
  const db=getFirestore(); const base=db.collection("users").doc(user.uid); const challengeRef=base.collection("lineClearChallenges").doc("current"); const cs=await challengeRef.get();
  if(!cs.exists)return NextResponse.json({error:"Line Clear challenge expired"},{status:400});
  const current=cs.data()!; if(current.area!==area||Date.now()-Number(current.createdAt)>5*60*1000)return NextResponse.json({error:"Line Clear challenge expired"},{status:400});
  let verified=false;
  if(current.mode==="registration"){
   const v=await verifyRegistrationResponse({response:body.response,expectedChallenge:current.challenge,expectedOrigin:origin,expectedRPID:rpID});
   if(v.verified&&v.registrationInfo){const c=v.registrationInfo.credential;await base.collection("lineClearCredentials").doc(c.id).set({publicKey:Array.from(c.publicKey),counter:c.counter,transports:body.response?.response?.transports||[],createdAt:Date.now()});verified=true;}
  }else{
   const id=body.response?.id; const snap=await base.collection("lineClearCredentials").doc(id).get(); if(!snap.exists)return NextResponse.json({error:"Unknown authenticator"},{status:401});
   const d=snap.data()!; const v=await verifyAuthenticationResponse({response:body.response,expectedChallenge:current.challenge,expectedOrigin:origin,expectedRPID:rpID,requireUserVerification:true,credential:{id,publicKey:new Uint8Array(d.publicKey),counter:Number(d.counter||0),transports:d.transports||[]}}); 
   if(v.verified){await base.collection("lineClearCredentials").doc(id).update({counter:v.authenticationInfo.newCounter,lastUsedAt:Date.now()});verified=true;}
  }
  await challengeRef.delete();
  if(!verified)return NextResponse.json({verified:false},{status:401});
  return NextResponse.json({verified:true,token:issueLineClearToken(user.uid,area),expiresInMs:5*60*1000});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Line Clear verification failed"},{status:401})}
}
