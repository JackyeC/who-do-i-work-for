
CREATE TABLE public.vibe_match_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  job_title TEXT,
  interview_date DATE,
  
  -- Section 1: Leadership & Transparency
  success_clarity INTEGER NOT NULL DEFAULT 50 CHECK (success_clarity >= 0 AND success_clarity <= 100),
  challenge_consistency INTEGER NOT NULL DEFAULT 50 CHECK (challenge_consistency >= 0 AND challenge_consistency <= 100),
  
  -- Section 2: Inclusion & Cultural Logic
  panel_diversity INTEGER NOT NULL DEFAULT 50 CHECK (panel_diversity >= 0 AND panel_diversity <= 100),
  boundary_reaction INTEGER NOT NULL DEFAULT 50 CHECK (boundary_reaction >= 0 AND boundary_reaction <= 100),
  
  -- Section 3: Red Flag Radar
  predecessor_respect INTEGER NOT NULL DEFAULT 50 CHECK (predecessor_respect >= 0 AND predecessor_respect <= 100),
  process_organization INTEGER NOT NULL DEFAULT 50 CHECK (process_organization >= 0 AND process_organization <= 100),
  
  -- Computed scores
  overall_vibe_score INTEGER,
  reality_gap_score INTEGER,
  
  -- AI analysis
  advisor_analysis TEXT,
  
  -- Notes
  additional_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vibe_match_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own responses"
  ON public.vibe_match_responses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own responses"
  ON public.vibe_match_responses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own responses"
  ON public.vibe_match_responses FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own responses"
  ON public.vibe_match_responses FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
