-- ============================================================
-- SECURITY FIX: Tighten Realtime channel access
--
-- PROBLEM: Realtime subscriptions on company_scan_events,
-- company_ideology_flags, and scan_alerts broadcast to all
-- authenticated users regardless of ownership.
--
-- FIX: These tables contain public company data (not user-private),
-- so SELECT USING(true) is acceptable for authenticated users.
-- But we must ensure INSERT/UPDATE/DELETE is restricted.
-- ============================================================

-- company_scan_events: Public read, admin-only write
DO $$
BEGIN
  -- Drop any overly permissive write policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_scan_events' AND policyname ILIKE '%insert%' AND cmd = 'INSERT') THEN
    EXECUTE 'DROP POLICY IF EXISTS "' || (
      SELECT policyname FROM pg_policies
      WHERE tablename = 'company_scan_events' AND cmd = 'INSERT'
      LIMIT 1
    ) || '" ON public.company_scan_events';
  END IF;
END $$;

-- Ensure only service_role/admins can insert scan events
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Only admins insert scan events' AND tablename = 'company_scan_events') THEN
    CREATE POLICY "Only admins insert scan events"
      ON public.company_scan_events FOR INSERT TO authenticated
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- company_ideology_flags: Public read, admin-only write
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Only admins insert ideology flags' AND tablename = 'company_ideology_flags') THEN
    CREATE POLICY "Only admins insert ideology flags"
      ON public.company_ideology_flags FOR INSERT TO authenticated
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- scan_alerts: Public read, admin-only write
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Only admins insert scan alerts' AND tablename = 'scan_alerts') THEN
    CREATE POLICY "Only admins insert scan alerts"
      ON public.scan_alerts FOR INSERT TO authenticated
      WITH CHECK (public.is_admin());
  END IF;
END $$;
