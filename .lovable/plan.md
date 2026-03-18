

## Company Signal Engine — Gap Analysis and Build Plan

### What Already Exists (Extensive)

The platform already has significant signal infrastructure:

| Component | Status |
|---|---|
| `company_signal_scans` table | Exists — stores signal_category, signal_type, signal_value, confidence_level |
| `company_jobs` table | Exists — full job data with ATS detection |
| `job-scrape` function | 925 lines — ATS detection, page classification, hiring signal generation |
| `company-intelligence-scan` | Orchestrates 20+ data sources across 3 phases |
| `osint-parallel-scan` | Fires all OSINT sources in parallel |
| `refresh-intelligence` | Provider fallback chains with TTL freshness |
| `translate-signals` | Converts technical signals to plain English |
| `bulk-ingest-jobs` / `bulk-refresh-companies` | Batch processing |
| `ingest-unknown-company-job` | Company resolution for unknown entities |
| `StructuredSignalsSection` | UI rendering of hiring, stability, comp, leadership signals |
| `BeforeYouAcceptBlock` | Decision checkpoint using dossier insights |

### What's Actually Missing (The Gaps)

The system has the pieces but lacks the **unifying layer** — a single edge function that takes job ingestion events and company data, then writes standardized signals back to `company_signal_scans` using the 6 canonical signal types. Currently, signals are generated ad-hoc by individual scanners and the UI derives signals from boolean flags at render time.

---

### The Build (3 Parts)

#### Part 1: `generate-company-signals` Edge Function

A new orchestrator that reads existing data from the database and writes standardized signals. Not a new scraper — a **signal compiler**.

**Input**: `{ companyId }` (or triggered after job-scrape / scan completion)

**Logic**:
1. Query `company_jobs` for this company — count active jobs, salary presence, repost patterns, department concentration
2. Query `company_warn_notices`, `company_worker_sentiment`, `compensation_data`, `company_signal_scans` (existing raw signals)
3. Query `companies` table for PAC spending, lobbying, patent data
4. For each of the 6 canonical types, generate a standardized signal:

```text
{
  company_id, signal_type, value, direction, confidence_score,
  source, timestamp, summary (human-readable)
}
```

5. Upsert into `company_signal_scans` with the new fields
6. Missing data generates explicit signals (e.g., `compensation_transparency: "not_disclosed"`)

**Signal types generated**:
- `compensation_transparency` — from salary_range presence in jobs + compensation_data
- `hiring_activity` — from job count, repost frequency, department concentration
- `workforce_stability` — from WARN notices, layoff signals, sentiment
- `company_behavior` — from PAC spending, lobbying, contracts
- `innovation_activity` — from patent data, R&D signals
- `public_sentiment` — from worker sentiment, news signals

#### Part 2: Database Schema Addition

Add 3 columns to `company_signal_scans`:
- `direction` (text, nullable) — `increase | decrease | stable | unknown`
- `summary` (text, nullable) — human-readable one-liner
- `value_normalized` (text, nullable) — standardized value (`high | medium | low | not_disclosed`)

This preserves backward compatibility — all existing records keep working.

#### Part 3: Wire Signal Engine into Existing Pipelines

**After `job-scrape` completes**: call `generate-company-signals` for that company
**After `osint-parallel-scan` completes**: call `generate-company-signals`
**After `bulk-refresh-companies`**: already loops companies, add signal generation step

**UI consumption**: Update `StructuredSignalsSection` to read from `company_signal_scans` with the canonical types instead of deriving from boolean flags. Update `BeforeYouAcceptBlock` to pull pre-computed signal summaries instead of deriving at render time.

---

### Files to Create/Edit

| File | Action |
|---|---|
| `supabase/functions/generate-company-signals/index.ts` | **Create** — the signal compiler |
| DB migration | Add `direction`, `summary`, `value_normalized` columns to `company_signal_scans` |
| `supabase/functions/job-scrape/index.ts` | **Edit** — call signal engine after job upsert |
| `supabase/functions/osint-parallel-scan/index.ts` | **Edit** — call signal engine after scan completes |
| `src/components/company/StructuredSignalsSection.tsx` | **Edit** — read pre-computed signals from DB instead of deriving from booleans |
| `src/components/career/BeforeYouAcceptBlock.tsx` | **Edit** — use pre-computed signal summaries |

### What This Unlocks

Once signals are standardized and pre-computed:
- Job cards, detail pages, company profiles, live ticker, scoring — all read from the same source
- No recomputation on page load
- Missing data is an explicit signal, not a blank state
- Every signal is traceable (source, timestamp, confidence)

