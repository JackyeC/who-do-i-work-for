

# Two Features: Leadership Tensions + "Add a Company" Flow

## Feature 1: Leadership Tensions in Brand Madness

Add a "Leadership Tensions" layer to every Brand Madness matchup — one tension per matchup that reflects how each company operates under pressure.

### Data Changes

**Modify `src/data/bracketData2026.ts`**
- Extend `BracketMatchup` interface with `tension?: { left: string; right: string; label: string }` and `postVoteInsight?: string`
- Add tension + insight to all 32 matchups across 4 regions using the 16 provided examples as a starting set, plus assign tensions to the remaining 16

### UI Changes

**Modify `src/components/bracket/BracketMatchupCard.tsx`**
- Below the seed header, add a "Tension in Play" row: monospace chip showing `[Left] ↔ [Right]`
- After a user votes, expand a post-vote section below the VS battle:
  - Show the user's pick + the tension label
  - 1-2 sentence insight (from `postVoteInsight`)
  - "How they tend to operate" mini-section: leaning direction + tradeoff + suggested question
  - Subtle CTA: "See full company intelligence →" linking to `/company/{slug}`
- Keep it tight — no moral labels, no overloading

**Modify `src/components/bracket/ShareVoteCard.tsx`**
- Include tension in share text: "Tension: Compassion ↔ Ruthlessness"

### No database changes needed — tensions are static content embedded in the bracket data file.

---

## Feature 2: "Add a Company" on Check Page

Turn missing company results into a power feature instead of a dead end.

### UI Changes

**Modify `src/pages/Check.tsx`**
- When search returns 0 results and `searchTerm.length >= 2`:
  - Replace empty dropdown with an "Add a Company" card inside the dropdown area
  - Shows: "Can't find **{searchTerm}**? We'll research it for you."
  - Primary button: `[ + Add {searchTerm} ]`
  - Microcopy: "If we don't have it, we'll build it."
- On click: call existing `company-discover` edge function (already built) with the search term
- Show loading state: "Live Scan in Progress..." with spinner
- On success: auto-select the newly created company and load its policy data inline
- On failure: "Still gathering signals — try again shortly."

**Also update the empty state** (line 256-261)
- Replace the static "Select your priorities" message with a more action-oriented prompt that includes the "add a company" affordance when no company is selected

### No new files needed — this reuses the existing `company-discover` edge function and modifies only `Check.tsx`.

---

## Files Summary

| Action | File |
|--------|------|
| Modify | `src/data/bracketData2026.ts` — add tension + insight to interface and all 32 matchups |
| Modify | `src/components/bracket/BracketMatchupCard.tsx` — tension display + post-vote experience |
| Modify | `src/components/bracket/ShareVoteCard.tsx` — include tension in share text |
| Modify | `src/pages/Check.tsx` — "Add a Company" flow when search returns no results |

