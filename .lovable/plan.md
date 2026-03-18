

# Font Audit Results

## Font Family — Almost Clean

The project correctly uses three fonts everywhere via CSS and Tailwind:
- **IBM Plex Sans** — body text
- **Syne** — headings and display
- **JetBrains Mono** — data, labels, mono elements

**One exception found:** `src/components/ShareableScorecard.tsx` uses `fontFamily: "'Inter', 'Helvetica Neue', sans-serif"` inline. This is for a generated share image, so it may be intentional (Inter isn't loaded by the app, so it would fall back to Helvetica Neue or system sans-serif). Should be switched to IBM Plex Sans for brand consistency.

## Text Size — Widespread Violations

The design system sets a **12px minimum** for metadata/labels and **14px minimum** for decision-critical content. However, **313 files** use `text-[10px]`, `text-[9px]`, `text-[8px]`, or `text-[7px]` — well below the floor.

These are used extensively for:
- Source attribution lines
- Badge text
- Chart tick labels
- Metadata timestamps
- Confidence labels

**Recommendation:** This is too large a sweep to do in one pass. I'd suggest a phased approach:

### Phase 1 — Fix the font-family issue
- Update `ShareableScorecard.tsx` to use `'IBM Plex Sans'` instead of `Inter`

### Phase 2 — Enforce text size floor (separate task)
- Replace all `text-[10px]` and below with `text-xs` (12px minimum)
- This affects 313 files and should be done in batches by component group (dossier, strategic-offer, policy-intelligence, etc.)

## Summary
The typefaces are correct across the app. The one off-brand font is in a share card. The bigger issue is undersized text throughout — but that's a bulk cleanup, not a font mismatch.

