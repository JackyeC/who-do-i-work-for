
-- ═══════════════════════════════════════════════════════════════════
-- 1. CONNECTIVE TISSUE: Entity Linkage Table (Knowledge Graph)
-- ═══════════════════════════════════════════════════════════════════

CREATE TYPE public.link_type AS ENUM (
  'donation_to_member',
  'member_on_committee', 
  'committee_oversight_of_contract',
  'lobbying_on_bill',
  'revolving_door',
  'foundation_grant_to_district',
  'trade_association_lobbying',
  'dark_money_channel',
  'advisory_committee_appointment',
  'interlocking_directorate',
  'state_lobbying_contract',
  'international_influence'
);

CREATE TABLE public.entity_linkages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  source_entity_type TEXT NOT NULL,
  source_entity_name TEXT NOT NULL,
  source_entity_id TEXT,
  target_entity_type TEXT NOT NULL,
  target_entity_name TEXT NOT NULL,
  target_entity_id TEXT,
  link_type public.link_type NOT NULL,
  confidence_score NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  amount BIGINT DEFAULT NULL,
  description TEXT,
  source_citation JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.entity_linkages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Entity linkages are publicly readable" ON public.entity_linkages FOR SELECT USING (true);

CREATE INDEX idx_entity_linkages_company ON public.entity_linkages(company_id);
CREATE INDEX idx_entity_linkages_link_type ON public.entity_linkages(link_type);

-- ═══════════════════════════════════════════════════════════════════
-- 2. STATE-LEVEL LOBBYING
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE public.company_state_lobbying (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  state TEXT NOT NULL,
  lobbying_spend BIGINT NOT NULL DEFAULT 0,
  issues TEXT[] DEFAULT '{}',
  lobbyist_count INTEGER DEFAULT 0,
  state_contracts_value BIGINT DEFAULT NULL,
  year INTEGER NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.company_state_lobbying ENABLE ROW LEVEL SECURITY;
CREATE POLICY "State lobbying is publicly readable" ON public.company_state_lobbying FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════════════
-- 3. FOUNDATION GRANTS (Philanthropy as Influence)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE public.company_foundation_grants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  foundation_name TEXT NOT NULL,
  recipient_org TEXT NOT NULL,
  amount BIGINT NOT NULL DEFAULT 0,
  year INTEGER NOT NULL,
  recipient_district TEXT,
  relevant_committee TEXT,
  political_relevance TEXT,
  confidence TEXT NOT NULL DEFAULT 'inferred',
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.company_foundation_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Foundation grants are publicly readable" ON public.company_foundation_grants FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════════════
-- 4. FEDERAL ADVISORY COMMITTEES (expand revolving door concept)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE public.company_advisory_committees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  person TEXT NOT NULL,
  title_at_company TEXT NOT NULL,
  committee_name TEXT NOT NULL,
  agency TEXT NOT NULL,
  appointment_year INTEGER,
  regulatory_relevance TEXT,
  confidence TEXT NOT NULL DEFAULT 'direct',
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.company_advisory_committees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Advisory committees are publicly readable" ON public.company_advisory_committees FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════════════
-- 5. INTERNATIONAL INFLUENCE
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE public.company_international_influence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  country TEXT NOT NULL,
  influence_type TEXT NOT NULL,
  description TEXT,
  amount BIGINT DEFAULT NULL,
  entity_name TEXT,
  registry_source TEXT,
  confidence TEXT NOT NULL DEFAULT 'inferred',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.company_international_influence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "International influence is publicly readable" ON public.company_international_influence FOR SELECT USING (true);
