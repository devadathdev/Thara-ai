type Provider = "openrouter" | "gemini";
const OPENROUTER_URL="https://openrouter.ai/api/v1/chat/completions";
export const MODEL_ROLES={orchestrator:process.env.OPENROUTER_ORCHESTRATOR_MODEL||"openrouter/free",general:process.env.OPENROUTER_GENERAL_MODEL||"openrouter/free",coding:process.env.OPENROUTER_CODING_MODEL||"openrouter/free",reasoning:process.env.OPENROUTER_REASONING_MODEL||"openrouter/free",vision:process.env.GEMINI_MODEL||"gemini-3.1-flash-lite"};
const TIMEOUT_MS=Number(process.env.THARA_MODEL_TIMEOUT_MS||8000);
async function fetchWithTimeout(input:RequestInfo|URL,init:RequestInit={}){return fetch(input,{...init,signal:AbortSignal.timeout(TIMEOUT_MS),keepalive:true});}
export async function callModel(provider:Provider,model:string,messages:{role:string;content:any}[]){
 if(provider==="openrouter"){
  if(!process.env.OPENROUTER_API_KEY)throw Error("OPENROUTER_API_KEY is not configured");
  const r=await fetchWithTimeout(OPENROUTER_URL,{method:"POST",headers:{"Authorization":`Bearer ${process.env.OPENROUTER_API_KEY}`,"Content-Type":"application/json","HTTP-Referer":process.env.NEXT_PUBLIC_APP_ORIGIN||"http://localhost:3000","X-OpenRouter-Title":"THARA Personal AI"},body:JSON.stringify({model,messages,temperature:0.2,max_tokens:Number(process.env.THARA_MAX_OUTPUT_TOKENS||700)})});
  if(!r.ok)throw Error(`OpenRouter ${r.status}`);
  const d=await r.json();return d?.choices?.[0]?.message?.content??"";
 }
 if(!process.env.GEMINI_API_KEY)throw Error("GEMINI_API_KEY is not configured");
 const r=await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:messages.map(m=>`${m.role}: ${m.content}`).join("\n")}]}],generationConfig:{temperature:.2,maxOutputTokens:Number(process.env.THARA_MAX_OUTPUT_TOKENS||700)}})});
 if(!r.ok)throw Error(`Gemini ${r.status}`);
 const d=await r.json();return d?.candidates?.[0]?.content?.parts?.map((x:any)=>x.text||"").join("")??"";
}
export async function orchestrate(messages:{role:string;content:any}[]){
 const fast=process.env.THARA_FAST_MODEL||process.env.GEMINI_MODEL||"gemini-3.1-flash-lite";
 try{return await callModel("gemini",fast,messages)}catch{}
 try{return await callModel("openrouter",process.env.OPENROUTER_ORCHESTRATOR_MODEL||"openrouter/free",messages)}catch{}
 return await callModel("openrouter","openrouter/free",messages);
}
