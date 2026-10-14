import { db } from "@/lib/db";

export type TharaCapability = {
  id: string;
  name: string;
  domain: "intelligence"|"memory"|"builder"|"research"|"voice"|"multimodal"|"security"|"performance"|"ecosystem"|"engineering";
  status: "online"|"guarded"|"beta";
  description: string;
  actions: string[];
};

export const THARA_CAPABILITIES: TharaCapability[] = [
  {id:"intelligence-core",name:"Intelligence Core",domain:"intelligence",status:"online",description:"Routes requests through planning, specialist delegation, verification and synthesis.",actions:["plan","route","verify","synthesize"]},
  {id:"agent-swarm",name:"Agent Swarm",domain:"intelligence",status:"online",description:"Coordinates specialist agents for complex engineering and research tasks.",actions:["decompose","delegate","merge"]},
  {id:"memory-vault",name:"Memory Vault",domain:"memory",status:"online",description:"User-scoped durable memory with relevance retrieval and timeline metadata.",actions:["remember","retrieve","prioritize"]},
  {id:"memory-graph",name:"Memory Knowledge Graph",domain:"memory",status:"online",description:"Connects memories, projects, datasets and concepts into a navigable graph.",actions:["link","relate","enrich"]},
  {id:"autonomous-forge",name:"Autonomous Forge",domain:"builder",status:"guarded",description:"Mission-based build workflow with explicit approval boundaries.",actions:["plan","build","test","verify","package"]},
  {id:"code-repair",name:"Code Repair",domain:"builder",status:"guarded",description:"Structured debugging and bounded code-change planning.",actions:["diagnose","patch","test","rollback"]},
  {id:"deep-research",name:"Deep Research",domain:"research",status:"online",description:"Multi-source research with source-aware context and evidence handling.",actions:["search","read","cross-check","cite"]},
  {id:"research-workspace",name:"Research Workspace",domain:"research",status:"beta",description:"Stores research missions, findings and reproducible source trails.",actions:["save","compare","summarize"]},
  {id:"voice-core",name:"Voice Core",domain:"voice",status:"online",description:"Wake-word, speech recognition and soft speech synthesis through supported browser/device APIs.",actions:["listen","transcribe","speak"]},
  {id:"voice-command",name:"Voice Command Router",domain:"voice",status:"online",description:"Maps spoken THARA commands into the same secure assistant pipeline.",actions:["wake","route","execute"]},
  {id:"vision-core",name:"Vision Core",domain:"multimodal",status:"beta",description:"Multimodal input boundary for images, screenshots and visual documents.",actions:["inspect","extract","explain"]},
  {id:"document-intelligence",name:"Document Intelligence",domain:"multimodal",status:"beta",description:"Designed for structured extraction and analysis of supplied documents.",actions:["parse","extract","summarize"]},
  {id:"sentinel-gateway",name:"Sentinel Security Gateway",domain:"security",status:"online",description:"Threat analysis, prompt-injection defense and defensive recommendations.",actions:["scan","triage","harden","alert"]},
  {id:"permission-gateway",name:"Tool Permission Gateway",domain:"security",status:"guarded",description:"Separates read, write, deploy and high-impact actions with approval boundaries.",actions:["authorize","deny","audit"]},
  {id:"latency-engine",name:"Latency Engine",domain:"performance",status:"online",description:"Tracks end-to-end latency and keeps fast-path requests lightweight.",actions:["measure","route","budget"]},
  {id:"parallel-execution",name:"Parallel Execution",domain:"performance",status:"online",description:"Runs independent retrieval operations concurrently to reduce waiting.",actions:["parallelize","cache","compress"]},
  {id:"skills-sdk",name:"THARA Skills SDK",domain:"ecosystem",status:"beta",description:"Capability registry for adding bounded tools and specialist skills.",actions:["register","discover","enable"]},
  {id:"automation-core",name:"Automation Core",domain:"ecosystem",status:"guarded",description:"Mission and workflow automation with explicit control boundaries.",actions:["schedule","run","verify"]},
  {id:"thara-api",name:"THARA API",domain:"ecosystem",status:"beta",description:"Stable internal capability surface for THARA-connected applications.",actions:["discover","invoke","observe"]},
  {id:"android-companion",name:"Native Android Companion",domain:"ecosystem",status:"beta",description:"Native Android companion shell with explicit device permissions and secure transport boundaries.",actions:["pair","sync","notify","handoff"]},
  {id:"local-inference",name:"Local Model Fallback",domain:"performance",status:"beta",description:"Device-local inference adapter for offline or low-latency fallback before cloud routing.",actions:["probe","select","fallback","health"]},
  {id:"native-wakeword",name:"Low-Power Wake Word",domain:"voice",status:"beta",description:"On-device wake-word boundary designed for low-power continuous listening without cloud audio streaming.",actions:["listen","detect","handoff"]},
  {id:"sandbox-forge",name:"Sandboxed Coding",domain:"builder",status:"guarded",description:"Temporary isolated execution boundary for generated code with policy checks and explicit approval gates.",actions:["stage","execute","test","destroy"]},
  {id:"benchmark-arena",name:"Benchmark Arena",domain:"performance",status:"beta",description:"Automated correctness and latency evaluation across repeatable benchmark suites.",actions:["run","score","compare","report"]},
  {id:"long-term-eval",name:"Long-Term Evaluation",domain:"intelligence",status:"beta",description:"Tracks quality, latency and regression signals over time without silently changing production behavior.",actions:["record","aggregate","detect","review"]},
  {id:"cad-engineering",name:"CAD Engineering Fabric",domain:"engineering",status:"beta",description:"CAD workflow registry for parametric modeling, assemblies, drawings and engineering interchange.",actions:["model","assemble","draw","export"]},
  {id:"cae-simulation",name:"CAE Simulation Fabric",domain:"engineering",status:"beta",description:"CAE workflow registry for FEA, CFD, thermal, multiphysics and meshing workflows.",actions:["mesh","simulate","analyze","optimize"]},
  {id:"manufacturing-fabric",name:"Manufacturing Fabric",domain:"engineering",status:"beta",description:"CAM, CNC, electronics, process planning, quality and design-for-manufacturing workflows.",actions:["plan","toolpath","manufacture","inspect"]},
  {id:"industry4-fabric",name:"Industry 4.0 Fabric",domain:"engineering",status:"beta",description:"Industrial connectivity, IIoT, digital twins, MES, OEE, traceability and predictive-maintenance workflows.",actions:["connect","telemetry","twin","optimize"]},
];

