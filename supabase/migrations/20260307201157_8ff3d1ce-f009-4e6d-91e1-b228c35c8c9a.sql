
CREATE TABLE public.company_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  employment_type TEXT DEFAULT 'full-time',
  description TEXT,
  url TEXT,
  salary_range TEXT,
  posted_at TIMESTAMP WITH TIME ZONE,
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.company_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jobs are publicly readable" ON public.company_jobs
  FOR SELECT USING (true);

CREATE INDEX idx_company_jobs_company_id ON public.company_jobs(company_id);
CREATE INDEX idx_company_jobs_is_active ON public.company_jobs(is_active);
