# THARA.ai — local PostgreSQL deployment

Target: one trusted laptop, Next.js + TypeScript, PostgreSQL, and no Firebase at runtime after migration completion.

## Requirements
- Node.js 22+
- Docker Desktop (or Docker Engine) with Compose

## Setup
1. Copy `.env.example` to `.env.local`; never commit the real file.
2. Set strong random values for `POSTGRES_PASSWORD` and `THARA_SETUP_SECRET` (at least 32 random characters each).
3. Set `DATABASE_URL=postgresql://thara:URL_ENCODED_PASSWORD@127.0.0.1:54329/thara?schema=public`.
4. Start PostgreSQL using the same environment file: `docker compose --env-file .env.local up -d postgres`.
5. Install Ollama locally and run `ollama pull llama3.2:3b`; keep Ollama bound to localhost.
6. Install dependencies: `npm install`.
7. Generate the client: `npm run db:generate`.
8. Apply migrations: `npm run db:migrate`.
9. Start Next.js: `npm run dev` and open `http://localhost:3000/login`.

PostgreSQL is bound to loopback only. Session cookies are HttpOnly/SameSite=Strict and only SHA-256 session-token hashes are stored. Do not expose the app or database to untrusted networks. Keep `.env.local` and backups private.

The schema and local auth foundation do not mean every feature has migrated. This branch must pass the full acceptance checklist before being considered a Firebase-free release.

## Local model policy

`THARA_LOCAL_ONLY=true` is the default. The router sends inference only to the loopback Ollama OpenAI-compatible endpoint at `http://127.0.0.1:11434/v1/chat/completions`. If the local model is stopped or unavailable, THARA returns a failure instead of sending prompts to a cloud provider. Cloud routing requires the explicit opt-out `THARA_LOCAL_ONLY=false` and configured provider credentials.
