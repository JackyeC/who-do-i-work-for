# WDIWF Security Fix Runbook

**Date:** March 31, 2026
**Priority:** Critical → High → Medium (in order below)

---

## Status Overview

| Fix | Migration File | Status |
|-----|---------------|--------|
| RLS on 10 report tables | `20260329000001_security_fix_rls_policies.sql` | In repo — needs DB apply |
| User data ownership | `20260329000002_security_fix_user_data_rls.sql` | In repo — needs DB apply |
| Realtime channel writes | `20260329000003_security_fix_realtime_channels.sql` | In repo — needs DB apply |
| LinkedIn token encryption | `20260331000001_security_encrypt_linkedin_token.sql` | NEW — needs DB apply |
| LinkedIn token RPC lockdown | `20260331000002_linkedin_token_rpc.sql` | NEW — needs DB apply |
| Frontend safe view switch | `src/hooks/use-linkedin.ts` | Code updated — deploys with push |

---

## How to Apply

Go to your Supabase dashboard → SQL Editor → paste each migration in order.

**Project:** `tdetybqdxadmowjivtjy` (the WDIWF production database)
**Dashboard:** https://supabase.com/dashboard/project/tdetybqdxadmowjivtjy/sql

### Step 1: Check what's already applied

Before running anything, paste this to see if the security tables already exist:

```sql
-- Check if admin_users table exists (from migration 1)
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'admin_users'
);

-- Check if is_admin function exists
SELECT EXISTS (
  SELECT FROM pg_proc WHERE proname = 'is_admin'
);

-- Check if linkedin_profiles_safe view exists
SELECT EXISTS (
  SELECT FROM information_schema.views
  WHERE table_name = 'linkedin_profiles_safe'
);
```

### Step 2: Run migrations in order

If Step 1 shows `false`, run each migration file contents in order:

1. `20260329000001_security_fix_rls_policies.sql`
2. `20260329000002_security_fix_user_data_rls.sql`
3. `20260329000003_security_fix_realtime_channels.sql`
4. `20260331000001_security_encrypt_linkedin_token.sql`
5. `20260331000002_linkedin_token_rpc.sql`

### Step 3: Add yourself as admin

After migration 1 runs, add yourself as superadmin:

```sql
INSERT INTO public.admin_users (user_id, role)
SELECT id, 'superadmin' FROM auth.users
WHERE email = 'jackyeclayton@gmail.com';
```

### Step 4: Push code to production repo

From your terminal:

```bash
cd ~/wdiwf-prod
cp -r ~/who-do-i-work-for/src/hooks/use-linkedin.ts src/hooks/use-linkedin.ts
cp -r ~/who-do-i-work-for/supabase/migrations/20260331000001_security_encrypt_linkedin_token.sql supabase/migrations/
cp -r ~/who-do-i-work-for/supabase/migrations/20260331000002_linkedin_token_rpc.sql supabase/migrations/
cp -r ~/who-do-i-work-for/supabase/functions/linkedin-share-certificate/index.ts supabase/functions/linkedin-share-certificate/
git add -A
git commit -m "Security: encrypt LinkedIn tokens, add safe view, lock down token RPC"
git push origin main
```

---

## What Each Fix Does

### 1. RLS on Report Tables (Critical)
**Before:** Any logged-in user could edit or delete investigative reports.
**After:** Only users in the `admin_users` table can write. Everyone can still read.

### 2. LinkedIn Token Encryption (Critical)
**Before:** LinkedIn OAuth access_token stored as plaintext. Frontend RLS policy allowed `SELECT *` which could expose it.
**After:** Safe view (`linkedin_profiles_safe`) hides the token column. Frontend queries the view. Server-side RPC locked to service_role only.

### 3. Realtime Channel Writes (High)
**Before:** Any authenticated user could INSERT into scan_alerts, ideology_flags, scan_events.
**After:** Only admins can write to those tables. Read access preserved (public company data).

### 4. User Data Ownership (Medium)
**Before:** No `created_by` tracking on company_sanctions_screening and company_wikidata.
**After:** Ownership column added, scoped to creating user.

---

## Encryption key rotation (LinkedIn tokens)

The migration `20260331000001_security_encrypt_linkedin_token.sql` derives the symmetric key from `current_setting('app.settings.service_role_key', true)` (SHA-256 hex). That ties ciphertext to **whatever value that setting holds in the database session that performs encrypt/decrypt**.

### What this means

- **Rotating the Supabase `service_role` JWT** (project API settings) **without** updating how you derive or store the encryption key will **not** automatically re-encrypt existing rows. Edge functions and RPCs that decrypt `encrypted_access_token` must use the **same** derived key as when the data was written, or decryption fails and LinkedIn features break until users reconnect LinkedIn.
- There is **no automatic key versioning** in the current schema (single `encrypted_access_token` column). Plan rotations explicitly.

### If you need a clean rotation today

Pick one approach:

1. **User-driven (simplest):** Invalidate stored tokens (clear `encrypted_access_token` / force users through LinkedIn OAuth again) after you change the key material. Accept brief disruption for connected accounts.
2. **Re-encrypt in place (no user action):** In a maintenance window, run a one-off script or SQL `DO` block that:
   - Reads each row’s token using **old** key material (decrypt).
   - Writes ciphertext using **new** key material (encrypt).
   - Requires both secrets to be available only during the migration; then retire the old secret.
3. **Longer-term hardening:** Move to a **dedicated** secret (e.g. Supabase Vault–backed setting such as `app.settings.linkedin_token_dek`) that is **independent** of the service_role JWT, plus optional `key_version` column for staged rotations. That avoids coupling token encryption to API key rotation.

### Operational checklist before rotating service_role JWT

- [ ] Confirm whether any code path still uses the **plaintext** `access_token` column; migrate callers to encrypted storage first.
- [ ] Document the current `app.settings.service_role_key` source in your project (who sets it, which role).
- [ ] Either **re-encrypt** all `encrypted_access_token` values or plan a **forced re-link** for LinkedIn.

If you want a follow-up migration for Vault-backed keys + versioning, add it as a separate PR after this security bundle is stable in production.
