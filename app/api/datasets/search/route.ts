export const runtime="nodejs";
import {NextResponse} from "next/server";
import {verifyBearerToken} from "@/lib/firebase-admin";

export async function POST(req:Request){
  try{
    await verifyBearerToken(req);
    const {query}=await req.json();
    const q=typeof query==="string"?query.trim():"";
    if(!q||q.length>500)return NextResponse.json({error:"Invalid dataset query"},{status:400});
    const results:any[]=[];
    if(process.env.HUGGINGFACE_API_TOKEN){
      const r=await fetch("https://huggingface.co/api/datasets?search="+encodeURIComponent(q)+"&limit=20",{headers:{Authorization:"Bearer "+process.env.HUGGINGFACE_API_TOKEN},signal:AbortSignal.timeout(10000)});
      if(r.ok){const data=await r.json();for(const d of Array.isArray(data)?data:[])results.push({id:d.id,name:d.id,source:"huggingface",url:"https://huggingface.co/datasets/"+d.id,description:d.description||"",tags:d.tags||[],downloads:d.downloads});}
    }
    return NextResponse.json({ok:true,results});
  }catch(e){console.error("dataset_search_error",e);return NextResponse.json({error:"Dataset search unavailable"},{status:502});}
}
