import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { buildEngineeringEvidence } from "@/lib/engineering-datasets";
import type { DatasetDoc } from "@/lib/datasets/retrieval";

export const runtime="nodejs";

export async function POST(req:Request){
  try{
    const user=await verifyBearerToken(req);
    const body=await req.json();
    const query=typeof body.query==="string"?body.query.trim():"";
    if(!query||query.length>4000)return NextResponse.json({error:"query must be 1–4000 characters"},{status:400});
    const snap=await getFirestore().collection("users").doc(user.uid).collection("datasets").limit(100).get();
    const datasets=snap.docs.map(d=>({id:d.id,...d.data()})) as DatasetDoc[];
    const evidence=buildEngineeringEvidence(datasets,query);
    return NextResponse.json({ok:true,evidence});
  }catch{
    return NextResponse.json({error:"Engineering provenance unavailable"},{status:502});
  }
}
