import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyBearerToken } from "@/lib/local-auth";
import { buildEngineeringEvidence } from "@/lib/engineering-datasets";
import type { DatasetDoc } from "@/lib/datasets/retrieval";
export const runtime="nodejs";
export async function POST(req:Request){try{const user=await verifyBearerToken(req),body=await req.json(),query=typeof body.query==="string"?body.query.trim():"";if(!query||query.length>4000)return NextResponse.json({error:"query must be 1–4000 characters"},{status:400});const rows=await db.dataset.findMany({where:{ownerId:user.uid},take:100});const datasets=rows.map(d=>({id:d.id,...(d.data as any)})) as DatasetDoc[];return NextResponse.json({ok:true,evidence:buildEngineeringEvidence(datasets,query)})}catch{return NextResponse.json({error:"Engineering provenance unavailable"},{status:503})}}
