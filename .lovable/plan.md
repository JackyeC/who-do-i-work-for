

## Monthly/Annual Billing Toggle for Pathfinder Tracks

### What changes

**Single file:** `src/components/landing/PathfinderTracks.tsx`

### Implementation

1. **Add `isAnnual` state** (default `false` for Monthly)

2. **Add annual pricing data to tracks:**
   - Track 2 (Scout): `annualPrice: "$15"`, `annualPeriod: "/mo"`, `annualPriceNote: "billed annually"`, `annualPriceId: "price_..."` (use same priceId for now, or a placeholder — user will need to create the annual Stripe price)
   - Track 5 (Executive): `annualPrice: "$799"`, `annualPeriod: "/year"`, `annualPriceId: "price_..."`
   - Tracks 1, 3, 4 (free/one-time): no annual variant — render unchanged

3. **Billing toggle UI** — placed between the header text and the grid:
   - Two labels: "Monthly" and "Annual"
   - A pill/switch toggle between them
   - "Save 20%" badge next to "Annual" in gold (`#EBAD0C` / `text-primary`)
   - Style: `font-mono text-xs tracking-wider uppercase`, gold highlight on active state, muted on inactive

4. **Price display logic** — in each track card's price section:
   - If `isAnnual` and track has `annualPrice`: show annual price with a strikethrough on the original monthly price
   - If not annual or track has no annual variant: show original price unchanged

5. **Checkout logic** — `handleTrackAction` updated to pass `annualPriceId` when `isAnnual` is active (for subscription tracks only)

### Visual structure of toggle

```text
        [ Monthly ]  ●────○  [ Annual  Save 20% ]
```

Centered below the subtitle, using the gold/dark theme. Active side gets `bg-primary text-primary-foreground` pill styling, inactive gets `text-muted-foreground`.

### Technical notes

- No new files, no database changes, no new dependencies
- Annual Stripe price IDs will need to be created in Stripe and updated in the code — I'll add placeholder IDs with a comment
- One-time payment tracks (Strategist, Partner) are unaffected by the toggle

