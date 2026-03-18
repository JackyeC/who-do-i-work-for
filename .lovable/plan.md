

# TruthStack Decision Engine — Interactive Demo Page

## What the Upload Is
A self-contained HTML demo showcasing the full "Truth-over-Vibes" Decision Support Engine in a dark, cyberpunk "Bloomberg terminal" aesthetic. It includes:
- **Values DNA Calibration Panel** — 5 sliders (Work Style, Ownership, Pace, Culture, Priority)
- **Job Category Filter** — All / Tech / Operations / Sales / HR
- **Job Cards** with Clarity Score bars, department-aware signal chips, Ghost Posting ribbons, Values Clash alerts, Pro blur gating, and "Audit Now" deep-dive triggers
- **Free/Pro tier toggle** to demo monetization gating

## What Already Exists in the Codebase
All the *logic* is already built:
- `signalPersonalization.ts` — scoring, department priority, clash detection, dual-framing
- `WorkProfileQuiz.tsx` — 6 sliders + priorities + avoidances
- `PremiumGate.tsx` — blur variant with CTA
- `JobListRow.tsx` / `JobDetailDrawer.tsx` — signal rendering, ghost detection
- `company_signal_scans` table — real data backend

## What We'll Build
A new **standalone page** at `/decision-engine` that replicates the uploaded HTML's design and interactivity, wired into your existing real data and logic. This becomes a showcase/demo of the platform's intelligence capabilities.

### New Files

**1. `src/pages/DecisionEngine.tsx`** — The main page
- Dark theme wrapper matching the uploaded CSS variables (`--bg: #0a0a0f`, `--accent: #e8ff47`, etc.)
- Three sections: DNA Panel, Category Filter, Job Cards Grid
- DNA Panel uses 5 inline sliders (simplified from the WorkProfileQuiz's 6 — maps to the same categories)
- Category filter row: All, Tech, Operations, Sales, HR
- Queries `company_signal_scans` joined with `companies` and `company_jobs` for real data
- Falls back to demo data (matching the uploaded HTML's 6 jobs) when no real data exists
- Each job card renders: company emoji/logo, role, comp, Clarity Score bar, 2 department-aware signal chips, optional ghost ribbon, optional clash alert, pro blur section, and audit button

**2. `src/components/decision-engine/DecisionJobCard.tsx`** — Individual card component
- Clarity Score computed as average of 6 signal scores, rendered as a thin progress bar with green/amber/red fill
- Signal chips styled with the uploaded HTML's color scheme (green `#47ffb3`, amber `#ffb347`, red `#ff4d6d`)
- Ghost ribbon: red corner badge `👻 GHOST_POSTING_RISK`
- Clash detection: uses existing `generateClashAlerts()` with the inline slider values mapped to a WorkProfile
- Pro blur section: blurred text with overlay CTA (reuses PremiumGate blur variant logic inline for the custom dark theme)
- "AUDIT NOW" button: Pro-only, shows spinner → "AUDIT COMPLETE" with mock ATS match and Reddit sentiment results (uses existing edge function pattern when real deep-dive is available)

**3. `src/components/decision-engine/DNAPanel.tsx`** — Values DNA calibration
- 5 sliders in a responsive grid, styled with the dark theme
- Slider labels: left/right anchors (Flexible↔Structured, etc.)
- Values update a local state that feeds into clash detection and signal ranking
- Maps slider values to the existing `WorkProfile` format for compatibility with `signalPersonalization.ts`

### Modified Files

**4. `src/App.tsx`** (or router config)
- Add route: `/decision-engine` → `DecisionEngine`

### Design System
- Uses Tailwind utility classes to replicate the uploaded CSS:
  - Background: `bg-[#0a0a0f]`
  - Cards: `bg-[#16161f] border-[#2a2a3a]`
  - Accent: `text-[#e8ff47]`
  - Fonts: Space Mono (monospace elements), Syne (headers), DM Sans (body) — loaded via Google Fonts link in index.html
  - Signal chip colors match existing `--civic-green`, `--civic-yellow`, destructive vars
- Noise overlay via CSS `::before` pseudo-element on the page wrapper

### Data Flow
1. On mount, query `company_jobs` + `companies` + `company_signal_scans` for active jobs
2. If data exists, render real jobs with real signals
3. If no data, render the 6 demo jobs from the uploaded HTML as static fallback
4. DNA slider changes trigger re-ranking and clash re-evaluation (client-side, no API call)
5. Category filter is client-side filtering
6. "Audit Now" calls existing deep-dive edge function (or shows mock results for demo)
7. Free/Pro toggle uses existing `usePremium()` hook — no mock toggle needed since the real tier system is live

### AI Integration
The "Audit Now" deep-dive can optionally call the Lovable AI gateway (Gemini) to generate a real-time ATS check summary and sentiment analysis, reusing the pattern from `negotiation-coach` edge function. This is a future enhancement — initial build uses the existing signal data.

