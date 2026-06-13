# uniplace-front

The student + admin web app for **UniPlace Mockday** — a Bluebook-style digital SAT
practice platform. Next.js (App Router) on Vercel, Supabase for auth, talking to
the `uniplace-api` (FastAPI) backend for all exam logic.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** — Bluebook-style light theme, UniPlace brand tokens in `app/globals.css`
- **Supabase Auth** (`@supabase/ssr`) — email/password login only
- Session gating via `proxy.ts` (Next 16's renamed middleware)

## Getting started

```bash
cp .env.example .env.local   # fill in Supabase + API URLs
npm install
npm run dev                  # http://localhost:3000
```

Required env vars (see `.env.example`):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (publishable) key |
| `NEXT_PUBLIC_API_URL` | Base URL of the FastAPI backend |

## Structure

```
app/
  login/                 # email + password sign-in
  (student)/dashboard/   # student home: live/upcoming Mockdays
  (student)/exam/        # the test-taking engine (Phase 3)
  admin/                 # question bank + Mockday management (Phase 2+)
components/
  Logo.tsx               # wordmark SVG; swap to mascot via public/uniplace-logo.png
  AppHeader.tsx
lib/
  supabase/{client,server}.ts
  api.ts                 # authenticated fetch wrapper to uniplace-api
proxy.ts                 # auth gate (optimistic redirect to /login)
```

## Branding

The wordmark renders from `public/uniplace-wordmark.svg`. To use the full
graduation-cap llama mascot, save the artwork to `public/uniplace-logo.png` and
render `<Logo variant="full" />`. Brand colors live as CSS tokens in
`app/globals.css` (`--up-blue`, `--up-yellow`, `--up-orange`).

## Deploy (Vercel)

Import the repo in Vercel, set the three env vars above, deploy. Vercel
auto-detects Next.js — no extra config needed.
