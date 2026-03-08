
-- Table to track Browse AI monitoring robots per company page
CREATE TABLE IF NOT EXISTS public.browse_ai_monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  page_type TEXT NOT NULL, -- 'careers', 'benefits', 'leadership', 'esg', 'political_disclosure', 'job_listings'
  page_url TEXT NOT NULL,
  browse_ai_robot_id TEXT, -- Browse AI robot ID once created
  browse_ai_task_id TEXT, -- Latest task ID
  last_checked_at TIMESTAMPTZ,
  last_change_detected_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'paused', 'error'
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, page_type)
);

-- Enable RLS
ALTER TABLE public.browse_ai_monitors ENABLE ROW LEVEL SECURITY;

-- Public read access (monitoring data is non-sensitive)
CREATE POLICY "Browse AI monitors are publicly readable"
ON public.browse_ai_monitors FOR SELECT
USING (true);

-- Table for change detection events from Browse AI webhooks
CREATE TABLE IF NOT EXISTS public.browse_ai_change_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id UUID NOT NULL REFERENCES public.browse_ai_monitors(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  page_type TEXT NOT NULL,
  change_summary TEXT,
  raw_payload JSONB DEFAULT '{}'::jsonb,
  signal_modules_triggered TEXT[] DEFAULT '{}',
  processing_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.browse_ai_change_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Change events are publicly readable"
ON public.browse_ai_change_events FOR SELECT
USING (true);

-- Enable realtime for change events so watchers get notified
ALTER PUBLICATION supabase_realtime ADD TABLE public.browse_ai_change_events;
