

# Fix All Build Errors

There are 6 distinct issues causing build failures. Here's the plan:

## 1. Fix syntax error in `supabase/functions/_shared/linkedin.ts` (line 12)
Missing closing quote and comma: `'code` → `'code',`

## 2. Fix `signInWithOAuth` calls (SignupModal.tsx line 34, Login.tsx lines 74, 87)
The method takes a single object argument. Change from:
```ts
supabase.auth.signInWithOAuth("google", { redirectTo: ... })
```
to:
```ts
supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: ... } })
```
Three call sites: SignupModal (Google), Login (Google), Login (Apple).

## 3. Fix `use-linkedin.ts` — bypass TypeScript errors for `linkedin_profiles` table
Use `(supabase as any)` for the `.from("linkedin_profiles")` call (line 26-27), and cast `data` before setting state (line 36).

## 4. Fix `ChromeExtension.tsx` — bypass TypeScript for `pro_waitlist` table
Use `(supabase as any)` for `.from("pro_waitlist")` (line 52).

## 5. Add `showShareModal` state to `ResultsScreen` in `Quiz.tsx`
Add `const [showShareModal, setShowShareModal] = useState(false);` inside the `ResultsScreen` function body (after line 840), and add the `useState` import if missing.

---

**Files to edit**: 5 files, all straightforward single-line or few-line fixes.

