-- Lets logged-in users discover if their email has an early_access_signups row from the founding month
-- (RLS blocks direct SELECT). Used by pricing / Briefing Room Founding Supporters gate.

CREATE OR REPLACE FUNCTION public.is_briefing_room_founding_audience(p_year integer, p_month integer)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.early_access_signups e
    WHERE lower(trim(e.email)) = lower(trim((SELECT u.email::text FROM auth.users u WHERE u.id = auth.uid())))
      AND (extract(year from (e.created_at AT TIME ZONE 'UTC'))::integer = p_year)
      AND (extract(month from (e.created_at AT TIME ZONE 'UTC'))::integer = p_month)
  );
$$;

REVOKE ALL ON FUNCTION public.is_briefing_room_founding_audience(integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_briefing_room_founding_audience(integer, integer) TO authenticated;
