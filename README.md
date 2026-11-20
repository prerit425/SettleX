# SettleX

A deployable full-stack expense-sharing app built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS 4**, **Prisma 7** and **PostgreSQL**.

Split a bill with friends, keep a shared ledger, and settle up with the fewest possible payments.

## Features

- **Authentication** — signup, login, logout; bcrypt (cost 12) password hashing; DB-backed sessions with 256-bit random tokens stored only as SHA-256 hashes; httpOnly + SameSite=Lax cookies (Secure in production); 15-minute rate limiting after 5 failed attempts; timing-equalized login for unknown emails; safe same-origin post-login redirects.
- **Profile & security** — edit display name, change password (invalidates all other sessions), view active sessions with device labels, revoke individual sessions, "log out everywhere".
- **Groups** — create groups, invite registered users by email, member lists, strict member-only access.
- **Expenses** — equal splits using integer-paise arithmetic with deterministic remainder distribution, so shares always sum exactly to the total; atomic transactions; server-side validation and membership checks.
- **Balances** — derived entirely from the ledger, never stored; group-wise and overall summaries; greedy debt simplification.
- **Settlements** — recorded as real ledger rows, capped at the current outstanding pairwise debt.
- **UI** — responsive social-fintech design with desktop sidebar, mobile bottom navigation, split-panel auth screens, password strength meters, loading skeletons and error boundaries.

## Requirements

- **Node.js 20.19+** (declared in `engines`)
- **PostgreSQL 14+**
- npm

## Local setup

```bash
npm install                 # postinstall runs `prisma generate`
cp .env.example .env        # set DATABASE_URL
npm run db:deploy           # apply migrations on a fresh database
npm run db:seed             # optional, development-only demo data
npm run dev                 # http://localhost:3000
```

`.env` example:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
```

`.env` is gitignored. Never commit credentials; `.env.example` contains placeholders only.

### Demo accounts (after `npm run db:seed`)

| Email | Password |
| --- | --- |
| `aditi.test@example.com` | `password123` |
| `rohan.test@example.com` | `password123` |

## Deployment

The app is a standard Node.js Next.js application; no special runtime is required.

1. Provision a PostgreSQL database and get its connection string.
2. Set environment variables on your host:
   - `DATABASE_URL` — **required**. Use a TLS-enabled connection string if your provider supports it.
   - `NODE_ENV=production` — set automatically by most platforms; enables Secure cookies and HSTS.
3. Install dependencies with `npm ci` (runs `postinstall` → `prisma generate`, which creates the gitignored `src/generated/prisma` client).
4. Apply migrations with `npm run db:deploy` (`prisma migrate deploy`).
5. Build with `npm run build` and start with `npm start`.

For Vercel/Railway/Render-style platforms, set the build command to `npm run build` (it generates the Prisma client first) and the start command to `npm start`. Run `npm run db:deploy` once as a release step, or use a connection migration during release. Do **not** run `npm run db:seed` in production — the script explicitly refuses to.

> The generated Prisma client lives at `src/generated/prisma` and is intentionally gitignored. Always run `npm install` / `npm ci` or `npm run prisma:generate` before type-checking or building on a fresh checkout.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Generate Prisma client + production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run prisma:generate` | Regenerate the Prisma client |
| `npm run prisma:migrate` | Create/apply a migration during development |
| `npm run db:deploy` | Apply committed migrations (production-safe) |
| `npm run db:seed` | Development-only demo data |
| `npx prisma studio` | Inspect data locally |

## Security notes

- Session tokens are random, hashed at rest, and sent only in an httpOnly cookie; JavaScript cannot read them.
- Cookies are `Secure` in production, `SameSite=Lax`, and scoped to `/`.
- Security headers: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, and HSTS in production.
- Login is rate-limited per email (hashed) and per IP-independent email key; unknown emails run a dummy bcrypt compare to reduce user-enumeration timing signals.
- Passwords require 8+ characters with at least one letter and one number. Changing a password deletes all other sessions.
- All mutations re-check the caller's session and group membership server-side; direct URL access to another user's group returns 404.
- Audit is clean: `npm audit --omit=dev` reports **0 vulnerabilities** (Prisma 7 + Zod 4, with a pinned safe `effect` override).

## Ledger model

- Money is stored as `Decimal(12,2)`; arithmetic uses integer paise to avoid floating-point drift.
- An expense credits its payer and debits its participants.
- A settlement credits its payer and debits its recipient, reducing what they owe.
- Balances are always recalculated from expenses and settlements; history is never mutated.
