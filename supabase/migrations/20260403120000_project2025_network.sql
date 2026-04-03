-- Neutral Project 2025 contributor/advisory registry linked to companies (public read)

CREATE TABLE IF NOT EXISTS public.project2025_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('person', 'org')),
  primary_role TEXT,
  note TEXT,
  source_url TEXT NOT NULL,
  source_last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project2025_entities_name
  ON public.project2025_entities USING GIN (to_tsvector('simple', name));

CREATE TABLE IF NOT EXISTS public.project2025_company_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES public.project2025_entities(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  relationship_note TEXT,
  evidence_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project2025_company_links_company
  ON public.project2025_company_links (company_id);

CREATE INDEX IF NOT EXISTS idx_project2025_company_links_entity
  ON public.project2025_company_links (entity_id);

ALTER TABLE public.project2025_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project2025_company_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project 2025 entities are publicly readable"
  ON public.project2025_entities FOR SELECT USING (true);

CREATE POLICY "Project 2025 company links are publicly readable"
  ON public.project2025_company_links FOR SELECT USING (true);

CREATE POLICY "Admin manages project2025 entities"
  ON public.project2025_entities FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'owner'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'owner'::public.app_role)
  );

CREATE POLICY "Admin manages project2025 company links"
  ON public.project2025_company_links FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'owner'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'owner'::public.app_role)
  );
