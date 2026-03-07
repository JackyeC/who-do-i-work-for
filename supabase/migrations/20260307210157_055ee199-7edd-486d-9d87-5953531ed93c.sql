
CREATE TABLE public.ai_hr_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  signal_type text NOT NULL,
  signal_category text NOT NULL,
  tool_name text,
  vendor_name text,
  source_url text,
  source_type text,
  evidence_text text,
  detection_method text NOT NULL DEFAULT 'keyword_detection',
  confidence text NOT NULL DEFAULT 'moderate_inference',
  date_detected timestamp with time zone NOT NULL DEFAULT now(),
  last_verified timestamp with time zone,
  status text NOT NULL DEFAULT 'auto_detected',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_hr_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AI HR signals are publicly readable"
  ON public.ai_hr_signals
  FOR SELECT
  USING (true);

CREATE INDEX idx_ai_hr_signals_company_id ON public.ai_hr_signals(company_id);
CREATE INDEX idx_ai_hr_signals_status ON public.ai_hr_signals(status);
