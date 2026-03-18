

# "Reality Feedback Loop" — Flinch Test & Crowdsourced Signals

## Current State

Your architecture prompt describes 5 pillars. **4 of 5 are fully built:**

1. **Investigation Pipeline** — Done (ATS pivot, precomputed dossiers, hardened SQL functions)
2. **Calibration Layer (DNA)** — Done (DNAPanel with 5 sliders, clash alerts, Decision Engine page)
3. **Tactical Toolkit** — Done (Brand Madness, TacticalQuestionsCard, StabilityDelta, NegotiationCoach)
4. **UI & Branding** — Done (monospace dossier aesthetic, blur gating on Pro content)
5. **Reality Feedback Loop** — **Missing**

## What We'll Build

### 1. The "Flinch Test" — Post-Interview Signal Collection

**New component: `src/components/reality-check/FlinchTest.tsx`**

After a user completes the Reality Check questionnaire, show a follow-up card:

- "Did they flinch?" — 3-5 yes/no toggles per tactical question category:
  - "Did they dodge the compensation structure question?"
  - "Did they get vague about retention or layoffs?"
  - "Did they redirect when asked about leadership stability?"
  - "Did they avoid specifics on team growth?"
- Each toggle maps to a signal category (comp_transparency, workforce_stability, etc.)
- Stores responses in a new `interview_flinch_signals` table

**New table: `interview_flinch_signals`**
```sql
CREATE TABLE public.interview_flinch_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  company_name TEXT NOT NULL,
  signal_category TEXT NOT NULL,
  flinch_detected BOOLEAN NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: users manage own rows
```

### 2. Crowdsourced Signal Intensity

**New component: `src/components/company/CrowdSignalBadge.tsx`**

A small badge on company profiles showing aggregated flinch data:

- Queries `interview_flinch_signals` grouped by company + signal category
- Shows "X of Y candidates flagged comp evasion" (anonymized counts, minimum 3 responses to display)
- Renders as a subtle monospace chip next to existing signal chips
- Free tier: count only. Pro tier: breakdown by category

**Integration point: `src/components/company/CompanyProfilePage.tsx`** (or equivalent profile view)

- Add CrowdSignalBadge inline with existing signal sections

### 3. Wire into Reality Check Flow

**Modify: `src/pages/RealityCheck.tsx`**

- After `RealityGapResults` renders, show `<FlinchTest>` card
- Pass the company ID and name from the questionnaire input

## Files

| Action | File |
|--------|------|
| Create | `src/components/reality-check/FlinchTest.tsx` |
| Create | `src/components/company/CrowdSignalBadge.tsx` |
| Modify | `src/pages/RealityCheck.tsx` — add FlinchTest after results |
| Migration | `interview_flinch_signals` table with RLS |

## Technical Details

- Minimum 3 anonymized responses before showing crowd data (privacy threshold)
- Aggregation query uses `COUNT(*) FILTER (WHERE flinch_detected)` for efficiency
- RLS: users can INSERT/SELECT own rows; SELECT aggregates available to all authenticated users via a security-definer function to prevent exposing individual responses

