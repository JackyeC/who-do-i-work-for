-- Persistent recognition badges (Founding Member #1, future campaigns, etc.). Does not expire.

CREATE TABLE IF NOT EXISTS public.user_recognition_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  badge_key text NOT NULL,
  member_number integer,
  title text,
  subtitle text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_recognition_badges_user_key UNIQUE (user_id, badge_key)
);

CREATE INDEX IF NOT EXISTS idx_user_recognition_badges_user_id ON public.user_recognition_badges (user_id);

ALTER TABLE public.user_recognition_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own recognition badges" ON public.user_recognition_badges;
CREATE POLICY "Users read own recognition badges"
  ON public.user_recognition_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage recognition badges" ON public.user_recognition_badges;
CREATE POLICY "Admins manage recognition badges"
  ON public.user_recognition_badges FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'owner'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'owner'::public.app_role)
  );

-- Founder: Founding Member #1 (adjust email in migration if needed)
INSERT INTO public.user_recognition_badges (user_id, badge_key, member_number, title, subtitle, sort_order)
SELECT
  id,
  'founding_member',
  1,
  'Founding Member',
  'Badge #1 — home base for career intelligence, support, and the best public-record resources as we grow.',
  0
FROM auth.users
WHERE lower(trim(email)) = lower(trim('jackyeclayton@gmail.com'))
ON CONFLICT (user_id, badge_key) DO NOTHING;
