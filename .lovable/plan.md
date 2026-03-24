

## Plan: Execute 3 SQL Seed Files Against the Database

### What
Run the three SQL files from the repo against the database to seed 49 companies and 47 issue signals.

### Execution Order
1. **sql/10-seed-receipts-companies.sql** (746 lines) — 10 core "Receipts" companies with full data (Meta, Google, Amazon, Microsoft, Boeing, Booz Allen, Accenture, Verizon, T-Mobile, MAC Cosmetics)
2. **sql/11-seed-additional-companies.sql** (2,147 lines) — 40 additional companies across Big Tech, Finance, Healthcare, Retail, Energy, Defense sectors
3. **sql/12-seed-issue-signals.sql** (272 lines) — 47 issue signals linked to the 10 Receipts companies

All use `INSERT ... ON CONFLICT` so they're safe to re-run (idempotent).

### How
Since these are INSERT statements (data operations, not schema changes), I'll execute them using `psql` via the database connection. The files are large, so I'll read the full content and execute each file's SQL directly.

### Verification
After execution, run count queries to confirm:
- `SELECT COUNT(*) FROM companies`
- `SELECT COUNT(*) FROM issue_signals`

