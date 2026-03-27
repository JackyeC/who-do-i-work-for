

# Visual & Branding Cleanup — Classic Black & Gold

## What changes

Three categories of work, all visual/branding only. No layout, structure, or content changes.

### 1. CSS Variables & Color Palette

Replace the entire `:root` and `.dark` block in `src/index.css` with a single unified dark palette. Remove the separate `.dark` block entirely since the site is dark-only.

**New values:**
- `--background: 0 0% 4%` → #0A0A0A
- `--foreground: 0 0% 99%` → #FEFEFE
- `--card: 0 0% 7%` → #121212
- `--primary: 45 58% 46%` → #BA9731
- `--border: 0 0% 14%` → #242424
- `--muted-foreground: 240 2% 61%` → #9898A0 (captions — NOT #F2F2F2, which would make muted text identical to body text)
- All signal/surface/sidebar/nav-glass tokens updated to match

### 2. Find-and-Replace Hardcoded Colors (21 files)

Replace every `#f0c040` / `#F0C040` → `#BA9731` and every `rgba(240,192,64,X)` → `rgba(186,151,49,X)` in:

- `src/components/layout/SiteFooter.tsx` — logo ? color
- `src/components/layout/MarketingNav.tsx` — logo ? color  
- `src/components/InsiderScorePill.tsx`
- `src/components/company/StalenessWarning.tsx`
- `src/components/dashboard/AlignedValuesSearch.tsx`
- `src/components/company/LeadershipInfluenceSection.tsx`
- `src/components/PersonaChip.tsx`
- `src/components/PersonaQuizBanner.tsx`
- `src/hooks/use-ticker-items.ts`
- `src/pages/AutoApply.tsx`
- `src/pages/Quiz.tsx`
- `src/pages/Hire.tsx`
- `src/pages/EarlyAccess.tsx`
- `src/pages/SampleDossier.tsx`
- `src/pages/AdminTicker.tsx`
- `src/lib/freshness-utils.ts`
- `src/components/interview/InterviewKit.tsx`
- `src/pages/DecisionEngine.tsx` — also `#e8ff47` → `#BA9731`
- `src/components/decision-engine/DNAPanel.tsx` — also `#e8ff47` → `#BA9731`
- `src/components/ShareableScorecard.tsx`
- `src/components/EmbedBadge.tsx`

### 3. Footer Readability Fix

`SiteFooter.tsx`: Change `text-muted-foreground/50` and `text-muted-foreground` classes on footer text to explicit colors for readability:
- Footer links: `text-[#F2F2F2] hover:text-[#FEFEFE]`
- Section headers: `text-[#9898A0]`
- Copyright line: `text-[#9898A0]`
- Brand description: `text-[#F2F2F2]`
- Copyright text: "Created by Jackye Clayton · WDIWF"

### 4. ™ Symbol Removal (42 files)

Global find-and-replace of `™` → empty string across all `.tsx` and `.ts` files (excluding `src/utils/signalTextSanitizer.ts` which handles encoding cleanup of `â€™` patterns — that's different).

### 5. "Built with" Branding

The `lovable` references in `supabase/functions/` are API gateway URLs and env vars — these are infrastructure, not branding, and must NOT be removed. The only user-facing branding references are:
- `src/components/bracket/ShareVoteCard.tsx` line 19: share URL uses `lovable.app` domain — this is the actual deployed URL, not branding attribution
- `src/pages/RequestCorrection.tsx` line 162: placeholder URL — update to generic placeholder

No "Built with Lovable" badges exist in the frontend code.

### 6. Edge Function Build Fix

`supabase/functions/parse-career-document/index.ts` lines 27, 40, 62:
- `npm:mammoth@1.6.0` → `https://esm.sh/mammoth@1.6.0`
- `npm:jszip@3.10.1` → `https://esm.sh/jszip@3.10.1`
- `npm:pdf-parse/lib/pdf-parse.js` → `https://esm.sh/pdf-parse@1.1.1/lib/pdf-parse.js`

---

### Files NOT touched
- `/public/peoplepuzzles-app.html`
- All page layouts, sections, content, routing
- Supabase edge function logic (only import paths in parse-career-document)
- `src/integrations/supabase/client.ts` and `types.ts`

### Estimated scope
~25 frontend files edited (color swaps + ™ removal), 1 edge function (import fix), 1 CSS file (variables). All changes are mechanical replacements.

