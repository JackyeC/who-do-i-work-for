
-- 1. Create signal_change_events table
CREATE TABLE public.signal_change_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  signal_category text NOT NULL,
  change_type text NOT NULL DEFAULT 'new_signal',
  change_description text,
  confidence_level text NOT NULL DEFAULT 'moderate_inference',
  source_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.signal_change_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signal change events are publicly readable"
  ON public.signal_change_events FOR SELECT
  USING (true);

-- 2. Add notification_preferences to watchlist
ALTER TABLE public.user_company_watchlist
  ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"new_signals": true, "confidence_changes": true, "hiring_tech": true, "influence_signals": true}'::jsonb;

-- 3. Trigger function: when a signal_change_event is inserted, create alerts for all watchers
CREATE OR REPLACE FUNCTION public.notify_watchers_on_signal_change()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_alerts (user_id, company_id, company_name, signal_category, change_type, change_description, date_detected)
  SELECT
    w.user_id,
    NEW.company_id,
    c.name,
    NEW.signal_category,
    NEW.change_type,
    COALESCE(NEW.change_description, 'Signal detected from publicly available sources.'),
    NEW.created_at
  FROM public.user_company_watchlist w
  JOIN public.companies c ON c.id = NEW.company_id
  WHERE w.company_id = NEW.company_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_watchers_on_signal_change
  AFTER INSERT ON public.signal_change_events
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_watchers_on_signal_change();

-- 4. Enable realtime for alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_alerts;
