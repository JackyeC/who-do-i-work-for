

## Plan: Beta Testing Guardrails

### What we're building

Three guardrails to protect the platform during testing: read-only access for regular users, a beta agreement popup on first sign-in, and hardened admin-only access.

---

### 1. Read-Only Beta Mode for Non-Admin Users

**Current state:** Several tables allow authenticated users to INSERT (e.g., `companies`, `correction_requests`). The job board and company profiles are publicly readable -- that's fine.

**Changes:**
- Create a `BetaReadOnlyGuard` wrapper component that checks if the current user has an admin/owner role. If not, it intercepts any "create/edit/delete" UI actions (like "Add Company", "Post a Job", "Submit Correction") and shows a toast saying "Read-only during beta."
- On the `/for-employers` page, hide or disable the "Post a Job" and tier purchase buttons for non-owner users.
- On `/add-company`, wrap the form submission in a beta guard that blocks non-admins.
- This is a UI-level guard. The existing RLS policies already restrict most write operations to `auth.uid()` matching. No DB changes needed -- the UI just needs to block the actions.

### 2. Beta Agreement Pop-up on First Sign-In

**Database change:** Add a `beta_agreement_accepted_at` column (nullable timestamp) to the `profiles` table.

**New component:** `BetaAgreementModal`
- Shown when `user` exists but `profiles.beta_agreement_accepted_at` is NULL.
- Text: *"By entering, you agree that this is a private preview, the data is for testing only, and you will not share screenshots or information publicly."*
- Single "I Agree" button that updates `profiles.beta_agreement_accepted_at = now()`.
- No dismiss/close -- must accept to proceed.
- Placed in `AuthProvider` or `AppShell` so it triggers globally after login.

**Hook:** `useBetaAgreement` -- queries the profile for the flag, exposes `needsAgreement` boolean and `acceptAgreement()` mutation.

### 3. Admin-Only Lock on /admin and /for-employers "Post a Job"

**Current state:** `AdminRoute` checks `isAdmin || isOwner` from the `user_roles` table. This is already secure (server-side RLS on `user_roles`).

**Change:** Tighten `AdminRoute` to also verify the user's email matches `jackyeclayton@gmail.com` as a secondary client-side check. The real security is the `user_roles` table, but this adds belt-and-suspenders.

**For `/for-employers`:** The "Post a Job" / purchase buttons will be hidden for non-owner users (same as #1 above).

---

### Technical summary

| Change | Type |
|---|---|
| Add `beta_agreement_accepted_at` to `profiles` | DB migration |
| `BetaAgreementModal` component | New file |
| `useBetaAgreement` hook | New file |
| Mount modal in `AppShell` | Edit |
| `BetaReadOnlyGuard` or inline checks on write actions | New + edits |
| Tighten `AdminRoute` with email check | Edit |
| Disable write UI on `/for-employers`, `/add-company` for non-admins | Edits |

