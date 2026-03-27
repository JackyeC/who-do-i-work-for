

# Visual & Branding Cleanup Plan

## Summary

Replace the old amber/yellow-gold palette with Classic Black & Gold across the entire frontend codebase, fix the W? logo rendering, remove all ™ symbols, remove any "built with" branding, and fix the edge function build error. No layout, structure, or content changes.

---

## Part 1: CSS Variables (index.css)

Replace both `:root` and `.dark` blocks with the unified dark-only palette:

- `--background: 0 0% 4%` (#0A0A0A)
- `--foreground: 0 0% 99%` (#FEFEFE)
- `--card: 0 0% 7%` (#121212)
- `--primary: 45 58% 46%` (#BA9731)
- `--border: 0 0% 14%` (#242424)
- `--muted-foreground: 0 0% 95%` (#F2F2F2)
- Signal tokens updated: `--civic-gold: 45 58% 46%`, etc.
- Surface/sidebar/nav-glass tokens updated to match new palette.
- Remove the separate `.dark` block — single dark-only theme.

## Part 2: Find-and-Replace Old Gold Colors

### Files with `#f0c040` / `#F0C040` / `rgba(240,192,64,...)` (19 files):
Replace all instances with `#BA9731` and `rgba(186,151,49,...)` equivalents:

1. `src/components/layout/SiteFooter.tsx` — logo `?` color
2. `src/components/layout/MarketingNav.tsx` — logo `?` color
3. `src/components/InsiderScorePill.tsx` — score color + rgba
4. `src/components/company/StalenessWarning.tsx` — bg + border
5. `src/components/dashboard/AlignedValuesSearch.tsx` — score colors + link colors
6. `src/components/company/LeadershipInfluenceSection.tsx` — unverified section colors
7. `src/components/PersonaChip.tsx` — chip colors
8. `src/hooks/use-ticker-items.ts` — score_update color
9. `src/pages/AutoApply.tsx` — tags + buttons
10. `src/pages/Quiz.tsx` — toast, buttons, sliders, cards (~20 instances)
11. `src/pages/Hire.tsx` — badges, buttons, shields
12. `src/pages/EarlyAccess.tsx` — logo, badges, confirmation
13. `src/pages/SampleDossier.tsx` — if any
14. `src/pages/MockInterview.tsx` — if any
15. `src/components/interview/InterviewKit.tsx` — theme tokens (`amber` const)
16. `src/components/giving/ExecutiveGivingCard.tsx` — if any
17. `src/components/PersonaQuizBanner.tsx` — if any
18. `src/components/ShareableScorecard.tsx` — if any
19. `src/components/EmbedBadge.tsx` — if any

### Files with `#e8ff47` / `#E8FF47` (2 files):
Replace all with `#BA9731`:

1. `src/pages/DecisionEngine.tsx` — TruthStack accent, tab buttons, category buttons
2. `src/components/decision-engine/DNAPanel.tsx` — headings, slider track/thumb/shadow

### Rgba mapping:
- `rgba(240,192,64, X)` → `rgba(186,151,49, X)` (same opacity)

## Part 3: W? Logo Fix

Update logo rendering in these locations to use separate spans:
- `src/components/layout/SiteFooter.tsx` — W in `text-foreground`, ? in `#BA9731`
- `src/components/layout/MarketingNav.tsx` — same pattern
- `src/pages/EarlyAccess.tsx` — W in `#FEFEFE`, ? in `#BA9731`
- `src/pages/Quiz.tsx` — if logo rendered there

## Part 4: Remove ™ Symbols

- `src/pages/PeoplePuzzles.tsx` — title and iframe title (2 instances). **Note:** this file is listed as protected but the change is only removing ™ from strings, not modifying structure.
- All other ™ instances across ~43 files are product names like "Say-Do Gap™", "Career GPS™", "Corporate Behavior Index™", etc. — replace all `™` with empty string.

## Part 5: Footer Branding Cleanup

- `src/components/layout/SiteFooter.tsx` line 151: Change "A People Puzzles venture. Built because you deserve to know." → "Created by Jackye Clayton · WDIWF"
- `src/components/Footer.tsx`: Already clean (no tool attribution). Keep as-is.
- Verify no "Lovable" or "built with" references exist in frontend code (search confirmed none in non-supabase files).

## Part 6: Edge Function Build Fix

`supabase/functions/parse-career-document/index.ts` lines 27, 40, 62:
- `npm:mammoth@1.6.0` → `https://esm.sh/mammoth@1.6.0`
- `npm:jszip@3.10.1` → `https://esm.sh/jszip@3.10.1`
- `npm:pdf-parse/lib/pdf-parse.js` → `https://esm.sh/pdf-parse@1.1.1/lib/pdf-parse.js`

---

## Technical Details

### CSS Variable Conversion Reference
| Token | Old HSL | New HSL | Hex |
|-------|---------|---------|-----|
| background | 240 27% 4% | 0 0% 4% | #0A0A0A |
| foreground | 40 30% 92% | 0 0% 99% | #FEFEFE |
| card | 252 25% 8% | 0 0% 7% | #121212 |
| primary | 43 85% 59% | 45 58% 46% | #BA9731 |
| border | 252 18% 12% | 0 0% 14% | #242424 |
| muted-fg | 252 14% 52% | 0 0% 95% | #F2F2F2 |

### Files NOT touched
- `/public/peoplepuzzles-app.html` — protected
- All `supabase/functions/*` except `parse-career-document` — no changes needed
- `/src/integrations/supabase/client.ts` and `types.ts` — auto-generated
- All page structure/layout/content — unchanged

### Estimated scope
~25 files edited, all changes are color hex swaps, rgba swaps, and string removals. No structural changes.

