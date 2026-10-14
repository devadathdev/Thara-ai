"use client";

import { useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase";
import { signInAnonymously } from "firebase/auth";

const domains = [
  "intelligence","memory","builder","research","voice","multimodal","security","performance",
  "data","ml","engineering","manufacturing","industry4","robotics","science","healthcare",
  "agriculture","climate","product","device","ecosystem","evaluation","experience"
] as const;

const labels: Record<string,string> = {
  intelligence:"INTELLIGENCE", memory:"MEMORY", builder:"AUTONOMOUS BUILDER", research:"RESEARCH",
  voice:"VOICE CORE", multimodal:"MULTIMODAL", security:"SENTINEL SECURITY", performance:"PERFORMANCE",
  data:"DATA FABRIC", ml:"MODEL / ML LAB", engineering:"CAD / CAE", manufacturing:"MANUFACTURING",
  industry4:"INDUSTRY 4.0", robotics:"ROBOTICS", science:"SCIENCE / MATERIALS", healthcare:"HEALTHCARE",
  agriculture:"AGRICULTURE", climate:"CLIMATE", product:"PROJECT OS", device:"DEVICE FABRIC",
  ecosystem:"ECOSYSTEM", evaluation:"EVALUATION", experience:"EXPERIENCE"
};

const nav = [
  ["overview","OVERVIEW"],["command","COMMAND"],["capabilities","CAPABILITIES"],
  ["engineering","ENGINEERING"],["security","SENTINEL"],["telemetry","TELEMETRY"]
] as const;

function Icon({type}:{type:string}) {
  const common = {width:18,height:18,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.7,strokeLinecap:"round" as const,strokeLinejoin:"round" as const};
  const paths: Record<string,React.ReactNode> = {
    overview:<><circle cx="12" cy="12" r="8"/><path d="M12 4v8l5 3"/></>,
    command:<><path d="M4 7h16M4 12h10M4 17h16"/><circle cx="17" cy="12" r="2"/></>,
    capabilities:<><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 8v8M8.5 10l7 4M15.5 10l-7 4"/></>,
    engineering:<><path d="M5 20l4-4M9 16l-3-3 6-6 3 3-6 6z"/><path d="M14 5l2-2 5 5-2 2"/><path d="M4 20h6"/></>,
    security:<><path d="M12 3l7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6l7-3z"/><path d="M9 12l2 2 4-5"/></>,
    telemetry:<><path d="M3 12h4l2-6 4 12 2-6h6"/><circle cx="12" cy="12" r="9"/></>,
    bolt:<><path d="M13 2L4 14h7l-1 8 10-13h-7z"/></>,
    globe:<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></>
  };
  return <svg {...common}>{paths[type] ?? paths.overview}</svg>;
}

export default function TharaV7CommandCenter() {
  const [data,setData] = useState<any>(null);
  const [query,setQuery] = useState("");
  const [routes,setRoutes] = useState<string[]>([]);
  const [active,setActive] = useState<(typeof nav)[number][0]>("overview");
  const [loading,setLoading] = useState(true);
  const [routing,setRouting] = useState(false);
  const [clock,setClock] = useState(new Date());

  async function token() {
    let u = auth.currentUser;
    if (!u) u = (await signInAnonymously(auth)).user;
    return u.getIdToken();
  }

  async function load() {
    try {
      const t = await token();
      const r = await fetch("/api/thara",{headers:{authorization:"Bearer "+t}});
      setData(await r.json());
    } finally { setLoading(false); }
  }

  useEffect(()=>{ load(); const id=setInterval(()=>setClock(new Date()),1000); return()=>clearInterval(id); },[]);

  async function route() {
    if (!query.trim() || routing) return;
    setRouting(true);
    try {
      const t=await token();
      const r=await fetch("/api/thara",{
        method:"POST",
        headers:{"content-type":"application/json",authorization:"Bearer "+t},
        body:JSON.stringify({message:query})
      });
      const d=await r.json();
      setRoutes(d.domains||[]);
      setActive("command");
    } finally { setRouting(false); }
  }

  const capabilities = data?.completeCapabilities || [];
  const master = data?.executionSummary?.master || 0;
  const ready = data?.executionSummary?.["execution-ready"] || 0;
  const foundation = data?.executionSummary?.foundation || 0;
  const total = capabilities.length;
  const onlineDomains = domains.filter(d => (data?.summary?.[d] || 0) > 0).length;
  const telemetry = data?.telemetry || [];
  const routedCapabilities = capabilities.filter((c:any)=>routes.includes(c.domain));

  const stats = useMemo(()=>[
    ["CAPABILITY NODES",total,"capabilities"],
    ["MASTER EXECUTION",master,"verified paths"],
    ["EXECUTION READY",ready,"bounded paths"],
    ["FOUNDATION",foundation,"development"],
  ],[total,master,ready,foundation]);

  return (
    <main className="thara-shell min-h-screen overflow-hidden bg-[#020817] text-[#E8F7FF]">
      <div aria-hidden className="pointer-events-none fixed inset-0 thara-blue-grid opacity-60"/>
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(22,140,255,.07),transparent_42%)]"/>
      <div className="relative mx-auto flex min-h-screen max-w-[1680px] gap-3 p-3 md:p-5">

        <aside className="glass hidden w-[230px] shrink-0 flex-col rounded-[26px] p-4 lg:flex">
          <div className="border-b border-[#63D8FF]/10 pb-5">
            <div className="text-[9px] tracking-[.42em] text-[#63D8FF]">NEURAL ENGINEERING OS</div>
            <div className="mt-2 text-3xl font-black tracking-[-.06em] text-white">THARA<span className="text-[#39B9FF]">.</span></div>
            <div className="mt-2 flex items-center gap-2 text-[9px] text-[#63D8FF]"><span className="status-dot"/> CORE ONLINE</div>
          </div>
          <nav className="mt-5 space-y-1">
            {nav.map(([id,label])=><button key={id} onClick={()=>setActive(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[9px] tracking-[.16em] transition ${active===id?"bg-[#168CFF]/15 text-[#63D8FF] shadow-[inset_2px_0_#39B9FF,0_0_22px_rgba(22,140,255,.08)]":"text-white/45 hover:bg-white/[.035] hover:text-white/80"}`}><Icon type={id}/>{label}</button>)}
          </nav>
          <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
            <div className="rounded-xl border border-[#39B9FF]/10 bg-[#168CFF]/5 p-3">
              <div className="text-[8px] tracking-widest text-white/35">SYSTEM CLOCK</div>
              <div className="mt-1 font-mono text-sm text-[#63D8FF]">{clock.toLocaleTimeString()}</div>
            </div>
            <div className="text-[8px] leading-4 text-white/25">V7 COMMAND CENTER<br/>EXECUTION FABRIC ACTIVE</div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="glass rounded-[26px] px-5 py-4 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[#63D8FF]/25 bg-[#168CFF]/10 text-[#63D8FF] shadow-[0_0_28px_rgba(22,140,255,.14)]"><Icon type="bolt"/></div>
                <div><div className="text-[9px] tracking-[.38em] text-[#63D8FF]">THARA // COMMAND CENTER</div><div className="mt-1 text-xs text-white/45">PERSONAL AI • ENGINEERING • EXECUTION</div></div>
              </div>
              <div className="flex items-center gap-2 font-mono text-[9px] text-white/45">
                <span className="status-dot"/> SYSTEMS NOMINAL <span className="mx-2 text-white/15">|</span> {clock.toLocaleDateString()}
              </div>
            </div>
          </header>

          <div className="mt-3 lg:hidden flex gap-2 overflow-x-auto">
            {nav.map(([id,label])=><button key={id} onClick={()=>setActive(id)} className="glass shrink-0 rounded-xl px-3 py-2 text-[9px]">{label}</button>)}
          </div>

          {active==="overview" && <section className="mt-3 space-y-3">
            <div className="grid gap-3 xl:grid-cols-[1.7fr_.8fr]">
              <div className="glass relative min-h-[310px] overflow-hidden rounded-[30px] p-6">
                <div className="absolute right-8 top-8 h-48 w-48 rounded-full border border-[#39B9FF]/15 shadow-[0_0_80px_rgba(22,140,255,.08)]"/>
                <div className="absolute right-20 top-20 h-24 w-24 rounded-full border border-[#63D8FF]/20"/>
                <div className="absolute right-[108px] top-[108px] h-3 w-3 rounded-full bg-[#63D8FF] shadow-[0_0_25px_#63D8FF]"/>
                <div className="relative z-10 max-w-2xl">
                  <div className="text-[9px] tracking-[.42em] text-[#63D8FF]">AUTONOMOUS INTELLIGENCE FABRIC</div>
                  <h1 className="mt-4 text-5xl font-black tracking-[-.055em] text-white md:text-6xl">THARA<span className="text-[#39B9FF]">.</span></h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">A technical command layer for reasoning, research, software engineering, data, AI/ML, CAD/CAE, manufacturing, Industry 4.0 and controlled execution.</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="rounded-full border border-[#39B9FF]/20 bg-[#168CFF]/10 px-3 py-2 text-[9px] text-[#63D8FF]">V7 FABRIC</span>
                    <span className="rounded-full border border-[#7C5CFF]/20 bg-[#7C5CFF]/10 px-3 py-2 text-[9px] text-[#BBAAFF]">MASTER EXECUTION</span>
                    <span className="rounded-full border border-white/10 bg-white/[.025] px-3 py-2 text-[9px] text-white/45">VERIFIED ACTIONS</span>
                  </div>
                </div>
              </div>
              <div className="glass rounded-[30px] p-5">
                <div className="flex items-center justify-between"><span className="text-[9px] tracking-[.3em] text-[#63D8FF]">SYSTEM STATE</span><span className="font-mono text-[9px] text-[#63D8FF]">LIVE</span></div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {[["CORE","ONLINE"],["MEMORY","ONLINE"],["ROUTER",data?.runtime?.localInferenceConfigured?(data?.runtime?.preferLocal?"LOCAL PREFERRED":"HYBRID READY"):(data?.runtime?.cloudInferenceConfigured?"CLOUD ROUTING":"CONFIG REQUIRED")],["SECURITY","GUARDED"],["ENGINEERING","PLAN-ONLY TOOLS"],["TELEMETRY",telemetry.length?"ACTIVE":"STANDBY"]].map(([a,b])=><div key={a} className="rounded-xl border border-white/8 bg-black/20 p-3"><div className="flex items-center gap-2"><span className="status-dot"/><span className="text-[8px] text-white/40">{a}</span></div><div className="mt-2 text-[10px] text-[#63D8FF]">{b}</div></div>)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {stats.map(([label,value,sub],i)=><div key={String(label)} className="glass rounded-2xl p-4"><div className="flex items-center justify-between"><span className="text-[8px] tracking-[.2em] text-white/35">{label}</span><span className="text-[9px] text-[#63D8FF]">0{i+1}</span></div><div className="mt-2 font-mono text-3xl font-bold text-white">{value}</div><div className="mt-1 text-[8px] text-white/30">{sub}</div></div>)}
            </div>

            <div className="grid gap-3 xl:grid-cols-[1.2fr_.8fr]">
              <div className="glass rounded-[28px] p-5">
                <div className="flex items-center justify-between"><div><div className="text-[9px] tracking-[.3em] text-[#63D8FF]">CAPABILITY MATRIX</div><div className="mt-1 text-xs text-white/35">{onlineDomains} active domains • {total} registered capability nodes</div></div><button onClick={()=>setActive("capabilities")} className="rounded-xl border border-[#39B9FF]/20 px-3 py-2 text-[8px] text-[#63D8FF]">OPEN MATRIX</button></div>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {domains.slice(0,12).map(d=><div key={d} className="rounded-xl border border-white/8 bg-black/20 p-3"><div className="flex justify-between gap-2"><span className="text-[9px]">{labels[d]}</span><span className="font-mono text-[8px] text-[#63D8FF]">{data?.summary?.[d]||0}</span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-[#168CFF] to-[#63D8FF]" style={{width:`${Math.min(100,((data?.summary?.[d]||0)/16)*100)}%`}}/></div></div>)}
                </div>
              </div>
              <div className="glass rounded-[28px] p-5">
                <div className="text-[9px] tracking-[.3em] text-[#63D8FF]">EXECUTION FABRIC</div>
                <div className="mt-5 space-y-3">
                  {[["MASTER",master,"#7C5CFF"],["EXECUTION-READY",ready,"#39B9FF"],["FOUNDATION",foundation,"#64748B"]].map(([name,value,color])=><div key={String(name)}><div className="flex justify-between text-[9px]"><span>{name}</span><span className="font-mono" style={{color:String(color)}}>{value}</span></div><div className="mt-2 h-2 rounded-full bg-white/5"><div className="h-full rounded-full" style={{width:`${total?Number(value)/total*100:0}%`,background:String(color)}}/></div></div>)}
                </div>
                <div className="mt-6 border-t border-white/8 pt-4 text-[8px] leading-4 text-white/30">High-impact operations remain explicitly authorized, verified and audited. The interface does not grant execution authority by itself.</div>
              </div>
            </div>
          </section>}

          {active==="command" && <section className="mt-3 space-y-3">
            <div className="glass rounded-[30px] p-6">
              <div className="text-[9px] tracking-[.4em] text-[#63D8FF]">COMMAND CONSOLE</div>
              <h2 className="mt-2 text-3xl font-bold text-white">Route a mission through THARA</h2>
              <p className="mt-2 text-xs text-white/35">Describe the objective. THARA identifies relevant capability domains and engineering workflows.</p>
              <div className="mt-6 flex gap-2"><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&route()} placeholder="Build, research, analyze, design, simulate, secure…" className="thara-input flex-1 rounded-2xl px-4"/><button disabled={routing} onClick={route} className="thara-button rounded-2xl px-6 text-xs font-bold">{routing?"ROUTING…":"ROUTE MISSION"}</button></div>
            </div>
            {routes.length>0 && <div className="grid gap-3 md:grid-cols-2">
              <div className="glass rounded-[26px] p-5"><div className="text-[9px] tracking-[.3em] text-[#63D8FF]">ROUTING RESULT</div><div className="mt-4 flex flex-wrap gap-2">{routes.map(x=><span key={x} className="rounded-full border border-[#39B9FF]/20 bg-[#168CFF]/10 px-3 py-2 text-[9px] text-[#63D8FF]">{labels[x]||x}</span>)}</div></div>
              <div className="glass rounded-[26px] p-5"><div className="text-[9px] tracking-[.3em] text-[#63D8FF]">MATCHED CAPABILITIES</div><div className="mt-4 space-y-2">{routedCapabilities.slice(0,8).map((c:any)=><div key={c.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 p-3"><span className="text-[9px]">{c.name}</span><span className="text-[8px] text-[#63D8FF]">{c.execution?.level||c.status}</span></div>)}</div></div>
            </div>}
          </section>}

          {active==="capabilities" && <section className="mt-3 space-y-3">
            <div className="glass rounded-[26px] p-5"><div className="text-[9px] tracking-[.35em] text-[#63D8FF]">CAPABILITY MATRIX // {total} NODES</div><div className="mt-2 text-xs text-white/35">Technical registry with execution state, action surface and domain ownership.</div></div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{domains.map(d=><div key={d} className="glass rounded-[24px] p-4"><div className="flex items-center justify-between"><span className="text-[10px] tracking-widest">{labels[d]}</span><span className="font-mono text-[8px] text-[#63D8FF]">{data?.summary?.[d]||0} NODES</span></div><div className="mt-3 space-y-2">{capabilities.filter((c:any)=>c.domain===d).map((c:any)=><div key={c.id} className="rounded-xl border border-white/8 bg-black/20 p-3"><div className="flex justify-between gap-2"><b className="text-[9px]">{c.name}</b><span className="text-[7px] text-[#63D8FF]">{String(c.execution?.level||c.status).toUpperCase()}</span></div><div className="mt-2 text-[8px] leading-4 text-white/30">{c.description}</div></div>)}</div></div>)}</div>
          </section>}

          {active==="engineering" && <section className="mt-3 grid gap-3 lg:grid-cols-[1.1fr_.9fr]">
            <div className="glass rounded-[28px] p-6"><div className="text-[9px] tracking-[.35em] text-[#63D8FF]">ENGINEERING COMMAND</div><h2 className="mt-2 text-3xl font-bold">CAD → CAE → CAM → IIoT</h2><p className="mt-2 text-xs leading-5 text-white/35">Engineering workflows remain separated from direct machine execution. Generated artifacts and simulation plans are validated before consequential action.</p><div className="mt-6 grid grid-cols-2 gap-2">{Object.entries(data?.engineering?.summary||{}).map(([k,v])=><div key={k} className="rounded-xl border border-white/8 bg-black/20 p-4"><div className="text-[8px] text-white/35">{k.toUpperCase()}</div><div className="mt-1 font-mono text-xl text-[#63D8FF]">{String(v)}</div></div>)}</div></div>
            <div className="glass rounded-[28px] p-6"><div className="text-[9px] tracking-[.35em] text-[#BBAAFF]">EXECUTION BOUNDARY</div><div className="mt-5 space-y-3">{["Requirements","Parametric CAD","Simulation","Optimization","Manufacturing plan","Digital twin","Telemetry"].map((x,i)=><div key={x} className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/20 p-3"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#168CFF]/10 font-mono text-[8px] text-[#63D8FF]">0{i+1}</span><span className="text-[9px]">{x}</span><span className="ml-auto text-[7px] text-[#63D8FF]">{i<5?"READY":"GUARDED"}</span></div>)}</div></div>
          </section>}

          {active==="security" && <section className="mt-3 grid gap-3 lg:grid-cols-2">
            <div className="glass rounded-[28px] p-6"><div className="text-[9px] tracking-[.35em] text-[#63D8FF]">SENTINEL // SECURITY FABRIC</div><h2 className="mt-2 text-3xl font-bold">PROTECTED COMMAND SURFACE</h2><p className="mt-3 text-xs leading-5 text-white/35">Security boundaries, permission gates, Line Clear authentication and defensive analysis are surfaced as first-class system controls.</p><div className="mt-6 space-y-2">{["Prompt injection defense","Tool permission gateway","Fingerprint Line Clear","Secret scanner","Security audit","Incident response"].map((x,i)=><div key={x} className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 p-4"><span className="text-[9px]">{x}</span><span className="text-[8px] text-[#63D8FF]">{i<3?"ACTIVE":"GUARDED"}</span></div>)}</div></div>
            <div className="glass rounded-[28px] p-6"><div className="text-[9px] tracking-[.35em] text-[#BBAAFF]">AUTHORIZATION MODEL</div><div className="mt-6 grid gap-3 sm:grid-cols-2">{[["READ","LOW IMPACT"],["WRITE","APPROVAL"],["DEPLOY","VERIFICATION"],["CONTROL","LINE CLEAR"]].map(([a,b])=><div key={a} className="rounded-2xl border border-white/8 bg-black/20 p-5"><div className="text-xl font-bold">{a}</div><div className="mt-2 text-[8px] tracking-widest text-[#63D8FF]">{b}</div></div>)}</div></div>
          </section>}

          {active==="telemetry" && <section className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_.8fr]">
            <div className="glass rounded-[28px] p-6"><div className="flex items-center justify-between"><div><div className="text-[9px] tracking-[.35em] text-[#63D8FF]">TELEMETRY STREAM</div><div className="mt-1 text-xs text-white/35">Recorded THARA capability events</div></div><button onClick={load} className="rounded-xl border border-[#39B9FF]/20 px-3 py-2 text-[8px] text-[#63D8FF]">REFRESH</button></div><div className="mt-5 space-y-2">{telemetry.length?telemetry.slice(0,20).map((t:any,i)=><div key={i} className="grid grid-cols-[70px_1fr_auto] gap-3 rounded-xl border border-white/8 bg-black/20 p-3 text-[8px]"><span className="font-mono text-white/25">{new Date(t.createdAt||Date.now()).toLocaleTimeString()}</span><span>{t.event||"capability event"}</span><span className="text-[#63D8FF]">{t.success===false?"FAILED":"OK"}</span></div>):<div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-white/25">No telemetry events returned for this session.</div>}</div></div>
            <div className="glass rounded-[28px] p-6"><div className="text-[9px] tracking-[.35em] text-[#63D8FF]">SYSTEM METRICS</div><div className="mt-5 space-y-4">{[["CAPABILITIES",total],["MASTER",master],["READY",ready],["FOUNDATION",foundation],["DOMAINS",onlineDomains]].map(([k,v])=><div key={String(k)} className="flex items-end justify-between border-b border-white/8 pb-3"><span className="text-[8px] text-white/35">{k}</span><span className="font-mono text-xl text-white">{v}</span></div>)}</div></div>
          </section>}
        </div>
      </div>
    </main>
  );
}
