DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;
CREATE POLICY "Anyone can join waitlist"
ON public.waitlist
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(email)) > 3
  AND position('@' in email) > 1
  AND position('.' in split_part(email, '@', 2)) > 0
  AND role IN ('candidate'::public.waitlist_role, 'recruiter'::public.waitlist_role, 'employer'::public.waitlist_role)
);