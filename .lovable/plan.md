

# Full Intelligence + Job Discovery on Every Company Search

## Problem

`company-discover` triggers `company-research` but does NOT trigger `job-scrape`. The careers URL is discovered during identity verification and saved to the company record, but no job scraping follows. The Check page shows intelligence but zero job listings.

## Current Flow

```text
User searches → company-discover → identity AI → company-research (fire-and-forget)
                                                   ↳ NO job-scrape
```

## Target Flow

```text
User searches → company-discover → identity AI → company-research (fire-and-forget)
                                                → job-scrape (fire-and-forget, if careers_url found)
                                   ↳ returns companyId to frontend

Frontend → selects company → loads policy data
                           → loads jobs from company_jobs table
                           → shows "Open Roles" section inline
                           → shows live scan progress steps
```

## Changes

### 1. Edge Function: `company-discover/index.ts`

After Step 5 (where `company-research` is triggered), add a parallel fire-and-forget call to `job-scrape` if `identityData.careers_url` or the company's `careers_url` was set. Pass `companyId`, `careersUrl`, and `companyName`.

### 2. Frontend: `src/pages/Check.tsx`

**Add "Open Roles" section** after the intelligence results (after PolicyReceiptsPanel, before the View Full Dossier CTA):

- New query: fetch `company_jobs` where `company_id = selectedCompanyId` and `is_active = true`, ordered by `posted_at desc`, limit 20
- Render as a compact list: title, location, work_mode badge, department, salary_range if present, and an "Apply" external link
- If jobs are loading (company was just discovered), show a 3-step progress indicator:
  - "Finding careers page..." → "Scanning hiring signals..." → "Pulling open roles..."
  - Auto-refetch every 5 seconds for up to 60 seconds using `refetchInterval`
- If no jobs after timeout: "Still scanning careers page — check back soon."
- Section header: "Open Roles" with a briefcase icon

**Update `AddCompanyCard`:**

- After discovery succeeds, show the scan progress steps inline before the card closes

### 3. Edge Function: `company-discover/index.ts` — also trigger for EXISTING companies

When a company already exists but has no recent job scan (`last_scan_attempted` is null or older than 48 hours), trigger `job-scrape` in the background before returning. This ensures existing companies also get fresh jobs.

## Files

| Action | File |
|--------|------|
| Modify | `supabase/functions/company-discover/index.ts` — add job-scrape trigger after identity + for stale existing companies |
| Modify | `src/pages/Check.tsx` — add Open Roles section with live scan progress + auto-refresh |

## Technical Details

- `job-scrape` already handles ATS detection for Greenhouse, Lever, Workday, iCIMS, SmartRecruiters, Ashby, Workable — no new scraping logic needed
- `refetchInterval: 5000` with `enabled` gated on `jobsQuery.data?.length === 0 && pollingCount < 12` (60s max)
- Jobs displayed with monospace aesthetic consistent with dossier look
- No database migration needed — `company_jobs` table already exists with all required columns

