
-- Board members table
CREATE TABLE public.board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Board Member',
  photo_url TEXT,
  start_year INTEGER,
  previous_company TEXT,
  committees TEXT[] DEFAULT '{}',
  is_independent BOOLEAN DEFAULT true,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Board members are publicly readable"
  ON public.board_members FOR SELECT TO anon, authenticated
  USING (true);

-- Leader follows table
CREATE TABLE public.leader_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  leader_type TEXT NOT NULL CHECK (leader_type IN ('executive', 'board_member')),
  leader_id UUID NOT NULL,
  leader_name TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, leader_type, leader_id)
);

ALTER TABLE public.leader_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own follows"
  ON public.leader_follows FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
