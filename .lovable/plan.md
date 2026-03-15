

## Merge Plan: Compensation Intelligence + Admin Dashboard Enhancements

### What You Uploaded vs What Already Exists

| Component | Already Built | Uploaded Files Want |
|---|---|---|
| `compensation_data` table | Created (migration ran) | `setup.sql` — same schema, plus RLS policies, freshness audit view, cron job |
| Edge function | AI-estimation version live | `index.ts` — multi-provider (Levels.fyi, Apify, H1B) with fallback chain |
| UI card | `CompensationMarketCard.tsx` working | Same requirements (already met) |
| Admin dashboard | `FounderConsole.tsx` with real data queries | `wdiwf-admin-dashboard.html` — richer layout with search intelligence, funnel, notes |
| Cron job | Partially configured | `setup.sql` has full pg_cron setup |

### The Reality Check

- **Levels.fyi has no public API** — the uploaded `index.ts` will fail on that provider every time
- **Apify requires a paid account + specific actor subscription** — you don't have `APIFY_API_KEY` or `LEVELSFYI_API_KEY` set
- **The current AI-estimation approach actually works** and returns data right now

### Plan: Hybrid Merge (Best of Both)

**1. Upgrade the Edge Function to support real providers when keys exist, AI fallback otherwise**

Merge the uploaded `index.ts` provider architecture (Levels.fyi, Apify, H1B blocks) into the existing `fetch-company-compensation/index.ts`, but add the current AI-estimation as a fourth fallback provider. The chain becomes:

```text
Levels.fyi (if key set) → Apify (if key set) → H1B (public, no key) → AI Estimation (always available)
```

This means compensation works immediately via AI, and when you eventually get API keys, the real providers activate automatically with zero code changes.

**2. Add missing database pieces from setup.sql**

Run a migration to add:
- RLS policies (service role write, authenticated read) — currently missing
- The `compensation_freshness_audit` view for quick monitoring
- Mark stale rows so cron picks them up

The cron job for auto-refresh will be configured via direct SQL insert (not migration) since it contains project-specific URLs.

**3. Enhance the Founder Console with admin dashboard features**

Port the best sections from `wdiwf-admin-dashboard.html` into the existing React `FounderConsole.tsx`:
- **Search Intelligence** section: top company searches + zero-result searches (query from existing tables)
- **Conversion Funnel** visualization: signup → first report flow
- **Compensation Data Health** panel: show freshness audit data from the new view
- **Founder Notes** section: weekly notes saved to a new `founder_notes` table

The existing stat cards, system health bars, and user activity sections stay as-is since they already pull real data.

**4. No changes needed to the UI card**

`CompensationMarketCard.tsx` already implements everything from the requirements — bar charts, freshness badges, disclaimer, source confidence. It stays as-is.

### Files to Create/Edit

| File | Action |
|---|---|
| `supabase/functions/fetch-company-compensation/index.ts` | Rewrite: merge multi-provider chain + AI fallback |
| Migration SQL | Add RLS policies, freshness audit view |
| Cron job SQL (via insert tool) | Auto-refresh stale companies daily at 2 AM UTC |
| `src/pages/FounderConsole.tsx` | Extend with search intelligence, funnel, comp health, notes |
| `founder_notes` table (migration) | Store weekly founder observations |

### Technical Notes

- The uploaded `index.ts` uses `sift` for serving — we will keep using the standard Deno `serve` pattern that works with Lovable's Edge Function deployment
- All existing secrets (`LOVABLE_API_KEY`, etc.) remain; the function checks for optional provider keys at runtime
- No frontend schema changes — the `CompensationMarketCard` component needs zero modifications

