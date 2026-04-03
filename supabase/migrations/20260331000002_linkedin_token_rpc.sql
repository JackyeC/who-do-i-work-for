-- ============================================================
-- SECURITY: RPC function to retrieve LinkedIn token server-side only
--
-- This function is SECURITY DEFINER (runs as the function owner,
-- not the calling user), so it bypasses RLS.
-- It should ONLY be called from edge functions via service_role.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_linkedin_token(p_user_id UUID)
RETURNS TABLE (
  linkedin_id TEXT,
  access_token TEXT,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Only allow service_role to call this function
  IF current_setting('request.jwt.claim.role', true) != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: service_role required';
  END IF;

  RETURN QUERY
    SELECT
      lp.linkedin_id,
      lp.access_token,
      lp.expires_at
    FROM public.linkedin_profiles lp
    WHERE lp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Revoke direct execution from authenticated users
REVOKE EXECUTE ON FUNCTION public.get_linkedin_token(UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_linkedin_token(UUID) TO service_role;
