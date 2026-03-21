

# Fix Company Dossier Page — Remaining Issues

## Issues Found

1. **Slug typo**: MAC Cosmetics stored as `mac-costmetics` instead of `mac-cosmetics`
2. **No fallback state on CompanyDossier page**: The no-data fallback was only added to `CompanyProfile.tsx`, not `CompanyDossier.tsx` — which is the actual public-facing dossier page at `/dossier/:id`
3. **3-second blank loading** while Clerk times out before content renders
4. **CompanyProfile page is login-gated**: `/company/:id` is behind `ProtectedRoute`, so unauthenticated users never see it. The public route is `/dossier/:id`
5. **No Jackye's Insight on the dossier page** even though it was added to CompanyProfile
6. **Remaining data seeding incomplete**: 310 issue signals and all public stances still pending

## Plan

### Step 1: Fix the slug typo in database
- Update `mac-costmetics` → `mac-cosmetics` via migration

### Step 2: Add no-data fallback to CompanyDossier.tsx
- When a company has all scores at 0, no signals, and no insight, show the "We don't have receipts on this company yet" block with:
  - CompanyZeroState scan button
  - AuditRequestForm fallback
- Place this after the overview/basics layer, before the paywall layers

### Step 3: Add Jackye's Insight to CompanyDossier.tsx
- Render `jackye_insight` (or `description`) as a styled coaching block inside the overview content, matching what was done in CompanyProfile

### Step 4: Seed remaining issue signals and public stances
- Insert the remaining 310 issue signals from the uploaded SQL
- Insert public stances data, working around the `gap` column constraint

### Step 5: (Optional) Reduce Clerk timeout impact
- Consider showing a skeleton/placeholder immediately instead of a blank spinner during the 3-second Clerk timeout on public dossier pages

## Technical Details

**Files to modify:**
- Database migration: fix `mac-costmetics` slug
- `src/pages/CompanyDossier.tsx` — add Jackye's Insight block + no-data fallback state
- Database inserts for remaining issue_signals and company_public_stances

**No schema changes needed.**

