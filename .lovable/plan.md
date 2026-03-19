

# Make Donations & Political Spending Actionable on /check

## Problem

1. **Donations show no recipient detail** — the Political Spending Disclosure section only shows `target_entity_name` and amount from `entity_linkages`. No party, state, or context about who received the money.
2. **Nothing is clickable/expandable** — individual donation rows are static cards with no drill-down. For an intelligence system, users need to click a donation and see the full picture.
3. **The `company_candidates` table is never queried** — this table has rich recipient data (name, party, state, district, amount, donation_type, flagged, flag_reason) but it's completely unused on the /check page.

## Changes

### 1. Fetch `company_candidates` data on the /check page

Add `company_candidates` to the `policyData` query in `src/pages/Check.tsx` so recipient-level donation data is available. Pass it down to `PolicyReceiptsPanel`.

### 2. Redesign Political Spending Disclosure in `PolicyReceiptsPanel.tsx`

Replace the current flat donation list with an expandable, intelligence-grade view:

- **Summary bar**: Total amount, number of recipients, party breakdown (R/D/Other as colored segments)
- **Each recipient row** (from `company_candidates`): Name, party badge (R=red, D=blue, Other=gray), state, amount, donation type
- **Click to expand**: Shows district, flag_reason if flagged, link to FEC source
- **Flagged donations** get a warning indicator
- Fall back to `entity_linkages` donation data if `company_candidates` is empty

### 3. Make the entire Receipts Panel expandable per-item

Each section (Lobbying, Trade Associations, etc.) already uses `Collapsible` — but individual items within are not expandable. Add per-item expand for donations specifically, since that's where the intelligence lives.

## Files Modified

- `src/pages/Check.tsx` — add `company_candidates` query, pass to `PolicyReceiptsPanel`
- `src/components/policy-intelligence/PolicyReceiptsPanel.tsx` — redesign Political Spending section with recipient detail, party breakdown, expandable rows

