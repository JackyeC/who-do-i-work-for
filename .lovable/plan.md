

## Plan: Build the Universal Onboarding Quiz at `/quiz`

### Summary
Create a standalone 7-question quiz at `/quiz` — full-viewport screens, slide transitions, amber progress bar, scoring across 9 persona buckets + 3 meta-flags, results screen with persona profile and signal chips. No homepage changes. Results stored in localStorage.

### Files to Create

**1. `src/pages/Quiz.tsx`** — The full quiz page component containing:
- Grain texture SVG overlay (fixed, pointer-events none)
- 3px amber progress bar fixed to top (fills 0→100% across 7 questions)
- Slide-based question navigation (CSS transform translateX, 0.5s cubic-bezier(0.16,1,0.3,1))
- All 7 question screens rendered in a horizontal track, only one visible at a time
- Back button (ghost style) visible from Q2 onward
- Next button (amber pill, disabled until selection made; always enabled on Q5 slider)
- Answer tiles (2x2 grid, rounded-14px, hover/selected states per spec)
- Q5 slider with custom amber thumb and live italic label
- Scoring engine: maintains 9-key persona scores + 3 meta-flags, applies exact scoring rules per question
- Results screen with persona name, subtitle, 3 signal chips (+ conditional 4th nepotism chip), CTA buttons, reset
- localStorage persistence: `wdiwf_persona`, `wdiwf_nepotism_flag`, `wdiwf_trust`
- All colors, fonts, spacing per the design spec (Playfair Display for questions, DM Sans for UI)

**2. `src/App.tsx`** — Two small additions:
- Add lazy import: `const Quiz = lazy(() => import("./pages/Quiz"));`
- Add route: `<Route path="/quiz" element={<Quiz />} />`

### Technical Details

**Slide mechanism**: A container div with `display: flex` holding 8 panels (7 questions + results). Container uses `transform: translateX(-${currentStep * 100}vw)` with the specified cubic-bezier transition. Each panel is `min-h-screen w-screen` with flex centering.

**Fonts**: Playfair Display added via Google Fonts link in `index.html` (or imported in the component). DM Sans is already available in the project.

**Scoring**: All logic self-contained in the Quiz component. Score object initialized to 0 for all 9 keys. Each answer selection updates scores per the exact mapping provided. On completion, sort keys by score, pick top 2 (tie-break: favor higher nepotism_concern persona).

**Persona data**: Static map of 9 persona objects (id → name, subtitle, 3 signals) defined in the same file.

**No protected files touched**: This only creates a new page and adds a route. No data pipeline, scoring logic, methodology, or intelligence report code is modified.

