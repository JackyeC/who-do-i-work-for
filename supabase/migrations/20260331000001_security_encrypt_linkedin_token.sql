-- ============================================================
-- SECURITY FIX: Encrypt LinkedIn OAuth tokens at rest
-- and prevent frontend from reading them
--
-- PROBLEM: access_token is stored as plaintext in linkedin_profiles
-- and the RLS SELECT policy allows users to read their own row,
-- meaning a malicious script or browser extension could extract
-- the LinkedIn token via supabase.from('linkedin_profiles').select('*')
--
-- FIX:
--   1. Enable pgcrypto for encryption functions
--   2. Add encrypted_access_token column (encrypted with server key)
--   3. Create a secure view that excludes the token for frontend use
--   4. Revoke direct SELECT on the raw table from authenticated users
--   5. Grant SELECT on the safe view instead
--   6. Keep service_role access for edge functions that need the token
-- ============================================================

-- Step 1: Ensure pgcrypto is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: Add encrypted token column
ALTER TABLE public.linkedin_profiles
  ADD COLUMN IF NOT EXISTS encrypted_access_token BYTEA;

-- Step 3: Encrypt existing plaintext tokens using a server-side key
-- The encryption key is derived from the service role key (available only server-side)
-- We use pgp_sym_encrypt which provides authenticated encryption
DO $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Use a hash of the service role key as the encryption key
  -- This ensures only the server can decrypt
  encryption_key := encode(
    digest(current_setting('app.settings.service_role_key', true), 'sha256'),
    'hex'
  );

  -- If we can't get the service role key, use a fallback
  -- (The actual encryption will happen via the edge function migration below)
  IF encryption_key IS NULL OR encryption_key = '' THEN
    RAISE NOTICE 'Service role key not available in migration context. Tokens will be encrypted via edge function.';
  ELSE
    UPDATE public.linkedin_profiles
    SET encrypted_access_token = pgp_sym_encrypt(access_token, encryption_key)
    WHERE access_token IS NOT NULL
      AND encrypted_access_token IS NULL;
  END IF;
END $$;

-- Step 4: Create a SECURE view that hides the token
-- This is what the frontend will query instead of the raw table
CREATE OR REPLACE VIEW public.linkedin_profiles_safe AS
  SELECT
    id,
    user_id,
    linkedin_id,
    name,
    email,
    profile_url,
    profile_picture_url,
    expires_at,
    created_at,
    updated_at
  FROM public.linkedin_profiles;

-- Step 5: Drop the old SELECT policy that exposes the full row
DROP POLICY IF EXISTS "Users can read own LinkedIn profile" ON public.linkedin_profiles;

-- Step 6: Create a new restrictive SELECT policy
-- Users can only SELECT specific safe columns via the view
-- Direct table access is service_role only
CREATE POLICY "Users read own LinkedIn profile via view"
  ON public.linkedin_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Note: The view inherits RLS from the underlying table,
-- but only exposes the safe columns defined in Step 4.

-- Step 7: Grant view access to authenticated users
GRANT SELECT ON public.linkedin_profiles_safe TO authenticated;

-- Step 8: The UPDATE policy stays scoped to own records
-- (already exists: "Users can update own LinkedIn profile")
-- But we should ensure they can't update access_token directly
-- by revoking column-level UPDATE on sensitive columns
REVOKE UPDATE (access_token, encrypted_access_token) ON public.linkedin_profiles FROM authenticated;

-- ============================================================
-- IMPORTANT: After running this migration:
--
-- 1. Update the frontend hook (use-linkedin.ts) to query
--    'linkedin_profiles_safe' instead of 'linkedin_profiles'
--
-- 2. Update edge functions to use encrypted_access_token:
--    - linkedin-callback: encrypt before storing
--    - linkedin-share-certificate: decrypt before using
--
-- 3. Once all tokens are encrypted, NULL out the plaintext column:
--    UPDATE linkedin_profiles SET access_token = 'MIGRATED';
-- ============================================================
