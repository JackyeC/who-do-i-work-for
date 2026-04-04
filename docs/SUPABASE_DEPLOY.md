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
- After deploy, run the **health check** (below). Treat that as your **“am I safe to test?”** gate.

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
**`ok: true`** means infra for the desk pipeline is consistent; **`newest_live`** may still be `null` until you’ve published at least one live row — that’s a **content** smoke test, not a deploy failure.

---

## End-to-end content smoke (before testers)

1. Frontend deploy green on Vercel.
2. Supabase ritual + health check **pass** (`ok: true`).
3. Run content generation, then publish (e.g. `scripts/content-engine/publish-desk-publication.example.sh` with real files).
4. Open **`/newsletter`** — live desk should show **Live** (not Fallback).

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
