
-- WARN Act layoff notices table
CREATE TABLE public.company_warn_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  notice_date date NOT NULL,
  effective_date date,
  employees_affected integer NOT NULL DEFAULT 0,
  layoff_type text NOT NULL DEFAULT 'layoff',
  location_city text,
  location_state text,
  reason text,
  source_url text,
  source_state text,
  confidence text NOT NULL DEFAULT 'direct',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_warn_notices_company ON public.company_warn_notices(company_id);
CREATE INDEX idx_warn_notices_date ON public.company_warn_notices(notice_date DESC);

-- RLS
ALTER TABLE public.company_warn_notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "WARN notices are publicly readable"
  ON public.company_warn_notices FOR SELECT
  USING (true);
