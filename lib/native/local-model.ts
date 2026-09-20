export type LocalModelState={available:boolean;model?:string;latencyMs?:number;endpoint?:string};

export async function getLocalModelState(baseUrl=process.env.THARA_LOCAL_MODEL_URL):Promise<LocalModelState>{
 if(!baseUrl)return {available:false};
 const started=Date.now();
 try{
  const res=await fetch(baseUrl.replace(/\/$/,"")+"/health",{signal:AbortSignal.timeout(1200),cache:"no-store"});
  if(!res.ok)return {available:false};
  const data=await res.json().catch(()=>({}));
  return {available:true,model:typeof data.model==="string"?data.model:undefined,latencyMs:Date.now()-started,endpoint:baseUrl};
 }catch{return {available:false}}
}

export function shouldUseLocalModel(offline:boolean,local:LocalModelState){
 return local.available && (offline || Number(local.latencyMs??999999)<Number(process.env.THARA_LOCAL_MODEL_MAX_LATENCY_MS??350));
}

export function selectInferencePath(offline:boolean,local:LocalModelState){
 return shouldUseLocalModel(offline,local)?"local":"cloud";
}
