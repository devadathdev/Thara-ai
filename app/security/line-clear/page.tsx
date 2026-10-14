"use client";

import { useState } from "react";
import { startAuthentication, startRegistration, browserSupportsWebAuthn } from "@simplewebauthn/browser";

const areas=[["equipment-control","Equipment Control"],["engineering-execution","Engineering Execution"],["private-memory","Private Memory"],["sentinel","Sentinel / Security"]];

export default function LineClear(){
 const [area,setArea]=useState("private-memory"); const [status,setStatus]=useState("READY"); const [token,setToken]=useState("");
 async function run(){
  try{
   if(!browserSupportsWebAuthn()) throw new Error("This browser does not support WebAuthn.");
   const session=await fetch("/api/auth/local/session",{cache:"no-store"}).then(r=>r.json()); if(!session.authenticated)throw new Error("Sign in to THARA first.");
   setStatus("REQUESTING BIOMETRIC CHALLENGE…");
   const idToken="local-session";
   const opt=await fetch("/api/auth/line-clear/options?area="+encodeURIComponent(area),{headers:{authorization:"Bearer "+idToken}}).then(r=>r.json());
   if(opt.error)throw new Error(opt.error);
   const response=opt.mode==="registration"?await startRegistration({optionsJSON:opt.options}):await startAuthentication({optionsJSON:opt.options});
   setStatus("VERIFYING…");
   const verified=await fetch("/api/auth/line-clear/verify",{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+idToken},body:JSON.stringify({area,response})}).then(r=>r.json());
   if(!verified.verified)throw new Error(verified.error||"Biometric verification failed");
   setToken(verified.token); sessionStorage.setItem("thara-line-clear",verified.token); setStatus("LINE CLEAR VERIFIED");
  }catch(e){setStatus(e instanceof Error?e.message:"Authentication failed")}
 }
 return <main className="min-h-screen bg-[#020506] text-[#d9fffa] p-5 md:p-10"><div className="mx-auto max-w-4xl"><section className="glass rounded-[32px] p-8"><div className="text-[10px] tracking-[.5em] text-amber-300">THARA // SECURITY FABRIC</div><h1 className="mt-3 text-4xl font-black">FINGERPRINT <span className="text-teal-300">LINE CLEAR</span></h1><p className="mt-3 text-sm opacity-55">WebAuthn platform-authenticator step-up authentication. On supported phones this can invoke the device fingerprint/biometric system.</p><div className="mt-6 grid gap-3">{areas.map(([id,label])=><button key={id} onClick={()=>setArea(id)} className={`rounded-2xl border p-4 text-left ${area===id?"border-teal-300/40 bg-teal-300/10":"border-white/10 bg-black/20"}`}><div className="text-xs">{label}</div><div className="mt-1 text-[9px] opacity-40">{id}</div></button>)}</div><button onClick={run} className="thara-button mt-6 w-full rounded-2xl py-4">VERIFY WITH DEVICE BIOMETRIC</button><div className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-300/5 p-4 text-xs">{status}</div>{token&&<div className="mt-4 rounded-2xl border border-teal-300/15 bg-teal-300/5 p-4 text-[10px] text-teal-200">Protected-area proof issued for {area}. Valid for 5 minutes and bound to your signed-in THARA account.</div>}</section></div></main>
}
