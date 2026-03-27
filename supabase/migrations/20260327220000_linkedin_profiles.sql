-- LinkedIn OAuth profiles for WDIWF users
CREATE TABLE public.linkedin_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  linkedin_id text NOT NULL,
  name text,
  email text,
  profile_url text,
  profile_picture_url text,
  access_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(linkedin_id)
);

-- RLS
ALTER TABLE public.linkedin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own LinkedIn profile"
  ON public.linkedin_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own LinkedIn profile"
  ON public.linkedin_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can do everything (for edge functions)
CREATE POLICY "Service role full access"
  ON public.linkedin_profiles FOR ALL
  USING (auth.role() = 'service_role');
