CREATE TABLE public.offer_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  outcome_type TEXT NOT NULL DEFAULT 'negotiated_more',
  details TEXT,
  amount_increase INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.offer_outcomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own outcomes" ON public.offer_outcomes
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());