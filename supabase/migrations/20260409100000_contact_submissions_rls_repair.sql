-- Repair RLS after 071 dropped public INSERT (client form needs it if 081 was not applied).
-- Restore SELECT for owners (081 matched has_role(admin) only; 061 allowed admin + owner).
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can read contact submissions" ON public.contact_submissions
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'owner'::public.app_role)
  );

COMMENT ON TABLE public.contact_submissions IS 'Inbound messages from /contact; anon/authenticated INSERT; admin/owner SELECT; service role bypasses RLS.';
