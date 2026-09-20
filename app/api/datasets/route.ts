export const runtime="nodejs";
import {NextResponse} from "next/server";
import {getFirestore} from "firebase-admin/firestore";
import {verifyBearerToken} from "@/lib/firebase-admin";
import {DATASET_SOURCES,normalizeDataset,datasetAllowedForIndexing} from "@/lib/dataset-hub";

export async function GET(req:Request){
  try{
    const user=await verifyBearerToken(req);
    const snap=await getFirestore().collection("users").doc(user.uid).collection("datasets").orderBy("createdAt","desc").limit(100).get();
    return NextResponse.json({ok:true,sources:DATASET_SOURCES,datasets:snap.docs.map(d=>d.data())},{headers:{"Cache-Control":"no-store"}});
  }catch(e){console.error("datasets_get_error",e);return NextResponse.json({error:"Dataset hub unavailable"},{status:502});}
}

export async function POST(req:Request){
  try{
    const user=await verifyBearerToken(req);
    const body=await req.json();
    const dataset=normalizeDataset(body);
    if(!datasetAllowedForIndexing(dataset)) return NextResponse.json({error:"Dataset URL or license is not eligible for indexing. Review provenance and license first."},{status:400});
    const ref=getFirestore().collection("users").doc(user.uid).collection("datasets").doc(dataset.id);
    await ref.set({...dataset,createdAt:Date.now(),updatedAt:Date.now()});
    return NextResponse.json({ok:true,dataset});
  }catch(e){console.error("datasets_post_error",e);return NextResponse.json({error:"Unable to register dataset"},{status:502});}
}
