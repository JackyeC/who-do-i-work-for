

# Fix PAC Detail: Show Who Gets the Money

## Problem

Braum's (and likely many companies) has **party-level spending data** ($370K Republican, $65K Democrat) but **zero individual candidate records** in `company_candidates`. So when you click into the PAC drawer, you see the pie chart and a message saying "individual recipient names aren't yet available" with a generic FEC link. That's not intelligence — it's a dead end.

## Root Cause

The `company_candidates` table is empty for this company. The PAC drawer already handles this case (lines 200-228 of `PACDetailDrawer.tsx`) but falls back to a passive "look it up yourself on FEC.gov" link, which defeats the purpose of the platform.

## Solution: Auto-fetch FEC recipients when drawer opens

### 1. New edge function: `fec-pac-recipients`

Creates `supabase/functions/fec-pac-recipients/index.ts` that:
- Takes a `company_id` and `company_name`
- Queries the **FEC OpenFEC API** (`https://api.open.fec.gov/v1/schedules/schedule_b/`) to find disbursements by committee name
- First resolves the company's PAC committee ID via `/committees/?q=COMPANY_NAME&committee_type=O`
- Then fetches top disbursement recipients via `/schedules/schedule_b/?committee_id=...`
- Normalizes results into `company_candidates` rows (name, party, state, amount, donation_type)
- Stores them so subsequent visits are instant
- Returns the fetched candidates

Requires: `FEC_API_KEY` secret (free from api.open.fec.gov)

### 2. Update `PACDetailDrawer.tsx`

When the drawer opens and `candidates` is empty but `totalPACSpending > 0`:
- Show a "Fetch FEC Records" button instead of just the passive FEC link
- On click, call the `fec-pac-recipients` edge function
- Show a loading state while fetching
- Once complete, display the results inline (same candidate row format already built)
- Cache: if candidates exist, skip the fetch

### 3. Update the empty state

Replace the current passive fallback (lines 200-228) with:
- A prominent CTA: **"Pull recipient records from FEC"**
- Loading spinner during fetch
- Error state if FEC is unavailable: "FEC data temporarily unavailable — try the direct link below"
- After successful fetch, the drawer auto-refreshes to show the new candidate rows

## Files Modified

- `supabase/functions/fec-pac-recipients/index.ts` — new edge function to query OpenFEC API
- `src/components/PACDetailDrawer.tsx` — add fetch button, loading state, and auto-populate logic

## Secret Required

- `FEC_API_KEY` — free API key from https://api.open.fec.gov/signup/

