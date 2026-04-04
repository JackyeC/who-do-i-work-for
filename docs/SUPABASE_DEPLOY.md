# Supabase deploy ritual (repeatable, predictable)

Use this **same order every time** you ship database or Edge changes. No improvisation.

---

## Prerequisites (one-time per machine)

1. [Supabase CLI](https://supabase.com/docs/guides/cli) installed (`supabase --version`).
2. **Logged in:** `supabase login`
3. **Project linked** from repo root: `supabase link --project-ref <your-project-ref>`  
   (ref is in the Supabase dashboard URL or `project_id` in `supabase/config.toml` — verify it matches **production** before pushing.)

4. **Edge secrets** (dashboard **Project Settings → Edge Functions → Secrets** or CLI), at minimum:
   - `WDIWF_DESK_PUBLISH_SECRET` — shared with your publish automation / health script
   - `SUPABASE_SERVICE_ROLE_KEY` — usually auto-provided to functions; confirm if deploys fail

---

## When you only change the frontend

Push to GitHub → **Vercel** builds the branch it tracks. **No Supabase steps.**

---

## When you touch Supabase (migrations and/or Edge functions)

Run **in this order** from the **repository root**:

```bash
supabase db push
supabase functions deploy publish-desk-publication
supabase functions deploy desk-publication-health
```

**Rules**

- Do **not** skip `db push` because “it’s only functions” — migrations and RPCs must exist before the app and health check rely on them.
- Do **not** reorder: migrations first, then functions that depend on the schema.
- After deploy, run the **health check** (below). That is **step 1 only** of the **final verification gate** — see § *Final verification (required before user testing)*.

---

## One-command deploy + health (recommended)

From repo root:

```bash
./scripts/supabase/deploy.sh
```

This runs `db push`, deploys both desk functions, then **`scripts/supabase/health-check.sh`** (unless `RUN_HEALTH_CHECK=0`).

---

## Health check (“am I safe to test?”)

**What it validates**

| Check | Meaning |
|--------|--------|
| `publications_table` | Service role can read `wdiwf_desk_publications` (schema matches what functions expect). |
| `rpc_latest_live_desk` | RPC `wdiwf_latest_live_desk_publication()` exists and runs — same path **`/newsletter`** uses. |

**Environment** (export or use a `.env` loaded by your shell — **never commit secrets**):

- `SUPABASE_URL` — `https://<ref>.supabase.co`
- `WDIWF_DESK_PUBLISH_SECRET` — same value as the Edge secret

**Run**

```bash
./scripts/supabase/health-check.sh
```

- Exit **0** only if HTTP 200 and JSON **`ok: true`**.
- Exit **non-zero** on network/auth failure or `ok: false` (e.g. RPC missing after a bad migration skip).

**Manual equivalent**

```bash
curl -sS -H "Authorization: Bearer ${WDIWF_DESK_PUBLISH_SECRET}" \
  "${SUPABASE_URL%/}/functions/v1/desk-publication-health"
```

Inspect `checks`, `safe_for_newsletter_desk`, `newest_live`, and `runs`.  
**`ok: true`** means infra for the desk pipeline is consistent; **`newest_live`** may still be `null` until you’ve published at least one live row. A null `newest_live` after deploy means you **must** complete **step 2** below before testers.

---

## Final verification (required before user testing)

**`deploy.sh` succeeding is not enough.** The following three steps are the **release gate** for anyone who will use the product.

Execute **in order** after `./scripts/supabase/deploy.sh` (or the equivalent three CLI commands + `health-check.sh`).

### Step 1 — Health check must pass

- **Already included** at the end of `./scripts/supabase/deploy.sh` unless `RUN_HEALTH_CHECK=0`.
- **Pass:** `health-check.sh` exits **0** and JSON has **`ok: true`**.
- **Fail:** stop. Fix Supabase deploy or secrets before anything else.

### Step 2 — Real publish must exist (trigger if needed)

- **Pass:** There is a row you intend to show, with the live contract (`publish_status: success`, `published_to_site: true`, bi-hourly completed, non-empty `site_markdown`).
- If **`newest_live`** in the health response is **null** or **stale**, run a **real** publish — e.g. generate content, then:

  ```bash
  # Example: loads newsletter/outputs/live/* and POSTs to Edge
  export SUPABASE_URL="https://<ref>.supabase.co"
  export WDIWF_DESK_PUBLISH_SECRET="…"
  ./scripts/content-engine/publish-desk-publication.example.sh
  ```

- Re-run **`health-check.sh`** and confirm **`newest_live`** matches the run you expect (note `id`, `created_at`, `run_id`).

### Step 3 — Manual check: `/newsletter` must show that publication

- Open **production** **`/newsletter`** (the URL your testers will use — typically Vercel).
- **Pass:** The desk shows **Live** (not **Fallback**) and the visible content matches the latest publication you expect (same story / run as step 2).
- **Fail:** If step 1 and 2 passed but **`/newsletter` does not reflect the latest publication**, treat this as a **failure of the delivery layer** (frontend env pointing at wrong Supabase project, stale deploy, RPC/RLS mismatch, CDN/browser cache, or broken client hook).

**Required log line on that failure** (paste into your ops log, incident note, or `RUN_META.md`):

```text
delivery layer not working — newsletter UI did not reflect latest desk publication after successful health + publish. Timestamp (UTC): …  Health newest_live.id: …  Production URL checked: …  Observed: Fallback / wrong content / …
```

Do **not** invite testers until steps **1–3** all pass.

### Full stack reminder

- **Frontend:** Vercel (or your host) must have a **green deploy** for the branch users hit, with `VITE_*` / Supabase anon URL pointing at the **same** project you pushed to in step 1.

---

## Optional later: CI (keep it boring)

When you want automation, the smallest step is **one workflow** that runs on `workflow_dispatch` only:

1. `supabase link` via CI secret (or use Supabase GitHub integration if you prefer).
2. Same three commands as above.
3. `./scripts/supabase/health-check.sh` with secrets from GitHub Actions.

Do **not** auto-push migrations on every PR until you’re comfortable with preview DB branching or a dedicated staging project.

---

## Related docs

- Desk schema and contracts: `docs/CONTENT_ENGINE_LIVE_DELIVERY.md`
- Publish handoff: `newsletter/delivery/PUBLISHING.md`, `automations/HOT_SIGNAL_ENGINE.md`
