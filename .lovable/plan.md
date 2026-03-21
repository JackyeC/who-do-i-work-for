

# Fix Company Dossier Page — Full Functionality

## What's Actually Wrong

After investigation, the page is **not static** — it already has extensive data connections and interactive components. The real issues are:

1. **Build error blocking deployment**: `check-subscription/index.ts` uses `npm:@supabase/supabase-js@2.57.2` which fails Deno's module resolution. This blocks all edge functions from deploying.

2. **No Jackye's Insight shown on company profile**: The `jackye_insight` field exists in the DB (populated for 45+ companies) but CompanyProfile.tsx never renders it.

3. **No issue signals shown for newly seeded companies**: The 03-issue-signals.sql and 04-public-stances.sql weren't fully imported yet (only Amazon, Tesla, Walmart have signals from prior data; 47 new companies have zero).

4. **MAC Cosmetics specifically** has zero data (score 0, no insight, no signals) — it's a bare skeleton entry.

5. **Missing "no data" fallback on company profile**: When a company has no signals, scores, or insights, the page shows sections with empty content but no clear "we don't have receipts yet" message or audit request flow.

## Plan

### Step 1: Fix build error in `check-subscription/index.ts`
- Replace `import { createClient } from "npm:@supabase/supabase-js@2.57.2"` with `import { createClient } from "https://esm.sh/@supabase/supabase-js@2"`
- Replace `import { serve } from "https://deno.land/std@0.190.0/http/server.ts"` + `serve(...)` with `Deno.serve(...)`

### Step 2: Add Jackye's Insight to CompanyProfile
- After the header card, render the `jackye_insight` field from `dbCompany` as a styled coaching block (similar to how JobDetailPage renders it under "Strategic Context")
- Also show `description` if `jackye_insight` is absent

### Step 3: Add "No Data" fallback state
- When a company has no meaningful data (no signals, no PAC, no lobbying, score = 0), show a clear fallback block:
  - "We don't have receipts on this company yet."
  - Request Audit button → links to the existing audit request flow
  - Show the scan button prominently

### Step 4: Seed remaining data (issue signals + public stances)
- Insert the remaining issue signals and public stances from the uploaded SQL files for the newly seeded companies
- This will populate the "What We're Seeing" signals and "Reality Gap" sections

### Step 5: Make all buttons functional with fallbacks
- Ensure the "Run Full Company Scan" button works (already does — just blocked by build error)
- For any action button that isn't ready, add `disabled` state with tooltip explaining why

## Technical Details

**Files to modify:**
- `supabase/functions/check-subscription/index.ts` — fix imports (build error)
- `src/pages/CompanyProfile.tsx` — add Jackye's Insight block + no-data fallback
- Database inserts for issue_signals and public_stances data

**No new tables or schema changes needed.** All data structures already exist.

