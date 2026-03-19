

# Show Offer Check Wizard in Dashboard "Offers" Tab

## Problem
Clicking "Offers" in the sidebar shows a bare placeholder with a link to another page. Users expect to start an offer check right there.

## Fix

**File: `src/pages/Dashboard.tsx`**

Replace the static placeholder in the `case "offers"` block with the `OfferClarityWizard` component directly, plus a link to view past reports below it.

- Import `OfferClarityWizard` from `@/components/offer-clarity/OfferClarityWizard`
- Render it inline wrapped in the `PremiumGate` (same pattern as the standalone page)
- Add a small "View past reports →" link below pointing to `/my-offer-checks`

Import `PremiumGate` as well to maintain the existing access control.

