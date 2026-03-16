
-- Table 1: Corporate Claims (extracted from ESG reports, press releases, etc.)
CREATE TABLE public.company_corporate_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  claim_text TEXT NOT NULL,
  claim_source TEXT NOT NULL DEFAULT 'unknown',
  claim_source_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  extracted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  extraction_method TEXT NOT NULL DEFAULT 'manual',
  is_approved BOOLEAN NOT NULL DEFAULT false,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.company_corporate_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved claims"
  ON public.company_corporate_claims FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Admins can manage claims"
  ON public.company_corporate_claims FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Table 2: Per-category alignment scores
CREATE TABLE public.company_alignment_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  alignment_score INTEGER NOT NULL DEFAULT 50,
  alignment_level TEXT NOT NULL DEFAULT 'Mixed',
  claim_count INTEGER NOT NULL DEFAULT 0,
  signal_count INTEGER NOT NULL DEFAULT 0,
  last_calculated TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, category)
);

ALTER TABLE public.company_alignment_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read alignment categories"
  ON public.company_alignment_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage alignment categories"
  ON public.company_alignment_categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_corporate_claims_company ON public.company_corporate_claims(company_id);
CREATE INDEX idx_corporate_claims_category ON public.company_corporate_claims(category);
CREATE INDEX idx_alignment_categories_company ON public.company_alignment_categories(company_id);
