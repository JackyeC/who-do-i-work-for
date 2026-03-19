

## Plan: Add Insider Score Pill to Company Cards + Breakdown Section in Dossier

### Summary
Create a reusable `InsiderScorePill` component, add it to 4 company card variants (additive only — no restructuring), add an "Insider Score Breakdown" section to the Company Dossier page, and add a database column to store the score.

### Database Migration
Add `insider_score` column (nullable integer, default null) to `companies` table:
```sql
ALTER TABLE public.companies ADD COLUMN insider_score integer DEFAULT NULL;
```
No RLS changes needed — this column inherits existing company table policies. When `insider_score` is NULL, the pill displays "Pending."

### Files to Create

**1. `src/components/InsiderScorePill.tsx`**
Reusable pill component. Props: `score: number | null | undefined`.
- If score is null/undefined → renders "Insider Score · Pending" in muted style (#7a7590, transparent bg, border rgba(255,255,255,0.07))
- 0–39 → green (#47ffb3), label "Open Network"
- 40–69 → amber (#f0c040), label "Moderate Concentration"
- 70–100 → red-amber (#ff6b35), label "High Concentration"
- Pill style: border-radius 20px, padding 5px 12px, DM Sans 12px weight 500, inline-flex, gap 6px
- Wrapped in a Tooltip (using existing `@/components/ui/tooltip`) showing the hover text from the spec, with `[X]%` replaced by score value when available

**2. `src/components/dossier/InsiderScoreBreakdown.tsx`**
Expandable section for the Company Dossier. Props: `companyId: string, companyName: string`.
- Queries `board_interlocks` table for interlock count
- Displays 5 sub-rows: Leadership overlap, Board interlocks (from DB), Educational concentration, Related party disclosures, Network density estimate
- Each row shows value or "Data pending"
- Uses existing `VerificationBadge` from `@/components/SourceTransparencyPanel` for verification status
- Network density row explicitly labeled "Tier 4 — commercial enrichment, not verified"
- Collapsible explainer text at bottom (the "Every company runs a background check..." paragraph)

### Files to Modify (additive only)

**3. `src/components/CompanyCard.tsx`** — Add `<InsiderScorePill />` in the existing footer row (line 32-42), next to CivicFootprintBadge. No restructuring. Uses `company.civicFootprintScore` area — will pass insider score from company data or undefined for Pending.

**4. `src/components/slots/TrackedCompanyCard.tsx`** — Add `<InsiderScorePill />` below the existing influence score div (line 35-38). Additive only.

**5. `src/components/values-lens/ValuesCompanyCard.tsx`** — Add `<InsiderScorePill />` in the header badges area (line 83-90), next to existing signal count badge. Additive only.

**6. `src/components/career/EmployerDossierCard.tsx`** — Add `<InsiderScorePill />` in the badges row (line 39-42), alongside existing Risk and Confidence badges. Additive only.

**7. `src/pages/CompanyDossier.tsx`** — Add a new `DossierLayer` for "Insider Score" in the candidate lens section (after Influence & Policy, before Patterns & Synthesis). Uses `InsiderScoreBreakdown` component. No existing layers modified.

**8. `src/data/sampleData.ts`** — Add `insiderScore?: number` to the `Company` interface. No existing fields changed.

### What is NOT touched
- No data pipeline changes — just a nullable DB column and client-side reads
- No scoring logic changes — Civic Footprint, Evidence Quality untouched
- No existing signals moved or removed from any card
- No methodology or evidence sources pages modified
- Existing verification badge system reused as-is

