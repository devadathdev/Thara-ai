type Provider = "openrouter" | "gemini";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const MODEL_ROLES = {
  orchestrator: process.env.OPENROUTER_ORCHESTRATOR_MODEL || "nemotron-orchestrator",
  general: process.env.OPENROUTER_GENERAL_MODEL || "openrouter/free",
  coding: process.env.OPENROUTER_CODING_MODEL || "openrouter/free",
  reasoning: process.env.OPENROUTER_REASONING_MODEL || "openrouter/free",
  vision: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
};

export async function callModel(provider:Provider, model:string, messages:{role:string;content:any}[]) {
  if (provider === "openrouter") {
    if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");
    const r=await fetch(OPENROUTER_URL,{method:"POST",headers:{"Authorization":`Bearer ${process.env.OPENROUTER_API_KEY}`,"Content-Type":"application/json","HTTP-Referer":process.env.NEXT_PUBLIC_APP_ORIGIN || "http://localhost:3000","X-OpenRouter-Title":"THARA Personal AI"},body:JSON.stringify({model,messages})});
    if(!r.ok) throw new Error(`OpenRouter ${r.status}: ${await r.text()}`);
    const d=await r.json(); return d?.choices?.[0]?.message?.content ?? "";
  }
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");
  const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:messages.map(m=>`${m.role}: ${m.content}`).join("\n")}]}]})});
  if(!r.ok) throw new Error(`Gemini ${r.status}: ${await r.text()}`);
  const d=await r.json(); return d?.candidates?.[0]?.content?.parts?.map((x:any)=>x.text||"").join("") ?? "";
}

export async function orchestrate(messages:{role:string;content:any}[]) {
  const primary = process.env.OPENROUTER_ORCHESTRATOR_MODEL;
  if (primary) { try { return await callModel("openrouter",primary,messages); } catch {} }
  try { return await callModel("gemini",process.env.GEMINI_MODEL||"gemini-3.1-flash-lite",messages); }
  catch { return await callModel("openrouter","openrouter/free",messages); }
}