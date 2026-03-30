-- ============================================================
-- FEATURE: Auto-detect employer from email domain
--
-- When a user signs up with jane@boeing.com, we extract
-- "boeing.com", match it to a company, and auto-set their
-- employer_company_id. Instant personalized dashboard.
-- ============================================================

-- 1. Company domains mapping table
CREATE TABLE IF NOT EXISTS public.company_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,  -- e.g. "boeing.com", "google.com"
  is_primary BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(domain)
);

CREATE INDEX idx_company_domains_domain ON public.company_domains(domain);
CREATE INDEX idx_company_domains_company ON public.company_domains(company_id);

ALTER TABLE public.company_domains ENABLE ROW LEVEL SECURITY;

-- Anyone can read domains (needed for signup flow)
CREATE POLICY "Anyone can read company domains"
  ON public.company_domains FOR SELECT
  USING (true);

-- Only admins can manage domains
CREATE POLICY "Admins manage company domains"
  ON public.company_domains FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 2. Add email_domain column to profiles for quick lookups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email_domain'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email_domain TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_email_domain ON public.profiles(email_domain);

-- 3. Function to extract domain from email
CREATE OR REPLACE FUNCTION public.extract_email_domain(email TEXT)
RETURNS TEXT AS $$
  SELECT lower(split_part(email, '@', 2));
$$ LANGUAGE sql IMMUTABLE;

-- 4. Function to auto-detect employer on signup/login
-- Called by a trigger on profiles or manually after auth
CREATE OR REPLACE FUNCTION public.auto_detect_employer()
RETURNS TRIGGER AS $$
DECLARE
  v_domain TEXT;
  v_company_id UUID;
  v_free_domains TEXT[] := ARRAY[
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'aol.com', 'icloud.com', 'mail.com', 'protonmail.com',
    'zoho.com', 'yandex.com', 'live.com', 'msn.com',
    'comcast.net', 'att.net', 'verizon.net', 'me.com',
    'pm.me', 'tutanota.com', 'fastmail.com', 'hey.com'
  ];
BEGIN
  -- Extract domain from email
  v_domain := public.extract_email_domain(NEW.email);

  -- Store the domain on the profile
  NEW.email_domain := v_domain;

  -- Skip if it's a free email provider
  IF v_domain = ANY(v_free_domains) THEN
    RETURN NEW;
  END IF;

  -- Skip if employer is already set
  IF NEW.employer_company_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Try to match domain to a company
  SELECT company_id INTO v_company_id
  FROM public.company_domains
  WHERE domain = v_domain
  LIMIT 1;

  -- If we found a match, set the employer
  IF v_company_id IS NOT NULL THEN
    NEW.employer_company_id := v_company_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger: auto-detect on profile insert or update
DROP TRIGGER IF EXISTS trg_auto_detect_employer ON public.profiles;
CREATE TRIGGER trg_auto_detect_employer
  BEFORE INSERT OR UPDATE OF email ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_detect_employer();

-- 6. Seed company_domains from existing website_url data
-- Extract domain from website_url for all companies that have one
INSERT INTO public.company_domains (company_id, domain, is_primary, verified)
SELECT
  id,
  lower(regexp_replace(
    regexp_replace(website_url, '^https?://(www\.)?', ''),
    '/.*$', ''
  )),
  true,
  true
FROM public.companies
WHERE website_url IS NOT NULL
  AND website_url != ''
  AND lower(regexp_replace(
    regexp_replace(website_url, '^https?://(www\.)?', ''),
    '/.*$', ''
  )) NOT IN (SELECT domain FROM public.company_domains)
ON CONFLICT (domain) DO NOTHING;

-- 7. Backfill email_domain for existing profiles
UPDATE public.profiles
SET email_domain = public.extract_email_domain(email)
WHERE email IS NOT NULL AND email_domain IS NULL;

-- 8. Backfill employer_company_id for existing profiles with corporate emails
UPDATE public.profiles p
SET employer_company_id = cd.company_id
FROM public.company_domains cd
WHERE p.email_domain = cd.domain
  AND p.employer_company_id IS NULL
  AND p.email_domain NOT IN (
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'aol.com', 'icloud.com', 'mail.com', 'protonmail.com',
    'zoho.com', 'yandex.com'
  );
