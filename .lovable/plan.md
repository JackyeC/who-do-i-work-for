

## Gun Policy Signal Engine — Receipts, Not Labels

Following the identical architecture as Labor Rights, Immigration, and Climate engines.

### 1. Database Table: `gun_policy_signals`

```sql
CREATE TABLE public.gun_policy_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  signal_category text NOT NULL DEFAULT 'gun_policy',
  signal_type text NOT NULL, -- ffl_license, gun_lobby_donation, firearms_policy, gun_litigation, coalition_membership, gun_sales
  license_type text, -- manufacturer, dealer, importer
  case_number text,
  filing_date date,
  amount numeric,
  organization_name text, -- NRA, NSSF, Everytown, etc.
  location_state text,
  description text,
  source_name text NOT NULL,
  source_url text,
  confidence text DEFAULT 'direct',
  evidence_text text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.gun_policy_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.gun_policy_signals FOR SELECT USING (true);
CREATE INDEX idx_gun_policy_company ON public.gun_policy_signals(company_id);
CREATE INDEX idx_gun_policy_type ON public.gun_policy_signals(signal_type);
```

### 2. Edge Function: `sync-gun-policy-signals`

Pulls from free public sources per company:

| Source | Endpoint | Signal Types |
|--------|----------|-------------|
| ATF FFL List | ATF published CSV/datasets | `ffl_license` (manufacturer, dealer, importer) |
| OpenFEC | Existing PAC data cross-referenced for gun policy orgs (NRA, NSSF, Everytown) | `gun_lobby_donation` |
| Gun Violence Archive | `https://www.gunviolencearchive.org` (structured search) | `gun_incident_link` |

Also writes summary rows to `issue_signals` with `issue_category = 'gun_policy'`.

### 3. Edge Function: `seed-gun-policy-companies`

Seeds ~12 companies with documented gun policy activity:

| Company | Known Activity |
|---------|---------------|
| Smith & Wesson (now Smith & Wesson Brands) | Firearms manufacturer |
| Sturm Ruger | Major firearms manufacturer |
| Walmart | Sold firearms, changed policy 2019 |
| Dick's Sporting Goods | Removed assault-style rifles from stores |
| Kroger | Requested customers not open-carry |
| Vista Outdoor | Ammunition manufacturer (Federal, CCI) |
| Sig Sauer | Firearms manufacturer |
| Bass Pro Shops / Cabela's | Major firearms retailer |
| Levi Strauss | Corporate gun safety advocacy |
| Salesforce | Restricted gun retailer clients on platform |
| Remington (RemArms) | Manufacturer, Sandy Hook settlement |
| Daniel Defense | Manufacturer, policy controversy |

### 4. Daily Refresh

Add `sync-gun-policy-signals` to the `daily-gov-data-refresh` GOV_SOURCES array.

### 5. Influence Network Map

Add gun policy nodes to `FollowTheMoney.tsx` for the "Gun Policy" filter:
- **Companies**: Smith & Wesson, Walmart, Dick's Sporting Goods, Levi Strauss
- **Organizations**: NRA, NSSF, Everytown for Gun Safety, Giffords
- **Legislation**: Bipartisan Safer Communities Act, Protection of Lawful Commerce in Arms Act
- **Agencies**: ATF (Bureau of Alcohol, Tobacco, Firearms)
- **Committees**: Senate Judiciary (already exists), House Judiciary

### 6. SignalSourceLink

Add entries for `ATF`, `Gun Violence Archive`, `NSSF`.

### Files to Create/Modify

1. **Create** migration for `gun_policy_signals` table
2. **Create** `supabase/functions/sync-gun-policy-signals/index.ts`
3. **Create** `supabase/functions/seed-gun-policy-companies/index.ts`
4. **Modify** `supabase/functions/daily-gov-data-refresh/index.ts` — add gun policy to nightly refresh
5. **Modify** `supabase/config.toml` — register new functions
6. **Modify** `src/pages/FollowTheMoney.tsx` — add gun policy company/org nodes
7. **Modify** `src/components/SignalSourceLink.tsx` — add gun policy source URLs

