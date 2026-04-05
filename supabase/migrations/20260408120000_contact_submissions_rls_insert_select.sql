-- contact_submissions: public INSERT (anon + authenticated), SELECT only for admin role.
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can read contact submissions" ON public.contact_submissions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

COMMENT ON TABLE public.contact_submissions IS 'Inbound messages from /contact; anon/authenticated INSERT; admin SELECT only; Edge Function may insert/update via service role.';
