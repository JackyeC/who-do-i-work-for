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

### Automated setup on your Mac (recommended)

You do **not** need to hunt variables in the dashboard for every deploy if you use a **local env file** (gitignored):

1. From the **repository root**, copy the template:
   ```bash
   cp scripts/supabase/env.supabase.local.example .env.supabase.local
   ```
2. Edit **`.env.supabase.local`** and set **`WDIWF_DESK_PUBLISH_SECRET`** to a long random string (e.g. `openssl rand -base64 32`).
3. **Push that value to Supabase Edge** once (or after you rotate the secret):
   ```bash
   ./scripts/supabase/push-edge-secrets.sh
   ```
4. From then on, **`./scripts/supabase/deploy.sh`** automatically loads `.env.supabase.local`, derives **`SUPABASE_URL`** from **`supabase/config.toml`** if you omit it, and runs the health check with the correct Bearer token.

If the health check still returns **401**, the secret in **`.env.supabase.local`** and the Edge secret are not identical — re-run **`push-edge-secrets.sh`** or paste the same value in the dashboard.

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
- After deploy, run the **health check** (below). That is **step 1 only** of the **final verification gate** (steps 1–4) — see § *Final verification (required before user testing)*.

---

## One-command deploy + health (recommended)

From repo root (with **`.env.supabase.local`** in place — see **Automated setup** above):

```bash
./scripts/supabase/deploy.sh
```

This runs `db push`, deploys both desk functions, then **`scripts/supabase/health-check.sh`** (unless `RUN_HEALTH_CHECK=0`). You can run the script from **any directory**; it always `cd`s to the repo root and loads env from **`.env.supabase.local`**.

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

**`deploy.sh` succeeding is not enough.** Steps **1–3** are the **technical release gate**. Step **4** is a **required human pass** before testers; **UX-only** findings there are **product signal**, not a ship blocker.

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

### Step 4 — UX sanity check (required before testers)

After steps **1–3** pass, open **`/newsletter` again as a first-time user** (incognito or fresh eyes — no prior context).

**Confirm:**

- The content reads **clearly live** (not static / demo / placeholder).
- The **message is understandable without insider context** (headlines, desk, feed make sense on their own).
- There is **no obvious confusion or broken flow** (dead ends, misleading labels, “Fallback” when you expect Live, etc.).

**If it is technically correct but confusing:**

- **Log as a UX issue** (ops log, Linear, or `RUN_META.md` / run notes). Example:

  ```text
  UX issue — /newsletter: <what confused you>. Technically live (steps 1–3 passed). Does not block tester invite; note for product follow-up.
  ```

- **Do not block testing** on UX-only findings — but **do note them** so they are not lost.

This is **not** a system failure; it is **product signal**. It is separate from **`delivery layer not working`** (step 3), which **does** block.

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

## Troubleshooting (migration drift & “policy already exists”)

### Work from the repo root

All CLI commands assume **`cd` into `who-do-i-work-for`** (the folder that contains `supabase/` and `scripts/`). Paths like `supabase/migrations/...` are wrong from `~`.

### Policy `already exists` on `storage.objects`

The migration **`supabase/migrations/20260405130000_security_hardening.sql`** must include **`DROP POLICY IF EXISTS`** immediately before **`CREATE POLICY "authenticated users upload battle images"`**. That fix is in the repo on branch **`cursor/pre-launch-hardening`** — **`git pull`** before pushing again.

If the remote DB still has the policy and a migration fails before you can pull: run **one-off SQL against the linked project** (not raw SQL in zsh):

```bash
supabase db query --linked "DROP POLICY IF EXISTS \"authenticated users upload battle images\" ON storage.objects;"
```

Then run **`supabase db push`** (or **`supabase db push --include-all`** if the CLI tells you to).

### Desk health: `publish_status` missing / `wdiwf_desk_publications` not in schema cache

The desk pipeline uses **two** migrations in order:

1. **`20260404210000_wdiwf_desk_publications.sql`** — creates **`wdiwf_desk_publications`**
2. **`20260405120000_wdiwf_desk_publications_operability.sql`** — adds **`publish_status`**, **`failure_*`**, **`wdiwf_latest_live_desk_publication()`**, and updates RLS

If you applied **(1)** manually (or partially) but **not (2)**, **`db push`** can still say **“Remote database is up to date”** while the health function fails on missing columns.

**Fix** (from repo root) — apply operability SQL with **`-f`** (required: do **not** use `supabase db query --linked "$(cat …)"` — lines starting with **`--`** are treated as CLI flags and you get **`unknown flag: --`**):

```bash
./scripts/supabase/apply-desk-operability.sh
```

Equivalent:

```bash
supabase db query --linked -f supabase/migrations/20260405120000_wdiwf_desk_publications_operability.sql
```

Then re-run **`./scripts/supabase/health-check.sh`** or **`./scripts/supabase/deploy.sh`**.

If this script errors on **duplicate constraint**, the operability migration already ran partly — use the SQL Editor to finish or ask for help with the exact Postgres error.

### Commands that do **not** exist (ignore old advice)

- **`supabase db execute`** — not a real subcommand; use **`supabase db query`** (see **`supabase db query --help`**).
- **Typing `DROP POLICY ...` directly in the shell** — zsh will treat it as a command; use **`supabase db query --linked "..."`** or the SQL Editor in the dashboard.

### “Remote migration versions not found in local migrations directory”

Your **linked project’s migration history** and **local `supabase/migrations/`** are out of sync. Do **not** stack random **`migration repair`** commands from a chatbot.

1. **`git pull`** so local files match your team’s branch.
2. **`supabase migration list`** — compare local vs remote.
3. Follow **only** the repair / pull guidance **printed by your CLI** for your exact versions, or use the [Supabase migration docs](https://supabase.com/docs/guides/cli/managing-environments#migration-history-conflicts).

When history is aligned, prefer **`supabase db push`** (and **`--include-all`** only when the CLI prompts for it).

---

## Related docs

- Desk schema and contracts: `docs/CONTENT_ENGINE_LIVE_DELIVERY.md`
- Publish handoff: `newsletter/delivery/PUBLISHING.md`, `automations/HOT_SIGNAL_ENGINE.md`
