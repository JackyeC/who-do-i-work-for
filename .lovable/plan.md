

## Implementation Plan: Decision Support System Upgrades

### Current State Assessment

**Already implemented and working:**
- Company Profile 5-section layout (InsiderBrief, StructuredSignals, HowToReadThis, UpgradeMoment, Footer)
- Signal integrity (confidence + recency on all signals)
- Trust guardrails and credibility-first copy
- Values profile system (30 lens sliders + workplace preferences)
- Landing page ValuesQuiz (pick values → teaser)
- Reality Check / Vibe Match (post-interview tool)
- Say-Do Gap analysis via `company_public_stances` table
- Monetization gating (ReportTeaserGate, UpgradeMoment)
- ATS detection + mismatch signals in edge functions
- Empty state interpretation (EmptyStateExplainer)

**What's missing (3 deliverables):**

1. **Work Profile Quiz** — A 3-step onboarding quiz (Priorities, Sliders, Avoidances) stored in localStorage, distinct from the deep values profile
2. **Values-Signal Matching on Company Profile** — Dynamic "Aligned / Mismatched" section using stored work profile to personalize the Insider Brief
3. **Reality Gap Block on Company Profile** — Inline "What they say vs what signals show" using `company_public_stances` gap data

---

### 1. Create Work Profile Quiz Component

**New file**: `src/components/WorkProfileQuiz.tsx`

3-step flow within a single card:

**Step 1 — Priorities** (select max 3 chips):
- Higher pay, Flexibility, Stability, Clear growth and advancement paths, Clear and consistent leadership, Respectful team environment, Work that aligns with your priorities, Clearly defined role and expectations, Transparent communication

**Step 2 — Sliders** (6 bipolar sliders, default center):
- Flexible ↔ Structured
- Remote ↔ In-person
- Steady ↔ Fast-moving
- Stable ↔ Dynamic
- Hands-off ↔ Hands-on
- Open ↔ Need-to-know

**Step 3 — Avoidances** (select max 2 chips):
- Frequent layoffs or instability, Unsustainable workload or burnout, Inconsistent or unclear management, Below-market compensation, Limited growth opportunities, High turnover or negative culture signals, Unclear role or shifting expectations

On completion: saves to `localStorage` key `userWorkProfile` as `{ priorities, avoids, sliders }`. Also saves to `job_match_preferences` table if user is authenticated.

**Output view** (post-completion, collapsible):
- "You prioritize: [chips]"
- "What to look for: [signal-aware sentences]"
- "Watch for: [avoidance-aware sentences]"

No emoji. Signal-aware language (e.g., "Look for companies with low layoff signals and stable hiring patterns" not "Find a stable job").

**Integration**: Add to Career page and as a nudge banner on company profiles when no work profile exists.

---

### 2. Create Values-Signal Match Section for Company Profile

**New file**: `src/components/company/ValuesSignalMatch.tsx`

Reads `localStorage.getItem("userWorkProfile")`. If present, renders a personalized section between InsiderBrief and StructuredSignals.

**Mapping logic** (priority → signal check):
| Priority | Signal Source |
|---|---|
| Flexibility | `hasRtoSignals`, remote job ratio |
| Stability | `hasWarnNotices`, `hasLayoffSignals` |
| Growth | internal mobility signals, hiring patterns |
| Leadership | sentiment data, exec turnover |
| Transparency | pay equity disclosure, benefits data |
| Compensation | compensation data availability |

**Avoidance mapping**:
| Avoidance | Signal Source |
|---|---|
| Frequent layoffs | WARN notices, layoff signals |
| Burnout | sentiment themes |
| Below-market comp | compensation data gaps |
| High turnover | sentiment + hiring volume |

**Output**: Two blocks:
- "Aligned with your priorities" — green-tinted items where signals match
- "Potential mismatches" — amber-tinted items where signals conflict or data is absent
- Optional alignment score (0-100) shown as a small badge

Each item: one sentence + confidence + recency. No raw data.

If no work profile stored: show a compact nudge — "Set your work preferences to see how this company aligns" with link to quiz.

**Edit**: `src/pages/CompanyProfile.tsx` — add `<ValuesSignalMatch>` between InsiderBrief and StructuredSignals, passing company signal booleans.

---

### 3. Create Reality Gap Block for Company Profile

**New file**: `src/components/company/RealityGapBlock.tsx`

Fetches `company_public_stances` where `gap` is `medium` or `large`. If none exist, the section is hidden entirely.

**Display**: A compact card titled "What they say vs. what signals show"

For each stance with a gap (max 3 shown free):
- Left column: "Says: [public_position]" on [topic]
- Right column: "Records show: [spending_reality]"
- Gap severity badge (Medium / Large)
- Confidence: Medium (always — these are inferred from spending patterns)
- Recency from company `updated_at`

Additional stances gated behind `ReportTeaserGate`.

**Edit**: `src/pages/CompanyProfile.tsx` — add `<RealityGapBlock>` after StructuredSignals, before HowToReadThis.

---

### Files Summary

| File | Action |
|------|--------|
| `src/components/WorkProfileQuiz.tsx` | **Create** — 3-step priorities/sliders/avoidances quiz |
| `src/components/company/ValuesSignalMatch.tsx` | **Create** — personalized alignment section |
| `src/components/company/RealityGapBlock.tsx` | **Create** — say vs. do gap display |
| `src/pages/CompanyProfile.tsx` | **Edit** — add ValuesSignalMatch + RealityGapBlock |

No database changes. No edge function changes. Three new components, one page edit.

