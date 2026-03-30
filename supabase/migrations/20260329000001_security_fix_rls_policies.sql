-- ============================================================
-- SECURITY FIX: Tighten RLS policies on report tables
--
-- PROBLEM: 10 report tables allow ANY authenticated user to
-- INSERT, UPDATE, DELETE ALL records via USING(true).
-- This means any logged-in user can edit/delete Jackye's
-- investigative reports.
--
-- FIX: Replace open "authenticated" policies with:
--   - READ: Keep public read for published reports (already exists)
--   - WRITE: Restrict to service_role only (backend/admin operations)
--   - Add admin_write policies for specific admin users
-- ============================================================

-- Step 1: Create an admin_users table for managing who can edit reports
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor',  -- 'editor', 'admin', 'superadmin'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only service_role can manage admin_users
CREATE POLICY "Service role manages admin_users"
  ON public.admin_users FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Admins can read their own admin status
CREATE POLICY "Users can check own admin status"
  ON public.admin_users FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Step 2: Drop the dangerous open policies on ALL 10 report tables
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

-- Step 3: Create admin-only write policies using admin_users table
-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- policy_reports: admins can manage
CREATE POLICY "Admins manage reports"
  ON public.policy_reports FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- report_sections: admins can manage
CREATE POLICY "Admins manage sections"
  ON public.report_sections FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- report_claims: admins can manage
CREATE POLICY "Admins manage claims"
  ON public.report_claims FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- report_evidence_links: admins can manage
CREATE POLICY "Admins manage evidence"
  ON public.report_evidence_links FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- report_entities: admins can manage
CREATE POLICY "Admins manage entities"
  ON public.report_entities FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- report_legislation: admins can manage
CREATE POLICY "Admins manage legislation"
  ON public.report_legislation FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- report_events: admins can manage
CREATE POLICY "Admins manage events"
  ON public.report_events FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- report_company_alignment: admins can manage
CREATE POLICY "Admins manage alignment"
  ON public.report_company_alignment FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- report_actions: admins can manage
CREATE POLICY "Admins manage actions"
  ON public.report_actions FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- report_followups: admins can manage
CREATE POLICY "Admins manage followups"
  ON public.report_followups FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Step 4: Service role always has full access (for edge functions/backend)
-- (service_role bypasses RLS by default in Supabase, so no explicit policy needed)

-- ============================================================
-- IMPORTANT: After running this migration, insert yourself as admin:
--
-- INSERT INTO public.admin_users (user_id, role)
-- SELECT id, 'superadmin' FROM auth.users
-- WHERE email = 'jackye@jackyeclayton.com';
--
-- (Run this in the Supabase SQL Editor with service_role)
-- ============================================================
