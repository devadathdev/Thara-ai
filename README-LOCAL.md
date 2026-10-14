# THARA.ai — local PostgreSQL deployment

Target: one trusted laptop, Next.js + TypeScript, PostgreSQL, and no Firebase at runtime after migration completion.

## Requirements
- Node.js 22+
- Docker Desktop (or Docker Engine) with Compose

## Setup
1. Copy `.env.example` to `.env.local`; never commit the real file.
2. Set strong random values for `POSTGRES_PASSWORD` and `THARA_SETUP_SECRET` (at least 32 random characters each).
3. Set `DATABASE_URL=postgresql://thara:URL_ENCODED_PASSWORD@127.0.0.1:54329/thara?schema=public`.
4. Start PostgreSQL: `docker compose up -d postgres`.
5. Install dependencies: `npm install`.
6. Generate the client: `npm run db:generate`.
7. Apply migrations: `npm run db:migrate`.
8. Start Next.js: `npm run dev` and open `http://localhost:3000/login`.

PostgreSQL is bound to loopback only. Session cookies are HttpOnly/SameSite=Strict and only SHA-256 session-token hashes are stored. Do not expose the app or database to untrusted networks. Keep `.env.local` and backups private.

The schema and local auth foundation do not mean every feature has migrated. This branch must pass the full acceptance checklist before being considered a Firebase-free release.
