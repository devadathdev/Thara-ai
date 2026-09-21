import { generateAuthenticationOptions, generateRegistrationOptions } from "@simplewebauthn/server";
import { getFirestore } from "firebase-admin/firestore";

export function webAuthnConfig(req: Request) {
  const url = new URL(req.url);
  return {
    rpID: process.env.THARA_WEBAUTHN_RP_ID || url.hostname,
    origin: process.env.THARA_WEBAUTHN_ORIGIN || url.origin,
    rpName: process.env.THARA_WEBAUTHN_RP_NAME || "THARA AI",
  };
}

export async function registrationOptions(uid: string, req: Request) {
  const db=getFirestore();
  const existing=await db.collection("users").doc(uid).collection("lineClearCredentials").get();
  const {rpID,rpName}=webAuthnConfig(req);
  const options=await generateRegistrationOptions({
    rpName,
    rpID,
    userName: uid,
    userDisplayName: "THARA User",
    userID: new TextEncoder().encode(uid),
    attestationType:"none",
    supportedAlgorithmIDs:[-7,-257],
    excludeCredentials: existing.docs.map(d=>({id:d.id,transports:d.data().transports||[]})),
    authenticatorSelection:{residentKey:"required",userVerification:"required",authenticatorAttachment:"platform"}
  });
  await db.collection("users").doc(uid).collection("lineClearChallenges").doc("registration").set({challenge:options.challenge,createdAt:Date.now()});
  return options;
}

export async function authenticationOptions(uid: string, req: Request) {
  const db=getFirestore();
  const existing=await db.collection("users").doc(uid).collection("lineClearCredentials").get();
  if(existing.empty) throw new Error("No Fingerprint Line Clear credential is registered");
  const {rpID}=webAuthnConfig(req);
  const options=await generateAuthenticationOptions({
    rpID,
    userVerification:"required",
    allowCredentials:existing.docs.map(d=>({id:d.id,transports:d.data().transports||[]})),
  });
  await db.collection("users").doc(uid).collection("lineClearChallenges").doc("authentication").set({challenge:options.challenge,createdAt:Date.now()});
  return options;
}
