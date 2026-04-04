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
- **Anonymous site visitors** can read only rows that are explicitly **published** (`published_to_site`, `generation_status`, `kind`, non-null `site_markdown`).
- **Automation** (Cursor, CI, local script) pushes content with a **shared secret** — no service role in the browser.

**Not chosen as primary:** git-commit MD into the repo for every run (noisy history, slower deploy loop, no per-run audit row). **Not chosen:** paste into Vercel env or code (manual, error-prone).

---

## 3. Schema — `public.wdiwf_desk_publications`

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid | PK |
| `created_at` | timestamptz | Default now |
| `run_id` | text | Optional trace / idempotency label |
| `kind` | text | `bi_hourly` \| `friday` |
| `generation_status` | text | `completed` \| `skipped` |
| `site_markdown` | text | **Website body** for desk “Website brief” tab |
| `newsletter_markdown` | text | Optional full email body for desk or Friday |
| `email_subject` | text | Optional |
| `email_preview_text` | text | Optional |
| `social_linkedin` | text | Optional |
| `social_bluesky` | text | Optional |
| `social_x` | text | Optional |
| `social_instagram` | text | Optional |
| `social_facebook` | text | Optional |
| `run_log` | jsonb | Timestamp, inputs used, outputs, skip reason, etc. |
| `published_to_site` | boolean | **Must be true** for anon-visible bi-hourly live desk |

**RLS (anon / authenticated):** `SELECT` allowed only when  
`published_to_site = true` AND `generation_status = 'completed'` AND `kind = 'bi_hourly'` AND `site_markdown IS NOT NULL`.

**Writes:** via Edge Function using **service role** (no public insert policy).

Migration: `supabase/migrations/20260404210000_wdiwf_desk_publications.sql`.

---

## 4. Components / pages updated (Phase 1)

| File | Change |
|------|--------|
| `src/hooks/use-latest-desk-publication.ts` | **New** — React Query fetch latest visible row. |
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

**Deploy function:** `supabase functions deploy publish-desk-publication`  
**Apply migration:** `supabase db push` or dashboard SQL (project-dependent).

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

1. Run migration on production Supabase.
2. `supabase secrets set WDIWF_DESK_PUBLISH_SECRET='...'` (strong random string).
3. Deploy `publish-desk-publication`.
4. Test POST with `scripts/content-engine/publish-desk-publication.example.sh`.
5. Open `/newsletter` — desk should show **Live** card with your markdown.
6. Add POST step to bi-hourly automation **only** when generation completes with strong `site-update.md`.

---

## Friday newsletter vs bi-hourly

- **Friday** rows can use `kind: 'friday'`, `published_to_site: false` until reviewed — they **do not** match current public RLS, so they stay off the public desk until you add a reviewed-publish flow (e.g. flip `published_to_site` or separate `friday` read policy for admins only).

---

## Related source-of-truth docs

Use as active references every run: `docs/BUILD_BIBLE.md`, `docs/MESSAGE_SYSTEM.md`, `newsletter/style/jackye-voice.md`, `newsletter/style/enforcement.md`, `automations/bi-hourly-agent-instructions.md`, `newsletter/delivery/PUBLISHING.md`, visual refs per project charter.
