# WDIWF — Pre-launch execution plan (minimal & safe)

This is the **smallest safe path** derived from [`ARCHITECTURE_RECOMMENDATION.md`](ARCHITECTURE_RECOMMENDATION.md). Goal: **do not break the live product**, **only launch-critical hardening**, **incremental changes only**.

**Legend (task type)**  
`[code]` · `[vercel]` · `[supabase]` · `[render]` · `[optional]`

---

## Launch-critical runbook (strict order — do only these)

**Safety rule:** Add **`VITE_CLERK_PUBLISHABLE_KEY`** (and optionally **`VITE_SENTRY_DSN`**) in **Vercel** *before* deploying the commit that removes the hardcoded Clerk key, or production will throw on load.

| Step | Task | Where |
|:----:|------|-------|
| **1** | Add / confirm Vercel env vars **before** deploy of new code | **Vercel dashboard** |
| **2** | Merge & deploy app (Clerk from env + Sentry + 404) | **Local codebase** → git → **Vercel deploy** |
| **3** | Rotate Supabase API keys | **Supabase dashboard** |
| **4** | Update Edge Function secrets (`SUPABASE_SERVICE_ROLE_KEY` = new) | **Supabase dashboard** |
| **5** | Update `VITE_SUPABASE_*` on Vercel + **Production redeploy** | **Vercel dashboard** |
| **6** | Create Render Cron for `sync-work-news` + **Run now** | **Render dashboard** |
| **7** | Disable `pg_cron` job `sync-work-news-2h` | **Supabase → SQL Editor** |

---

### Step 1 — Vercel env (do this before Step 2 goes to production)

| | |
|--|--|
| **Where** | **Vercel** → Project → **Settings** → **Environment Variables** |
| **Env vars** | `VITE_CLERK_PUBLISHABLE_KEY` = your live `pk_live_…` (same value previously in `src/main.tsx`). Optional: `VITE_SENTRY_DSN` = Sentry project DSN. |
| **Files** | None |
| **SQL** | None |
| **Success** | Variables saved for **Production** (and Preview if you use Clerk there). |

Also confirm these already exist and will stay valid until after Step 5: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.

---

### Step 2 — Code + deploy

| | |
|--|--|
| **Where** | **Local codebase** → push to connected branch; **Vercel** builds |
| **Env vars** | None new locally beyond `.env` for dev (`VITE_CLERK_PUBLISHABLE_KEY` required or app throws). |
| **Files** | `src/main.tsx` (Clerk from `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY`), `src/lib/sentry.ts`, `src/pages/NotFound.tsx` (Sentry `spa_route_not_found`), `package.json` (`@sentry/react`), `.env.example`, `src/vite-env.d.ts` |
| **SQL** | None |
| **Success** | Production site loads; Clerk sign-in still works; Sentry shows releases after DSN is set (optional: hit a fake path → **Issues** shows `spa_route_not_found` with `pathname`). |

---

### Step 3 — Rotate Supabase keys

| | |
|--|--|
| **Where** | **Supabase** → **Project Settings** → **API** (or **Data API**) |
| **Env vars** | N/A (you copy new **anon** + **service_role** from dashboard into password manager). |
| **Files** | None |
| **SQL** | None |
| **Success** | New **anon** and **service_role** strings displayed; old keys no longer valid (rotation semantics depend on Supabase UI — use “Generate new” / “Rotate” as offered). |

---

### Step 4 — Supabase Edge Function secrets

| | |
|--|--|
| **Where** | **Supabase** → **Edge Functions** → **Secrets** (name may be “Manage secrets”) |
| **Env vars** | **`SUPABASE_SERVICE_ROLE_KEY`** = **new** service_role from Step 3. Confirm **`SUPABASE_URL`** matches project URL. Keep any existing secrets your functions need (e.g. **`NEWS_API_KEY`** for `sync-work-news`). |
| **Files** | None |
| **SQL** | None |
| **Success** | Secrets saved; invoke a user-facing function from the app still works after Step 5 updates the anon key in the SPA. |

---

### Step 5 — Vercel Supabase env + redeploy

| | |
|--|--|
| **Where** | **Vercel** → **Environment Variables** → **Production** redeploy |
| **Env vars** | **`VITE_SUPABASE_PUBLISHABLE_KEY`** = **new anon** from Step 3. **`VITE_SUPABASE_URL`** = `https://<project-ref>.supabase.co` |
| **Files** | None |
| **SQL** | None |
| **Success** | Production deploy **Succeeded**; app loads data (e.g. browse/search) without auth errors from Supabase. |

