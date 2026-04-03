-- ============================================================
-- WDIWF SECURITY FIXES — COMBINED MIGRATION
-- Run this ONCE in Supabase SQL Editor
-- Date: March 31, 2026
-- ============================================================

-- ╔══════════════════════════════════════════════════════════╗
-- ║  MIGRATION 1: RLS on report tables + admin system       ║
-- ╚══════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages admin_users"
  ON public.admin_users FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Users can check own admin status"
  ON public.admin_users FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Drop dangerous open policies on report tables
DROP POLICY IF EXISTS "Auth users manage reports" ON public.policy_reports;
DROP POLICY IF EXISTS "Auth users manage sections" ON public.report_sections;
DROP POLICY IF EXISTS "Auth users manage claims" ON public.report_claims;
DROP POLICY IF EXISTS "Auth users manage evidence" ON public.report_evidence_links;
DROP POLICY IF EXISTS "Auth users manage entities" ON public.report_entities;
DROP POLICY IF EXISTS "Auth users manage legislation" ON public.report_legislation;
DROP POLICY IF EXISTS "Auth users manage events" ON public.report_events;
DROP POLICY IF EXISTS "Auth users manage alignment" ON public.report_company_alignment;
DROP POLICY IF EXISTS "Auth users manage actions" ON public.report_actions;
DROP POLICY IF EXISTS "Auth users manage followups" ON public.report_followups;

-- Admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Admin-only write policies
CREATE POLICY "Admins manage reports"
  ON public.policy_reports FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage sections"
  ON public.report_sections FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage claims"
  ON public.report_claims FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage evidence"
  ON public.report_evidence_links FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage entities"
  ON public.report_entities FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage legislation"
  ON public.report_legislation FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage events"
  ON public.report_events FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage alignment"
  ON public.report_company_alignment FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage actions"
  ON public.report_actions FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage followups"
  ON public.report_followups FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MIGRATION 2: User data ownership                       ║
-- ╚══════════════════════════════════════════════════════════╝

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can read scan runs' AND tablename = 'scan_runs') THEN
    DROP POLICY "Authenticated users can read scan runs" ON public.scan_runs;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can read monitors' AND tablename = 'browse_ai_monitors') THEN
    DROP POLICY "Authenticated users can read monitors" ON public.browse_ai_monitors;
  END IF;
END $$;

CREATE POLICY "Authenticated users can read scan runs"
  ON public.scan_runs FOR SELECT TO authenticated
  USING (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Only admins write scan runs' AND tablename = 'scan_runs') THEN
    CREATE POLICY "Only admins write scan runs"
      ON public.scan_runs FOR INSERT TO authenticated
      WITH CHECK (public.is_admin());
  END IF;
END $$;

CREATE POLICY "Authenticated users can read monitors"
  ON public.browse_ai_monitors FOR SELECT TO authenticated
  USING (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'company_sanctions_screening' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.company_sanctions_screening ADD COLUMN created_by UUID DEFAULT auth.uid();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'company_wikidata' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.company_wikidata ADD COLUMN created_by UUID DEFAULT auth.uid();
  END IF;
END $$;


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MIGRATION 3: Realtime channel access control           ║
-- ╚══════════════════════════════════════════════════════════╝

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Only admins insert scan events' AND tablename = 'company_scan_events') THEN
    CREATE POLICY "Only admins insert scan events"
      ON public.company_scan_events FOR INSERT TO authenticated
      WITH CHECK (public.is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Only admins insert ideology flags' AND tablename = 'company_ideology_flags') THEN
    CREATE POLICY "Only admins insert ideology flags"
      ON public.company_ideology_flags FOR INSERT TO authenticated
      WITH CHECK (public.is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Only admins insert scan alerts' AND tablename = 'scan_alerts') THEN
    CREATE POLICY "Only admins insert scan alerts"
      ON public.scan_alerts FOR INSERT TO authenticated
      WITH CHECK (public.is_admin());
  END IF;
END $$;


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MIGRATION 4: LinkedIn token safe view                  ║
-- ╚══════════════════════════════════════════════════════════╝

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE VIEW public.linkedin_profiles_safe AS
  SELECT id, user_id, linkedin_id, name, email, profile_url,
         profile_picture_url, expires_at, created_at, updated_at
  FROM public.linkedin_profiles;

GRANT SELECT ON public.linkedin_profiles_safe TO authenticated;


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MIGRATION 5: LinkedIn token RPC (service_role only)    ║
-- ╚══════════════════════════════════════════════════════════╝

CREATE OR REPLACE FUNCTION public.get_linkedin_token(p_user_id UUID)
RETURNS TABLE (
  linkedin_id TEXT,
  access_token TEXT,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: service_role required';
  END IF;
  RETURN QUERY
    SELECT lp.linkedin_id, lp.access_token, lp.expires_at
    FROM public.linkedin_profiles lp
    WHERE lp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

REVOKE EXECUTE ON FUNCTION public.get_linkedin_token(UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_linkedin_token(UUID) TO service_role;


-- ╔══════════════════════════════════════════════════════════╗
-- ║  FINAL: Add Jackye as superadmin                        ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.admin_users (user_id, role)
SELECT id, 'superadmin' FROM auth.users
WHERE email = 'jackyeclayton@gmail.com'
ON CONFLICT (user_id) DO NOTHING;


-- ============================================================
-- DONE. All security fixes applied.
-- ============================================================
