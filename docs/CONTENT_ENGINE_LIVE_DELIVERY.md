# Content engine — live website delivery (Phase 1)

This document answers architecture questions for WDIWF editorial + publishing: what was demo-only, what is live now, and how to operate it.

---

## 1. Files that were static sample (demo) on `/newsletter`

| Location | Role |
|----------|------|
| `src/content/newsletterDeskSample.ts` | **Fallback only** — fictional desk matching engine shape. |
| `src/components/newsletter/NewsletterDeskSample.tsx` | Renders that sample when no live row exists. |
| `src/components/newsletter/NewsletterDeskPreview.tsx` | Chooses **Supabase live row** vs fallback + loading state. |

The **work intelligence feed** below the desk on `/newsletter` was already live: `useWorkNews` → Supabase `work_news` (`src/hooks/use-work-news.ts`, `src/pages/Newsletter.tsx`).

---

## 2. Recommended website delivery path (single choice)

**Supabase table + Row Level Security + Edge Function insert** is the production path for this repo:

- The app already uses Supabase for `work_news`, auth, and Edge Functions.
- **Anonymous site visitors** can read only rows that match the **full live contract** (see §3): `publish_status = success`, `published_to_site = true`, bi-hourly, completed, non-null `site_markdown`.
- **Automation** (Cursor, CI, local script) pushes content with a **shared secret** — no service role in the browser.

**Not chosen as primary:** git-commit MD into the repo for every run (noisy history, slower deploy loop, no per-run audit row). **Not chosen:** paste into Vercel env or code (manual, error-prone).

---

## 3. Schema — `public.wdiwf_desk_publications`

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid | PK |
| `created_at` | timestamptz | Default now |
| `run_id` | text | Optional trace / idempotency label |
| `kind` | text | `bi_hourly` \| `friday` (nullable only on **failed** audit rows) |
| `generation_status` | text | `completed` \| `skipped` (nullable only on **failed** audit rows) |
| `publish_status` | text | **Final edge outcome:** `success` \| `skipped` \| `failed` (set by Edge, not trusted from client) |
| `failure_code` | text | Required when `publish_status = failed` (stable machine code) |
| `failure_message` | text | Operator-readable detail for failures |
| `site_markdown` | text | **Website body** for desk “Website brief” tab |
| `newsletter_markdown` | text | Optional full email body for desk or Friday |
| `email_subject` | text | Optional |
| `email_preview_text` | text | Optional |
| `social_*` | text | Optional channel copy |
| `run_log` | jsonb | Inputs, outputs, `edge_received_at`, `final_status`, etc. |
| `published_to_site` | boolean | **Authoritative website gate** (see below) |

### `published_to_site` — contract (not “just metadata”)

- **Meaning:** “This row is intended to appear on the public **/newsletter** desk.”
- **Enforcement:** A **CHECK** constraint requires that if `published_to_site = true`, then the row must also be `publish_status = 'success'`, `generation_status = 'completed'`, `kind = 'bi_hourly'`, and `site_markdown` non-null.
- **RLS:** Anonymous and authenticated users may `SELECT` **only** rows that satisfy that same full live contract (including `publish_status = 'success'`).
- **So:** The flag is both **intent** and **part of the visibility contract**; the database + RLS together guarantee visitors never see drafts, skips, or failures.

### Final status semantics (`publish_status`)

| Value | Meaning | Typical HTTP |
|--------|---------|----------------|
| `success` | Payload accepted and stored; may be live (`published_to_site`) or draft (e.g. Friday). | 200 |
| `skipped` | Engine skipped the run; stored for audit; **never** public. | 200 |
| `failed` | Validation or DB error after auth; audit row stored when possible; **never** public. | 400 / 500 |

**401 / misconfiguration:** No DB row (no shared secret → do not allow unauthenticated failure spam).

**Writes:** via Edge Function using **service role** (no public insert policy).

Migrations: `supabase/migrations/20260404210000_wdiwf_desk_publications.sql`, `supabase/migrations/20260405120000_wdiwf_desk_publications_operability.sql`.

### “What is live right now?”

- **SQL / app:** `select * from wdiwf_latest_live_desk_publication();` — returns **at most one** row, the newest that matches the same filter as RLS.
- **Frontend:** `useLatestDeskPublication()` calls that RPC.

### Operator health (“is the engine alive?” / “safe to test?”)

- **Edge:** `GET` or `POST` `.../functions/v1/desk-publication-health?limit=5` with the same `Authorization: Bearer <WDIWF_DESK_PUBLISH_SECRET>`.
- **`ok: true`** only when **`checks.rpc_latest_live_desk`** is `"ok"` (RPC exists — same path as **`/newsletter`**). If operability migration wasn’t applied, `ok` is **`false`** even when `runs` can be read.
- Also returns: `checked_at`, `checks.publications_table`, `safe_for_newsletter_desk`, `runs`, `newest_live`, `engine_alive`.
- **Script:** `./scripts/supabase/health-check.sh` (see **`docs/SUPABASE_DEPLOY.md`**).
- **Deploy:** `supabase functions deploy desk-publication-health`

### Publish API response shape

`publish-desk-publication` returns JSON including `publish_status` / `final_status`, `ok`, and on success `id`, `created_at`, `run_id`, `kind`, `published_to_site`. On failure after auth, `audit_id` may reference the stored failure row.

