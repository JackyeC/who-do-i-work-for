# RLS Policy Audit - Complete Analysis Package

## Quick Summary

Comprehensive security audit of your Supabase RLS policies found:
- **20 problematic policies** across 12 tables
- **10 CRITICAL** - Any authenticated user can modify ANY record
- **4 MODERATE** - Write operations without ownership tracking
- **8 LOW** - Read-only (likely intentional)

## Documents in This Package

### 1. RLS_SECURITY_FINDINGS.txt
**Executive summary with full analysis**
- One-page overview of all findings
- Detailed table-by-table inventory
- Migration strategy
- Next steps
- **Start here for context**

### 2. rls_policy_audit.md
**Detailed markdown report** (11 KB)
- Full RLS policy analysis
- Organized by severity
- Table structure analysis
- Proposed fix strategy in SQL
- **Read for complete understanding**

### 3. rls_policy_audit.json
**Structured data format** (13 KB)
- JSON structure of all findings
- For programmatic processing
- Machine-readable policy inventory
- Summary statistics
- **Use for tooling/automation**

### 4. rls_policy_audit.csv
**Spreadsheet-friendly format** (5.8 KB)
- Import into Excel/Sheets
- 22 rows (one per problematic policy)
- Columns: Severity, Policy Name, Table, Operation, Role, etc.
- **Use for tracking/management**

### 5. MIGRATION_TEMPLATE.sql
**Ready-to-use SQL patterns** (6.8 KB)
- Pattern 1: Report tables (add user_id)
- Pattern 2: Edit tables (add created_by)
- Complete examples
- Testing checklist
- Rollback strategy
- **Use to write the actual fix migration**

---

## Critical Findings Summary

### Report Tables (CRITICAL - Fix First)
10 tables allow ANY authenticated user to INSERT/UPDATE/DELETE ALL records:
- `policy_reports`
- `report_sections`
- `report_claims`
- `report_evidence_links`
- `report_entities`
- `report_legislation`
- `report_events`
- `report_company_alignment`
- `report_actions`
- `report_followups`

**Current Policy:** `FOR ALL TO authenticated USING (true) WITH CHECK (true)`

**Problem:** No user ownership verification. Any user can sabotage any other user's work.

**Solution:** Add `user_id UUID DEFAULT auth.uid()` column to all 10 tables and change policies to check `auth.uid() = user_id`

---

### Edit-Permission Tables (MODERATE - Fix Second)
2 tables allow unrestricted INSERT/UPDATE:
- `company_sanctions_screening`
- `company_wikidata`

**Problem:** No created_by tracking. Can't prevent modification of others' data.

**Solution:** Add `created_by UUID NOT NULL DEFAULT auth.uid()` and scope policies to creator.

---

### Read-Only Policies (LOW - Review)
8 tables with SELECT-only access (likely intentional):
- `epstein_persons`, `epstein_documents`, `epstein_flights`, `epstein_cross_references`
- `company_court_cases`
- `company_dossiers`
- `scan_runs`
- `browse_ai_monitors`

**Assessment:** No write permissions allowed. Probably OK, but document intent clearly.

---

## How to Use This Package

### If you're a developer writing the fix:
1. Read `RLS_SECURITY_FINDINGS.txt` for context
2. Use `MIGRATION_TEMPLATE.sql` as your guide
3. Write a new migration file in `/supabase/migrations/`
4. Copy the SQL patterns and customize for each table
5. Use the CSV to check off each table as you complete it

### If you're a manager/reviewer:
1. Read `RLS_SECURITY_FINDINGS.txt` (5 min)
2. Review `rls_policy_audit.md` for details (10 min)
3. Import `rls_policy_audit.csv` into spreadsheet for tracking
4. Use for status updates: "10 CRITICAL tables, 2 MODERATE tables need fixes"

### If you're automating this:
1. Parse `rls_policy_audit.json`
2. Generate SQL from the structured data
3. Use `MIGRATION_TEMPLATE.sql` patterns as templates
4. Apply fixes programmatically

---

## Key Statistics

| Metric | Count |
|--------|-------|
| Total problematic policies | 20 |
| Critical (ALL operations) | 10 |
| Moderate (INSERT/UPDATE) | 4 |
| Low (SELECT only) | 8 |
| Tables needing user_id | 10 |
| Tables needing created_by | 2 |
| Migrations analyzed | ~120 |
| Files with issues | 9 |

---

## File Locations

All files saved to: `/sessions/tender-serene-darwin/mnt/who-do-i-work-for/`

```
RLS_AUDIT_INDEX.md              (this file)
RLS_SECURITY_FINDINGS.txt       (executive summary)
rls_policy_audit.md             (detailed report)
rls_policy_audit.json           (structured data)
rls_policy_audit.csv            (spreadsheet format)
MIGRATION_TEMPLATE.sql          (SQL patterns to use)
```

---

## Recommended Next Steps

### Phase 1: Review & Approval
1. Share `RLS_SECURITY_FINDINGS.txt` with team
2. Discuss impact and timeline
3. Get approval to proceed

### Phase 2: Development
1. Create new migration file
2. Follow `MIGRATION_TEMPLATE.sql` patterns
3. Write SQL for all 12 tables
4. Include index/constraint decisions

### Phase 3: Testing
1. Deploy to dev environment
2. Run test suite
3. Verify permissions work correctly
4. Test with different user roles

### Phase 4: Staging & Production
1. Deploy to staging
2. Monitor for errors
3. Have rollback plan ready (see MIGRATION_TEMPLATE.sql)
4. Deploy to production with care

---

## Questions to Answer Before Fixing

1. **Backfill strategy for NULL user_ids:**
   - Leave as NULL (admins only can modify)?
   - Set to a system/default UUID?
   - Set to migration author for audit trail?

2. **Admin role function:**
   - Do you have `has_role()` function?
   - What's your actual role/permission table structure?
   - Need to verify implementation before using in policies

3. **Read-only policies:**
   - Should epstein/court data truly be readable by ALL authenticated users?
   - Or should these be more restricted?
   - Document the decision

---

## Security Notes

- These policies affect data integrity, not just confidentiality
- HIGH risk of accidental data loss or sabotage
- Each authenticated user is a potential data modifier
- Admin policies are still there but only for true admins
- Fix is straightforward: add one column + change policy condition

---

## Document Version

- **Created:** 2026-03-29
- **Analysis Date:** 2026-03-29
- **Status:** COMPLETE - Ready for implementation
- **Auditor:** Automated RLS Policy Scanner

---

## Related Documentation

See migration files in `/supabase/migrations/`:
- `20260309180817_f38f9afd-99a9-4540-86ca-249f1828ccb6.sql` - Report tables
- `20260313203707_949263a1-ba28-4cbe-9a8d-b21b82c52dba.sql` - Epstein tables
- `20260314211131_472a77fb-8b25-4ef4-ba4d-f60d90c5df71.sql` - Court cases
- `20260315181457_491d1fe3-5fe0-43a2-be7d-119b8167b809.sql` - Sanctions & Wikidata
- `20260317184558_bff38bac-4bc8-4118-a040-19f0a4e1a522.sql` - Dossiers
- `20260309125532_89c2c04c-7d3d-407f-9354-e599f68aad4b.sql` - Scan runs fix

---

*All analysis files are in your project directory. Print these documents for your team.*
