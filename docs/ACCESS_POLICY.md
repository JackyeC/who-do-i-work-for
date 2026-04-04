# Access policy (tier & premium features)

Client-side gating is implemented in [`src/lib/access-policy.ts`](../src/lib/access-policy.ts) and consumed by [`PremiumGate`](../src/components/PremiumGate.tsx). This keeps rank comparison for `free` / `candidate` / `professional` in one place.

## Server-side enforcement (required for security)

**UI gates are not sufficient.** Any Supabase table or Edge Function that exposes paid-only data must enforce the same rules with:

- **Row Level Security (RLS)** policies keyed on `user_id` and subscription/plan tables (`user_subscriptions`, `plans`), or
- **Edge Functions** that verify the JWT and plan before returning sensitive payloads.

Document new paid features with both: (1) `PremiumGate` + `tierMeetsMinimum`, and (2) the RLS policy or function check that matches.

## Feature flags

For experiments or kill switches, prefer environment-driven flags checked in one module (extend `access-policy.ts` or a small `feature-flags.ts`) rather than scattering `import.meta.env` across components.
