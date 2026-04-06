-- Cap auto-apply draft generation per calendar month (anti–spray-and-pray).
ALTER TABLE public.auto_apply_settings
  ADD COLUMN IF NOT EXISTS max_monthly_applications integer NOT NULL DEFAULT 5;

COMMENT ON COLUMN public.auto_apply_settings.max_monthly_applications IS
  'Max completed apply_queue items per calendar month (values-aligned pacing, not bulk bots).';
