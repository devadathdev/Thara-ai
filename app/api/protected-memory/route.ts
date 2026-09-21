import {NextResponse} from "next/server";
import {verifyBearerToken} from "@/lib/firebase-admin";
import {getFirestore} from "firebase-admin/firestore";
import {requireLineClearProof} from "@/lib/protected-auth";
export const runtime="nodejs";
export async function GET(req:Request){
 try{const u=await verifyBearerToken(req);requireLineClearProof(req,"private-memory",u.uid);const snap=await getFirestore().collection("users").doc(u.uid).collection("memories").orderBy("createdAt","desc").limit(50).get();return NextResponse.json({ok:true,memories:snap.docs.map(d=>({id:d.id,...d.data()}))});}
 catch{return NextResponse.json({error:"Fingerprint Line Clear authentication required"},{status:401});}
}
