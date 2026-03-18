

# Upgrade Hiring Discovery: Multi-Surface Job Search

## Problem
The current `job-scrape` function only searches the single `careersUrl` provided. If that URL is a marketing page or JS-heavy SPA (like FIFA's `fifa.com/careers`), it misses the actual job portal (`jobs.fifa.com`) entirely. Layer 3 (search fallback) only fires when content is thin AND no jobs found, using a single generic query.

## Root Causes
1. **Layer 3 is gated on `allMarkdown.length < 100`** — if the marketing page returns content (it will), search never fires
2. **Only one search query** — `"{companyName} careers jobs openings hiring 2026"` — doesn't target careers subdomains or ATS platforms
3. **No careers domain discovery** — never searches for `jobs.{company}.com` or `careers.{company}.com`
4. **Pinpoint HQ** has a `fetchJobs` that returns `[]` — no API integration despite having an accessible job board

## Changes

### File: `supabase/functions/job-scrape/index.ts`

**1. Add new Layer 2.5: Careers Domain & Web Search Discovery**
Insert between Layer 2 (scrape) and Layer 3 (search fallback). Fires when `jobs.length === 0` regardless of markdown length:

- Run 3-4 parallel Firecrawl searches (or resilientSearch if no Firecrawl):
  - `"{companyName}" careers site jobs apply`
  - `site:jobs.{companyDomain} OR site:careers.{companyDomain}`
  - `"{companyName}" pinpoint OR greenhouse OR lever OR workday jobs`
  - `"{companyName}" open positions vacancy 2025 2026`
- Extract the `companyDomain` from the `careersUrl` parameter
- From results, detect:
  - Careers subdomains (`jobs.*`, `careers.*`)
  - ATS URLs (run through existing `extractATSUrls` + `detectATS`)
  - Indexed job page URLs (`/jobs/`, `/vacancy/`, `/positions/`)
- For any discovered ATS or careers domain, attempt scrape + ATS fetch

**2. Update Layer 3 condition**
Remove the `allMarkdown.length < 100` gate. Layer 3 should fire whenever `jobs.length === 0`, since a marketing page with content but no jobs should still trigger search.

**3. Add Pinpoint HQ scraping support**
Update the `pinpoint` entry in `ATS_CONFIGS.fetchJobs` to scrape the Pinpoint job board page and extract listings via AI, since Pinpoint doesn't have a public API but renders job lists in HTML.

**4. Expand classification vocabulary**
Add two new classifications to `PageClassification`:
- `careers_site_detected` — "Dedicated careers site found at {url}"
- `ats_detected_jobs_found` — "ATS detected ({platform}), active jobs confirmed"

Update `ScanContext` to include a `layersChecked` string array that records what was searched (e.g., `["company_site", "careers_subdomain", "ats_detection", "web_search", "indexed_pages"]`).

**5. Improve final zero-job explanation**
When `jobs.length === 0`, build explanation from all layers checked:
```
"Checked: company careers page, careers subdomain search, ATS detection (Pinpoint HQ detected), 
indexed job page search. Careers site detected but active jobs could not be confirmed."
```

### File: `src/components/company/HiringScanContextCard.tsx`

**6. Display layers checked**
Add a compact list showing which discovery layers were attempted, so users see: "We looked where jobs actually live."

Add new classification labels for `careers_site_detected` and `ats_detected_jobs_found`.

## FIFA Test Case Expected Flow
1. Layer 1: `careersUrl` = `fifa.com/careers` → no ATS match
2. Layer 2: Scrape `fifa.com/careers` → marketing page, classified `informational_landing`
3. **Layer 2.5 (NEW)**: Search `"FIFA" careers site jobs` → discovers `jobs.fifa.com`
   - Detect Pinpoint HQ from domain
   - Scrape `jobs.fifa.com` → extract job listings via AI
   - Classification: `ats_detected_jobs_found`
4. Result: Jobs found, ATS = Pinpoint HQ, confidence = medium

## No Database Changes
Existing `company_report_sections.content` JSON field accommodates the new `layersChecked` array without schema changes.

