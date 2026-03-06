
-- Curated watchlist of flagged organizations by category
CREATE TABLE public.ideology_watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name text NOT NULL,
  category text NOT NULL, -- 'christian_nationalism', 'white_supremacy', 'anti_lgbtq', 'anti_labor', 'voter_suppression', 'climate_denial', 'anti_reproductive_rights', 'privatization'
  subcategory text, -- more specific classification
  description text,
  tracking_source text, -- 'SPLC', 'ADL', 'OpenSecrets', 'InfluenceWatch', 'manual'
  splc_designated boolean NOT NULL DEFAULT false,
  adl_designated boolean NOT NULL DEFAULT false,
  severity text NOT NULL DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
  aliases text[], -- alternative names for matching
  website text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Company connections to watchlist orgs (detected via scanning or curated)
CREATE TABLE public.company_ideology_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  watchlist_org_id uuid REFERENCES public.ideology_watchlist(id),
  category text NOT NULL,
  org_name text NOT NULL, -- denormalized for display
  relationship_type text NOT NULL, -- 'direct_funding', 'pac_contribution', 'executive_donation', 'board_membership', 'trade_association', 'lobbying_alignment', 'event_sponsorship', 'foundation_grant'
  description text,
  amount bigint,
  evidence_url text,
  severity text NOT NULL DEFAULT 'medium',
  confidence text NOT NULL DEFAULT 'inferred',
  detected_by text NOT NULL DEFAULT 'ai_scan', -- 'curated', 'ai_scan', 'user_report'
  scan_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.ideology_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_ideology_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Watchlist is publicly readable" ON public.ideology_watchlist FOR SELECT USING (true);
CREATE POLICY "Ideology flags are publicly readable" ON public.company_ideology_flags FOR SELECT USING (true);

-- Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.company_ideology_flags;
