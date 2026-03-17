
-- Security hardening: set explicit search_path on all public functions
ALTER FUNCTION public.trace_influence_chain(_company_id uuid, _max_depth integer) SET search_path = public;
ALTER FUNCTION public.get_company_roi_pipeline(_company_id uuid) SET search_path = public;
ALTER FUNCTION public.compute_career_intelligence_score(_company_id uuid) SET search_path = public;
ALTER FUNCTION public.compute_all_career_intelligence_scores() SET search_path = public;
ALTER FUNCTION public.check_slot_availability() SET search_path = public;
ALTER FUNCTION public.notify_watchers_on_signal_change() SET search_path = public;
ALTER FUNCTION public.deactivate_expired_jobs() SET search_path = public;
