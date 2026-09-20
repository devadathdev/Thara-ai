# THARA AI

> **THARA** — a personal AI command center designed for voice-first interaction, engineering workflows, defensive security, and controlled self-improvement.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12-orange?logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-private-lightgrey)](#)

## What is THARA?

THARA is a JARVIS-inspired personal AI interface built around a command-center experience rather than a conventional chat window.

It combines:

- **Command-first AI interaction**
- **Voice input and speech output**
- **Multi-agent engineering orchestration**
- **Defensive personal security intelligence**
- **Model routing through OpenRouter/Gemini**
- **Holographic Workshop concepts for models, datasets and experiments**
- **Authenticated API access**
- **Controlled self-rewrite capabilities**
- **Security-focused data rules and bounded automation**

The goal is to make THARA feel like a persistent engineering copilot that can understand a request, route it to the appropriate specialist, verify the result, and present the outcome through a cinematic interface.

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

THARA supports a server-side provider routing architecture.

Primary options include:

- OpenRouter
- Gemini
- OpenRouter free fallback

Environment configuration:

```env
OPENROUTER_API_KEY=
OPENROUTER_ORCHESTRATOR_MODEL=
OPENROUTER_GENERAL_MODEL=openrouter/free
OPENROUTER_CODING_MODEL=openrouter/free
OPENROUTER_REASONING_MODEL=openrouter/free
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.1-flash-lite
```

The exact OpenRouter model identifier should be configured explicitly rather than hard-coded to an assumed model slug.

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

```text
THARA AI
├── app/
│   ├── api/
│   │   ├── assistant/
│   │   ├── self-rewrite/
│   │   └── status/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── assistant.ts
│   ├── crypto.ts
│   ├── engineering-team.ts
│   ├── firebase.ts
│   ├── firebase-admin.ts
│   ├── model-router.ts
│   ├── security-agent.ts
│   └── self-rewrite.ts
├── firestore.rules
├── next.config.*
├── package.json
└── tsconfig.json
```

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

## Roadmap

### THARA V1
- [x] Command center
- [x] Voice input/output
- [x] Model routing foundation
- [x] Engineering-team architecture
- [x] Sentinel security layer
- [x] Authenticated assistant API
- [x] Controlled self-rewrite
- [x] Holographic Workshop UI

### THARA V2
- [ ] Distributed memory
- [ ] Persistent task/mission queue
- [ ] WebAuthn/passkeys
- [ ] Firebase App Check
- [ ] Real-time system telemetry
- [ ] Tool permission manager
- [ ] Agent execution runtime
- [ ] Automated test/verification loop

### THARA V3
- [ ] Native Android companion
- [ ] Reliable wake-word engine
- [ ] Device-control permissions
- [ ] Local model fallback
- [ ] Sandboxed autonomous coding
- [ ] Secure code-review pipeline
- [ ] Long-term learning/evaluation system

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
