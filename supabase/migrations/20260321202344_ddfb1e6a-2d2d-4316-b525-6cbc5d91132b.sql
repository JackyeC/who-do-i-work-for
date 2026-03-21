
CREATE TABLE public.audit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  company_url TEXT,
  role_title TEXT,
  email TEXT NOT NULL,
  user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous) to insert
CREATE POLICY "Anyone can submit audit requests"
  ON public.audit_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Users can see their own requests
CREATE POLICY "Users can view own audit requests"
  ON public.audit_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
