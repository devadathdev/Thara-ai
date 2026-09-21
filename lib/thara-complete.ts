export type TharaExpansionStatus = "online" | "guarded" | "beta" | "planned";

export type TharaExpansionCapability = {
  id: string;
  name: string;
  domain: string;
  status: TharaExpansionStatus;
  description: string;
  actions: string[];
};

export const THARA_COMPLETE_CAPABILITIES: TharaExpansionCapability[] = [
  // Intelligence
  ["reasoning-core","Reasoning Core","intelligence","online","Planning, synthesis, verification and structured reasoning.",["reason","plan","verify","synthesize"]],
  ["agent-orchestrator","Agent Orchestrator","intelligence","online","Specialist-agent decomposition, delegation and result merging.",["decompose","delegate","merge"]],
  ["task-planner","Task Planner","intelligence","online","Turns goals into ordered, dependency-aware missions.",["plan","prioritize","sequence"]],
  ["decision-support","Decision Support","intelligence","beta","Evidence-backed option analysis without silently making consequential choices.",["compare","explain","tradeoffs"]],
  ["context-engine","Context Engine","intelligence","beta","Combines conversation, memory, files, tools and task state.",["fuse","rank","ground"]],
  ["self-reflection","Self Reflection","intelligence","beta","Post-task critique and error analysis before learning signals are persisted.",["critique","detect","improve"]],

  // Memory + knowledge
  ["memory-vault","Memory Vault","memory","online","Durable user-scoped memories with relevance retrieval.",["remember","retrieve","forget-request"]],
  ["episodic-memory","Episodic Memory","memory","beta","Timeline of important interactions, projects and outcomes.",["timeline","retrieve","summarize"]],
  ["semantic-memory","Semantic Memory","memory","online","Meaning-based retrieval across stored context.",["embed","retrieve","rank"]],
  ["knowledge-graph","Knowledge Graph","memory","online","Links people, projects, concepts, datasets and artifacts.",["link","relate","traverse"]],
  ["memory-consolidation","Memory Consolidation","memory","beta","Merges duplicate memories and promotes stable facts.",["dedupe","consolidate","score"]],
  ["memory-encryption","Memory Encryption","memory","guarded","Application-level encrypted memory boundary with server-side key management.",["encrypt","decrypt","audit"]],

  // Builder
  ["autonomous-forge","Autonomous Forge","builder","guarded","Mission-based software construction with approval boundaries.",["plan","build","test","verify"]],
  ["code-repair","Code Repair","builder","guarded","Diagnoses, patches and validates bounded code changes.",["diagnose","patch","test","rollback"]],
  ["repo-agent","Repository Agent","builder","guarded","Repository-aware implementation, review and change planning.",["inspect","edit","review"]],
  ["test-generation","Test Generation","builder","beta","Generates unit, integration and regression test candidates.",["generate","run","report"]],
  ["dependency-audit","Dependency Audit","builder","beta","Checks dependency drift, known-risk metadata and compatibility.",["scan","compare","report"]],
  ["ci-cd-orchestrator","CI/CD Orchestrator","builder","guarded","Build, test and deployment workflow orchestration.",["build","test","promote","rollback"]],
  ["artifact-packager","Artifact Packager","builder","beta","Produces reproducible project artifacts and release metadata.",["package","hash","manifest"]],

  // Research
  ["deep-research","Deep Research","research","online","Multi-source search, page reading and evidence synthesis.",["search","read","cross-check","cite"]],
  ["research-workspace","Research Workspace","research","beta","Persistent research missions, findings and source trails.",["save","compare","summarize"]],
  ["literature-map","Literature Mapping","research","beta","Clusters papers, claims, methods and research gaps.",["cluster","map","compare"]],
  ["citation-verifier","Citation Verifier","research","beta","Checks whether cited sources support extracted claims.",["verify","trace","flag"]],
  ["experiment-manager","Experiment Manager","research","beta","Tracks experiments, parameters, artifacts and results.",["define","run","record"]],
  ["hypothesis-engine","Hypothesis Engine","research","planned","Generates testable hypotheses and experiment plans.",["hypothesize","test","revise"]],

  // Voice
  ["voice-core","Voice Core","voice","online","Speech recognition and speech synthesis where device APIs permit.",["listen","transcribe","speak"]],
  ["wake-word","Wake Word","voice","beta","Local wake-word boundary for THARA activation.",["listen","detect","handoff"]],
  ["voice-command-router","Voice Command Router","voice","online","Routes spoken commands through the secure assistant pipeline.",["wake","route","execute"]],
  ["conversation-barge-in","Barge-In","voice","planned","Interruptible speech with cancellation and turn-taking.",["interrupt","cancel","resume"]],
  ["voice-emotion-prosody","Prosody Control","voice","planned","Configurable speech pacing, emphasis and conversational prosody.",["pace","emphasize","speak"]],

  // Multimodal
  ["vision-core","Vision Core","multimodal","beta","Image and screenshot inspection.",["inspect","extract","explain"]],
  ["document-intelligence","Document Intelligence","multimodal","beta","Structured document extraction and analysis.",["parse","extract","summarize"]],
  ["ocr-pipeline","OCR Pipeline","multimodal","beta","Text extraction from scanned images and documents.",["ocr","layout","normalize"]],
  ["audio-intelligence","Audio Intelligence","multimodal","planned","Audio transcription, diarization and analysis.",["transcribe","segment","analyze"]],
  ["video-intelligence","Video Intelligence","multimodal","planned","Temporal video understanding and event extraction.",["sample","track","summarize"]],
  ["3d-understanding","3D Understanding","multimodal","planned","3D asset inspection and spatial reasoning.",["inspect","measure","reason"]],

  // Security
  ["sentinel","Sentinel Security AI","security","online","Defensive threat analysis, hardening and incident guidance.",["scan","triage","harden","alert"]],
  ["prompt-injection-defense","Prompt Injection Defense","security","online","Treats retrieved web/data content as untrusted source material.",["detect","isolate","sanitize"]],
  ["permission-gateway","Tool Permission Gateway","security","guarded","Separates read, write, deploy and high-impact actions.",["authorize","deny","audit"]],
  ["line-clear-auth","Fingerprint Line Clear Authentication","security","beta","WebAuthn/platform-authenticator step-up authentication for protected operations.",["register","verify","scope"]],
  ["secret-scanner","Secret Scanner","security","beta","Detects credentials and sensitive material before persistence or commits.",["scan","redact","block"]],
  ["security-audit","Security Audit","security","beta","Configuration, dependency and application security checks.",["audit","score","report"]],
  ["incident-response","Incident Response","security","guarded","Guided containment, evidence collection and recovery workflows.",["contain","collect","recover"]],

  // Performance
  ["latency-engine","Latency Engine","performance","online","Measures end-to-end latency and keeps fast paths lightweight.",["measure","route","budget"]],
  ["parallel-execution","Parallel Execution","performance","online","Concurrent independent retrieval and tool operations.",["parallelize","cache","merge"]],
  ["semantic-cache","Semantic Cache","performance","beta","Reuses safe equivalent retrieval/model work to reduce latency.",["lookup","validate","reuse"]],
  ["model-router","Adaptive Model Router","performance","online","Chooses model paths using task type, latency and availability.",["classify","route","fallback"]],
  ["offline-mode","Offline Mode","performance","beta","Local inference and local-only workflows when network access is unavailable.",["probe","switch","recover"]],
  ["cost-router","Cost Router","performance","planned","Routes work using configurable latency, quality and cost budgets.",["estimate","route","budget"]],

  // Data
  ["dataset-hub","Dataset Hub","data","online","Federated dataset discovery, metadata and retrieval.",["discover","inspect","retrieve"]],
  ["dataset-quality","Dataset Quality Engine","data","beta","Quality, deduplication, provenance and schema checks.",["profile","dedupe","validate"]],
  ["pii-filter","PII Filter","data","beta","Detects and removes or quarantines sensitive data before indexing.",["detect","redact","quarantine"]],
  ["data-lineage","Data Lineage","data","beta","Tracks dataset-to-answer and artifact provenance.",["trace","version","audit"]],
  ["synthetic-data","Synthetic Data Lab","data","planned","Controlled synthetic dataset generation and validation.",["generate","validate","balance"]],
  ["feature-store","Feature Store","data","planned","Reusable ML feature definitions and versioning.",["define","version","serve"]],

  // ML / models
  ["model-lab","Model Lab","ml","beta","Model configuration, evaluation and experiment workspace.",["configure","evaluate","compare"]],
  ["rag-forge","RAG Forge","ml","beta","Retrieval, grounding, chunking and context assembly workflows.",["index","retrieve","ground"]],
  ["fine-tuning-pipeline","Fine-Tuning Pipeline","ml","planned","Dataset preparation, training orchestration and evaluation.",["prepare","train","evaluate"]],
  ["model-evaluation","Model Evaluation","ml","beta","Quality, safety, latency and regression evaluation.",["benchmark","score","regress"]],
  ["model-registry","Model Registry","ml","planned","Versioned model metadata, lineage and deployment state.",["register","version","promote"]],

  // Engineering
  ["cad-fabric","CAD Engineering Fabric","engineering","beta","Parametric CAD, assemblies, drawings and interchange workflows.",["model","assemble","draw","export"]],
  ["generative-design","Generative Design","engineering","planned","Constraint-driven design-space generation and optimization.",["generate","constrain","optimize"]],
  ["cae-fabric","CAE Simulation Fabric","engineering","beta","FEA, CFD, thermal, multiphysics and meshing workflows.",["mesh","simulate","analyze"]],
  ["surrogate-models","Engineering Surrogate Models","engineering","planned","AI surrogate models for faster engineering exploration.",["train","predict","validate"]],
  ["optimization","Engineering Optimization","engineering","beta","Parameter sweeps, sensitivity analysis and optimization planning.",["sweep","analyze","optimize"]],
  ["plm","PLM / Digital Thread","engineering","planned","Requirements, revisions, BOMs and lifecycle traceability.",["link","version","trace"]],
  ["requirements-engineering","Requirements Engineering","engineering","beta","Turns natural-language requirements into verifiable engineering requirements.",["extract","trace","verify"]],

  // Manufacturing
  ["manufacturing-fabric","Manufacturing Fabric","manufacturing","beta","CAM, CNC planning, electronics, quality and DFM workflows.",["plan","toolpath","inspect"]],
  ["cnc-planning","CNC Process Planning","manufacturing","beta","Preview-only toolpath and process planning with machine-execution gates.",["plan","simulate","validate"]],
  ["dfm-dfa","DFM-DFA","manufacturing","beta","Design-for-manufacturing and design-for-assembly checks.",["check","flag","optimize"]],
  ["bom-costing","BOM & Cost Estimation","manufacturing","beta","BOM normalization and preliminary cost estimation.",["extract","estimate","compare"]],
  ["quality-inspection","Quality & Inspection","manufacturing","beta","Inspection plans, measurements and defect workflows.",["plan","inspect","trace"]],
  ["additive-manufacturing","Additive Manufacturing","manufacturing","planned","3D-print preparation and process planning.",["slice","validate","plan"]],
  ["electronics-fabric","Electronics Engineering","manufacturing","planned","PCB/ECAD workflow integration and design checks.",["schematic","layout","verify"]],

  // Industry 4.0
  ["industry4-fabric","Industry 4.0 Fabric","industry4","beta","IIoT connectivity, telemetry, digital twins, MES and OEE.",["connect","telemetry","twin","optimize"]],
  ["opcua","OPC UA Gateway","industry4","guarded","Industrial interoperability boundary for approved telemetry operations.",["read","map","audit"]],
  ["mqtt-sparkplug","MQTT / Sparkplug","industry4","guarded","Industrial event and telemetry messaging boundary.",["subscribe","publish","audit"]],
  ["modbus","Modbus Gateway","industry4","guarded","Modbus telemetry/control integration boundary.",["read","validate","audit"]],
  ["digital-twin","Digital Twin","industry4","beta","Virtual asset/process representation synchronized with approved telemetry.",["model","sync","simulate"]],
  ["mes-integration","MES Integration","industry4","planned","Production execution and traceability integration.",["read","trace","report"]],
  ["oee","OEE Analytics","industry4","beta","Availability, performance and quality analytics.",["measure","trend","report"]],
  ["predictive-maintenance","Predictive Maintenance","industry4","beta","Condition monitoring and maintenance prediction workflows.",["monitor","detect","forecast"]],
  ["factory-telemetry","Factory Telemetry","industry4","beta","Time-series machine and environment telemetry pipelines.",["ingest","aggregate","visualize"]],
  ["production-traceability","Production Traceability","industry4","planned","Lot, serial, process and quality genealogy.",["track","link","audit"]],

  // Robotics
  ["robotics-orchestrator","Robotics Orchestrator","robotics","planned","Task planning and guarded robot workflow orchestration.",["plan","simulate","verify"]],
  ["ros2-integration","ROS 2 Integration","robotics","planned","ROS 2 graph, topics and simulation integration boundary.",["inspect","simulate","bridge"]],
  ["robot-simulation","Robot Simulation","robotics","planned","Collision-aware robot simulation and trajectory planning.",["simulate","plan","validate"]],
  ["motion-planning","Motion Planning","robotics","planned","Constrained motion and trajectory planning.",["plan","check","export"]],

  // Science / materials
  ["scientific-computing","Scientific Computing","science","beta","Numerical analysis, data processing and reproducible computation.",["compute","analyze","reproduce"]],
  ["chemistry-lab","Computational Chemistry","science","planned","Molecular modeling and chemistry workflow integration.",["model","calculate","compare"]],
  ["materials-lab","Materials Intelligence","science","planned","Materials-property datasets, screening and candidate comparison.",["search","screen","compare"]],
  ["nanomaterials","Nanomaterials Intelligence","science","planned","Nanomaterial literature, properties and experiment knowledge workflows.",["map","screen","reason"]],
  ["physics-informed-ai","Physics-Informed AI","science","planned","Physics constraints integrated with machine-learning workflows.",["constrain","train","validate"]],

  // Healthcare / bio
  ["health-data-boundary","Healthcare Data Boundary","healthcare","planned","Privacy-aware health-data processing boundary.",["classify","redact","audit"]],
  ["clinical-literature","Clinical Literature Research","healthcare","planned","Evidence retrieval for clinical and biomedical literature.",["search","cite","compare"]],
  ["biomedical-rag","Biomedical RAG","healthcare","planned","Grounded biomedical retrieval and document synthesis.",["retrieve","ground","cite"]],

  // Agriculture / climate
  ["agri-intelligence","Agriculture Intelligence","agriculture","planned","Crop, soil, weather and farm-data reasoning.",["analyze","predict","recommend"]],
  ["farm-iot","Farm IoT","agriculture","planned","Sensor telemetry and farm digital-twin boundary.",["ingest","monitor","simulate"]],
  ["climate-intelligence","Climate Intelligence","climate","planned","Climate datasets, risk analysis and scenario workflows.",["retrieve","model","compare"]],

  // Product / knowledge
  ["project-os","Project OS","product","beta","Projects, milestones, tasks, artifacts and decisions in one graph.",["plan","track","link"]],
  ["meeting-intelligence","Meeting Intelligence","product","planned","Meeting transcription, decisions and action extraction.",["transcribe","extract","assign"]],
  ["personal-dashboard","Personal Intelligence Dashboard","product","beta","Unified status, missions, memory and system telemetry.",["observe","prioritize","act"]],
  ["notification-engine","Notification Engine","product","beta","Priority-aware proactive alerts and reminders.",["schedule","prioritize","notify"]],

  // Native / device
  ["android-companion","Native Android Companion","device","beta","Native companion shell with explicit device permissions.",["pair","sync","notify"]],
  ["device-control","Device Control","device","guarded","Permissioned local-device actions with user approval.",["authorize","execute","audit"]],
  ["local-files","Local File Intelligence","device","planned","Permissioned local file search and analysis.",["index","search","analyze"]],
  ["system-automation","System Automation","device","guarded","Explicitly approved device workflows with audit trails.",["authorize","execute","audit"]],

  // Collaboration / ecosystem
  ["skills-sdk","Skills SDK","ecosystem","beta","Extensible capability/plugin interface with permission scopes.",["register","discover","enable"]],
  ["thara-api","THARA API","ecosystem","beta","Authenticated API surface for THARA-connected applications.",["discover","invoke","observe"]],
  ["automation-core","Automation Core","ecosystem","guarded","Scheduled and event-driven missions with approval boundaries.",["schedule","run","verify"]],
  ["collaboration","Team Collaboration","ecosystem","planned","Shared projects, roles, comments and artifact handoff.",["share","review","handoff"]],
  ["webhooks","Webhooks & Events","ecosystem","planned","Signed event delivery for integrations.",["emit","verify","retry"]],

  // Evaluation / governance
  ["benchmark-arena","Benchmark Arena","evaluation","beta","Repeatable correctness, safety and latency benchmark suites.",["run","score","compare"]],
  ["long-term-eval","Long-Term Evaluation","evaluation","beta","Tracks quality, latency and regression signals over time.",["record","aggregate","detect"]],
  ["safety-evals","Safety Evaluation","evaluation","planned","Adversarial tests for tool use, privacy and policy boundaries.",["attack","measure","report"]],
  ["observability","Observability","evaluation","beta","Structured logs, traces, latency and tool outcomes.",["trace","measure","diagnose"]],
  ["audit-ledger","Audit Ledger","evaluation","guarded","Tamper-resistant record of consequential actions and approvals.",["record","verify","export"]],

  // Experience
  ["hud-interface","Cinematic HUD","experience","online","Dark glassmorphic command-center interface with live system state.",["observe","route","control"]],
  ["accessibility","Accessibility Fabric","experience","online","Keyboard, screen-reader, contrast, motion and target-size support.",["navigate","read","adapt"]],
  ["multilingual","Multilingual Core","experience","online","Language detection and multilingual interaction.",["detect","translate","speak"]],
  ["personalization","Adaptive Personality","experience","beta","User-configurable response style and interaction preferences.",["learn","adapt","apply"]],
  ["xr-interface","AR/VR Interface","experience","planned","Immersive interface boundary for spatial engineering and digital twins.",["view","interact","simulate"]]
].map(([id,name,domain,status,description,actions])=>({id,name,domain,status,description,actions} as TharaExpansionCapability));

export function completeCapabilitySummary() {
  return THARA_COMPLETE_CAPABILITIES.reduce<Record<string,number>>((out,c)=>{
    out[c.domain]=(out[c.domain]||0)+1;
    return out;
  },{});
}

export function allTharaCapabilities() {
  return THARA_COMPLETE_CAPABILITIES;
}
