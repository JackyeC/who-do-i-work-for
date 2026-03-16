

## Corporate Alignment Intelligence: Contradiction Layer, Recency Indicators & Civil Rights Panel

### What You're Asking For (Summary)

You've outlined a six-layer architecture for surfacing **mismatch signals** between what companies say and what they spend on, plus per-signal **freshness indicators** and a unified **Civil Rights Intelligence Panel**. Most of the raw data infrastructure already exists — the gap is in **surfacing contradictions**, **showing recency**, and **grouping civil rights signals** into a single panel.

### What Already Exists

| Layer | Status |
|-------|--------|
| Lobbying (Senate LDA) | ✅ `sync-lobbying` edge function, live data |
| PAC Donations (OpenFEC) | ✅ `sync-openfec`, PAC drawer, party breakdown |
| Policy Commitments | ⚠️ `public_stances` table + AlignmentDashboard — but no automated cross-reference against spending |
| Civil Rights Signals | ✅ `sync-civil-rights-signals` (CourtListener, EEOC, HRC) — but displayed only in Corporate Impact Map, not in company profile |
| Contradiction Detection | ⚠️ `social-scan` has a `contradictions` field and `hypocrisyFlags` in sentiment scan — but these are AI-inferred, not evidence-linked. No systematic "statement vs. spending" comparison |
| Recency Indicators | ⚠️ `DataFreshnessCard` shows overall staleness but NOT per-signal freshness badges |

### Plan (4 Deliverables)

---

#### 1. Contradiction Detection Engine (new edge function)

Create `supabase/functions/detect-contradictions/index.ts` that:
- Takes a `companyId` and queries:
  - `public_stances` (what the company publicly says)
  - `entity_linkages` where `link_type = 'donation_to_member'` (who they fund)
  - `issue_signals` (mapped issue positions of funded politicians)
  - `civil_rights_signals`, `climate_signals`, etc.
- Compares stance topics against spending targets using the existing `issue_legislation_map` logic
- Produces structured contradiction records: `{ topic, publicStatement, spendingReality, severity, evidenceLinks[] }`
- Stores results in a new `contradiction_signals` table
- No AI — pure data cross-reference (statement says X, spending goes to candidates opposing X)

**New table** (`contradiction_signals`):
```
id, company_id, topic, public_statement, spending_reality, 
severity (high|medium|low), evidence_sources (jsonb), 
statement_source_url, spending_source_url, created_at
```

---

#### 2. Per-Signal Recency Badges

Add a reusable `<SignalFreshness />` component that:
- Takes a `lastUpdated: string` date
- Displays "Signal freshness: X days" with color coding:
  - Green: < 30 days
  - Yellow: 30–90 days  
  - Red: > 90 days
- Include the data-type refresh cadence (e.g., "PAC data updates monthly")
- Attach this badge to every signal card in the company profile: PAC, lobbying, contracts, sentiment, civil rights, etc.

---

#### 3. Civil Rights Intelligence Panel (new component)

Create `<CivilRightsIntelligencePanel />` that aggregates into one view:
- **Corporate Statement**: From `public_stances` where topic matches civil rights keywords
- **Political Donations**: From `entity_linkages` filtered to civil-rights-related recipients (using `issue_signals`)
- **Lobbying Activity**: From lobbying linkages filtered to civil rights issues
- **Legal/Controversy**: From `civil_rights_signals` (EEOC, CourtListener, HRC)
- **Contradiction Row**: From the new `contradiction_signals` table

Display as a compact evidence table (like the example you gave) with each row showing the data type, the finding, and a freshness badge.

Add this panel to the company profile under the existing `values` section renderer.

---

#### 4. Wire Into Company Profile

- Add `CivilRightsIntelligencePanel` to the `values` section in `CompanyProfile.tsx`
- Add `SignalFreshness` badges to existing cards (PAC drawer, lobbying drawer, contracts card)
- Add `detect-contradictions` to the `osint-parallel-scan` pipeline and `daily-gov-data-refresh`

### Database Migration

One new table: `contradiction_signals` with RLS policies allowing authenticated read access and service-role write.

### Files Changed/Created

| File | Action |
|------|--------|
| `supabase/functions/detect-contradictions/index.ts` | Create |
| `src/components/SignalFreshness.tsx` | Create |
| `src/components/CivilRightsIntelligencePanel.tsx` | Create |
| `src/pages/CompanyProfile.tsx` | Edit (add panel + freshness badges) |
| `supabase/functions/daily-gov-data-refresh/index.ts` | Edit (add detect-contradictions to pipeline) |
| `supabase/functions/osint-parallel-scan/index.ts` | Edit (add detect-contradictions call) |

