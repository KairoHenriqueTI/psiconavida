# Server (Next.js + Prisma) — PsicoNaVida

This folder holds the Next.js API + admin server used by the Psiconavida project.

Overview

- Next.js (API routes) for CRUD, uploads and authentication (NextAuth).
- Prisma for database modeling and typed access to Postgres.
- Uploads are currently stored under `public/uploads/` (make sure host persistence is available) — consider S3/MinIO for production.

Quick start (server)

1. Install dependencies

```bash
cd server
npm install
```

2. Configure environment

```bash
cp .env.template .env
# Edit .env and set DATABASE_URL, NEXTAUTH_SECRET, FRONTEND_URL and optional OPENAI_API_KEY
```

3. Start Postgres (if using Docker)

```bash
docker-compose up -d
```

4. Run the server

```bash
npm run dev
```

Create an admin user

```bash
node scripts/create_admin_user.js admin@psiconavida.com "Admin Name" mypassword
```

Important files

- `prisma/schema.prisma` — database model (User, Post, Category, Session, etc.)
- `pages/api/auth/[...nextauth].ts` — NextAuth configuration
- `pages/api/posts/*`, `pages/api/categories/*`, `pages/api/uploads.ts` — API endpoints
- `scripts/` — utility scripts (create_admin_user.js, migration helpers)

Notes & recommendations

- Do not commit `.env` files or secrets. Use `.env.template` to document required variables.
- For staging/production, point `DATABASE_URL` to a managed Postgres and replace uploads storage with an object store.
- Review `server/pages/api/ai/generate-post.ts` before enabling OpenAI usage; ensure `OPENAI_API_KEY` is present and has budget controls.

If you want, I can add a docker-compose development manifest that starts Postgres, the frontend and the server together, or create a single `dev` script to start both servers concurrently.
