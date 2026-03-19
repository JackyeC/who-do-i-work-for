

## Plan: POST Candidate Parameters on Auto-Apply Finish

### Summary
Modify `handleLaunch` in `PurpleSquirrelOnboarding.tsx` to POST collected parameters to the external API endpoint, with graceful error handling.

### Changes

**File: `src/components/jobs/PurpleSquirrelOnboarding.tsx`**

1. Add `useState` for `submitting` to disable the button during the request.
2. Import `useToast` from `@/hooks/use-toast`.
3. Rewrite `handleLaunch` as an async function that:
   - Saves to localStorage and calls `upsert.mutate(...)` (existing behavior)
   - Sets `submitting = true`
   - POSTs to `https://wdiwf-integrity-api.onrender.com/api/candidates` with:
     ```json
     {
       "email": user.email,
       "target_roles": targetTitles,
       "industries": targetCompanies,
       "location_preference": derived from dnaValues.flexibility (>70 → "remote", 30-70 → "hybrid", <30 → "onsite"),
       "salary_min": minComp ? Number(minComp) : 80000,
       "salary_max": minComp ? Math.round(Number(minComp) * 1.5) : 150000,
       "values": DNA_DIALS sorted by slider value descending, mapped to label strings,
       "integrity_threshold": dnaLockThreshold,
       "narrative_gap_filter": true,
       "mission_alignment": true,
       "work_orientation": dnaValues.values / 100
     }
     ```
   - On success (2xx): toast "Your agent is active. Check your dashboard for updates."
   - On error (any): toast "We saved your preferences. Our team will activate your agent within 24 hours."
   - Calls `onComplete()` in both cases
   - Sets `submitting = false`
4. Disable the "Engage Engine" button while `submitting` is true and show a loading state.

### No other files changed.

