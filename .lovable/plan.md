

# Fix: Dream Job Alerts Not Generating

## Problem

Three issues are causing "No job alerts yet" despite having uploaded resumes:

1. **Stale time window**: The `dream-job-detect` function only matches jobs scraped in the last 48 hours. All 264 active jobs were last scraped on March 11 (a week ago), so they're all excluded from matching.
2. **No trigger mechanism**: The function is designed to run after batch scraping, but there's no way for users to trigger it manually.
3. **Misleading empty state**: The message says "Upload your resume" when the user has already done so and has a fully populated career profile.

## Plan

### 1. Fix the dream-job-detect edge function
- Widen the time window: instead of only matching jobs from the last 48 hours, match **all active jobs** when there are no existing alerts for the user (first-run behavior). Keep the 48-hour window for subsequent runs to avoid re-alerting.
- This ensures new users with profiles get matched against the full job catalog on their first scan.

### 2. Add a "Scan for Matches" button to DreamJobAlerts
- When there are no alerts, show a context-aware empty state:
  - If the user has a career profile with skills/titles: show "Your profile is ready. Run a scan to find matching jobs."
  - If no meaningful profile data: show "Complete your career profile to enable job matching."
- Add a button that calls `dream-job-detect` to trigger matching on demand.

### 3. Auto-trigger matching after resume upload
- In `CareerIntelligence.tsx`, after a document upload completes, call `dream-job-detect` in the background so alerts populate automatically without the user needing to manually scan.

### Files to modify
- `supabase/functions/dream-job-detect/index.ts` — widen time window for first-run, accept optional `user_id` param
- `src/components/career/DreamJobAlerts.tsx` — smart empty state + "Scan Now" button
- `src/pages/CareerIntelligence.tsx` — trigger scan after upload

