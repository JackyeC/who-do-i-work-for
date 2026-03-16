
-- Only create tables that don't exist yet

CREATE TABLE IF NOT EXISTS public.healthcare_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,
  signal_category TEXT DEFAULT 'healthcare',
  provider_name TEXT,
  facility_type TEXT,
  enforcement_action TEXT,
  penalty_amount NUMERIC,
  violation_date DATE,
  description TEXT,
  evidence_text TEXT,
  source_name TEXT DEFAULT 'CMS',
  source_url TEXT,
  confidence TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gun_industry_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,
  signal_category TEXT DEFAULT 'firearms',
  license_type TEXT,
  license_number TEXT,
  premise_street TEXT,
  premise_city TEXT,
  premise_state TEXT,
  expiration_date DATE,
  description TEXT,
  evidence_text TEXT,
  source_name TEXT DEFAULT 'ATF',
  source_url TEXT,
  confidence TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.immigration_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,
  signal_category TEXT DEFAULT 'immigration',
  visa_class TEXT,
  job_title TEXT,
  worksite_city TEXT,
  worksite_state TEXT,
  wage_rate NUMERIC,
  wage_unit TEXT,
  case_status TEXT,
  case_number TEXT,
  decision_date DATE,
  employer_name TEXT,
  total_workers INTEGER,
  description TEXT,
  evidence_text TEXT,
  source_name TEXT DEFAULT 'DOL',
  source_url TEXT,
  confidence TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.regulatory_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,
  signal_category TEXT DEFAULT 'regulatory',
  agency TEXT NOT NULL,
  violation_type TEXT,
  facility_name TEXT,
  facility_state TEXT,
  penalty_amount NUMERIC,
  settlement_amount NUMERIC,
  violation_date DATE,
  resolution_date DATE,
  status TEXT,
  description TEXT,
  evidence_text TEXT,
  case_number TEXT,
  source_name TEXT,
  source_url TEXT,
  confidence TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.board_interlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_name TEXT NOT NULL,
  person_title TEXT,
  company_a_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  company_a_name TEXT NOT NULL,
  role_at_a TEXT,
  company_b_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  company_b_name TEXT,
  role_at_b TEXT,
  interlock_type TEXT NOT NULL DEFAULT 'shared_director',
  nonprofit_org_name TEXT,
  nonprofit_role TEXT,
  political_network TEXT,
  pac_connection BOOLEAN DEFAULT false,
  influence_score NUMERIC,
  evidence_url TEXT,
  source TEXT,
  confidence TEXT DEFAULT 'medium',
  detected_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.healthcare_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gun_industry_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immigration_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_interlocks ENABLE ROW LEVEL SECURITY;

-- Public read
DO $$ BEGIN
  CREATE POLICY "Public read healthcare_signals" ON public.healthcare_signals FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Public read gun_industry_signals" ON public.gun_industry_signals FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Public read immigration_signals" ON public.immigration_signals FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Public read regulatory_violations" ON public.regulatory_violations FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Public read board_interlocks" ON public.board_interlocks FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Admin write
DO $$ BEGIN
  CREATE POLICY "Admin insert healthcare_signals" ON public.healthcare_signals FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Admin insert gun_industry_signals" ON public.gun_industry_signals FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Admin insert immigration_signals" ON public.immigration_signals FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Admin insert regulatory_violations" ON public.regulatory_violations FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Admin insert board_interlocks" ON public.board_interlocks FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Service role write for edge functions
DO $$ BEGIN
  CREATE POLICY "Service insert healthcare_signals" ON public.healthcare_signals FOR INSERT TO service_role WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Service insert gun_industry_signals" ON public.gun_industry_signals FOR INSERT TO service_role WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Service insert immigration_signals" ON public.immigration_signals FOR INSERT TO service_role WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Service insert regulatory_violations" ON public.regulatory_violations FOR INSERT TO service_role WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Service insert board_interlocks" ON public.board_interlocks FOR INSERT TO service_role WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_healthcare_company ON public.healthcare_signals(company_id);
CREATE INDEX IF NOT EXISTS idx_gun_industry_company ON public.gun_industry_signals(company_id);
CREATE INDEX IF NOT EXISTS idx_immigration_company ON public.immigration_signals(company_id);
CREATE INDEX IF NOT EXISTS idx_regulatory_violations_company ON public.regulatory_violations(company_id);
CREATE INDEX IF NOT EXISTS idx_board_interlocks_company_a ON public.board_interlocks(company_a_id);
CREATE INDEX IF NOT EXISTS idx_board_interlocks_company_b ON public.board_interlocks(company_b_id);
CREATE INDEX IF NOT EXISTS idx_board_interlocks_person ON public.board_interlocks(person_name);
