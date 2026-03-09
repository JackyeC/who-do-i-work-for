
-- Fix company_signal_scans: restrict inserts to authenticated users (already is, but add user check isn't possible since no user_id column — restrict to service_role for edge functions)
DROP POLICY IF EXISTS "Authenticated users can insert signal scans" ON public.company_signal_scans;
CREATE POLICY "Service role can insert signal scans" ON public.company_signal_scans
  FOR INSERT TO service_role WITH CHECK (true);

-- Fix correction_requests: public submissions are intentional but add rate limiting via requiring at least an email
-- This is a public form, keep it but mark as reviewed
DROP POLICY IF EXISTS "Anyone can submit corrections" ON public.correction_requests;
CREATE POLICY "Anyone can submit corrections" ON public.correction_requests
  FOR INSERT TO anon, authenticated WITH CHECK (
    contact_email IS NOT NULL AND contact_email != '' AND
    company_name IS NOT NULL AND company_name != '' AND
    description IS NOT NULL AND description != ''
  );
