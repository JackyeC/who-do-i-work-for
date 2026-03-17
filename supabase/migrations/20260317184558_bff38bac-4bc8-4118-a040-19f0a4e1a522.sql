
CREATE TABLE public.company_dossiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL UNIQUE,
  score numeric NOT NULL DEFAULT 5.0,
  risk_level text NOT NULL DEFAULT 'Moderate',
  confidence text NOT NULL DEFAULT 'Medium',
  insights text[] NOT NULL DEFAULT '{}',
  fit_signals text[] NOT NULL DEFAULT '{}',
  risk_signals text[] NOT NULL DEFAULT '{}',
  bottom_line text,
  sources_note text DEFAULT 'SEC filings, WARN notices, workforce data, compensation benchmarks, employee sentiment signals',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.company_dossiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read dossiers"
  ON public.company_dossiers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage dossiers"
  ON public.company_dossiers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_company_dossiers_updated_at
  BEFORE UPDATE ON public.company_dossiers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
