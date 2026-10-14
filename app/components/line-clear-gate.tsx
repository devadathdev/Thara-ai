"use client";
import {useState} from "react";
import {authenticateLineClear,registerLineClear} from "@/lib/line-clear-client";

export function LineClearGate({area,onVerified}:{area:"equipment-control"|"sentinel"|"private-memory"|"engineering-execution";onVerified:(token:string)=>void}){
 const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
 async function token(){const s=await fetch("/api/auth/local/session",{cache:"no-store"}).then(r=>r.json());if(!s.authenticated){window.location.assign("/login");throw new Error("Local session required")}return "local-session"}
 async function run(mode:"register"|"authenticate"){try{setBusy(true);setMessage("");const t=await token();const r=mode==="register"?await registerLineClear(t):await authenticateLineClear(t,area);if(!r.ok)throw new Error(r.error||"Line Clear verification failed");onVerified(r.token);setMessage(mode==="register"?"Fingerprint Line Clear registered.":"Identity verified.");}catch(e){setMessage(e instanceof Error?e.message:"Biometric verification failed")}finally{setBusy(false)}}
 return <div className="rounded-[28px] border border-teal-300/15 bg-teal-300/5 p-5"><div className="text-[10px] tracking-[.25em] text-teal-300">FINGERPRINT LINE CLEAR</div><p className="mt-2 text-xs opacity-60">Use your device's platform authenticator. THARA never receives your fingerprint data.</p><div className="mt-4 flex flex-wrap gap-2"><button disabled={busy} onClick={()=>run("authenticate")} className="thara-button rounded-xl px-4 py-2 text-xs">{busy?"VERIFYING…":"VERIFY IDENTITY"}</button><button disabled={busy} onClick={()=>run("register")} className="rounded-xl border border-white/10 px-4 py-2 text-xs">REGISTER DEVICE</button></div>{message&&<div className="mt-3 text-xs text-teal-200">{message}</div>}</div>
}
