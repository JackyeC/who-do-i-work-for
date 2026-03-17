

## Master Decision Engine Blueprint V3.0 — Implementation Plan

This blueprint touches 4 areas: SQL security hardening, ATS mismatch detection improvements, empty-state interpretation ("the Why"), and free/paid blur gating refinement. Much of the described functionality **already exists** in the codebase. This plan focuses on the gaps.

---

### What Already Exists (No Changes Needed)

| Feature | Current State |
|---------|--------------|
| ATS detection (11 platforms) | `job-scrape/index.ts` — Workday, Greenhouse, Lever, iCIMS, Taleo, etc. |
| Page classification (6 types) | `classifyPageContent()` in job-scrape |
| ATS mismatch signals | `generateHiringSignals()` already flags `ats_detected_no_active_jobs` |
| Hiring Scan Context UI | `HiringScanContextCard.tsx` shows classification, source, ATS, dept breakdown |
| Blur paywall gating | `ReportTeaserGate.tsx` with `blur-[6px]` + gradient CTA |
| Data freshness + confidence tiers | `DataFreshnessCard.tsx` with High/Medium/Low source tiers |
| Narrative Gap card | `NarrativeGapCard.tsx` for sparse/stale profiles |
| Off-the-Record Signals | `OffTheRecordSignals.tsx` already implemented and gated |
| Premium source gating | `PremiumSourceGate.tsx` dialog for source links |
| Dossier aesthetic / monospace | Already uses `font-mono` extensively across badge/header elements |

---

### Changes Required

#### 1. SQL Security Hardening (Database Migration)

Set explicit `search_path` on the two functions that are missing it. `handle_new_user` already has it.

```sql
ALTER FUNCTION public.trace_influence_chain(_company_id uuid, _max_depth integer) 
  SET search_path = public;

ALTER FUNCTION public.get_company_roi_pipeline(_company_id uuid) 
  SET search_path = public;

ALTER FUNCTION public.compute_career_intelligence_score(_company_id uuid) 
  SET search_path = public;

ALTER FUNCTION public.compute_all_career_intelligence_scores() 
  SET search_path = public;

ALTER FUNCTION public.check_slot_availability() 
  SET search_path = public;

ALTER FUNCTION public.notify_watchers_on_signal_change() 
  SET search_path = public;

ALTER FUNCTION public.deactivate_expired_jobs() 
  SET search_path = public;
```

One migration, all 7 functions secured.

#### 2. Empty-State Interpretation Layer

**File**: New component `src/components/company/EmptyStateExplainer.tsx`

A utility component that replaces blank/null states with contextual explanations across the profile. Instead of rendering nothing when data is absent, sections will show a short interpretive message.

| Missing Data | Interpretation |
|---|---|
| No EEO-1 data | "This company has not published EEO-1 workforce composition data. This is a low-transparency signal." |
| No public discussion signals | "Low public visibility — this may indicate a quiet or stealth corporate culture." |
| No active job openings | "No live openings detected. This may reflect operational stability or an internal-pipeline hiring strategy." |
| No court records | "No public court filings found. This is a positive signal, though absence does not guarantee no legal exposure." |
| No sentiment data | "No structured employee sentiment data available. Consider checking review platforms directly." |
| No compensation data | "Compensation data has not been disclosed or indexed for this employer." |

**Integration**: Add `EmptyStateExplainer` calls into key section renderers in `CompanyProfile.tsx` where components currently return `null` when data is missing — specifically in `workforce_intel`, `compensation`, `public_records`, and `off_the_record` sections.

#### 3. "What We Checked" Source Header

**File**: New component `src/components/company/SourcesCheckedBanner.tsx`

A compact horizontal scrolling badge strip shown at the top of the intelligence report (just below the Corporate Character Score), listing verified source types:

```
SEC 10-K · FEC Records · WARN Filings · Career Portal · ATS (Workday) · Reddit · Court Records · Federal Contracts
```

Each badge is conditionally rendered based on `scan_completion` and `intelligenceReports` data already available in CompanyProfile. Uses existing `Badge` component with `font-mono text-[10px]` styling.

**Integration**: Place in `CompanyProfile.tsx` after the `DataFreshnessCard` row (~line 780), before `ReportTeaserGate`.

#### 4. Scan Button Relabeling

**File**: `src/components/CompanyIntelligenceScanCard.tsx`

Replace "Run Scan" / "Scan" button labels with "Deep-Dive Research" or "Refresh Intelligence" for a more premium feel. Minor string replacements only.

#### 5. Enhanced Free/Paid Blur Gating with Signal Count

**File**: `src/components/ReportTeaserGate.tsx`

Currently the blur CTA says "See all signals, connection chains, workforce data." Enhance it to dynamically show the count of hidden signals:

- Accept a new optional prop `hiddenSignalCount?: number`
- Display: "Unlock Full Intelligence to see {N} more Risk Signals" when provided
- Increase blur from `blur-[6px]` to `blur-[8px]` for higher contrast per blueprint spec

No structural change to the gating logic — `isPremium || hasCredits` remains the access check.

---

### Files Summary

| File | Action |
|------|--------|
| Database migration | **Create** — ALTER 7 functions for search_path |
| `src/components/company/EmptyStateExplainer.tsx` | **Create** — interpretive empty states |
| `src/components/company/SourcesCheckedBanner.tsx` | **Create** — source badge strip |
| `src/pages/CompanyProfile.tsx` | **Edit** — integrate SourcesCheckedBanner + EmptyStateExplainer |
| `src/components/ReportTeaserGate.tsx` | **Edit** — add hiddenSignalCount prop, increase blur |
| `src/components/CompanyIntelligenceScanCard.tsx` | **Edit** — relabel scan buttons |

### What This Does NOT Change

- No new edge functions (ATS pivot logic already exists in job-scrape)
- No new monetization tiers (existing free/paid/credit system is preserved)
- No theme overhaul (existing dossier aesthetic with monospace + color-coded badges already matches the blueprint)

