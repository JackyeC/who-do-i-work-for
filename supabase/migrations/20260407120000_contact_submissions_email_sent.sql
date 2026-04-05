-- Track outbound notification; inserts move to submit-contact-form Edge Function (service role).
ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS email_sent boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.contact_submissions.email_sent IS 'Set true by submit-contact-form after Resend delivery succeeds.';

DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;

-- Inserts only via Edge Function using service role (bypasses RLS). Anon/authenticated direct INSERT removed to reduce spam.