---

### Step 6 — Render cron (`sync-work-news`)

| | |
|--|--|
| **Where** | **Render** → **New** → **Cron Job** |
| **Env vars** (Render service) | **`SUPABASE_FUNCTIONS_URL`** = `https://<project-ref>.supabase.co/functions/v1` — **`SUPABASE_SERVICE_ROLE_KEY`** = **same new service_role** as Step 4 |
| **Files** | None |
| **Command** (example) | `curl -sS -X POST "${SUPABASE_FUNCTIONS_URL}/sync-work-news" -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" -H "Content-Type: application/json" -d '{}'` |
| **Schedule** | e.g. `30 */2 * * *` (UTC) to mirror prior “every 2h” intent |
| **SQL** | None |
| **Success** | Render **Logs** show exit code 0; response body includes `"success":true` (and `newArticles` / `totalArticles`). **Supabase** → **Edge Functions** → **sync-work-news** → **Logs** shows a recent `200` invocation. |

---

### Step 7 — Disable matching `pg_cron`

| | |
|--|--|
| **Where** | **Supabase** → **SQL Editor** |
| **Env vars** | None |
| **Files** | None |
| **SQL (inspect)** | `SELECT jobid, jobname, schedule, command FROM cron.job WHERE command LIKE '%sync-work-news%';` |
| **SQL (remove)** | `SELECT cron.unschedule('sync-work-news-2h');` — only if that `jobname` exists; if `jobname` differs, use the name from the inspect query. |
| **Success** | Inspect query returns **no rows** for `sync-work-news`, or `unschedule` returns `true`; **no** duplicate runs (watch Render + function logs for a cycle). |

---

## Ranked checklist

### Do now — before launch

