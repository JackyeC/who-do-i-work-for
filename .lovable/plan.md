

# Fix Representative Data + Multi-Source Enrichment

## Root Cause Found

**Critical bug**: The `voter-lookup` edge function reads `Deno.env.get('FEC_API_KEY')` but the secret is stored as `OPENFEC_API_KEY`. This means every FEC lookup uses the `DEMO_KEY` fallback, which is heavily rate-limited and returns incomplete/empty donation data. This is why "no donations" appears despite data existing.

## Plan (Two Parts)

### Part 1: Fix Existing Data Pipeline + Enrich Representatives

**1. Fix FEC API key reference** (voter-lookup edge function)
- Change `FEC_API_KEY` → `OPENFEC_API_KEY` to use the real key
- This alone should dramatically improve donation data retrieval

**2. Add Congress.gov enrichment** (already have `CONGRESS_GOV_API_KEY` secret)
- After AI identifies reps, call Congress.gov API to get:
  - Official member details (party, chamber, committees, photo URL)
  - Current session voting activity
- This replaces reliance on AI inference for basic rep metadata

**3. Add confidence + freshness metadata to each rep**
- Tag each representative with `source_confidence` (high/medium/low) based on how many sources confirmed their identity
- Show `last_updated` timestamp and source badges (FEC, Congress.gov, AI) in the UI

**4. Improve the UI with grouped levels + graceful gaps**
- Group representatives by level: Federal → State → Local
- Replace blank donation sections with contextual messages: "Limited public data available — FEC records searched"
- Add confidence badge per representative
- Show data source indicators (FEC badge, Congress.gov badge)

### Part 2: Onboarding Flow Improvements

**Not implementing the full Gemini-suggested onboarding rebuild now.** The existing `DashboardOnboarding.tsx` flow already handles the core steps (values → resume → company check). The landing page (`Index.tsx`) already has a strong hero with search.

The Gemini suggestions around "minimize regret" framing and "before you sign" moments are good product direction, but they're copy/positioning changes — not architectural. These can be addressed in a dedicated pass later.

## Implementation Steps

1. **Fix voter-lookup edge function**: Use correct secret name, add Congress.gov member lookup, add confidence scoring, return richer rep objects
2. **Update VoterLookup.tsx**: Add level grouping, confidence badges, source indicators, graceful "limited data" states with explanations
3. **Update RepresentativeProfile.tsx**: Show committees, photo, last-updated timestamps, confidence level

## What This Fixes
- Donations will actually appear (FEC key fix)
- Rep profiles will have party, committees, photo from Congress.gov (not just AI guessing)
- Users see confidence levels so partial data feels intentional, not broken

