ALTER TABLE public.user_values_profile
  ADD COLUMN IF NOT EXISTS ai_ethics_importance integer DEFAULT 50,
  ADD COLUMN IF NOT EXISTS political_donations_importance integer DEFAULT 50,
  ADD COLUMN IF NOT EXISTS lobbying_activity_importance integer DEFAULT 50,
  ADD COLUMN IF NOT EXISTS international_trade_importance integer DEFAULT 50;