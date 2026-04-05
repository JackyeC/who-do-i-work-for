-- Who should see the Founding Member card: explicit badge row OR any /join early_access_signups email match.
-- Member # for join-list users = chronological order among early_access_signups (first signup = #1).

CREATE OR REPLACE FUNCTION public.get_founding_member_badge_info()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  uemail text;
  badge_num int;
  join_ts timestamptz;
  rank_num int;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('eligible', false);
  END IF;

  SELECT lower(trim(u.email::text)) INTO uemail FROM auth.users u WHERE u.id = uid;
  IF uemail IS NULL OR uemail = '' THEN
    RETURN jsonb_build_object('eligible', false);
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.user_recognition_badges b
    WHERE b.user_id = uid AND b.badge_key = 'founding_member'
  ) THEN
    SELECT b.member_number INTO badge_num
    FROM public.user_recognition_badges b
    WHERE b.user_id = uid AND b.badge_key = 'founding_member'
    LIMIT 1;
    RETURN jsonb_build_object(
      'eligible', true,
      'member_number', COALESCE(badge_num, 1)
    );
  END IF;

  SELECT e.created_at INTO join_ts
  FROM public.early_access_signups e
  WHERE lower(trim(e.email)) = uemail
  LIMIT 1;

  IF join_ts IS NULL THEN
    RETURN jsonb_build_object('eligible', false);
  END IF;

  SELECT COUNT(*)::int INTO rank_num
  FROM public.early_access_signups e1
  WHERE e1.created_at <= join_ts;

  RETURN jsonb_build_object(
    'eligible', true,
    'member_number', GREATEST(rank_num, 1)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_founding_member_badge_info() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_founding_member_badge_info() TO authenticated;
