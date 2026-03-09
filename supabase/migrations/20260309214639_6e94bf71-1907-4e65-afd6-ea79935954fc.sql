
-- Create company_values_evidence table
CREATE TABLE public.company_values_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  values_lens TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  source_name TEXT,
  source_type TEXT,
  source_url TEXT,
  source_title TEXT,
  evidence_summary TEXT,
  evidence_excerpt TEXT,
  related_legislation TEXT,
  related_org TEXT,
  related_politician TEXT,
  amount NUMERIC,
  event_date DATE,
  confidence_level TEXT NOT NULL DEFAULT 'medium',
  verification_status TEXT NOT NULL DEFAULT 'unverified',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add missing columns to existing company_values_signals
ALTER TABLE public.company_values_signals
  ADD COLUMN IF NOT EXISTS signal_label TEXT,
  ADD COLUMN IF NOT EXISTS signal_direction TEXT DEFAULT 'informational_signal',
  ADD COLUMN IF NOT EXISTS confidence_level TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS evidence_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS values_lens TEXT;

-- Enable RLS
ALTER TABLE public.company_values_evidence ENABLE ROW LEVEL SECURITY;

-- Public read for evidence (public data)
CREATE POLICY "Anyone can read values evidence"
  ON public.company_values_evidence FOR SELECT
  TO anon, authenticated
  USING (true);

-- Public read for signals (already has RLS from before, add if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'company_values_signals' AND policyname = 'Anyone can read values signals'
  ) THEN
    CREATE POLICY "Anyone can read values signals"
      ON public.company_values_signals FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- Indexes
CREATE INDEX idx_values_evidence_entity ON public.company_values_evidence(entity_id);
CREATE INDEX idx_values_evidence_lens ON public.company_values_evidence(values_lens);
CREATE INDEX idx_values_signals_lens ON public.company_values_signals(values_lens);

-- Updated_at trigger for evidence
CREATE TRIGGER update_values_evidence_updated_at
  BEFORE UPDATE ON public.company_values_evidence
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
