
-- Fix audit_requests: tighten INSERT to verify email matches auth user, add admin read policy

DROP POLICY "Authenticated users can submit audit requests" ON public.audit_requests;
CREATE POLICY "Authenticated users can submit audit requests"
  ON public.audit_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can view all audit requests"
  ON public.audit_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
