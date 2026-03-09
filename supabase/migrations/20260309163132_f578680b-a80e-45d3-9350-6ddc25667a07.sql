
-- Tighten insert/update to service_role only
DROP POLICY "Service role can insert issue signals" ON public.issue_signals;
DROP POLICY "Service role can update issue signals" ON public.issue_signals;

CREATE POLICY "Service role can insert issue signals"
  ON public.issue_signals FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update issue signals"
  ON public.issue_signals FOR UPDATE
  TO service_role
  USING (true);
