
CREATE TABLE public.organization_profile_enrichment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  source_name text NOT NULL DEFAULT 'OpenSecrets',
  source_type text NOT NULL DEFAULT 'third_party_summary',
  profile_url text,
  opensecrets_org_name text,
  opensecrets_org_identifier text,
  contributions_total numeric,
  lobbying_total numeric,
  outside_spending_total numeric,
  party_split_json jsonb,
  top_recipients_json jsonb,
  pac_names_json jsonb,
  industry_label text,
  sector_label text,
  issue_tags text[],
  source_note text,
  source_release_date text,
  confidence_score numeric DEFAULT 0.5,
  verification_status text NOT NULL DEFAULT 'unverified_opensecrets_only',
  cross_check_results jsonb,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_verification_status CHECK (verification_status IN ('unverified_opensecrets_only', 'cross_checked_primary_source', 'partially_verified', 'failed_match'))
);

CREATE INDEX idx_org_enrichment_company ON public.organization_profile_enrichment(company_id);
CREATE INDEX idx_org_enrichment_source ON public.organization_profile_enrichment(source_name);

ALTER TABLE public.organization_profile_enrichment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read enrichment data"
  ON public.organization_profile_enrichment
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TRIGGER update_org_enrichment_updated_at
  BEFORE UPDATE ON public.organization_profile_enrichment
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
