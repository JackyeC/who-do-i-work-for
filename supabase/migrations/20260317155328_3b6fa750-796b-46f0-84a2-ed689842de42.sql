
-- Career Intelligence waitlist
CREATE TABLE public.career_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  UNIQUE(email)
);

ALTER TABLE public.career_waitlist ENABLE ROW LEVEL SECURITY;

-- Users can see their own entry
CREATE POLICY "Users can view own waitlist entry"
  ON public.career_waitlist FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own entry
CREATE POLICY "Users can join waitlist"
  ON public.career_waitlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all entries
CREATE POLICY "Admins can manage waitlist"
  ON public.career_waitlist FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
