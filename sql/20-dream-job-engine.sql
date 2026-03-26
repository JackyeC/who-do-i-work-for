-- ============================================================
-- Dream Job Engine — Schema Migration
-- WDIWF automated job matching, auto-apply & interview prep
-- ============================================================

-- Stores daily job search results from all boards
CREATE TABLE IF NOT EXISTS dream_job_search_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_id UUID REFERENCES companies(id),
  source TEXT NOT NULL, -- 'linkedin', 'indeed', 'glassdoor', 'ziprecruiter', 'career_page'
  source_url TEXT NOT NULL,
  location TEXT,
  salary_range TEXT,
  work_mode TEXT, -- 'remote', 'hybrid', 'onsite'
  description TEXT,
  posted_date TIMESTAMPTZ,
  -- Matching scores
  skills_match_score NUMERIC(5,2) DEFAULT 0,
  values_match_score NUMERIC(5,2) DEFAULT 0,
  integrity_score NUMERIC(5,2) DEFAULT 0,
  composite_score NUMERIC(5,2) DEFAULT 0,
  matched_values TEXT[],
  matched_skills TEXT[],
  -- Status tracking
  status TEXT DEFAULT 'matched', -- 'matched', 'queued', 'applying', 'applied', 'failed', 'dismissed'
  applied_at TIMESTAMPTZ,
  dossier_generated BOOLEAN DEFAULT FALSE,
  dossier_url TEXT,
  dossier_emailed BOOLEAN DEFAULT FALSE,
  dossier_emailed_at TIMESTAMPTZ,
  -- Metadata
  raw_listing JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated dossier documents
CREATE TABLE IF NOT EXISTS dream_job_dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_result_id UUID NOT NULL REFERENCES dream_job_search_results(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  -- Dossier content sections (stored as JSON for flexibility)
  company_overview JSONB, -- mission, values, culture, leadership, recent news
  integrity_snapshot JSONB, -- WDIWF 4-pillar scores + key findings
  role_analysis JSONB, -- what the role entails, why it matches
  tailored_resume JSONB, -- highlighted skills and adjusted summary
  cover_letter TEXT, -- AI-generated, references Receipts data
  interview_questions JSONB, -- company-specific + role-specific questions
  salary_benchmarks JSONB, -- market data for this role/location
  preparation_checklist JSONB, -- day-of checklist
  references_template TEXT, -- pre-formatted references page
  thank_you_email_draft TEXT, -- post-interview thank you
  follow_up_timeline JSONB, -- when to follow up and how
  -- PDF
  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Application tracking with full history
CREATE TABLE IF NOT EXISTS dream_job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_result_id UUID NOT NULL REFERENCES dream_job_search_results(id),
  dossier_id UUID REFERENCES dream_job_dossiers(id),
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  application_url TEXT,
  application_method TEXT, -- 'auto_linkedin', 'auto_indeed', 'auto_glassdoor', 'manual', 'career_page'
  status TEXT DEFAULT 'pending', -- 'pending', 'submitted', 'viewed', 'interview', 'offer', 'rejected', 'withdrawn'
  submitted_at TIMESTAMPTZ,
  response_received_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email log for dossier delivery
CREATE TABLE IF NOT EXISTS dream_job_email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dossier_id UUID NOT NULL REFERENCES dream_job_dossiers(id),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_djsr_user_status ON dream_job_search_results(user_id, status);
CREATE INDEX IF NOT EXISTS idx_djsr_user_score ON dream_job_search_results(user_id, composite_score DESC);
CREATE INDEX IF NOT EXISTS idx_djd_user ON dream_job_dossiers(user_id);
CREATE INDEX IF NOT EXISTS idx_djd_search_result ON dream_job_dossiers(search_result_id);
CREATE INDEX IF NOT EXISTS idx_dja_user_status ON dream_job_applications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_djel_user ON dream_job_email_log(user_id);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE dream_job_search_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_job_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_job_email_log ENABLE ROW LEVEL SECURITY;

-- Search results
CREATE POLICY "Users can view own search results" ON dream_job_search_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own search results" ON dream_job_search_results FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service can insert search results" ON dream_job_search_results FOR INSERT WITH CHECK (TRUE);

-- Dossiers
CREATE POLICY "Users can view own dossiers" ON dream_job_dossiers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can insert dossiers" ON dream_job_dossiers FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Service can update dossiers" ON dream_job_dossiers FOR UPDATE USING (TRUE);

-- Applications
CREATE POLICY "Users can view own applications" ON dream_job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON dream_job_applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service can insert applications" ON dream_job_applications FOR INSERT WITH CHECK (TRUE);

-- Email log
CREATE POLICY "Users can view own email log" ON dream_job_email_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can insert email log" ON dream_job_email_log FOR INSERT WITH CHECK (TRUE);
