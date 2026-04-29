# Agent Guide: Psiconavida Blog + Admin Panel

## Architecture at a Glance

**Dual-server setup:**
- **Frontend**: Vite + React (TypeScript) → `src/` → port 8080
- **Backend**: Next.js + NextAuth + Prisma → `server/` → port 3001  
- **Database**: PostgreSQL 15 → Docker container `server-db-1` on port 5433
- **Frontend proxy**: `/api` requests forward to `http://localhost:3001` (configured in `vite.config.ts`)

**Critical**: Both servers must run simultaneously. Frontend alone cannot authenticate or fetch admin data.

## Quick Start (Development)

```bash
# Terminal 1: Frontend (port 8080)
npm run dev

# Terminal 2: Backend (port 3001)
cd server && npm run dev

# Verify both running:
curl http://localhost:8080/           # Frontend loads
curl http://localhost:3001/api/auth/csrf  # Backend responds
```

**Database prerequisites:**
```bash
# Must be running before backend starts
docker ps | grep server-db-1
# If stopped: cd server && docker-compose up -d
```

## Entry Points & Key Paths

| Location | Purpose | Critical Detail |
|----------|---------|-----------------|
| `src/pages/admin/Login.tsx` | Admin login UI | Reads `?error=` URL param for NextAuth errors |
| `src/hooks/useAuth.tsx` | Auth context | Fetches `/api/auth/session` after login form submit |
| `server/pages/api/auth/[...nextauth].ts` | NextAuth config | CredentialsProvider + JWT; stores `hashedPassword` |
| `server/prisma/schema.prisma` | DB schema | User, Post, Category, SiteContent tables |
| `vite.config.ts` | Frontend proxy | Routes `/api/*` → `http://localhost:3001` |

## Critical Setup: Admin User Creation

**Required before any login attempt.** The `User` table needs at least one admin with hashed password.

```bash
# Quickest method:
cd server
node scripts/create_admin_user.js admin@psiconavida.com "Admin" mypassword

# If that fails, manually create with bcryptjs hash:
node server/node_modules/bcryptjs/bin/bcrypt mypassword 10
# Then INSERT into DB with the output hash
```

## NextAuth + Proxy Quirks

1. **Authentication flow**:
   - Form submits to `/api/auth/callback/credentials` (relative path)
   - NextAuth validates password against `hashedPassword` field
   - On success: sets `next-auth.session-token` cookie
   - Frontend must poll `/api/auth/session` to confirm session exists

2. **Cross-origin cookie handling**:
   - Cookies set with `sameSite: 'none'` (non-standard; see `[...nextauth].ts` line 16)
   - Required because frontend proxy adds latency; sometimes cookies don't propagate
   - If cookies mysteriously don't set, check `sameSite` and `secure` flags

3. **Error handling**:
   - Failed auth: redirects to `/admin/login?error=CredentialsSignin`
   - `Login.tsx` reads `useSearchParams()` and displays error via toast
   - See `ERROR_MESSAGES` dict for all error types

## Common Issues & Quick Fixes

| Symptom | Root Cause | Check | Fix |
|---------|-----------|-------|-----|
| White screen on `http://localhost:8080` | Vite not running | `ps aux \| grep vite` | `npm run dev` |
| "Erro ao entrar: Erro ao conectar ao servidor" | Backend unreachable | `curl http://localhost:3001/api/auth/csrf` | `cd server && npm run dev` |
| Login succeeds but shows SessionCallback error | Backend `/api/auth/session` fails | Browser DevTools → Network tab | Verify backend is running |
| Database connection refused | PostgreSQL not running | `docker ps` | `cd server && docker-compose up -d` |
| "Cannot find module 'prisma'" | Prisma client not built | Check `server/node_modules/.prisma/client` | `cd server && npm install` |

## File Edit Gotchas

1. **`src/pages/admin/Login.tsx`**: When rewriting, validate first 5 lines are actual imports (not squeez metadata). Common corruption: `# squeez [cat]...` at line 1.
2. **`server/pages/api/auth/[...nextauth].ts`**: Cookie settings (`sameSite`, `secure`, `httpOnly`) require backend restart to take effect.
3. **`.env` files**: Never commit. Use `.env.template` to document required variables. Backend requires: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `FRONTEND_URL`, `DATABASE_URL`.

## Verification Commands

```bash
# Frontend builds
npm run build

# Backend builds
cd server && npm run build

# Type checking
npm run lint
```

## Key Directories

- `src/pages/admin/` — Admin UI (Login, Dashboard, Posts, Categories, Users)
- `server/pages/api/` — API endpoints (auth, posts, categories)
- `server/prisma/` — Schema & migrations (immutable; don't edit migration files directly)
- `docks/` — Analysis docs (objective/architecture notes)
