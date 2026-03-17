

## Plan: Decouple from Firecrawl — Seeded Intelligence Mode

### Problem
21 edge functions depend on Firecrawl. It's hard-blocked (402). The product appears broken with empty states and errors everywhere. All `career_intelligence_score` values are 0.0.

### Strategy
Three-phase approach: seed curated dossier data, update all remaining scan functions to use the Gemini fallback, and make the UI never show "broken."

---

### Phase 1: Seed Company Dossier Data

**New table: `company_dossiers`**

Stores curated, hand-written intelligence for key companies. Fields:
- `company_id` (FK to companies)
- `score` (numeric, 1-10)
- `risk_level` (text: Low/Moderate/High)
- `confidence` (text: Low/Medium/High)
- `insights` (text array — "Before you accept" bullets)
- `fit_signals` (text array — "Strong fit if you")
- `risk_signals` (text array — "Risk if you")
- `bottom_line` (text — one-liner summary)
- `sources_note` (text)
- `created_at`, `updated_at`

RLS: readable by all authenticated users.

**Seed 7 companies** with the curated data you provided:
Amazon, Microsoft, Workday, SeekOut, Textio, Google (currently missing — need to check), Meta, Salesforce.

Also run `compute_all_career_intelligence_scores()` to populate the currently-zero scores from existing DB data.

### Phase 2: Update Career Intelligence UI to Use Dossiers

**Modify `EmployerDossierCard`, `BeforeYouAcceptBlock`, `WhatThisMeansForYou`:**
- First check `company_dossiers` table for curated data
- If dossier exists → display curated score, insights, fit/risk, bottom line
- If no dossier → fall back to current computed logic from `companies` table fields
- Never show empty/error states

**Update `SampleDossierPreview`:**
- Change from "Acme Corp" to use Amazon as the example (real data, more credible)

**Add "Request this company" CTA** when a searched company has no dossier — stores requests for later curation.

### Phase 3: Make All Scan Functions Firecrawl-Independent

**Apply the `resilientSearch` Gemini fallback** to the remaining 19 scan functions that still hard-depend on Firecrawl:
- `worker-benefits-scan`, `ai-accountability-scan`, `pay-equity-scan`, `social-scan`, `ideology-scan`, `agency-scan`, `values-scan`, `eeoc-scan`, `warn-scan`, `job-scrape`, `fetch-company-branding`, `leader-enrich`, `company-discover`, `refresh-intelligence`, `sync-opensecrets`, `voter-lookup`, `patent-scan`, `institutional-dna-scan`, `civiclens-intelligence-scan`

Each function gets:
- `resilientSearch` import replacing direct Firecrawl calls
- Firecrawl key becomes optional (not a hard gate)
- On 402/missing key → Gemini AI research fallback
- Functions that only scrape URLs (branding, voter-lookup) get a graceful skip with cached data return

### Phase 4: UI Resilience Layer

**Update `useScanWithFallback` hook:**
- When circuit is open, still allow scan attempts (since functions now have Gemini fallback)
- Remove the hard block that prevents calling edge functions when Firecrawl is down
- Keep the toast messaging but change to informational: "Using AI research mode"

**Update scan cards** (WorkerSentimentCard, AIHiringCard, etc.):
- Replace "Paused" button states with "Scan (AI)" when Firecrawl is unavailable
- Show "AI-powered research" badge instead of "Firecrawl down" indicators

---

### Technical Details

**Migration SQL:**
```sql
CREATE TABLE public.company_dossiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL UNIQUE,
  score numeric NOT NULL DEFAULT 5.0,
  risk_level text NOT NULL DEFAULT 'Moderate',
  confidence text NOT NULL DEFAULT 'Medium',
  insights text[] NOT NULL DEFAULT '{}',
  fit_signals text[] NOT NULL DEFAULT '{}',
  risk_signals text[] NOT NULL DEFAULT '{}',
  bottom_line text,
  sources_note text DEFAULT 'SEC filings, WARN notices, workforce data, compensation benchmarks, employee sentiment signals',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.company_dossiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read dossiers"
  ON public.company_dossiers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage dossiers"
  ON public.company_dossiers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

Then seed the 7 companies with INSERT statements using data from the user's brief.

**Files to create:**
- None new (dossier logic integrates into existing components)

**Files to modify:**
- `src/components/career/EmployerDossierCard.tsx` — fetch from `company_dossiers` first
- `src/components/career/BeforeYouAcceptBlock.tsx` — use dossier insights if available
- `src/components/career/WhatThisMeansForYou.tsx` — use dossier fit/risk if available
- `src/components/career/SampleDossierPreview.tsx` — Amazon example
- `src/hooks/use-scan-with-fallback.ts` — remove hard Firecrawl gate
- 19 edge functions — add resilientSearch fallback

**Estimated scope:** Large but systematic — the edge function changes are repetitive (same pattern applied 19 times).

