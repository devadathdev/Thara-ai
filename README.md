# THARA

> **THARA** — a personal AI command center designed for voice-first interaction, engineering workflows, defensive security, and controlled self-improvement.

## What is THARA?

THARA is a persistent personal AI companion built around presence, voice, memory, context and controlled action rather than a conventional chatbot.

It combines companion interaction, persistent memory, multi-agent engineering orchestration, defensive security, model routing, research, datasets, multimodal foundations, and a guarded physical-world gateway architecture.

## Hardware Gateway

THARA now includes a dedicated **Hardware Gateway foundation** for connecting the AI system to external equipment without exposing the machine network directly to the web application.

### Architecture

```text
THARA AI
   |
Firebase Authentication
   |
Fingerprint Line Clear
   |
Gateway API
   |
Secure Hardware Gateway
   |
Protocol Adapter
   +-- OPC UA
   +-- MQTT
   +-- Sparkplug B
   +-- Modbus
   |
PLC / Robot / Sensor / Machine
   |
Telemetry -> THARA
```

### Gateway capabilities

- Device registration
- Protocol abstraction
- Gateway command IDs
- Read/write/start/stop/pause/reset operations
- Explicit operator approval
- Fingerprint Line Clear protection
- Simulation-first operation
- Adapter boundary for physical execution
- Future telemetry correlation
- Physical execution blocked until a real adapter is installed

The implementation lives in:

- `lib/hardware-gateway.ts`
- `app/api/gateway/route.ts`
- `gateway/README.md`

### Safety boundary

The gateway defaults to **simulation mode**. The web application does not directly send machine commands.

Physical execution requires:

1. An authenticated gateway host.
2. A real protocol adapter.
3. Explicit approval.
4. Fingerprint Line Clear verification.
5. Local gateway safety policy.
6. Audit and command correlation.
7. Verified telemetry/response handling.

The gateway therefore provides the connection point needed for future laptop/industrial-PC integration without falsely claiming that a physical machine has been controlled.

## Core Architecture

```text
THARA UI
   |
Command / Voice / Multimodal
   |
Assistant API
   |
Agent Orchestrator
   |
Verification + Permission Gateway
   |
+-------------------------------+
| Software Tools | HW Gateway   |
+-------------------------------+
   |                 |
Cloud/Local AI       |
Research/Data        |
Engineering          +--> OPC UA / MQTT / Sparkplug / Modbus
   |                              |
Telemetry <-----------------------+
```

## Security Architecture

THARA uses authenticated APIs, server-side provider credentials, PostgreSQL-backed owner-scoped persistence, rate limiting, prompt-injection defenses, bounded self-rewrite, sandboxed execution, and Fingerprint Line Clear protection for protected operations.

High-impact physical operations remain behind the hardware gateway rather than being executed directly from the browser.

## Execution-Level Policy

The capability registry distinguishes:

- **MASTER** — implemented and directly executable through a bounded software path.
- **EXECUTION-READY** — an implementation path exists but requires approval, verification and/or sandbox controls.
- **FOUNDATION** — architecture exists, but direct execution remains disabled until the real integration is implemented.

For hardware specifically, the gateway foundation is **execution-ready**, while physical device execution remains disabled until a real authenticated protocol adapter is installed and verified.

## THARA Command Center

The `/thara` interface provides:

- Command Console
- Capability Matrix
- Engineering surface
- Sentinel security surface
- Telemetry
- Execution state
- Hardware Gateway status

The intended operational loop is:

`OBSERVE -> REASON -> ROUTE -> PLAN -> VERIFY -> EXECUTE -> AUDIT -> OBSERVE`

## Hardware Gateway Activation Plan

When the gateway laptop/industrial PC is available:

1. Install the gateway service.
2. Pair the gateway securely with THARA.
3. Register equipment in simulation mode.
4. Validate read-only telemetry.
5. Run simulated commands.
6. Install the required protocol adapter.
7. Validate the adapter against the target equipment.
8. Enable physical execution only after local safety and authorization checks pass.
9. Stream command results and telemetry back to THARA.

THARA will remain transparent about whether a command was **planned, simulated, accepted by the gateway, or physically executed**.

## Repository

**GitHub:** https://github.com/devadathdev/Thara-ai

**Project:** THARA AI  
**Architecture:** Next.js + TypeScript + PostgreSQL + server-side model routing  
**Interface:** Technical blue/cyan command center

## V6 Guarded Engineering Autonomy

The V6 autonomy layer is additive to the existing Next.js + TypeScript + PostgreSQL application.

### Mission lifecycle

`POST /api/missions` creates a user-scoped mission with a canonical plan hash and status `awaiting_approval`. The lifecycle is constrained to explicit transitions; the client cannot mark a mission verified.

1. Request a scoped approval at `POST /api/missions/approval` with `{ "action": "request", "missionId": "..." }`.
2. Approve the displayed mission at the same endpoint with `{ "action": "approve", "missionId": "..." }`.
3. The API issues a short-lived token bound to the authenticated Firebase UID, mission ID, plan hash, and registered action list.
4. Execute a registered tool through `POST /api/missions/execute`. The approval record is consumed transactionally, so the token cannot be replayed.
5. A verification report records checks and a SHA-256 hash of the output. Mission state becomes `verified` only when the registered tool returns an output and its identity/status checks pass.

### Bounded execution policy

The current executor intentionally exposes only registered, in-process tools:
- `engineering.plan` — produces a structured engineering workflow plan.
- `artifact.sha256` — hashes supplied text content within a 100,000-character limit.

There is no shell execution, `eval`, arbitrary filesystem access, physical hardware actuation, or deployment tool in this milestone. A verified plan means the bounded planning operation and its output checks passed; it does **not** mean a CAD solver, simulation, build, or physical device was run.

### Hybrid cloud/local model routing

Local inference is opt-in. Configure a trusted OpenAI-compatible chat-completions endpoint in server-only environment variables:

- `THARA_LOCAL_MODEL_URL` — full chat-completions endpoint URL.
- `THARA_LOCAL_MODEL_NAME` — local model identifier.
- `THARA_LOCAL_MODEL_API_KEY` — optional gateway token.
- `THARA_PREFER_LOCAL=true` — try local inference before cloud providers; otherwise local inference is the final fallback.

A laptop-local endpoint is not reachable from a cloud deployment by default. For hybrid deployments, use a secured private network or authenticated gateway; do not expose an unauthenticated inference port to the public internet.

### Required approval secret

Set `THARA_APPROVAL_SECRET` to a random server-only value of at least 32 characters. Do not use a `NEXT_PUBLIC_` variable for this secret. Without it, approval token issuance fails closed.

### Verification

Run `npm run test:autonomy` to compile and execute the focused autonomy, mission lifecycle, and approval-token tests. Also run `npx tsc --noEmit` and `npm run build` before merging. Those full-project checks are not represented as passed by this change.


## Local PostgreSQL migration

See [README-LOCAL.md](./README-LOCAL.md) for local PostgreSQL startup, schema setup and local owner bootstrap. Firebase removal is not complete until all feature routes have been migrated and no Firebase imports/dependencies remain.


## Local-first migration

The `migration/postgres-local-first` branch introduces PostgreSQL persistence, local owner sessions, and local-only inference by default. Follow [README-LOCAL.md](./README-LOCAL.md). The migration must pass CI and the remaining acceptance checks before it is treated as a stable release.
