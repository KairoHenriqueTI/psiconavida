# Psiconavida — Blog + Admin panel

This repository contains a content website (Vite + React) and an admin backend (Next.js + Prisma + NextAuth) used to manage blog posts, categories and site content.

Short architecture
- Frontend: Vite + React (TypeScript) in the repository root under `src/` (runs on port 8080 in development)
- Backend / API: Next.js in the `server/` folder (runs on port 3001)
- Database: PostgreSQL (development uses Docker / local Postgres). Prisma client lives under `server/`

Why two servers?
- The frontend is a fast Vite SPA focused on public pages. The backend runs Next.js to host API routes, authentication (NextAuth) and server-side logic that requires secure environment variables.

Quick start (development)

Prerequisites: Node.js 18+, npm, Docker (for local Postgres) or a running Postgres database.

1. Install dependencies (root and server)

```bash
# root
npm install

# server
cd server && npm install
```

2. Start Postgres (Docker)

```bash
# from repository root
cd server
docker-compose up -d
```

3. Copy environment templates and fill values

```bash
cp server/.env.template server/.env
cp .env.template .env
# Edit the values: DATABASE_URL, NEXTAUTH_SECRET, FRONTEND_URL, OPENAI_API_KEY (optional)
```

4. Start servers (two terminals)

```bash
# Terminal 1 - frontend (root)
npm run dev

# Terminal 2 - backend
cd server && npm run dev
```

5. Verify

```bash
curl http://localhost:8080/  # frontend
curl http://localhost:3001/api/auth/csrf  # backend
```

Admin user
- Before signing in to the admin panel you must create an admin user in the database. From `server/`:

```bash
node scripts/create_admin_user.js admin@psiconavida.com "Admin Name" mypassword
```

Important files and folders
- `src/` — frontend application (Vite + React)
- `server/` — Next.js backend with API routes and Prisma schema
- `server/prisma/schema.prisma` — database schema
- `server/pages/api/auth/[...nextauth].ts` — authentication configuration (NextAuth)
- `server/scripts/` — helpful scripts (create_admin_user, migration helpers)

Environment variables
- `server/.env.template` documents required server variables (`DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, SMTP settings, `OPENAI_API_KEY`). Copy it to `server/.env`.

Contributing
- If you plan to add skills or agents (Claude/VoltAgent), keep them isolated under `.claude/skills/` or a separate repository. Do not commit secrets.

License and support
- See LICENSE in repository root.

If you want, I can improve or expand any section (deployment, CI, testing, seeding scripts). Choose what I should do next: update docs further, add a CONTRIBUTING.md, or create a developer script that automates local startup.

Notes about recent security fixes applied by the automation assistant:

- Updated server cookie options to set `secure: true` and `sameSite: none` when NODE_ENV is not `development`. This prevents insecure cookies in production while allowing local development without HTTPS.
- Added `.env` and `/server/.env` to `.gitignore` to avoid accidentally committing credentials.
- Added a lightweight GitHub Action `.github/workflows/secret-scan.yml` that searches for common secret patterns on PRs and pushes to main/master. It's intentionally simple; consider integrating a hardened secret-scanning tool (trufflehog, detect-secrets, GitHub Secret Scanning) for production.

If you'd like, I can also:
1. Remove the committed `.env` files from the repository and provide a script to rotate any exposed secrets.
2. Implement server-side hardening for uploads (content sniffing, virus scan hooks, or switch to S3/MinIO storage).
3. Add a small rate-limiter to AI endpoints and sanitize prompts before forwarding to OpenAI.
