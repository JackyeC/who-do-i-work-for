

## Labor Rights Signal Engine — Research, Import, and Seed Companies

### Current State
- **190 companies** in the database, **0 workplace enforcement signals**, **48 WARN notices**, **244 labor-rights issue signals** (but mostly keyword/stance-based, not enforcement data)
- Existing edge functions: `sync-workplace-enforcement` (DOL OSHA + WHD — never successfully populated), `warn-national-sync` (Big Local News WARN data), `warn-scan` (Firecrawl-based)
- Existing tables: `workplace_enforcement_signals`, `company_warn_notices`, `issue_signals`, `company_signal_scans`
- **Missing entirely**: NLRB data, union membership signals, DOL enforcement API (v4), BLS union data, OpenSecrets labor lobbying

### What We'll Build

**Phase 1: New `sync-labor-rights` Edge Function**
A unified edge function that pulls from 5 free government data sources for a given company and writes structured signals:

1. **DOL Enforcement** (existing `enforcedata.dol.gov/api` — OSHA + WHD, already coded but broken/unused) — fix and invoke
2. **NLRB Cases** — scrape NLRB CATS data from Data.gov JSON endpoint for union elections and unfair labor practice complaints
3. **WARN Notices** — invoke existing `warn-national-sync` (already works)
4. **BLS Union Membership** — query BLS API for industry-level unionization rates (series LNU02073395)
5. **OpenFEC Labor PAC Spending** — query existing `sync-openfec` data for labor-related PAC activity

The function writes to:
- `workplace_enforcement_signals` (OSHA/WHD violations)
- `issue_signals` with `issue_category = 'labor_rights'` and new signal subtypes: `nlrb_complaint`, `nlrb_election`, `union_membership_rate`, `osha_violation`, `wage_violation`, `warn_layoff`
- `company_signal_scans` for audit trail

**Phase 2: New `labor_rights_signals` Database Table**
A dedicated table for NLRB and union-specific data not covered by existing tables:

```sql
CREATE TABLE public.labor_rights_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  signal_category text NOT NULL DEFAULT 'labor_rights',
  signal_type text NOT NULL, -- nlrb_election, nlrb_ulp, union_drive, collective_bargaining, etc.
  case_number text,
  filing_date date,
  resolution_date date,
  resolution_type text,
  union_name text,
  employees_affected integer,
  location_state text,
  description text,
  source_name text NOT NULL,
  source_url text,
  confidence text DEFAULT 'direct',
  evidence_text text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.labor_rights_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.labor_rights_signals FOR SELECT USING (true);
```

**Phase 3: Seed Target Companies**
Run the new function against ~15 companies known for labor rights issues (pro and anti):

| Company | Known For |
|---------|-----------|
| Amazon | Anti-union activity, OSHA violations, WHD cases |
| Starbucks | Union-busting NLRB complaints |
| Walmart | Wage violations, anti-union history |
| Tyson Foods | OSHA violations, immigration labor |
| Tesla | NLRB complaints, safety violations |
| Dollar General | OSHA "severe violator" |
| Costco | Pro-worker, high wages |
| Patagonia | Pro-labor, B-Corp |
| REI | Unionization wave |
| Trader Joe's | Recent union drives |
| UPS | Major union contract (Teamsters) |
| John Deere | UAW strike |
| Kellogg's | BCTGM strike |
| Chipotle | NLRB violations |
| Apple | Retail union drives |

For companies not yet in the directory, add them via the existing `company-research` function first.

**Phase 4: Wire into Influence Network Map**
Add "Labor Rights" filter data to `FollowTheMoney.tsx` using real seeded companies instead of only Tyson.

### Technical Details

**NLRB Data Source**: The NLRB publishes case data via Data.gov at `https://data.nlrb.gov/`. We'll use the CATS (Case Activity Tracking System) API or JSON feeds to pull:
- R-cases (representation/election petitions)
- C-cases (unfair labor practice charges)

**DOL Enforcement API**: The existing `sync-workplace-enforcement` function uses `enforcedata.dol.gov/api/osha_inspection` and `whd_compliance` — these are live free APIs. The function exists but has never successfully populated data. We'll fix the search logic and trigger it.

**BLS Union Data**: Free API at `api.bls.gov/publicAPI/v2/timeseries/data/` — series like `LNU02073395` (union membership rate). Already have `sync-bls-data` function infrastructure.

**Daily Refresh**: Add `sync-labor-rights` to the `daily-gov-data-refresh` GOV_SOURCES array so labor data refreshes nightly alongside OpenFEC/LDA/USASpending.

### Files to Create/Modify
1. **Create** `supabase/functions/sync-labor-rights/index.ts` — unified labor rights data importer
2. **Create** migration for `labor_rights_signals` table
3. **Modify** `supabase/functions/daily-gov-data-refresh/index.ts` — add labor rights to nightly refresh
4. **Modify** `supabase/config.toml` — register new function
5. **Modify** `src/pages/FollowTheMoney.tsx` — add real labor rights company nodes from seeded data
6. **Create** `supabase/functions/seed-labor-companies/index.ts` — one-time seeder that adds missing companies and triggers labor scans

