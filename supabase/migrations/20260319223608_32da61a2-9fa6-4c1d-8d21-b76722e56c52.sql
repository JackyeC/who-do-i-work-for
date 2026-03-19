DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'waitlist_role'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.waitlist_role AS ENUM ('candidate', 'recruiter', 'employer');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.waitlist (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  role public.waitlist_role NOT NULL
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;
CREATE POLICY "Anyone can join waitlist"
ON public.waitlist
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read waitlist" ON public.waitlist;
CREATE POLICY "Admins can read waitlist"
ON public.waitlist
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));