| # | Item | Type | Why |
|---|------|------|-----|
| A1 | Rotate **Supabase anon + service_role** keys (keys appeared in committed migration SQL in the past) | supabase · vercel | Stops credential reuse from git history |
| A2 | Update **Vercel** `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the new anon key | vercel | SPA must match rotated anon key |
| A3 | Update **Supabase → Edge Functions → Secrets** for any deploy pipeline that injects keys | supabase | Functions keep working after rotation |
| A4 | Move **Clerk publishable key** from hardcoded `main.tsx` to `VITE_CLERK_PUBLISHABLE_KEY` | code · vercel | No behavior change if env matches current key |
| A5 | Add **Sentry** (or equivalent) for the browser + **report 404 path** from `NotFound` | code · vercel | See real errors and dead deep links in prod |
| A6 | **Render Cron** for **`sync-work-news`** using **`Authorization: Bearer <SERVICE_ROLE_KEY>`**; then **remove** the matching **`pg_cron`** job | render · supabase | Correct auth for this function; avoids double-runs |

### Do after launch

| # | Item | Type | Why |
|---|------|------|-----|
| B1 | Migrate remaining **`pg_cron` → Render** jobs (`news-ingestion`, `generate-briefing` batch, others in `supabase/migrations/*schedule*.sql`) | render · supabase · code | Same pattern as A6; do when you have time |
| B2 | Ensure each scheduled function **only** accepts **service role** (or a dedicated cron secret) — audit handlers vs `pg_cron` callers | code · supabase | Defense in depth after A6 |
| B3 | **Auth consolidation** (Supabase-only **or** Clerk + Supabase JWT integration) | code | Reduces “signed in one place but not the other” bugs |
| B4 | **Single email provider** (e.g. Resend) for transactional mail | code · supabase | Replace multi-path `email-career-results` behavior over time |
| B5 | Wire **Plausible / Fathom / PostHog** into `src/lib/analytics.ts` | code · optional vendor | Product analytics, not launch-blocking |
| B6 | **`work_news_sync_meta`** table (or similar) written at end of ingest functions | code · supabase | UI “last updated” / ops visibility |
| B7 | Render **Web Service worker** only if Edge Function timeouts hurt you | render · code | Scale path, not default |

### Optional anytime (low risk, not launch gates)

| # | Item | Type |
|---|------|------|
| C1 | **Vercel Web Analytics** for coarse traffic / route popularity | vercel · optional |
| C2 | **Smoke checklist** (manual or Playwright) for top URLs | optional |
| C3 | **GitHub secret scanning** on the repo | optional |

---

## Exact order of operations (before launch)

Do **A1 → A3** in one short session so you never sit in a half-rotated state longer than necessary.

1. **`[supabase]`** In Supabase Dashboard → **Settings → API**: rotate or create new **anon** and **service_role** keys (follow current Supabase UI labels).
2. **`[supabase]`** **Project Settings → Edge Functions → Secrets**: set `SUPABASE_SERVICE_ROLE_KEY` (and any other secrets your functions read) to the **new** service role value.
3. **`[vercel]`** Project → **Settings → Environment Variables**: set `VITE_SUPABASE_PUBLISHABLE_KEY` (and `VITE_SUPABASE_URL` if needed) to match the **new** anon key for **Production** (and Preview if you use Supabase there).
4. **`[vercel]`** Trigger a **Production deploy** so the new `VITE_*` values are baked into the build.
5. **`[code]` `[vercel]`** Replace hardcoded Clerk key in `src/main.tsx` with `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY`; add the same value in Vercel; deploy.
6. **`[code]` `[vercel]`** Add Sentry (or chosen tool) and **404 reporting** on `NotFound`; add `VITE_SENTRY_DSN` (or provider equivalent) in Vercel; deploy.
7. **`[render]`** Create **Cron Job** that `POST`s to  
   `https://<PROJECT_REF>.supabase.co/functions/v1/sync-work-news`  
   with header `Authorization: Bearer <SERVICE_ROLE_KEY>` and body `{}`. Schedule similar to current intent (e.g. every 2 hours — your migration used `30 */2 * * *`).
8. **`[supabase]`** In **SQL Editor**, run `SELECT * FROM cron.job;` (or your project’s equivalent) to confirm the job name, then **`SELECT cron.unschedule('sync-work-news-2h');`** if that name exists — **only after** you see **successful** runs in Render’s cron logs.
9. **`[supabase]`** Open **Edge Functions → sync-work-news → Logs** after a Render run: confirm `200` and sensible `newArticles` / `totalArticles` in the response body.

**Rollback:** If Render fails, you can temporarily re-enable the old `pg_cron` **only if** the Edge Function still accepts the old caller — **in this repository**, `sync-work-news` already checks the bearer token against **`SUPABASE_SERVICE_ROLE_KEY`**, so **`pg_cron` that sends the anon JWT should not succeed**. Treat Render + service role as the **correct** fix path; fix Render config rather than reverting to anon.

---

## First cron to migrate: `sync-work-news` (safest)

**Chosen job:** **`sync-work-news`** (`pg_cron` name in migrations: **`sync-work-news-2h`**).

**Why this one first**

- **Blast radius is narrow**: it only feeds **`work_news`**, which powers the **newsletter-style story list** (`/newsletter`, ticker hooks). It does not touch billing, auth, or per-user briefing tables.
- **Writes are upsert / dedupe-friendly** (`gdelt_url_hash`, `ignoreDuplicates`), so an occasional double-run during cutover is **annoying**, not catastrophic.
- **Repo reality check**: `supabase/functions/sync-work-news/index.ts` already gates on **`SUPABASE_SERVICE_ROLE_KEY`**. A database cron that sends the **anon** JWT is **incompatible** with that code path — so moving the schedule to **Render with the service role** is the **aligned** fix and may explain missing refreshes if production matches this file.

**Do not migrate `generate-briefing` first**: batch mode touches **many users**; save until `sync-work-news` is boring on Render.

---

## Newsletter / story reliability & deep-link observability

**Newsletter / `work_news`**

- **Today**: UI reads `work_news` via React Query (`useWorkNews`) with client `staleTime`; reliability is mostly **ingestion uptime** + **RLS** allowing reads your routes need.
- **Before launch (minimal)**: After A6, confirm **Render cron logs** and **Supabase function logs** for `sync-work-news` on a schedule you trust. No product code change required for launch if ingest is healthy.
- **After launch (B6)**: Add a tiny **`work_news_sync_meta`** row updated on success/failure at the end of `sync-work-news` so the UI can show **“Feed last updated …”** and you can alert on stale data without reading logs.

**Deep links**

- **Already correct for SPA**: `vercel.json` rewrites `/*` → `/index.html`, so `/company/foo` and shared URLs should load the app shell.
- **Before launch (minimal)**: **Sentry (A5)** with a **`not_found` / 404** event carrying **`window.location.pathname`** turns “broken bookmark” into something you can see in dashboards. Optional: enable **Vercel Web Analytics (C1)** for coarse “what paths get traffic” — not a substitute for error tracking.

---

## MANUAL_STEPS_FOR_JACKYE

Click-by-click where UI names are stable; adapt if Supabase/Render rename menus.

### Rotate Supabase keys

1. Log in to [supabase.com](https://supabase.com) → select **WDIWF project**.
2. Left sidebar → **Project Settings** (gear) → **Data API** or **API** (depends on dashboard version).
3. Find **Project API keys** → use the control to **rotate** or create a new **anon** key and **service_role** key; **copy** both somewhere private (password manager).
4. Left sidebar → **Edge Functions** → **Manage secrets** (or **Settings** for functions) → ensure **`SUPABASE_SERVICE_ROLE_KEY`** is set to the **new** service role value → **Save**.

### Vercel env + deploy

1. [vercel.com](https://vercel.com) → your **WDIWF** project → **Settings** → **Environment Variables**.
2. Edit **`VITE_SUPABASE_PUBLISHABLE_KEY`** (Production) → paste **new anon** → **Save**.
3. Confirm **`VITE_SUPABASE_URL`** matches your project URL (`https://<ref>.supabase.co`).
4. **Deployments** → **⋯** on latest production → **Redeploy** (or push a trivial commit) so the SPA rebuild picks up `VITE_*`.

### Clerk key via env (after code change)

1. Vercel → **Environment Variables** → add **`VITE_CLERK_PUBLISHABLE_KEY`** = your existing `pk_live_…` → **Production** (and Preview if needed).
2. Redeploy.

### Sentry (typical flow)

1. [sentry.io](https://sentry.io) → **Create project** → platform **React**.
2. Copy **DSN** → Vercel → **`VITE_SENTRY_DSN`** (or follow Sentry’s Vite env naming) for Production.
3. Redeploy after instrumenting the app (A5 in code).

### Render cron for `sync-work-news`

1. [dashboard.render.com](https://dashboard.render.com) → **New +** → **Cron Job**.
2. Connect your **Git repo** *or* choose **Shell** / empty cron if you only run a shell command (Render supports cron with a command string — pick what matches your account).
3. **Schedule**: e.g. `30 */2 * * *` UTC (adjust to match how you think about “every 2 hours”).
4. **Command** (example — put secrets in Render **Environment**, not in the command text):

   ```bash
   curl -sS -X POST "${SUPABASE_FUNCTIONS_URL}/sync-work-news" \
     -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

