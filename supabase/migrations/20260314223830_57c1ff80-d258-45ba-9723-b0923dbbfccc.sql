
-- Public Records & Network Exposure table
-- SENSITIVE: Association data must be phrased conservatively, sourced clearly, and displayed with contextual disclaimers.
-- The system should optimize for trust, defensibility, and user understanding.

CREATE TYPE public.documentation_strength AS ENUM ('high', 'medium', 'low');

CREATE TYPE public.network_relationship_type AS ENUM (
  'banking_relationship',
  'executive_or_founder_mention',
  'legal_settlement',
  'regulator_action',
  'account_holder_report',
  'donation_or_funding_link',
  'institutional_association',
  'testimony_or_deposition',
  'media_report_with_document_basis',
  'no_confirmed_company_level_evidence'
);

CREATE TABLE public.epstein_entity_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_name TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT 'company',
  parent_company TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  source_type TEXT NOT NULL,
  source_title TEXT NOT NULL,
  source_url TEXT,
  document_date DATE,
  relationship_type network_relationship_type NOT NULL,
  person_linked TEXT,
  summary TEXT NOT NULL,
  verbatim_excerpt TEXT,
  confidence_level documentation_strength NOT NULL DEFAULT 'low',
  risk_tier TEXT NOT NULL DEFAULT 'informational',
  disclaimer_required BOOLEAN NOT NULL DEFAULT true,
  last_reviewed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_epstein_entity_links_company_id ON public.epstein_entity_links(company_id);
CREATE INDEX idx_epstein_entity_links_entity_name ON public.epstein_entity_links(entity_name);
CREATE INDEX idx_epstein_entity_links_confidence ON public.epstein_entity_links(confidence_level);

-- RLS: public read (this is public records data), admin write
ALTER TABLE public.epstein_entity_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for epstein_entity_links"
  ON public.epstein_entity_links
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admin insert for epstein_entity_links"
  ON public.epstein_entity_links
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin update for epstein_entity_links"
  ON public.epstein_entity_links
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin delete for epstein_entity_links"
  ON public.epstein_entity_links
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_epstein_entity_links_updated_at
  BEFORE UPDATE ON public.epstein_entity_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
