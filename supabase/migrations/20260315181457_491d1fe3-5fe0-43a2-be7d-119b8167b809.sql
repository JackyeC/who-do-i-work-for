
-- Table for OpenSanctions screening results
CREATE TABLE public.company_sanctions_screening (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  entity_name TEXT NOT NULL,
  match_type TEXT NOT NULL DEFAULT 'company',
  schema_type TEXT,
  sanctions_list TEXT,
  dataset TEXT,
  topics TEXT[],
  match_score NUMERIC DEFAULT 0,
  properties JSONB DEFAULT '{}',
  source_url TEXT,
  first_seen TEXT,
  last_seen TEXT,
  screened_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sanctions_company ON public.company_sanctions_screening(company_id);
ALTER TABLE public.company_sanctions_screening ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sanctions screening"
  ON public.company_sanctions_screening FOR SELECT USING (true);
CREATE POLICY "Authenticated inserts sanctions"
  ON public.company_sanctions_screening FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated updates sanctions"
  ON public.company_sanctions_screening FOR UPDATE TO authenticated USING (true);

-- Table for Wikidata enrichment
CREATE TABLE public.company_wikidata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL DEFAULT 'company',
  entity_name TEXT NOT NULL,
  wikidata_id TEXT,
  description TEXT,
  founded_year INT,
  headquarters TEXT,
  industry_wikidata TEXT,
  parent_org TEXT,
  subsidiary_count INT,
  employee_count_wikidata TEXT,
  revenue_wikidata TEXT,
  stock_exchange TEXT,
  official_website TEXT,
  properties JSONB DEFAULT '{}',
  fetched_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, wikidata_id)
);

CREATE INDEX idx_wikidata_company ON public.company_wikidata(company_id);
ALTER TABLE public.company_wikidata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read wikidata"
  ON public.company_wikidata FOR SELECT USING (true);
CREATE POLICY "Authenticated inserts wikidata"
  ON public.company_wikidata FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated updates wikidata"
  ON public.company_wikidata FOR UPDATE TO authenticated USING (true);
