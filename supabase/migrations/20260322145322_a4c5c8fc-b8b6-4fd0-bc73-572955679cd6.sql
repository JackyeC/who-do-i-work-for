-- Replace permissive service-role policy expressions with explicit role checks
DROP POLICY IF EXISTS "Service insert patent_assignments" ON public.patent_assignments;
CREATE POLICY "Service insert patent_assignments"
ON public.patent_assignments
FOR INSERT
TO service_role
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role manages company_job_sponsors" ON public.company_job_sponsors;
CREATE POLICY "Service role manages company_job_sponsors"
ON public.company_job_sponsors
FOR ALL
TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role manages employer_billing_profiles" ON public.employer_billing_profiles;
CREATE POLICY "Service role manages employer_billing_profiles"
ON public.employer_billing_profiles
FOR ALL
TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');