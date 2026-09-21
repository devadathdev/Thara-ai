"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { signInAnonymously } from "firebase/auth";

type Tool = { id:string; name:string; category:string; description:string; capabilities:string[]; integration:string };
type Data = { tools:Tool[]; workflows:string[]; summary:Record<string,number> };

const labels:Record<string,string>={cad:"CAD",cae:"CAE / SIMULATION",manufacturing:"MANUFACTURING",industry4:"INDUSTRY 4.0"};

export default function EngineeringWorkbench(){
  const [data,setData]=useState<Data|null>(null);
  const [query,setQuery]=useState("");
  const [mission,setMission]=useState<any>(null);
  const [busy,setBusy]=useState(false);

  async function token(){ let u=auth.currentUser; if(!u) u=(await signInAnonymously(auth)).user; return u.getIdToken(); }

  useEffect(()=>{(async()=>{try{const t=await token();const r=await fetch("/api/engineering",{headers:{authorization:"Bearer "+t}});setData(await r.json())}catch{} })()},[]);

  async function plan(){
    if(!query.trim()) return;
    setBusy(true);
    try{const t=await token();const r=await fetch("/api/engineering",{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+t},body:JSON.stringify({message:query})});setMission(await r.json())}finally{setBusy(false)}
  }

  return <main className="min-h-screen bg-[#020506] text-[#d9fffa] p-5 md:p-10">
    <div className="mx-auto max-w-7xl">
      <header className="glass rounded-[32px] p-7">
        <div className="text-[10px] tracking-[.5em] text-teal-300">THARA // ENGINEERING WORKBENCH</div>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-4xl md:text-5xl font-black">ENGINEERING <span className="text-teal-300">FABRIC</span></h1><p className="mt-2 max-w-3xl text-sm opacity-55">CAD, CAE, manufacturing and Industry 4.0 orchestration with guarded execution boundaries.</p></div>
          <div className="rounded-full border border-teal-300/20 px-4 py-2 text-[10px] text-teal-200">PLANNING ONLINE</div>
        </div>
      </header>

      <section className="mt-5 glass rounded-[28px] p-5">
        <div className="text-[10px] tracking-widest text-teal-300">MISSION PLANNER</div>
        <div className="mt-3 flex flex-col gap-2 md:flex-row">
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&plan()} placeholder="e.g. Design a bracket, run FEA, prepare CNC and connect its production telemetry…" className="thara-input flex-1 rounded-2xl px-4"/>
          <button onClick={plan} disabled={busy} className="thara-button rounded-2xl px-6 disabled:opacity-40">{busy?"PLANNING…":"PLAN MISSION"}</button>
        </div>
        {mission?.mission&&<div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-teal-300/15 bg-teal-300/5 p-4"><div className="text-[9px] tracking-widest text-teal-200">DOMAINS</div><div className="mt-3 flex flex-wrap gap-2">{mission.mission.categories.map((x:string)=><span key={x} className="rounded-full border border-teal-300/20 px-3 py-1 text-[9px]">{labels[x]||x}</span>)}</div></div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="text-[9px] tracking-widest text-teal-200">PIPELINE</div><ol className="mt-3 space-y-2">{mission.mission.stages.map((x:string,i:number)=><li key={x} className="text-[10px]"><span className="mr-2 text-teal-300">{String(i+1).padStart(2,"0")}</span>{x}</li>)}</ol></div>
          <div className="rounded-2xl border border-amber-300/15 bg-amber-300/5 p-4"><div className="text-[9px] tracking-widest text-amber-200">CONTROL GATE</div><p className="mt-3 text-[10px] leading-5 opacity-70">Planning only. Machine control, production writes and external execution remain disabled until an explicit future permission layer is implemented.</p></div>
        </div>}
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-4">{Object.entries(data?.summary||{}).map(([k,v])=><div key={k} className="glass rounded-2xl p-4"><div className="text-[9px] tracking-widest opacity-50">{labels[k]||k}</div><div className="mt-2 text-3xl font-black text-teal-300">{v}</div><div className="text-[9px] opacity-40">registered adapters</div></div>)}</section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{(["cad","cae","manufacturing","industry4"] as const).map(cat=><div key={cat} className="glass rounded-[24px] p-5"><h2 className="text-xs tracking-widest">{labels[cat]}</h2><div className="mt-4 space-y-2">{(data?.tools||[]).filter(t=>t.category===cat).map(t=><div key={t.id} className="rounded-xl border border-white/10 bg-black/20 p-3"><div className="flex justify-between gap-2"><b className="text-[10px]">{t.name}</b><span className="text-[8px] text-teal-300">{t.integration}</span></div><p className="mt-1 text-[9px] leading-4 opacity-45">{t.description}</p></div>)}</div></div>)}</section>

      <section className="mt-5 glass rounded-[28px] p-5"><div className="text-[10px] tracking-widest text-teal-300">REFERENCE WORKFLOWS</div><div className="mt-4 flex flex-wrap gap-2">{(data?.workflows||[]).map(w=><span key={w} className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[9px]">{w}</span>)}</div></section>
    </div>
  </main>
}
