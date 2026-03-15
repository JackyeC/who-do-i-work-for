

## Problem

When an offer is being analyzed, the Offer Strength Score component immediately shows a verdict like "Proceed with Caution" using fallback data, even while AI research is still running. This is misleading — users see a cautionary judgment before the system has finished gathering information.

## Solution

Add a proper loading/analyzing state to the `OfferStrengthScore` component that replaces the premature verdict with a clear "Gathering Intelligence" message. The score ring, label, and recommendation badge should all reflect that analysis is in progress.

## Changes

### 1. `src/components/strategic-offer/OfferStrengthScore.tsx`

When `loading` is true:
- Replace the score number in the ring with an animated spinner icon instead of "—"
- Replace the label (e.g., "Proceed Carefully") with **"Analyzing Your Offer..."**
- Replace the recommendation badge with **"Gathering Intelligence — Please Wait"**
- Hide the `whyThisScore` paragraph
- Hide the category breakdown cards (or show them in a skeleton/dimmed state)
- Keep the ring animation at 0% (full offset)

### 2. `src/components/OfferCheckSnapshot.tsx` (if rendered during loading)

- If the snapshot verdict derives from incomplete data, show a "Building Your Report" state instead of "Proceed with Caution"

This ensures users never see a negative judgment before the platform has finished its work.

