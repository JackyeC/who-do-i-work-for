-- Restrict compensation_freshness_audit view to authenticated users only.
-- The view has security_invoker = on, so revoking anon access here prevents
-- unauthenticated users from querying it (used only in the admin panel).
REVOKE ALL ON public.compensation_freshness_audit FROM anon;
GRANT SELECT ON public.compensation_freshness_audit TO authenticated;
GRANT ALL ON public.compensation_freshness_audit TO service_role;
