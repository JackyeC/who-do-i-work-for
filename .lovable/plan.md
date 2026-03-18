

# Logic Bible V8.0 — Gap Analysis & Implementation Plan

This document defines the scoring engine, personalization layer, and UI integration rules for the platform. After auditing the codebase against it, here's what aligns and what needs work.

---

## What Already Exists & Aligns

The **Signal Scoring Engine** (6 categories) is already implemented in `generate-company-signals/index.ts` with the correct categories: compensation_transparency, hiring_activity, workforce_stability, company_behavior, innovation_activity, public_sentiment. Scoring uses high/medium/low bands. The `StructuredSignalsSection` renders these on company pages with confidence and recency metadata.

The **Work Profile Quiz** (priorities, avoidances, sliders) exists in `WorkProfileQuiz.tsx` and stores to localStorage. `ValuesSignalMatch` and `PersonalizationBanner` use this data.

Ghost job detection exists in `jobQuality.ts` with tier logic.

---

## Gaps to Close (Grouped by Priority)

### 1. Signal UI Statements — Align to Logic Bible Copy

**Current**: Signal summaries are verbose and data-heavy (e.g., "3 open role(s) detected. Hiring pace appears steady.").
**Required**: Short, neutral, human-readable statements per the Bible's tables (e.g., "Hiring activity mixed", "Salary range provided", "Workforce appears stable").

**Changes**:
- Update `generate-company-signals/index.ts` to use the exact UI Output strings from the Bible's tables
- Add a `ui_statement` field alongside the detailed `summary` — the short label for cards, the full summary for detail views
- Ensure numeric scores (0.0–1.0) never appear in UI (they don't currently — this is compliant)

### 2. Job Card — Show 1–3 Personalized Signals

**Current**: `JobListRow.tsx` shows signal indicator badges (Benefits, Hiring Tech, Sentiment, Influence) as detection flags, plus values badges. No per-job canonical signal statements.
**Required**: Show 1–3 of the Bible's human-readable signal statements, prioritized by user's top-weighted dials.

**Changes**:
- Create a utility `getTopSignalsForJob(companySignals, userProfile)` that:
  - Maps the 6 canonical signals to the user's 5 dials
  - Returns the top 1–3 most relevant signal statements sorted by user weight
- Update `JobListRow.tsx` to render these as concise text chips instead of (or alongside) the current detection badges
- Remove numeric scores from card display (civic score circle currently shows a number — needs discussion)

### 3. Job Detail Page — "Before You Sign" + "What This Could Mean" + "Why Ranked"

**Current**: `JobDetailDrawer.tsx` shows match score, civic score, company signals badges, description, and apply buttons. No "Before you sign" section, no personalized interpretation, no ranking explanation.
**Required**: Three new sections per the Bible.

**Changes**:
- Add **"Before you sign…"** section to `JobDetailDrawer.tsx`: surface key signals with explicit missing-data callouts (e.g., "Salary range not listed")
- Add **"What this could mean for you"** section: dual-framing per signal based on user's dials (cautionary + neutral perspective)
- Add **"Why this is ranked for you"** section: 1–2 sentence explanation tied to user's dial settings

### 4. Mixed-Score Personalization Rule

**Current**: Mixed scores (medium/0.4–0.6) are treated neutrally.
**Required**: If user's corresponding dial is >70%, treat Mixed as a Risk Signal with advisory copy: "This signal is mixed, and [priority] matters to you — consider asking directly."

**Changes**:
- Add `interpretMixedSignal(signalCategory, normalizedValue, userProfile)` utility
- Wire into Job Detail "Before you sign" and "What this could mean" sections
- Wire into company page `ValuesSignalMatch`

### 5. Ticker Format Compliance

**Current**: Ticker in `TopBar.tsx` — need to verify content format.
**Required**: Financial-terminal style, factual, time-stamped signals. No generic headlines, no sentiment, no unverified social signals.

**Changes**:
- Ensure ticker items follow format: "Company X: [signal change]"
- Source ticker content from `company_signal_scans` table changes (direction changes, new signals)

### 6. Company Page — All 6 Categories with Trend Indicators

**Current**: `StructuredSignalsSection` shows 4 grouped categories (Hiring Reality, Workforce Stability, Compensation, Leadership & Influence). Missing explicit Innovation & Growth and Employee Experience categories.
**Required**: All 6 signal categories displayed with trend direction (improving/declining/stable).

**Changes**:
- Add Innovation & Growth and Employee Experience sections to `StructuredSignalsSection`
- Add trend direction indicators (↑ ↓ →) next to each signal using the `direction` field already stored in the database

### 7. Stale Data UX (>30 days)

**Current**: Recency dots shown but no explicit stale-data warning.
**Required**: Explicit treatment when company dossier is older than 30 days.

**Changes**:
- Add a stale-data banner/badge in `StructuredSignalsSection` when `scan_timestamp` is >30 days old
- Copy: "This intelligence was last updated [X] days ago. Some signals may have changed."

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/signalPersonalization.ts` | Create | `getTopSignalsForJob()`, `interpretMixedSignal()`, dial-to-category mapping |
| `supabase/functions/generate-company-signals/index.ts` | Edit | Add `ui_statement` short labels per Bible tables |
| `src/components/jobs/JobListRow.tsx` | Edit | Render 1–3 personalized signal statements |
| `src/components/jobs/JobDetailDrawer.tsx` | Edit | Add "Before you sign", "What this could mean", "Why ranked" sections |
| `src/components/company/StructuredSignalsSection.tsx` | Edit | Add missing categories, trend indicators, stale-data warning |
| `src/components/layout/TopBar.tsx` | Edit | Validate ticker format compliance |

---

## Implementation Order

1. **Signal personalization utility** (`signalPersonalization.ts`) — foundation for everything else
2. **Edge function update** — add `ui_statement` short labels
3. **StructuredSignalsSection** — all 6 categories + trends + stale warning
4. **JobListRow** — personalized signal chips
5. **JobDetailDrawer** — three new sections
6. **Ticker audit** — format compliance

