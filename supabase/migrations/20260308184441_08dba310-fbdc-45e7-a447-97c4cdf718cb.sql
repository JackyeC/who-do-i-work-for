
-- Add dismissed_at and snoozed_until to user_alerts for quick actions
ALTER TABLE public.user_alerts 
  ADD COLUMN IF NOT EXISTS dismissed_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS snoozed_until timestamptz DEFAULT NULL;

-- Add notification_categories to user_company_watchlist for per-company preferences
-- (notification_preferences jsonb column already exists, we'll use it)