5. Render → **Environment** for this cron:
   - `SUPABASE_FUNCTIONS_URL` = `https://<PROJECT_REF>.supabase.co/functions/v1`
   - `SUPABASE_SERVICE_ROLE_KEY` = (paste **service role** — same as in Supabase secrets, **never** `VITE_*`)
6. **Save** → use **Trigger deploy** / **Run now** if available → open **Logs** and confirm HTTP **200** and JSON success.
7. Supabase → **SQL Editor** → run `SELECT cron.unschedule('sync-work-news-2h');` **only after** Render succeeds (see ranked list).

### Unschedule `pg_cron` safely

1. Supabase → **SQL Editor**.
2. Optional inspection: `SELECT jobid, jobname, schedule FROM cron.job;` (exact columns vary slightly by Postgres extension version — if `jobname` missing, use `jobid` from docs).
3. Run: `SELECT cron.unschedule('sync-work-news-2h');`
4. If the name differs, unschedule the job whose **command** references `sync-work-news` in `cron.job_run_details` / your inspection query.

---

## Environment variables (short)

| Where | Variables |
|-------|-----------|
| **Vercel** | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`, Sentry DSN as required by your SDK |
| **Render (cron)** | `SUPABASE_FUNCTIONS_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Supabase Functions secrets** | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, plus `NEWS_API_KEY` etc. as already used by `sync-work-news` |

Never prefix server secrets with `VITE_`.

---

## Risks (launch-relevant only)

| Risk | Mitigation |
|------|------------|
| **Double cron** | Unschedule `pg_cron` **after** Render proves green |
| **Stale extension / other clients** after anon rotation | Update any **Chrome extension** or other builds that embed the old anon key |
| **Render logs show 401** on `sync-work-news` | Bearer must be **service_role**, not anon |
| **Git history still has old keys** | Rotation is mandatory; optional enable secret scanning |

---

## Reference: what you already have

SPA on Vercel with rewrites, Supabase Postgres + Storage + Edge Functions, `pg_cron` calling functions, Clerk + Supabase Auth overlap, `ErrorBoundary` + console-only 404 — see original architecture doc for the full picture.

---

*Pre-launch scope: **A1–A6** (+ optional **C1**). Everything else is explicitly **after launch**.*
