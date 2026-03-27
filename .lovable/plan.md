

## Product Defensibility — Evidence Taxonomy, Confidence Scoring, and Signal Trust Architecture

### Priority 0: Fix Build (blocking everything)

**File: `supabase/functions/parse-career-document/index.ts`**

Replace 3 `npm:` dynamic imports with `https://esm.sh/` equivalents:
- Line 27: `npm:mammoth@1.6.0` → `https://esm.sh/mammoth@1.6.0`
- Line 40: `npm:jszip@3.10.1` → `https://esm.sh/jszip@3.10.1`
- Line 62: `npm:pdf-parse/lib/pdf-parse.js` → `https://esm.sh/pdf-parse@1.1.1`

---

### 1. Evidence Taxonomy Utility

**New file: `src/lib/evidence-taxonomy.ts`**

Implements the 5-tier source classification system from your existing architecture:

```text
Tier 1 — Government Record    (weight 1.0)  → FEC, SEC, OSHA, BLS, Congress.gov
Tier 2 — Company Disclosure   (weight 0.8)  → Annual reports, 10-K, proxy statements
Tier 3 — Major Reporting      (weight 0.6)  → Reuters, AP, WSJ investigations
Tier 4 — Commercial Enrichment(weight 0.4)  → Glassdoor, LinkedIn aggregation
Tier 5 — Unverified/Forums    (weight 0.1)  → Reddit, Blind, anonymous tips
```

Exports:
- `classifySource(sourceType)` → returns tier, weight, label, and description
- `EVIDENCE_TIERS` constant with all tier metadata
- `getSourceTierFromSignal(signal)` → infers tier from `source_type`, `detection_method`, or `confidence_level` fields already in `company_signal_scans`

---

### 2. Reusable SignalAttribution Component

**New file: `src/components/signals/SignalAttribution.tsx`**

A compact, reusable footer that attaches to any signal card. Displays:

| Element | Source |
|---|---|
| **Evidence type badge** | `"Fact"`, `"Signal"`, `"Risk"`, `"Interpretation"` — derived from source tier + confidence |
| **Source tier indicator** | Colored dot + label from evidence taxonomy |
| **Confidence level** | High / Medium / Low badge using existing `ConfidenceBadge` |
| **Freshness** | Uses existing `SignalFreshness` component with `scan_timestamp` or `last_verified_at` |
| **Source reference** | Link to `source_url` when available |
| **Hedged language** | Prefixes like "Records show" vs "Pattern suggests" based on tier |

Props: `{ sourceType, confidence, lastUpdated, sourceUrl, signalCategory, compact? }`

---

### 3. Signal Type Labels — Fact vs Signal vs Risk vs Interpretation

**New file: `src/components/signals/SignalTypeLabel.tsx`**

Four distinct label types with clear visual hierarchy:

```text
┌─────────────────┬────────────────────────────────────┬─────────┐
│ Type            │ When used                          │ Color   │
├─────────────────┼────────────────────────────────────┼─────────┤
│ Verified Fact   │ Tier 1-2 source, high confidence   │ Green   │
│ Detected Signal │ Tier 3-4, medium+ confidence       │ Blue    │
│ Identified Risk │ Negative direction or threshold     │ Yellow  │
│ Interpretation  │ AI-inferred, low confidence, T5    │ Gray    │
└─────────────────┴────────────────────────────────────┴─────────┘
```

Automatic classification: `deriveSignalType(tier, confidence, direction)` returns one of the four types. No manual tagging needed — the system classifies based on existing data fields.

---

### 4. Confidence Scoring with Weighted Formula

**New file: `src/hooks/useSignalConfidence.ts`**

Implements the documented weighted formula:
- 0.35 × source quality (tier weight)
- 0.25 × entity match (exact vs fuzzy)
- 0.20 × recency (1.0 for <30d, 0.7 for <6mo, 0.4 for 1yr+)
- 0.10 × coverage (signals-per-category count)
- 0.10 × verification count

Returns: `{ score: 0-1, level: "high"|"medium"|"low", breakdown }`. Works with data already in `company_signal_scans` — no schema changes needed.

---

### 5. Enhanced Source Freshness

**Update: `src/components/SignalFreshness.tsx`**

Enhancements:
- Add "stale data" warning banner when signal is >30 days old (per platform rules)
- Add decay indicator showing weighted recency score
- Show `REFRESH_CADENCES` contextually (e.g., "PAC data updates monthly" next to freshness dot)
- Add tooltip showing exact date and days since last update

---

### 6. Signal History / Trendline

**New file: `src/components/signals/SignalTrendline.tsx`**

A compact sparkline component that queries `company_signal_scans` for a given `company_id` + `signal_category` over time, showing direction changes. Uses existing Recharts (already imported in `CompanyHistoryTimeline`).

Displays: mini area chart with direction arrows (↑ increase, ↓ decrease, → stable) alongside the current signal value.

---

### 7. "Why This Matters" Explanations

**New file: `src/lib/why-this-matters.ts`**

Maps each `signal_category` to plain-English impact explanations:

```typescript
{
  compensation_transparency: {
    positive: "This employer publicly discloses pay ranges, giving you leverage in negotiations.",
    negative: "Pay data is not disclosed — you may be negotiating blind.",
    neutral: "Some compensation data is available but incomplete."
  },
  workforce_stability: { ... },
  hiring_activity: { ... },
  // ... all categories
}
```

Each explanation is direction-aware (`positive`, `negative`, `neutral`) and uses hedged language per tier. Consumed by `SignalAttribution` and surfaced as a one-liner beneath any signal card.

---

### 8. Integration Points

Apply `SignalAttribution` + `SignalTypeLabel` to:

| Component | What changes |
|---|---|
| `BeforeYouAcceptBlock` | Each signal bullet gets type label + source attribution |
| `RealitySignals` | Each badge gets evidence type suffix |
| `CategoryAlignmentCard` | Score bar gets confidence breakdown |
| `FullEvidenceLayer` | Each evidence item gets tier badge + freshness |
| `EVPSignalsPanel` | Each signal row gets attribution footer |
| `CompanyHistoryTimeline` | Timeline events get type labels |

---

### Implementation Order

1. Fix `parse-career-document` build error (unblocks everything)
2. Create `evidence-taxonomy.ts`
3. Create `SignalTypeLabel.tsx`
4. Create `useSignalConfidence.ts` hook
5. Create `SignalAttribution.tsx` (composes the above)
6. Create `why-this-matters.ts`
7. Create `SignalTrendline.tsx`
8. Enhance `SignalFreshness.tsx`
9. Apply to key surfaces (BeforeYouAccept, Reality, Alignment, Evidence, EVP)

### Files created/changed

- `supabase/functions/parse-career-document/index.ts` (fix build)
- `src/lib/evidence-taxonomy.ts` (new)
- `src/lib/why-this-matters.ts` (new)
- `src/components/signals/SignalAttribution.tsx` (new)
- `src/components/signals/SignalTypeLabel.tsx` (new)
- `src/components/signals/SignalTrendline.tsx` (new)
- `src/hooks/useSignalConfidence.ts` (new)
- `src/components/SignalFreshness.tsx` (enhanced)
- `src/components/career/BeforeYouAcceptBlock.tsx` (integrate)
- `src/components/jobs/RealitySignals.tsx` (integrate)
- `src/components/alignment/CategoryAlignmentCard.tsx` (integrate)
- `src/components/dossier/FullEvidenceLayer.tsx` (integrate)
- `src/components/recruiting/evp/EVPSignalsPanel.tsx` (integrate)

