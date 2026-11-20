# SettleX

A full-stack expense-sharing MVP built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma and PostgreSQL.

## Features

- Real signup/login/logout with bcrypt passwords and database-backed, SHA-256-hashed session tokens in an httpOnly cookie.
- Groups with creator membership, invite-by-email, member lists and per-group access control.
- Expenses split equally with integer-paise arithmetic and deterministic remainder distribution (shares always sum exactly to the total).
- Ledger-derived balances, group-wise summaries and greedy debt simplification (fewest suggested payments).
- Settlement payments recorded as real ledger rows, capped at the current outstanding pairwise debt.
- Dashboard, activity history with group filtering, balances and settings.
- Responsive social-fintech UI: desktop sidebar, mobile bottom navigation, warm off-white palette with lavender/mint/coral accents.

## Setup

```bash
npm install
cp .env.example .env   # then set DATABASE_URL
npx prisma migrate dev
npm run dev
```

`DATABASE_URL` must point to a PostgreSQL database. Never commit `.env`.

Useful commands:

```bash
npm run dev            # http://localhost:3000
npm run build          # production build
npm run typecheck      # TypeScript check
npx prisma studio      # inspect data
```

## Notes

- Monetary values are stored as `Decimal(12,2)`; arithmetic uses integer paise.
- Balances are never stored: they are derived from expenses and settlements on every request.
- Payment direction: an expense credits the payer and debits participants; a settlement credits its payer and debits its recipient, reflecting the reduction in what they owe.
