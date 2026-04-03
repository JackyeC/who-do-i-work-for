# RLS Policy Audit Report
## Policies Using USING (true) or WITH CHECK (true) for Non-Service_Role Roles

---

## CRITICAL - AUTHENTICATED ROLE POLICIES ALLOWING ALL OPERATIONS

### 1. Report Tables (Migration: 20260309180817)
**SEVERITY: CRITICAL** - Any authenticated user can INSERT/UPDATE/DELETE ALL reports

| Policy Name | Table | Operation | Role | Condition | Has User Column | Issue |
|---|---|---|---|---|---|---|
| Auth users manage reports | policy_reports | ALL | authenticated | USING (true) WITH CHECK (true) | NO | ANY user can modify ANY report |
| Auth users manage sections | report_sections | ALL | authenticated | USING (true) WITH CHECK (true) | NO | ANY user can modify ANY section |
| Auth users manage claims | report_claims | ALL | authenticated | USING (true) WITH CHECK (true) | NO | ANY user can modify ANY claim |
| Auth users manage evidence | report_evidence_links | ALL | authenticated | USING (true) WITH CHECK (true) | NO | ANY user can modify ANY evidence link |
| Auth users manage entities | report_entities | ALL | authenticated | USING (true) WITH CHECK (true) | NO | ANY user can modify ANY entity reference |
| Auth users manage legislation | report_legislation | ALL | authenticated | USING (true) WITH CHECK (true) | NO | ANY user can modify ANY legislation |
| Auth users manage events | report_events | ALL | authenticated | USING (true) WITH CHECK (true) | NO | ANY user can modify ANY event |
| Auth users manage alignment | report_company_alignment | ALL | authenticated | USING (true) WITH CHECK (true) | NO | ANY user can modify ANY alignment |
| Auth users manage actions | report_actions | ALL | authenticated | USING (true) WITH CHECK (true) | NO | ANY user can modify ANY action |
| Auth users manage followups | report_followups | ALL | authenticated | USING (true) WITH CHECK (true) | NO | ANY user can modify ANY followup |

**Table Columns Analysis:**
- `policy_reports`: Has `author_name`, `author_slug`, `created_at`, `updated_at` - NO user_id
- `report_sections`: Has `created_at`, `updated_at` - NO user_id
- `report_claims`: Has `created_at`, `updated_at` - NO user_id
- `report_evidence_links`: Has `created_at` - NO user_id
- `report_entities`: Has `created_at` - NO user_id
- `report_legislation`: Has `created_at`, `updated_at` - NO user_id
- `report_events`: Has `created_at` - NO user_id
- `report_company_alignment`: Has `created_at`, `updated_at` - NO user_id
- `report_actions`: Has `created_at` - NO user_id
- `report_followups`: Has `created_at`, `updated_at` - NO user_id

**Recommendation:** Add `user_id UUID DEFAULT auth.uid()` column to all tables and restrict policies to check `auth.uid() = user_id`

---

## MODERATE - AUTHENTICATED WRITE OPERATIONS WITHOUT OWNERSHIP CHECKS

### 2. Sanctions Screening (Migration: 20260315181457)

| Policy Name | Table | Operation | Role | Condition | Has User Column | Issue |
|---|---|---|---|---|---|---|
| Authenticated inserts sanctions | company_sanctions_screening | INSERT | authenticated | WITH CHECK (true) | NO | Any user can insert, no ownership tracking |
| Authenticated updates sanctions | company_sanctions_screening | UPDATE | authenticated | USING (true) | NO | Any user can update any record |

**Table Columns Analysis:**
- `company_sanctions_screening`: Has `screened_at`, `created_at` - NO created_by

**Recommendation:** Add `created_by UUID NOT NULL DEFAULT auth.uid()` and restrict to `auth.uid() = created_by` for INSERT/UPDATE

### 3. Wikidata Enrichment (Migration: 20260315181457)

| Policy Name | Table | Operation | Role | Condition | Has User Column | Issue |
|---|---|---|---|---|---|---|
| Authenticated inserts wikidata | company_wikidata | INSERT | authenticated | WITH CHECK (true) | NO | Any user can insert, no ownership tracking |
| Authenticated updates wikidata | company_wikidata | UPDATE | authenticated | USING (true) | NO | Any user can update any record |

**Table Columns Analysis:**
- `company_wikidata`: Has `fetched_at`, `created_at` - NO created_by

**Recommendation:** Add `created_by UUID NOT NULL DEFAULT auth.uid()` and restrict to `auth.uid() = created_by` for INSERT/UPDATE

---

## LIKELY INTENTIONAL - READ-ONLY FOR AUTHENTICATED USERS

These appear to be reference/public data tables with read-only access, though `USING (true)` is overly permissive syntax.

### 4. Epstein Tables (Migration: 20260313203707)

| Policy Name | Table | Operation | Role | Condition | Has User Column | Context |
|---|---|---|---|---|---|---|
| Authenticated users can read epstein_persons | epstein_persons | SELECT | authenticated | USING (true) | NO | Public-interest data, read-only |
| Authenticated users can read epstein_documents | epstein_documents | SELECT | authenticated | USING (true) | NO | Public-interest data, read-only |
| Authenticated users can read epstein_flights | epstein_flights | SELECT | authenticated | USING (true) | NO | Public-interest data, read-only |
| Authenticated users can read epstein_cross_references | epstein_cross_references | SELECT | authenticated | USING (true) | NO | Public-interest data, read-only |

**Table Columns Analysis:**
- All have `imported_at`/`updated_at`, no user_id
- epstein_cross_references has `verified_by` UUID but no auto-tracking