export function capabilitySummary() {
  return THARA_CAPABILITIES.reduce<Record<string, number>>((a,c)=>{a[c.domain]=(a[c.domain]||0)+1;return a;},{});
}

export function routeCapability(message: string) {
  const m = message.toLowerCase();
  const matches: string[] = [];
  const rules: [RegExp,string][] = [
    [/\b(memory|remember|forgot|previous|knowledge graph)\b/,"memory"],
    [/\b(build|code|debug|app|deploy|github|vercel|sandbox|autonomous coding)\b/,"builder"],
    [/\b(research|paper|source|latest|investigate|evaluate|benchmark)\b/,"research"],
    [/\b(voice|speak|listen|wake|wake word|microphone)\b/,"voice"],
    [/\b(image|photo|screenshot|vision|pdf|document)\b/,"multimodal"],
    [/\b(security|phishing|malware|threat|secret|prompt injection)\b/,"security"],
    [/\b(latency|fast|performance|speed|cache|local model|offline|benchmark|evaluation)\b/,"performance"],
    [/\b(skill|plugin|automation|workflow|api|android|mobile|companion)\b/,"ecosystem"],
  ];
  for (const [re,d] of rules) if (re.test(m)) matches.push(d);
  if (!matches.length) matches.push("intelligence");
  return [...new Set(matches)];
}

export async function getCapabilityTelemetry(uid: string) {
  const events = await db.telemetryEvent.findMany({ where: { ownerId: uid }, orderBy: { createdAt: "desc" }, take: 25 });
  return events.map(event => ({
    id: event.id,
    event: event.category,
    ...(event.payload && typeof event.payload === "object" && !Array.isArray(event.payload) ? event.payload as Record<string, unknown> : {}),
    createdAt: event.createdAt
  }));
}
