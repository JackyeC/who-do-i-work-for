

## Build Completion Plan — "Who Do I Work For?"

This plan covers the 5 areas from your request. After auditing the codebase, here's what's already done and what needs building:

---

### 1. Values Grid → Job Board Filtering ✅ ALREADY BUILT

The job board (`src/pages/Jobs.tsx`) already has:
- `valuesFilters` state wired to `ValuesPreferenceSidebar`
- Queries `company_values_signals` table filtered by selected values
- Filters jobs to only show companies matching ALL selected values
- Scores jobs with a values-match bonus (up to +30 points)

**What's missing**: The "Unknown/Pending Audit" tag for uncertified employers. Currently the job board doesn't distinguish certified vs uncertified companies on value tags.

**Work needed**:
- In `JobListRow` and `JobDetailDrawer`, check the company's `vetted_status` field
- If not `"certified"`, render matched value tags as "Unknown — Pending Audit" with a muted style and a tooltip nudging toward the $599 Founding Partner tier
- If `"certified"`, show green "Verified" badges on matched value tags

---

### 2. Compensation & Levels.fyi Embed — NEEDS FIXES

**Current state**: `LevelsFyiEmbed.tsx` exists with correct iframe URL format (`charts_embed.html?company=X&track=Software%20Engineer`). The "Jackye's Context" intelligence note is already pinned below the chart.

**Issues to fix**:
- The iframe `onError` handler doesn't reliably catch load failures (iframes don't fire `onerror` for HTTP errors). Add a fallback detection: if the iframe loads but shows nothing, use a timeout-based check or show a "loading" state with a direct link fallback.
- Add tier gating: Free users see the salary chart; Pro+ users unlock the title comparison/leveling view. Use `usePremium()` hook to gate this.

**Work needed**:
- Update `LevelsFyiEmbed` to accept a `tier` prop or use `usePremium()` internally
- Show a paywall overlay on the "Title Comparison" section for free users
- Improve iframe error handling with a load timeout fallback

---

### 3. "Inside the Room" Branding ✅ ALREADY BUILT

The hero and about sections in `src/pages/Index.tsx` already contain:
- **Hero bio**: "I've been blessed to be in the rooms where it happens — now I'm taking everything I've learned and putting it into your hands." (line 84)
- **Signature**: "Unapologetically Transparent. — Jackye Clayton" (line 297)
- **About blockquote**: "I've seen firsthand how corporate decisions are made..." (line 290)

**No changes needed.** This is already live.

---

### 4. Watchdog & Extremist Tracking — PARTIALLY BUILT

**What exists**:
- `ExplainableMetric.tsx` defines "Flagged Organization" and "Political Risk Score" with SPLC/ADL sourcing
- `EthicsRiskCard.tsx` shows risk levels (moderate/elevated/high)
- `flagged_associations` table exists in the DB with `severity`, `relationship_type`, `detected_by` fields
- The receipts timeline already renders flagged association events

**What's missing**: A dedicated "⚠️ High-Risk Connection" alert card in the Power & Influence pillar with a direct "View Source" link.

**Work needed**:
- Create `HighRiskConnectionCard.tsx` component that:
  - Queries `flagged_associations` for the current company
  - Filters for `severity = 'critical'` or `relationship_type` in known extremist categories
  - Renders a prominent warning card with: org name, relationship type, source link (View Source button), and a Jackye Insight
  - Shows "No Extremist Associations Found in Public Record" when clean
- Mount this card in the Power & Influence pillar section of the company profile

---

### 5. Employer Onboarding (The Audit) ✅ ALREADY BUILT

The `EmployerVerificationPending.tsx` page already has the full 4-step audit:
1. Verify Identity (corporate email check)
2. Submit Disclosure Docs (file upload to `career_docs` bucket)
3. Review Connection Chain (links to `/follow-the-money`)
4. Schedule Jackye Audit (Calendly link)

Plus: Job Credit Status badge, 24-hour timeline notice, Non-Interference Agreement, $599/yr reference.

**What's missing**: Admin-side approval keeping Gold Shield pending.

**Work needed**:
- The admin `CertificationQueue.tsx` component already exists and sets `vetted_status` to `"certified"` only after manual checklist completion
- Ensure the employer onboarding page reads the company's `vetted_status` and shows "Gold Shield: Pending Admin Approval" until Jackye approves
- After payment + checkout redirect, route employer to `/employer/verification-pending`

---

### Summary of Actual Work

| Area | Status | Files to Change |
|---|---|---|
| Values → Job Filter | Add "Unknown/Pending Audit" tags | `JobListRow.tsx`, `JobDetailDrawer.tsx` |
| Levels.fyi Embed | Fix iframe error handling, add tier gate | `LevelsFyiEmbed.tsx` |
| Branding | Already complete | None |
| Extremist Watchdog Card | Build new card | New `HighRiskConnectionCard.tsx`, mount in company profile |
| Employer Onboarding | Add pending shield status from admin | `EmployerVerificationPending.tsx` |

### Pricing Note
The pricing page (`Pricing.tsx`) still shows the old tier names and prices (Candidate $29/mo, Professional $99/mo). The user previously requested new pricing (Free, Pro $15/mo, Professional $49/mo) — that update is a separate task and is **not** included in this plan unless you want it bundled.

