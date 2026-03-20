

## Bug: Screen Jumping Between Auth States

### Root Cause

There are **two competing authentication systems** running simultaneously:

1. **Clerk** (`@clerk/clerk-react`) -- manages sign-in UI, `<SignedIn>`/`<SignedOut>`, `<RedirectToSignIn />`
2. **Supabase Auth** (`AuthContext`) -- runs `onAuthStateChange`, checks subscriptions, and **redirects to `/welcome`** on `SIGNED_IN` event

When you visit `/auto-apply` (which is NOT wrapped in `<ProtectedRoute>`):
- Clerk loads and may flash between signed-in/signed-out states while initializing
- Meanwhile, `AuthContext` fires `onAuthStateChange` and tries to redirect to `/welcome` if you're on certain paths
- The `ProtectedRoute` component uses Clerk's `<SignedOut>` + `<RedirectToSignIn />` AND Supabase's `useAuth()` user state, causing a race where the component flickers between loading, redirect, and content states

Additionally, the deprecated `afterSignInUrl` prop on `<ClerkProvider>` is causing console warnings and may conflict with the Supabase redirect in `AuthContext.navigateRef()`.

### Fix (3 files)

**1. `src/contexts/AuthContext.tsx`** -- Remove the post-login redirect logic
- Delete the `navigateRef` function (lines ~56-63) that redirects to `/welcome`
- Clerk already handles post-sign-in redirects via `fallbackRedirectUrl`
- Keep everything else (subscription checks, user state)

**2. `src/main.tsx`** -- Fix deprecated Clerk props
- Replace `afterSignInUrl="/dashboard"` and `afterSignUpUrl="/dashboard"` with `fallbackRedirectUrl="/dashboard"` (single prop, not deprecated)

**3. `src/App.tsx`** -- Wrap `/auto-apply` in `<ProtectedRoute>` if it should be protected
- Currently `/auto-apply` has no auth gate, so unauthenticated users see it but any auth-dependent code inside may cause flicker
- Wrap it: `<Route path="/auto-apply" element={<ProtectedRoute><AutoApplyOnboarding /></ProtectedRoute>} />`

These changes eliminate the dual-redirect race condition and stop the screen jumping.