---

## 4. Components / pages updated (Phase 1)

| File | Change |
|------|--------|
| `src/hooks/use-latest-desk-publication.ts` | React Query → RPC `wdiwf_latest_live_desk_publication()` (live contract). |
| `src/components/newsletter/NewsletterDeskLive.tsx` | **New** — Renders live markdown + email/social tabs. |
| `src/components/newsletter/NewsletterDeskSample.tsx` | **New** — Extracted sample UI. |
| `src/components/newsletter/NewsletterDeskPreview.tsx` | **Live + fallback** orchestration. |
| `src/pages/Newsletter.tsx` | Comment only (desk source clarified). |
| `src/integrations/supabase/types.ts` | Types for `wdiwf_desk_publications`. |

---

## 5. Automations: existing vs to wire

| Piece | Status |
|-------|--------|
| Bi-hourly spec | `automations/HOT_SIGNAL_ENGINE.md`, `automations/bi-hourly-agent-instructions.md` |
| Friday spec | Documented in user charter; align with `newsletter/outputs/friday/` contract in `newsletter/delivery/PUBLISHING.md` |
| **POST to `publish-desk-publication`** | **Operator step:** add to Cursor automation or CI after `Generation status: completed` |
| Example shell | `scripts/content-engine/publish-desk-publication.example.sh` |

**Skipped runs:** Do not set `published_to_site: true`. Optional: insert `skipped` row with `run_log` for audit (still not visible on public site).

---

## 6. Connectors, env vars, credentials

| Item | Purpose |
|------|---------|
| `WDIWF_DESK_PUBLISH_SECRET` | Supabase Edge secret; caller sends `Authorization: Bearer <value>` |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto for Edge Functions — insert bypasses RLS |
| `SUPABASE_URL` | Project URL (caller + function) |
| Frontend | Uses existing anon key — **no** new Vite env for desk read |

**Deploy:** use the fixed order and health gate in **`docs/SUPABASE_DEPLOY.md`** (`./scripts/supabase/deploy.sh` or the three CLI commands documented there).

---

## 7. Phased implementation order

### Phase 1 — Website delivery (this doc + code)

- Migration, RLS, Edge Function, hook, UI. **Done in repo:** implement as merged; **you** apply migration + deploy function + set secret + wire automation POST.

### Phase 2 — Email delivery (recommendation)

**Best next step: Beehiiv REST API** (or keep Substack as manual/draft workflow if you are locked to Substack UX).

| Topic | Detail |
|-------|--------|
| Possible now | Export Friday files (`newsletter.md`, `subject-lines.txt`, `preview-text.txt`) — human paste into Substack/Beehiiv; or Zapier/Make “new file” trigger |
| Beehiiv | API key + publication ID → create **draft** post; review in Beehiiv; send |
| Substack | Official API surface has shifted; many teams use **manual** or **Zapier**; verify current Substack developer docs before betting on full automation |
| Recommended posture | **Draft creation**, not direct send, until editorial sign-off is routine |

Credentials: Beehiiv API key, publication ID; store in Cursor automation secrets / CI — not in repo.

### Phase 3 — Social delivery (recommendation)

| Channel | Direct from repo? | Best near-term path |
|---------|-------------------|---------------------|
| **LinkedIn** | Possible with OAuth + org permissions | **Draft** `linkedin.txt` + scheduler (Zapier/Make) or manual |
| **Bluesky** | Yes with app password + ATProto client | **Draft** file + optional small worker later |
| **Instagram / Facebook** | Heavy Meta app review for auto-Reels | **Draft** `instagram.txt` / `facebook.txt` + manual or approved Graph API |
| **YouTube Shorts** | API upload possible with OAuth + quota | **Draft** `youtube-short.md`; video still human-produced |

Treat social as the same pipeline: **files + optional webhooks**; promote to API only when credentials and review workflow exist.

---

## 8. Operator checklist (go-live)

Full Supabase order and scripts: **`docs/SUPABASE_DEPLOY.md`**.

**Before testers — mandatory gate (all must pass):**

1. **Health** — `./scripts/supabase/deploy.sh` (or `health-check.sh`) exits clean; JSON **`ok: true`**.
2. **Real publish** — POST a live row (e.g. `scripts/content-engine/publish-desk-publication.example.sh`) or confirm **`newest_live`** in health is the row you intend to show.
3. **Manual `/newsletter`** — production URL shows **Live** desk matching that publication. If not, while 1–2 passed: **failure** — log **`delivery layer not working`** (exact template in **`docs/SUPABASE_DEPLOY.md`** § *Final verification*).

**Ongoing:** add POST to bi-hourly automation **only** when generation completes with strong `site-update.md`.

---

## Friday newsletter vs bi-hourly

- **Friday** rows can use `kind: 'friday'`, `published_to_site: false` until reviewed — they **do not** match current public RLS, so they stay off the public desk until you add a reviewed-publish flow (e.g. flip `published_to_site` or separate `friday` read policy for admins only).

---

## Related source-of-truth docs

Use as active references every run: `docs/BUILD_BIBLE.md`, `docs/MESSAGE_SYSTEM.md`, `newsletter/style/jackye-voice.md`, `newsletter/style/enforcement.md`, `automations/bi-hourly-agent-instructions.md`, `newsletter/delivery/PUBLISHING.md`, visual refs per project charter.
