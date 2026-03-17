
-- Create enum for family model types
CREATE TYPE public.family_model_type AS ENUM ('traditional', 'progressive');

-- Create company_family_tags table
CREATE TABLE public.company_family_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_model family_model_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, user_id)
);

-- Enable RLS
ALTER TABLE public.company_family_tags ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read tags (aggregate counts are public)
CREATE POLICY "Authenticated users can read family tags"
  ON public.company_family_tags
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own tags
CREATE POLICY "Users can insert own family tags"
  ON public.company_family_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tags
CREATE POLICY "Users can update own family tags"
  ON public.company_family_tags
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own tags
CREATE POLICY "Users can delete own family tags"
  ON public.company_family_tags
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
