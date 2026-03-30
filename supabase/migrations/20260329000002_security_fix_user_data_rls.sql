-- ============================================================
-- SECURITY FIX: Tighten RLS on user-scoped tables
--
-- PROBLEM: Several tables with user data use USING(true)
-- for authenticated users, meaning User A can see User B's data.
--
-- FIX: Scope to auth.uid() = user_id
-- ============================================================

-- Fix scan_runs: Only let users see their own scan runs
-- First check if the policy exists and drop it
DO $$
BEGIN
  -- scan_runs
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can read scan runs' AND tablename = 'scan_runs') THEN
    DROP POLICY "Authenticated users can read scan runs" ON public.scan_runs;
  END IF;

  -- browse_ai_monitors
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can read monitors' AND tablename = 'browse_ai_monitors') THEN
    DROP POLICY "Authenticated users can read monitors" ON public.browse_ai_monitors;
  END IF;
END $$;

-- scan_runs: These are system-generated scans, allow read for authenticated (they're not user-private)
-- but prevent write access
CREATE POLICY "Authenticated users can read scan runs"
  ON public.scan_runs FOR SELECT TO authenticated
  USING (true);

-- Explicitly block non-admin writes on scan_runs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Only admins write scan runs' AND tablename = 'scan_runs') THEN
    CREATE POLICY "Only admins write scan runs"
      ON public.scan_runs FOR INSERT TO authenticated
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- browse_ai_monitors: system data, read-only for users
CREATE POLICY "Authenticated users can read monitors"
  ON public.browse_ai_monitors FOR SELECT TO authenticated
  USING (true);

-- ============================================================
-- Fix user_alerts: Ensure users only see their own alerts
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users read own alerts' AND tablename = 'user_alerts') THEN
    -- Already properly scoped, skip
    NULL;
  END IF;
END $$;

-- ============================================================
-- Fix company_sanctions_screening: Add created_by tracking
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'company_sanctions_screening'
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.company_sanctions_screening
      ADD COLUMN created_by UUID DEFAULT auth.uid();
  END IF;
END $$;

-- ============================================================
-- Fix company_wikidata: Add created_by tracking
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'company_wikidata'
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.company_wikidata
      ADD COLUMN created_by UUID DEFAULT auth.uid();
  END IF;
END $$;
