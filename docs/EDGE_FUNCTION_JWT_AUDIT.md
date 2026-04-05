# Edge Functions: `verify_jwt = false` audit

Supabase does not enforce a platform JWT gate for the functions listed in [`supabase/config.toml`](../supabase/config.toml) under `[functions.<name>]` with `verify_jwt = false`. Each handler **must** implement its own authorization (user JWT via `requireUser`, `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`, webhook secrets, etc.).

## Shared helpers

- [`supabase/functions/_shared/auth.ts`](../supabase/functions/_shared/auth.ts) — `requireUser()` for logged-in Supabase users.
- [`supabase/functions/_shared/quota.ts`](../supabase/functions/_shared/quota.ts) — `enforceDailyQuota()` / `recordUsage()` against `public.user_usage`.

Refactored to use these where noted below.

## Functions with `verify_jwt = false` (by category)

| Category | Functions | Expected gate |
|----------|-----------|----------------|
| **User JWT + quota** | `semantic-search`, `career-discovery`, `offer-clarity-scan`, `translate-signals`, `delete-user-account` | `requireUser()` from `_shared/auth.ts` and `enforceDailyQuota` / `recordUsage` from `_shared/quota.ts` (where refactored). |
| **Webhooks / OAuth callbacks** | `browse-ai-webhook`, `linkedin-callback` | Verify signature or OAuth state as implemented in each handler. |
| **Cron / batch / internal** | `sync-*`, `seed-*`, `daily-gov-data-refresh`, `scheduled-leadership-refresh`, `news-ingestion`, `bulk-scrape-strategic-jobs`, `deactivate-expired-jobs` (if configured), `process-apply-queue`, `eeoc-case-scanner`, etc. | `Authorization` must match **service role** or other shared secret checked in code. |
| **Research / enrichment** | `company-research-perplexity`, `leader-enrich`, `generate-battle-image`, `osint-parallel-scan`, `fetch-company-compensation`, `receipts-timeline`, … | Treat as **privileged** unless explicitly documented otherwise; confirm service role or admin checks before exposing new callers. |
| **User uploads / AI** | `career-gap-analysis`, `parse-resume`, `negotiation-simulator`, `negotiation-coach`, `dream-job-detect`, `skill-gap-gigs`, `generate-briefing`, `parse-resume` | **Audit each file**: many require user session in-handler; do not assume the gateway blocks anonymous traffic. |
| **LinkedIn** | `linkedin-auth`, `linkedin-share-certificate` | OAuth flow or user JWT per implementation. |
| **Desk / publications** | `publish-desk-publication`, `desk-publication-health` | Service role or internal secret. |
| **Admin / maintenance** | `backfill-company-websites`, `batch-extract-corporate-claims`, `detect-contradictions`, `detect-board-interlocks`, `extract-corporate-claims`, `calculate-alignment-scores`, `fec-pac-recipients` | Service role or role-checked user JWT. |

## Default `verify_jwt`

Any function **not** listed in `config.toml` uses the project default (**JWT verification on**). Those endpoints still need correct RLS and least-privilege keys on the client.

## When adding a new function

1. Prefer **`verify_jwt = true`** if the only caller is the logged-in Supabase client with a user session.
2. If you set **`verify_jwt = false`**, document the expected gate in this file and implement **`requireUser()`** or **service-role** verification in the first lines of the handler.
