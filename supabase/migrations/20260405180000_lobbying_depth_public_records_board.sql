-- Documented public-record items (primary-source editorial rows; not mixed with lobbying signals)
CREATE TABLE IF NOT EXISTS public.company_public_record_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  neutral_summary TEXT NOT NULL,
  record_type TEXT NOT NULL,
  primary_source_url TEXT NOT NULL,
  source_label TEXT,
  published_at TIMESTAMPTZ,
  confidence TEXT NOT NULL DEFAULT 'medium',
  related_person_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_public_record_items_company
  ON public.company_public_record_items(company_id);

ALTER TABLE public.company_public_record_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_public_record_items_select_public"
  ON public.company_public_record_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "company_public_record_items_admin_write"
  ON public.company_public_record_items FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'owner'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'owner'::public.app_role)
  );

-- Microsoft Corporation: board snapshot from public proxy-style disclosures (verify against latest DEF 14A).
-- Former: Bill Gates stepped down March 13, 2020 (public filings / press).
INSERT INTO public.board_members (
  company_id, name, title, is_independent, verification_status, source, last_verified_at, departed_at
)
SELECT c.id, v.name, v.title, v.is_independent, 'verified', 'Seed: Microsoft proxy / public disclosures', now(), v.departed_at
FROM public.companies c
CROSS JOIN (VALUES
  ('Satya Nadella', 'Chairman and Chief Executive Officer', false, NULL::timestamptz),
  ('Reid Hoffman', 'Partner, Greylock Partners', true, NULL::timestamptz),
  ('Hugh F. Johnston', 'Vice Chairman and Chief Financial Officer, PepsiCo', true, NULL::timestamptz),
  ('Teri L. List-Stoll', 'Former Executive Vice President and Chief Financial Officer', true, NULL::timestamptz),
  ('Sandra E. Peterson', 'Operating Partner, Clayton, Dubilier & Rice', true, NULL::timestamptz),
  ('Penny S. Pritzker', 'Founder and Chairman, PSP Partners', true, NULL::timestamptz),
  ('Carlos A. Rodriguez', 'President and Chief Executive Officer, ADP', true, NULL::timestamptz),
  ('John W. Stanton', 'Chairman, Trilogy Partnerships', true, NULL::timestamptz),
  ('Emma N. Walmsley', 'Chief Executive Officer, GSK', true, NULL::timestamptz),
  ('Bill Gates', 'Co-founder; Director (historical)', false, '2020-03-13'::timestamptz)
) AS v(name, title, is_independent, departed_at)
WHERE c.slug = 'microsoft'
  AND NOT EXISTS (
    SELECT 1 FROM public.board_members bm
    WHERE bm.company_id = c.id AND bm.name = v.name
  );
