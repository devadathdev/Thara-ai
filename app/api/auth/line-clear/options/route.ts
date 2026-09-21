import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/firebase-admin";
import { generateAuthenticationOptions, generateRegistrationOptions } from "@simplewebauthn/server";
import { getFirestore } from "firebase-admin/firestore";
import { isProtectedArea } from "@/lib/protected-auth";

export const runtime="nodejs";

const rpID=process.env.THARA_WEBAUTHN_RP_ID || "localhost";

export async function GET(req:Request){
 try{
  const user=await verifyBearerToken(req);
  const url=new URL(req.url); const area=url.searchParams.get("area")||"private-memory";
  if(!isProtectedArea(area))return NextResponse.json({error:"Invalid protected area"},{status:400});
  const db=getFirestore(); const ref=db.collection("users").doc(user.uid).collection("lineClearCredentials");
  const snap=await ref.get();
  if(!snap.empty){
   const options=await generateAuthenticationOptions({rpID,userVerification:"required",allowCredentials:snap.docs.map(d=>({id:d.id,transports:d.data().transports||[]}))});
   await db.collection("users").doc(user.uid).collection("lineClearChallenges").doc("current").set({challenge:options.challenge,area,createdAt:Date.now()});
   return NextResponse.json({mode:"authentication",options});
  }
  const options=await generateRegistrationOptions({rpName:"THARA AI",rpID,userName:user.uid,userDisplayName:"THARA User",attestationType:"none",supportedAlgorithmIDs:[-7,-257],authenticatorSelection:{residentKey:"preferred",userVerification:"required",authenticatorAttachment:"platform"}});
  await db.collection("users").doc(user.uid).collection("lineClearChallenges").doc("current").set({challenge:options.challenge,area,mode:"registration",createdAt:Date.now()});
  return NextResponse.json({mode:"registration",options});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Line Clear unavailable"},{status:502})}
}
