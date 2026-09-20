export const runtime="nodejs";
import {NextResponse} from "next/server";
import {getFirestore} from "firebase-admin/firestore";
import {verifyBearerToken} from "@/lib/firebase-admin";
import {normalizeMission,DEFAULT_PERMISSIONS} from "@/lib/v4-autonomy";

export async function GET(req:Request){try{const u=await verifyBearerToken(req);const s=await getFirestore().collection("users").doc(u.uid).collection("missions").orderBy("updatedAt","desc").limit(50).get();return NextResponse.json({ok:true,missions:s.docs.map(d=>d.data()),permissions:DEFAULT_PERMISSIONS});}catch(e){console.error(e);return NextResponse.json({error:"Mission service unavailable"},{status:502});}}
export async function POST(req:Request){try{const u=await verifyBearerToken(req);const m=normalizeMission(await req.json());if(!m.goal)return NextResponse.json({error:"Mission goal is required"},{status:400});await getFirestore().collection("users").doc(u.uid).collection("missions").doc(m.id).set(m);return NextResponse.json({ok:true,mission:m});}catch(e){console.error(e);return NextResponse.json({error:"Unable to create mission"},{status:502});}}
export async function PATCH(req:Request){try{const u=await verifyBearerToken(req);const b=await req.json();const id=String(b.id||"");const status=["planned","awaiting_approval","running","completed","failed","cancelled"].includes(b.status)?b.status:null;if(!id||!status)return NextResponse.json({error:"Invalid mission update"},{status:400});const ref=getFirestore().collection("users").doc(u.uid).collection("missions").doc(id);await ref.update({status,updatedAt:Date.now()});return NextResponse.json({ok:true,id,status});}catch(e){console.error(e);return NextResponse.json({error:"Unable to update mission"},{status:502});}}
