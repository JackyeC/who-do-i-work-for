-- Add user_id column to correction_requests for authentication binding
ALTER TABLE public.correction_requests
  ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Drop the old permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can submit corrections" ON public.correction_requests;

-- Authenticated users must bind their user_id
CREATE POLICY "Authenticated users submit corrections"
  ON public.correction_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    contact_email IS NOT NULL AND contact_email != '' AND
    company_name IS NOT NULL AND company_name != '' AND
    description IS NOT NULL AND description != ''
  );

-- Anonymous users can still submit but user_id must be null
CREATE POLICY "Anonymous users submit corrections"
  ON public.correction_requests
  FOR INSERT TO anon
  WITH CHECK (
    user_id IS NULL AND
    contact_email IS NOT NULL AND contact_email != '' AND
    company_name IS NOT NULL AND company_name != '' AND
    description IS NOT NULL AND description != ''
  );

-- Drop old admin-only SELECT policy (the new one below covers admins too)
DROP POLICY IF EXISTS "Admins can view correction requests" ON public.correction_requests;

-- Authenticated users can read their own submissions; admins/owners can read all
CREATE POLICY "Users can view own corrections"
  ON public.correction_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));
