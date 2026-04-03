-- RLS Policy Security Fixes
-- This template shows the exact patterns needed for the fix migration
-- Replace [table] and [column] with actual names

================================================================================
PATTERN 1: Fix for Report Tables (Add user_id column)
================================================================================

-- Step 1: Add the user_id column with default
ALTER TABLE public.[table] ADD COLUMN user_id UUID DEFAULT auth.uid();

-- Step 2: Drop overly permissive policy
DROP POLICY IF EXISTS "Auth users manage [table]" ON public.[table];

-- Step 3: Create user-scoped policies for all operations
CREATE POLICY "Users can manage own records" ON public.[table]
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Step 4: Add admin override policy
CREATE POLICY "Admins can manage all records" ON public.[table]
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- NOTE: For existing data with NULL user_id, you have options:
--   Option A: Leave as NULL (admins only can modify)
--   Option B: Set to a system default UUID
--   Option C: Set to migration author for audit trail
--   Choose one based on business requirements


================================================================================
PATTERN 2: Fix for Edit-Permission Tables (Add created_by column)
================================================================================

-- Step 1: Add the created_by column
ALTER TABLE public.[table] ADD COLUMN created_by UUID NOT NULL DEFAULT auth.uid();

-- Step 2: Drop overly permissive INSERT policy
DROP POLICY IF EXISTS "Authenticated inserts [table]" ON public.[table];

-- Step 3: Drop overly permissive UPDATE policy
DROP POLICY IF EXISTS "Authenticated updates [table]" ON public.[table];

-- Step 4: Create user-scoped INSERT policy
CREATE POLICY "Users can insert own records" ON public.[table]
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Step 5: Create user-scoped UPDATE policy
CREATE POLICY "Users can update own records" ON public.[table]
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Step 6: Add admin override policy
CREATE POLICY "Admins can manage all records" ON public.[table]
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


================================================================================
COMPLETE EXAMPLE: policy_reports Table
================================================================================

-- 1. Add user_id column
ALTER TABLE public.policy_reports ADD COLUMN user_id UUID DEFAULT auth.uid();

-- 2. Drop problematic policy
DROP POLICY IF EXISTS "Auth users manage reports" ON public.policy_reports;

-- 3. Create user-scoped policies
CREATE POLICY "Users can manage own reports" ON public.policy_reports
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reports" ON public.policy_reports
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


================================================================================
TABLES REQUIRING PATTERN 1 (user_id column)
================================================================================

Copy-paste and replace [table] with each name:

- policy_reports
- report_sections
- report_claims
- report_evidence_links
- report_entities
- report_legislation
- report_events
- report_company_alignment
- report_actions
- report_followups


================================================================================
TABLES REQUIRING PATTERN 2 (created_by column)
================================================================================

Copy-paste and replace [table] with each name:

- company_sanctions_screening
- company_wikidata


================================================================================
ADMIN ROLE CHECK FUNCTION
================================================================================

Make sure your database has this function for admin checks.
If not, add it:

CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = $1 AND role = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

Or adapt to your actual role/permission table structure.


================================================================================
TESTING CHECKLIST
================================================================================

For each table:

1. [ ] Column added successfully
2. [ ] Old policies dropped without error
3. [ ] New policies created successfully
4. [ ] User can read own records: SELECT WHERE user_id = auth.uid()
5. [ ] User can modify own records: INSERT/UPDATE WHERE user_id = auth.uid()
6. [ ] User CANNOT read others' records: SELECT blocked
7. [ ] User CANNOT modify others' records: INSERT/UPDATE/DELETE blocked
8. [ ] Admin can read all records: has_role(auth.uid(), 'admin')
9. [ ] Admin can modify all records: has_role(auth.uid(), 'admin')
10. [ ] Existing NULL records are handled (decide on backfill strategy)


================================================================================
ROLLBACK STRATEGY
================================================================================

If something goes wrong:

-- Remove columns (WARNING: loses NULL data)
ALTER TABLE public.[table] DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.[table] DROP COLUMN IF EXISTS created_by;

-- Recreate old policies (from migrations folder)
-- Use the original CREATE POLICY statements


================================================================================
MONITORING POST-DEPLOYMENT
================================================================================

1. Check application logs for permission denied errors
2. Monitor for users unable to access their own records
3. Verify admins can still manage all records
4. Audit that policies actually restrict access:

   SELECT * FROM information_schema.table_constraints
   WHERE table_name = '[table]' AND constraint_type = 'POLICY';

5. Test with different user roles in development first


================================================================================
RELATED FILES
================================================================================

- rls_policy_audit.md: Detailed findings and context
- rls_policy_audit.json: Structured data for tooling
- rls_policy_audit.csv: Spreadsheet format
- RLS_SECURITY_FINDINGS.txt: Executive summary
