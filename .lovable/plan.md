

## Add Clerk Loading Fallback

### Problem
When Clerk fails to initialize (e.g., preview environment origin mismatch), `isLoaded` stays `false` forever, causing 6 components to render `null` — resulting in a blank page.

### Solution
Create a shared hook `useClerkWithFallback` that returns `isLoaded: true` after a timeout (3 seconds) even if Clerk never initializes. This ensures content renders regardless.

### Changes

**1. New hook: `src/hooks/use-clerk-fallback.ts`**
- Wraps Clerk's `useAuth()` 
- Starts a 3-second timer; if `isLoaded` is still false after that, returns `{ ...clerkAuth, isLoaded: true }` as a fallback
- All other Clerk values pass through unchanged

**2. Update 6 files to use the new hook instead of raw `useClerkAuth`:**
- `src/pages/Index.tsx` — replace `useClerkAuth` import/call with `useClerkWithFallback`
- `src/pages/Welcome.tsx` — same
- `src/pages/AutoApply.tsx` — same
- `src/components/layout/TopBar.tsx` — same
- `src/components/ProtectedRoute.tsx` — same
- `src/components/AdminRoute.tsx` — same

Each file: swap the import and the destructured call. No other logic changes. When Clerk loads normally, behavior is identical. When it fails, content renders after 3 seconds instead of staying blank.

