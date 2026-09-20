# THARA AI

> **THARA** — a personal AI command center designed for voice-first interaction, engineering workflows, defensive security, and controlled self-improvement.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12-orange?logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-private-lightgrey)](#)

## What is THARA?

THARA is a persistent personal AI companion built around presence, voice, memory, context and action rather than a conventional chatbot. The command center is now a secondary surface; the companion itself is the product.

It combines:

- **Companion-first interaction**
- **Persistent personal memory and context**
- **Presence modes: Companion, Focus, Builder, Guardian, Workshop and Silent**
- **Voice input and speech output**
- **Multi-agent engineering orchestration**
- **Defensive personal security intelligence**
- **Model routing through OpenRouter/Gemini**
- **Holographic Workshop concepts for models, datasets and experiments**
- **Authenticated API access**
- **Controlled self-rewrite capabilities**
- **Security-focused data rules and bounded automation**

The goal is to make THARA feel like a persistent companion that can listen, understand context, remember useful information, proactively surface what matters, help with projects, and remain user-controlled. Complex requests can still be routed to specialist engineering agents and verified before delivery.

---

## Core Architecture

```text
                         ┌─────────────────────┐
                         │      THARA UI       │
                         │  Command Center     │
                         └──────────┬──────────┘
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
             Voice I/O        Command Router      Security
                  │                 │                 │
                  └─────────────────┼─────────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │   Assistant API     │
                         │ Firebase Auth       │
                         │ Rate Limiting       │
                         └──────────┬──────────┘
                                    │
                     ┌──────────────┼──────────────┐
                     │              │              │
                Model Router   Engineering Team  Sentinel
                     │              │              │
              ┌──────┴──────┐       │              │
              │             │       │              │
          OpenRouter      Gemini   Specialists   Threat AI
                                    │
              ┌─────────────────────┼────────────────────┐
              │                     │                    │
            Web/App              AI/Data            DevOps/QA
```

---

## Companion Core

THARA is designed around a companion loop rather than a chat loop:

```text
PRESENCE → LISTEN → UNDERSTAND → REMEMBER → PLAN → ACT → VERIFY → RETURN TO PRESENCE
```

### Companion modes

- **Companion** — natural conversation, memory and daily context
- **Focus** — minimal interruptions while helping with a task
- **Builder** — coding, projects, debugging and engineering agents
- **Guardian** — defensive security and privacy assistance
- **Workshop** — research, experiments and creative technical work
- **Silent** — no proactive speech while permitted background services continue

### Persistent memory

Useful memories are stored per authenticated user in Firestore. THARA should distinguish transient conversation from durable context and never invent memories. Memory APIs are authenticated server-side.

### Proactive behavior

THARA can surface useful context instead of waiting for a chat message, while asking before consequential actions. Voice is the primary interaction surface; the visual HUD is a companion dashboard.

---

## JARVIS-Style Features

### 🎙️ Voice Command Layer

THARA supports browser-based voice interaction where available.

Example:

> "THARA, explain this error."

The assistant can transcribe the command, process it, and speak the response using browser speech synthesis.

Voice capabilities depend on browser/device support.

### 🧠 Command Core

THARA is designed around commands such as:

```text
Explain this error
Build a Next.js application
Analyze this suspicious message
Plan my project
Design an AI architecture
Review my code
Run a security analysis
```

The command layer can route requests to the appropriate engineering/security context.

### 👨‍💻 Engineering Team

THARA includes a bounded engineering-team architecture:

| Specialist | Responsibility |
|---|---|
| Chief Architect | System architecture and planning |
| Web Engineer | Next.js, React and UI |
| App Engineer | Mobile application workflows |
| Backend Engineer | APIs, Firebase and data services |
| AI/ML Engineer | Models, RAG and evaluation |
| Data Engineer | Pipelines and datasets |
| Defensive Security Engineer | Hardening and threat analysis |
| DevOps/SRE Engineer | Infrastructure and deployment |
| QA/Verification Engineer | Testing and regression |
| Research Engineer | Experiments and benchmarks |
| Product Engineer | Requirements and UX |

The orchestration pattern is:

```text
DECOMPOSE → DELEGATE → VERIFY → SYNTHESIZE
```

Agents are intentionally not given unrestricted shell or network authority.

---

## 🛡️ Sentinel Security AI

Sentinel is the defensive security layer inside THARA.

It can identify signals related to:

- Credential/API-key exposure
- Phishing
- Suspicious payment/account messages
- Malware indicators
- Ransomware indicators
- Keyloggers and information stealers

It provides defensive recommendations such as:

- Credential rotation
- MFA/passkeys
- Patch management
- Least privilege
- Encrypted backups
- Authentication/event monitoring
- Isolation and incident-response steps when appropriate

THARA is designed for **defensive security**, not uncontrolled offensive automation.

---

## 🔐 Security Architecture

### Firebase Authentication

Assistant API requests require a verified Firebase ID token.

The server derives the user identity from the verified token rather than trusting a client-supplied UID.

### Rate Limiting

The assistant endpoint has a per-user request limit to reduce abuse.

> Production multi-instance deployments should replace the in-memory limiter with a distributed store such as Redis/Upstash or an equivalent service.

### Firestore Rules

Firestore access is explicitly scoped to the authenticated user's own documents.

The rules reject unexpected document paths and restrict writable fields.

### Server-Side API Keys

Provider credentials must remain server-side.

Do **not** use:

```text
NEXT_PUBLIC_OPENROUTER_API_KEY
NEXT_PUBLIC_GEMINI_API_KEY
```

Use:

```text
OPENROUTER_API_KEY
GEMINI_API_KEY
```

### AES-256-GCM

THARA includes an AES-256-GCM helper for application-level encryption.

The encryption key must be exactly 32 random bytes encoded as base64 and kept server-side.

### TLS 1.3

TLS is provided by the hosting/network layer. THARA should be deployed behind HTTPS with modern TLS configuration.

---

## ♻️ Controlled Self-Rewrite

THARA supports an explicit self-rewrite command:

```text
THARA, REWRITE YOUR OWN CODE
```

This is intentionally **bounded**, not unrestricted autonomous code mutation.

The rewrite layer:

1. Requires authenticated access.
2. Requires the exact authorization command.
3. Applies a cooldown/rate limit.
4. Exposes only an allowlisted set of source files.
5. Blocks secrets and environment files.
6. Blocks package/dependency manifests.
7. Blocks authentication/security-policy files.
8. Creates a backup before modification.
9. Rolls back files when the write transaction fails.
10. Requires structured model output.

### Current rewrite principle

```text
USER AUTHORIZATION
        ↓
BOUNDED SOURCE CONTEXT
        ↓
MODEL PROPOSES PATCH
        ↓
ALLOWLIST VALIDATION
        ↓
BACKUP
        ↓
APPLY
        ↓
VERIFY / ROLLBACK ON FAILURE
```

For production, add automated tests, static analysis, signed commits, human approval, and isolated build verification before allowing generated changes to reach deployment.

---

## 🧪 Holographic Workshop

The Workshop is the experimental R&D area of THARA.

Current interface concepts include:

- Dataset Lab
- Model Lab
- RAG Forge
- Benchmark Arena
- Prompt Lab
- Agent Graph
- Vision Lab
- Security Lab

These are designed to become connectors to real datasets, models, evaluation systems and experiments.

---

## 🤖 Model Routing

THARA supports server-side provider routing through OpenRouter and Gemini, with role-specific model configuration for orchestration, general tasks, coding and reasoning.

Example configuration:

~~~env
OPENROUTER_API_KEY=
OPENROUTER_ORCHESTRATOR_MODEL=
OPENROUTER_GENERAL_MODEL=openrouter/free
OPENROUTER_CODING_MODEL=openrouter/free
OPENROUTER_REASONING_MODEL=openrouter/free
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.1-flash-lite
TAVILY_API_KEY=
HUGGINGFACE_API_TOKEN=
~~~

---

## 🚀 Getting Started

### Requirements

- Node.js **20.9+**
- npm
- Firebase project
- Firebase Authentication
- Firestore
- OpenRouter and/or Gemini API credentials

### Install

```bash
git clone https://github.com/devadathdev/Thara-ai.git
cd Thara-ai

npm install
```

### Environment

Copy the example configuration:

```bash
cp .env.example .env.local
```

Fill in the Firebase, model-provider and server-side security variables.

Never commit `.env.local`.

### Development

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Production build

```bash
npm run build
npm start
```

If dependency installation is slow on a constrained Termux/ARM environment, allow npm enough time to complete and check Node/npm versions first:

```bash
node --version
npm --version
```

---

## 📁 Project Structure

~~~text
THARA AI
├── app/
│   ├── api/
│   │   ├── assistant/
│   │   ├── companion/
│   │   ├── datasets/
│   │   │   ├── search/
│   │   │   └── ingest/
│   │   ├── knowledge-graph/
│   │   ├── research/
│   │   ├── self-rewrite/
│   │   └── web/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── datasets/
│   │   ├── providers.ts
│   │   └── retrieval.ts
│   ├── assistant.ts
│   ├── companion.ts
│   ├── dataset-hub.ts
│   ├── knowledge-graph.ts
│   ├── language-detection.ts
│   ├── languages.ts
│   ├── model-router.ts
│   ├── research.ts
│   ├── security-agent.ts
│   ├── web-browser.ts
│   └── self-rewrite.ts
├── firestore.rules
├── next.config.*
├── package.json
├── tsconfig.json
└── .env.example
~~~

---

## ⚠️ Production Hardening Roadmap

Before treating THARA as a high-trust personal assistant, implement:

- Distributed rate limiting
- Firebase App Check
- Passkeys/WebAuthn instead of anonymous authentication
- Real biometric/device authentication boundaries
- Proper session management
- CSP and security headers
- Audit logging
- Tool-level permission scopes
- Sandboxed code execution
- Static analysis before self-rewrite
- Automated unit/integration tests
- Isolated build verification
- Signed commits/releases
- Human approval for high-impact changes
- Secret rotation and centralized secret management
- Persistent memory encryption with appropriate key management

### Important

The current self-rewrite system is a **controlled development capability**, not a guarantee that generated code is safe. Generated code should be tested and reviewed before production deployment.

---

## THARA V5 — Capability Fabric

THARA V5 unifies the requested capability layers behind one authenticated capability registry and smart router:

- **Intelligence** — Intelligence Core and Agent Swarm for planning, delegation, verification and synthesis.
- **Memory** — Memory Vault and Memory Knowledge Graph for durable user-scoped context.
- **Autonomous Builder** — Autonomous Forge and Code Repair with guarded mission/approval boundaries.
- **Research** — Deep Research and Research Workspace for multi-source evidence workflows.
- **Voice** — Voice Core and Voice Command Router for wake-word, speech input and speech output where supported.
- **Multimodal** — Vision Core and Document Intelligence for supplied visual/document inputs.
- **Security** — Sentinel Security Gateway and Tool Permission Gateway.
- **Performance** — Latency Engine and Parallel Execution for fast-path routing, measurement and concurrent retrieval.
- **THARA Ecosystem** — Skills SDK, Automation Core and THARA API capability surfaces.

The capability dashboard is available at:

`/thara`

The assistant API now returns `capabilityDomains` for each request so the UI and future agents can understand which THARA subsystems were selected.

---

## Roadmap

### THARA V1 — Companion Foundation
- [x] Voice interaction
- [x] Companion modes
- [x] Persistent memory
- [x] Authenticated assistant API
- [x] Model routing
- [x] Sentinel foundation

### THARA V2 — Intelligence Fabric
- [x] Knowledge Graph
- [x] Semantic memory retrieval
- [x] Multilingual support
- [x] Automatic language detection
- [x] Web browsing
- [x] Multi-source research

### THARA V3 — Data + Workshop
- [x] Dataset Hub
- [x] Federated dataset discovery
- [x] Safe dataset preview/indexing
- [x] Dataset retrieval
- [x] Dataset/Knowledge Graph connection
- [x] Workshop V1 → V8 architecture

### THARA V4 — Advanced Autonomy
- [x] Persistent mission/task queue
- [x] Explicit approval boundary for consequential missions
- [x] User-scoped mission API and Firestore rules
- [x] V4 Autonomous Forge UI
- [x] Permission model foundation
- [x] Tool permission manager foundation
- [x] THARA V5 capability fabric
- [x] Capability-aware assistant routing
- [x] Capability dashboard at `/thara`
- [x] Intelligence + memory + builder + research + voice + multimodal + security + performance + ecosystem registry
- [x] Native Android companion architecture
- [x] Low-power native wake-word architecture
- [ ] Low-power native wake-word engine
- [x] Local model fallback adapter
- [x] Sandboxed autonomous coding boundary
- [x] Benchmark automation
- [x] Long-term evaluation/learning signals

---


## THARA V6 — Native + Learning Fabric

THARA V6 adds the next infrastructure layer:

- **Native Android Companion** — Android project skeleton with a foreground companion service and permission boundary.
- **Low-Power Native Wake Word** — on-device wake-word service boundary; production detector/model remains local and replaceable.
- **Local Model Fallback** — adapter for offline/local inference with cloud fallback policy.
- **Sandboxed Autonomous Coding** — temporary isolated workspace, command allow/deny policy, timeouts and output limits.
- **Benchmark Automation** — repeatable benchmark cases with latency and correctness results.
- **Long-Term Evaluation/Learning** — persistent evaluation records can be aggregated into quality/latency learning signals.

These capabilities are deliberately **guarded**: THARA does not silently gain unrestricted device, shell, microphone, deployment or self-modification authority. High-impact actions remain subject to explicit permissions and verification.

---

## Philosophy

THARA should behave less like:

```text
"Ask → answer"
```

and more like:

```text
"Listen → understand → plan → delegate → execute → verify → explain → learn"
```

The system should remain **user-controlled, security-bounded and transparent about what it actually executed**.

---

## Repository

**GitHub:** https://github.com/devadathdev/Thara-ai

**Project:** THARA AI  
**Architecture:** Next.js + TypeScript + Firebase + server-side model routing  
**Interface:** Cinematic dark command center / JARVIS-inspired HUD


## THARA V5 — Capability Fabric

THARA V5 unifies the requested capability families behind one authenticated capability fabric:

- Intelligence Core + Agent Swarm
- Memory Vault + Memory Knowledge Graph
- Autonomous Forge + Code Repair
- Deep Research + Research Workspace
- Voice Core + Voice Command Router
- Vision Core + Document Intelligence
- Sentinel Security Gateway + Tool Permission Gateway
- Latency Engine + Parallel Execution
- THARA Skills SDK + Automation Core + THARA API

The capability registry is available at `/api/thara` and the dedicated dashboard at `/thara`. Capability routing records lightweight telemetry under each user's scoped Firestore collection. Consequential automation remains guarded by explicit approval boundaries.
