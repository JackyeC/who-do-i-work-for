
-- Fix scan_runs: restrict to service role only (edge functions use service role)
DROP POLICY IF EXISTS "Authenticated users can read scan runs" ON public.scan_runs;
CREATE POLICY "Only service role can read scan runs" ON public.scan_runs
  FOR SELECT TO service_role USING (true);

-- Fix browse_ai_monitors: restrict to service role only
DROP POLICY IF EXISTS "Authenticated users can read monitors" ON public.browse_ai_monitors;
CREATE POLICY "Only service role can read monitors" ON public.browse_ai_monitors
  FOR SELECT TO service_role USING (true);

-- Fix scan_schedules: remove public access, restrict to service role
DROP POLICY IF EXISTS "Scan schedules are publicly readable" ON public.scan_schedules;
CREATE POLICY "Only service role can read scan schedules" ON public.scan_schedules
  FOR SELECT TO service_role USING (true);
