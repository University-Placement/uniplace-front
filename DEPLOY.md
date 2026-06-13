# Deploying UniPlace Mockday

Two pieces deploy independently:

- **Frontend** (`uniplace-front`) → **Vercel**
- **Backend** (`uniplace-api`) → **Render** (free tier, `render.yaml` blueprint)

Supabase is already hosted, so no DB to deploy.

## 1. Backend → Render

1. https://render.com → **New → Blueprint** → connect `University-Placement/uniplace-api`.
   Render reads `render.yaml` and provisions the web service.
2. Set these environment variables (Dashboard → Environment):
   - `DATABASE_URL` = the Supabase **session pooler** async URL
     `postgresql+asyncpg://postgres.<ref>:<password>@aws-1-us-east-2.pooler.supabase.com:5432/postgres`
   - `SUPABASE_URL` = `https://<ref>.supabase.co`
   - `SUPABASE_JWT_SECRET` = *(leave blank — tokens are ES256, verified via JWKS)*
   - `CORS_ORIGINS` = your Vercel URL (fill in after step 2), e.g. `https://uniplace-front.vercel.app`
3. Deploy. Note the service URL, e.g. `https://uniplace-api.onrender.com`.
   - **Cold-start caution:** the free tier sleeps after ~15 min idle and wakes in
     30–50s. Before a Mockday window, hit `/health` a few times to warm it, or
     bump to a paid instance for the exam day so students never wait on a cold start.

## 2. Frontend → Vercel

1. https://vercel.com → **Add New → Project** → import `University-Placement/uniplace-front`.
   Vercel auto-detects Next.js — no build config needed.
2. Set environment variables (Settings → Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://<ref>.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the Supabase anon key
   - `NEXT_PUBLIC_API_URL` = the Render backend URL from step 1
   - `NEXT_PUBLIC_DESMOS_API_KEY` = *(optional; a working key is baked in)*
3. Deploy. Note the URL, then go back to Render and set `CORS_ORIGINS` to it.

## 3. Final wiring

- Backend `CORS_ORIGINS` must equal the deployed frontend origin (comma-separate
  multiple, e.g. preview + prod URLs).
- Redeploy the backend after changing `CORS_ORIGINS`.

## Driving it from the CLI (alternative)

If you'd rather I run the frontend deploy: in this session run `! npx vercel login`
to authenticate, then I can `npx vercel --prod` from `uniplace-front`. The backend
is easiest via the Render dashboard blueprint above.
