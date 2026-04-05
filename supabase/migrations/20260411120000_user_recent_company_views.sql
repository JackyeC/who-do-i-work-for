-- Per-user recent employer views (dossier / profile / check) for dashboard history.
-- Replaces broken client writes to company_scan_events (admin-only INSERT after security fix).

CREATE TABLE public.user_recent_company_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_recent_company_views_user_company UNIQUE (user_id, company_id)
);

CREATE INDEX idx_user_recent_company_views_user_viewed
  ON public.user_recent_company_views (user_id, viewed_at DESC);

ALTER TABLE public.user_recent_company_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own recent company views"
  ON public.user_recent_company_views FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own recent company views"
  ON public.user_recent_company_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own recent company views"
  ON public.user_recent_company_views FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own recent company views"
  ON public.user_recent_company_views FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
