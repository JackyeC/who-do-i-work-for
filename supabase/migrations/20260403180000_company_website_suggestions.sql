-- Queue for AI-suggested official websites pending founder review (medium/low confidence).

CREATE TABLE IF NOT EXISTS public.company_website_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  suggested_url TEXT NOT NULL,
  suggested_careers_url TEXT,
  confidence TEXT NOT NULL CHECK (confidence IN ('high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  source_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_website_suggestions_company
  ON public.company_website_suggestions(company_id);

CREATE INDEX IF NOT EXISTS idx_company_website_suggestions_pending
  ON public.company_website_suggestions(status, created_at DESC)
  WHERE status = 'pending';

-- At most one open review row per company
CREATE UNIQUE INDEX IF NOT EXISTS uniq_company_website_suggestions_pending_company
  ON public.company_website_suggestions(company_id)
  WHERE status = 'pending';

ALTER TABLE public.company_website_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage website suggestions"
  ON public.company_website_suggestions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));
