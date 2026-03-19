

## Patent Feature Fix: Auto-Load Real USPTO Data

### What's Already Done
- `uspto-scan` edge function (447 lines) already connects to PatentsView API with company name resolution, alias generation, CPC clustering, and signal scoring. This is solid.
- `InnovationPatentsLayer.tsx` (dossier page) already calls `uspto-scan` but requires a manual click to trigger.

### What's NOT Done (the actual problem)
- `InnovationSignals.tsx` (company profile page) uses a broken `scan-patents` edge function (Google Patents scraping) with a manual "Scan USPTO Records" button
- Patent data never auto-loads — users must click a button
- No `patent-utils.ts` client-side utility exists
- No ticker integration for notable patent activity

### Plan

**1. Create `src/lib/patent-utils.ts`** — Client-side utility
- `fetchPatentData(companyName)` that calls the existing `uspto-scan` edge function (not a new direct API call — the edge function already handles aliases, caching, and clustering)
- `calculateInnovationSignal()` returning high/moderate/low/none with labels and descriptions
- `getPatentGoogleLink(patentNumber)` for linking to readable patent pages

**2. Rewrite `src/components/company/InnovationSignals.tsx`**
- Remove the manual "Scan USPTO Records" button entirely
- Auto-load patent data via `useQuery` calling the `uspto-scan` edge function on mount (no `scanTriggered` state needed)
- Show skeleton loader with "Checking USPTO records..." during loading
- Display signal pill (green/amber/gray dot + label), total count, recent filings with Google Patents links
- Handle edge cases: 0 results with subsidiary note + link to PatentsView search, API timeout with graceful message
- Add source note: "USPTO PatentsView · Public record" + "View all patents on USPTO →" link

**3. Update `src/components/dossier/InnovationPatentsLayer.tsx`**
- Remove `scanTriggered` state — auto-load on mount by setting `enabled: true` instead of `enabled: scanTriggered`
- Keep the existing display (it's already good) but remove the "Check what they're actually building" empty state button

**4. Ticker integration** (lightweight)
- After patent data loads in `InnovationSignals.tsx`, if notable (100+ total or 5+ in 12 months), insert a ticker item via upsert to `ticker_items` table (if the table exists and company has a DB ID)

### Files to Change
- `src/lib/patent-utils.ts` — Create
- `src/components/company/InnovationSignals.tsx` — Rewrite to auto-load via `uspto-scan`
- `src/components/dossier/InnovationPatentsLayer.tsx` — Remove manual trigger, auto-load

### What Stays Untouched
- `supabase/functions/uspto-scan/index.ts` — Already works correctly
- `supabase/functions/scan-patents/index.ts` — Can remain (unused after this fix)
- All other data pipeline, methodology, scoring

