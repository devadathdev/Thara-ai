export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { verifyBearerToken } from "@/lib/firebase-admin";
import { buildKnowledgeGraph } from "@/lib/knowledge-graph";

function db(){ return getFirestore(); }

export async function GET(req:Request){
  try{
    const user=await verifyBearerToken(req);
    const snapshot=await db().collection("users").doc(user.uid).collection("memories")
      .orderBy("createdAt","desc").limit(200).get();
    const memories=snapshot.docs.map(d=>({
      id:d.id, content:String(d.data().content||""), createdAt:Number(d.data().createdAt||Date.now())
    }));
    return NextResponse.json({ok:true,...buildKnowledgeGraph(memories)},{headers:{"Cache-Control":"no-store"}});
  }catch(error){
    console.error("knowledge_graph_get_error",error);
    return NextResponse.json({error:"Knowledge graph unavailable"},{status:502});
  }
}

export async function POST(req:Request){
  try{
    const user=await verifyBearerToken(req);
    const body=await req.json();
    const memoryIds=Array.isArray(body.memoryIds)?body.memoryIds.filter((x:any)=>typeof x==="string").slice(0,200):[];
    const snapshot=await db().collection("users").doc(user.uid).collection("memories")
      .orderBy("createdAt","desc").limit(200).get();
    const memories=snapshot.docs.map(d=>({id:d.id,content:String(d.data().content||""),createdAt:Number(d.data().createdAt||Date.now())}));
    const filtered=memoryIds.length?memories.filter(m=>memoryIds.includes(m.id)):memories;
    const graph=buildKnowledgeGraph(filtered);
    const ref=db().collection("users").doc(user.uid).collection("knowledgeGraph").doc("current");
    await ref.set({nodes:graph.nodes,edges:graph.edges,updatedAt:Date.now(),memoryCount:filtered.length});
    return NextResponse.json({ok:true,...graph},{headers:{"Cache-Control":"no-store"}});
  }catch(error){
    console.error("knowledge_graph_post_error",error);
    return NextResponse.json({error:"Unable to update knowledge graph"},{status:502});
  }
}
