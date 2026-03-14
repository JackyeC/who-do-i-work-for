
CREATE TABLE public.company_ownership_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  structure_type TEXT NOT NULL DEFAULT 'standard',
  holder_name TEXT,
  holder_role TEXT,
  voting_power_pct NUMERIC(5,2),
  economic_ownership_pct NUMERIC(5,2),
  share_class TEXT,
  description TEXT,
  governance_signal TEXT,
  signal_severity TEXT NOT NULL DEFAULT 'info',
  source TEXT,
  source_url TEXT,
  confidence TEXT NOT NULL DEFAULT 'likely',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.company_ownership_structures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ownership structures"
  ON public.company_ownership_structures
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX idx_ownership_company ON public.company_ownership_structures(company_id);
