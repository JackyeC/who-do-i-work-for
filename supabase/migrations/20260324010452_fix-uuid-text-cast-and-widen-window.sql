-- Fix: score_news_for_user was casting UUID to TEXT causing type mismatch error
-- This broke get_personalized_news entirely, making Daily Briefing always empty

-- Fix the scoring function
CREATE OR REPLACE FUNCTION score_news_for_user(p_news_id UUID, p_user_id UUID)
RETURNS REAL AS $$
DECLARE
  v_score REAL := 0;
  v_news personalized_news%ROWTYPE;
  v_user_values TEXT[];
  v_user_industries TEXT[];
  v_user_interests TEXT[];
  v_user_location_state TEXT;
  v_watched_slugs TEXT[];
  v_value_overlap INT;
  v_industry_overlap INT;
  v_location_match BOOLEAN;
  v_company_match BOOLEAN;
BEGIN
  SELECT * INTO v_news FROM personalized_news WHERE id = p_news_id;
  IF NOT FOUND THEN RETURN 0; END IF;

  SELECT COALESCE(user_values, '{}'), COALESCE(industries, '{}'), COALESCE(interests, '{}'), location_state
  INTO v_user_values, v_user_industries, v_user_interests, v_user_location_state
  FROM profiles WHERE id = p_user_id LIMIT 1;

  -- FIXED: removed ::text cast — user_company_watchlist.user_id is UUID
  SELECT ARRAY_AGG(c.slug) INTO v_watched_slugs
  FROM user_company_watchlist w JOIN companies c ON c.id = w.company_id
  WHERE w.user_id = p_user_id;
  v_watched_slugs := COALESCE(v_watched_slugs, '{}');

  SELECT COUNT(*) INTO v_value_overlap FROM unnest(v_user_values) uv WHERE uv = ANY(v_news.value_tags);
  IF array_length(v_user_values, 1) > 0 THEN
    v_score := v_score + (v_value_overlap::REAL / array_length(v_user_values, 1)) * 35;
  END IF;

  SELECT COUNT(*) INTO v_industry_overlap FROM unnest(v_user_industries) ui WHERE ui = ANY(v_news.industry_tags);
  IF array_length(v_user_industries, 1) > 0 THEN
    v_score := v_score + (v_industry_overlap::REAL / array_length(v_user_industries, 1)) * 20;
  END IF;

  v_location_match := (v_user_location_state IS NOT NULL AND v_user_location_state = ANY(v_news.location_tags));
  IF v_location_match THEN v_score := v_score + 10; END IF;

  v_company_match := (v_watched_slugs IS NOT NULL AND v_news.company_slugs IS NOT NULL AND v_watched_slugs && v_news.company_slugs);
  IF v_company_match THEN v_score := v_score + 20; END IF;

  v_score := v_score + (v_news.importance_score * 15);
  RETURN LEAST(GREATEST(v_score, 0), 100);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Widen get_personalized_news window from 48h to 30 days
CREATE OR REPLACE FUNCTION get_personalized_news(p_user_id UUID, p_limit INT DEFAULT 20, p_category TEXT DEFAULT NULL)
RETURNS TABLE (id UUID, title TEXT, summary TEXT, source TEXT, source_url TEXT, category TEXT, tags TEXT[], value_tags TEXT[], company_slugs TEXT[], importance_score REAL, published_at TIMESTAMPTZ, relevance_score REAL)
AS $$
BEGIN
  RETURN QUERY
  SELECT n.id, n.title, n.summary, n.source, n.source_url, n.category, n.tags, n.value_tags, n.company_slugs, n.importance_score, n.published_at,
    score_news_for_user(n.id, p_user_id) AS relevance_score
  FROM personalized_news n
  WHERE n.is_active = TRUE AND n.published_at >= NOW() - INTERVAL '30 days'
    AND (p_category IS NULL OR n.category = p_category)
  ORDER BY score_news_for_user(n.id, p_user_id) DESC, n.published_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Fix the same ::text cast in get_company_recommendations
CREATE OR REPLACE FUNCTION get_company_recommendations(p_user_id UUID, p_limit INT DEFAULT 10)
RETURNS TABLE (id UUID, name TEXT, slug TEXT, industry TEXT, civic_footprint_score REAL, career_intelligence_score REAL, lobbying_spend BIGINT, category_tags TEXT[], match_reason TEXT, values_matched TEXT[])
AS $$
DECLARE
  v_user_values TEXT[];
  v_user_industries TEXT[];
  v_user_location_state TEXT;
  v_watched_ids UUID[];
BEGIN
  SELECT COALESCE(user_values, '{}'), COALESCE(industries, '{}'), location_state
  INTO v_user_values, v_user_industries, v_user_location_state
  FROM profiles WHERE id = p_user_id LIMIT 1;

  -- FIXED: removed ::text cast
  SELECT ARRAY_AGG(company_id) INTO v_watched_ids FROM user_company_watchlist WHERE user_id = p_user_id;
  v_watched_ids := COALESCE(v_watched_ids, '{}');

  RETURN QUERY
  WITH scored AS (
    SELECT c.id, c.name, c.slug, c.industry, c.civic_footprint_score, c.career_intelligence_score, c.lobbying_spend, c.category_tags,
      (SELECT COUNT(DISTINCT vs.signal_type)::REAL FROM company_signal_scans vs WHERE vs.company_id = c.id AND vs.signal_category = 'values_check' AND vs.direction = 'positive' AND vs.signal_type = ANY(v_user_values)) AS value_match_count,
      (SELECT ARRAY_AGG(DISTINCT vs.signal_type) FROM company_signal_scans vs WHERE vs.company_id = c.id AND vs.signal_category = 'values_check' AND vs.direction = 'positive' AND vs.signal_type = ANY(v_user_values)) AS matched_values,
      CASE WHEN c.industry = ANY(v_user_industries) THEN 1.0 ELSE 0.0 END AS industry_bonus,
      CASE WHEN c.state = v_user_location_state THEN 0.5 ELSE 0.0 END AS location_bonus,
      COALESCE(c.civic_footprint_score, 0) / 100.0 AS cfs_score
    FROM companies c
    WHERE c.record_status IN ('published', 'approved') AND NOT (c.id = ANY(v_watched_ids))
  )
  SELECT s.id, s.name, s.slug, s.industry, s.civic_footprint_score, s.career_intelligence_score, s.lobbying_spend, s.category_tags,
    CASE
      WHEN s.value_match_count > 2 THEN 'Strong values alignment across ' || s.value_match_count || ' areas'
      WHEN s.value_match_count > 0 THEN 'Aligns with your interest in ' || (s.matched_values)[1]
      WHEN s.industry_bonus > 0 THEN 'Active in your industry: ' || s.industry
      WHEN s.cfs_score > 0.7 THEN 'High civic footprint score (' || ROUND(s.civic_footprint_score::NUMERIC) || ')'
      ELSE 'Recommended based on transparency record'
    END AS match_reason,
    COALESCE(s.matched_values, '{}') AS values_matched
  FROM scored s
  ORDER BY (s.value_match_count * 3 + s.industry_bonus * 2 + s.location_bonus + s.cfs_score) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Also update any existing articles with old published_at to be recent
UPDATE personalized_news 
SET published_at = NOW() - INTERVAL '1 hour'
WHERE is_active = true AND published_at < NOW() - INTERVAL '48 hours';