**Assessment:** Read-only policies are likely intentional for public-interest research data. However, syntax could be simplified to just `true` without `USING()` wrapper if truly unrestricted.

### 5. Court Cases (Migration: 20260314211131)

| Policy Name | Table | Operation | Role | Condition | Has User Column | Context |
|---|---|---|---|---|---|---|
| Public read court cases | company_court_cases | SELECT | authenticated | USING (true) | NO | Company litigation data, read-only |

**Assessment:** Appears to be company research data. Write operations restricted to admins.

### 6. Dossiers (Migration: 20260317184558)

| Policy Name | Table | Operation | Role | Condition | Has User Column | Context |
|---|---|---|---|---|---|---|
| Authenticated users can read dossiers | company_dossiers | SELECT | authenticated | USING (true) | NO | Company summary data, read-only |

**Assessment:** Read-only policy for authenticated users. Write operations restricted to admins.

### 7. Scan Runs (Migration: 20260309125532)

| Policy Name | Table | Operation | Role | Condition | Has User Column | Context |
|---|---|---|---|---|---|---|
| Authenticated users can read scan runs | scan_runs | SELECT | authenticated | USING (true) | NO | Monitoring data, read-only |

**Assessment:** Read-only policy. Note: This file actively removes the overly permissive "Scan runs are publicly readable" policy.

### 8. Browse AI Monitors (Migration: 20260309125532)

| Policy Name | Table | Operation | Role | Condition | Has User Column | Context |
|---|---|---|---|---|---|---|
| Authenticated users can read monitors | browse_ai_monitors | SELECT | authenticated | USING (true) | NO | Monitoring configuration, read-only |

**Assessment:** Likely intentional. Would benefit from checking browse_ai_monitors table structure.

---

## SUMMARY TABLE

### High-Risk Policies (Require Immediate Fix)

```
CRITICAL (Any authenticated user can modify ANY record):
- policy_reports (ALL ops, 10 tables total)
- report_sections (ALL ops)
- report_claims (ALL ops)
- report_evidence_links (ALL ops)
- report_entities (ALL ops)
- report_legislation (ALL ops)
- report_events (ALL ops)
- report_company_alignment (ALL ops)
- report_actions (ALL ops)
- report_followups (ALL ops)

MODERATE (Inserts/updates without ownership):
- company_sanctions_screening (INSERT/UPDATE)
- company_wikidata (INSERT/UPDATE)
```

### Lower-Risk Policies (Review Context)

```
LIKELY OK (Read-only, public/reference data):
- epstein_persons (SELECT only)
- epstein_documents (SELECT only)
- epstein_flights (SELECT only)
- epstein_cross_references (SELECT only)
- company_court_cases (SELECT only)
- company_dossiers (SELECT only)
- scan_runs (SELECT only)
- browse_ai_monitors (SELECT only)
```

---

## PROPOSED FIX STRATEGY

### Phase 1: Add User Tracking Columns

**Migration 1: Add user_id to Report Tables**
```sql
ALTER TABLE public.policy_reports ADD COLUMN user_id UUID DEFAULT auth.uid();
ALTER TABLE public.report_sections ADD COLUMN user_id UUID DEFAULT auth.uid();
ALTER TABLE public.report_claims ADD COLUMN user_id UUID DEFAULT auth.uid();
ALTER TABLE public.report_evidence_links ADD COLUMN user_id UUID DEFAULT auth.uid();
ALTER TABLE public.report_entities ADD COLUMN user_id UUID DEFAULT auth.uid();
ALTER TABLE public.report_legislation ADD COLUMN user_id UUID DEFAULT auth.uid();
ALTER TABLE public.report_events ADD COLUMN user_id UUID DEFAULT auth.uid();
ALTER TABLE public.report_company_alignment ADD COLUMN user_id UUID DEFAULT auth.uid();
ALTER TABLE public.report_actions ADD COLUMN user_id UUID DEFAULT auth.uid();
ALTER TABLE public.report_followups ADD COLUMN user_id UUID DEFAULT auth.uid();
```

**Migration 2: Add created_by to Sanctions/Wikidata**
```sql
ALTER TABLE public.company_sanctions_screening ADD COLUMN created_by UUID NOT NULL DEFAULT auth.uid();
ALTER TABLE public.company_wikidata ADD COLUMN created_by UUID NOT NULL DEFAULT auth.uid();
```

### Phase 2: Update RLS Policies

**For each report table:**
```sql
-- Drop overly permissive policies
DROP POLICY "Auth users manage [table]" ON public.[table];

-- Add user-scoped policies
CREATE POLICY "Users can manage own records" ON public.[table]
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add admin override policies
CREATE POLICY "Admins can manage all records" ON public.[table]
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

**For sanctions/wikidata:**
```sql
DROP POLICY "Authenticated inserts [table]" ON public.[table];
DROP POLICY "Authenticated updates [table]" ON public.[table];

CREATE POLICY "Users can manage own records" ON public.[table]
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own records" ON public.[table]
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can manage all" ON public.[table]
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

---

## REFERENCE DATA

### All Tables with Problematic Policies
1. policy_reports
2. report_sections
3. report_claims
4. report_evidence_links
5. report_entities
6. report_legislation
7. report_events
8. report_company_alignment
9. report_actions
10. report_followups
11. company_sanctions_screening
12. company_wikidata

### Tables with Only User-Friendly Column Names in existing reports
- policy_reports: `author_name`, `author_slug` (not UUID fields suitable for RLS)
