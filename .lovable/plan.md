

## Three-Part Fix: Homepage Intelligence + Glassmorphism Cards + Values Filter

### What's broken and why

1. **Homepage panels are empty**: All 8 queries filter `record_status = 'published'` but zero companies have that status. 169 are `verified`, 19 `research_in_progress`, 5 `active`. Additionally, `category_tags` is empty for all 193 companies and `is_startup` is false for all.

2. **Job cards look dated**: Standard card styling, no modern visual treatment.

3. **No values-alignment filter on job board**: The `institutional_alignment_signals` table exists with `institution_category` values (`traditional_policy`, `progress_policy`, `bipartisan`) but only 3 companies have data. The filter UI can still be built — it will surface matches where they exist.

---

### Part 1: Fix Homepage Intelligence Panels

**Data seeding** (3 SQL updates via insert tool):

- Tag `category_tags = ['Government Contractors']` on companies with industry matching Defense, Government Administration, Private Prisons
- Tag `category_tags = ['HR Tech']` on companies with industry matching Human Resources Software, Human Resources Consulting, Software Human Resources Technology
- Set `is_startup = true` on companies with industry matching AI, Software, SaaS, FinTech, Cybersecurity, Pet Services & Technology where `employee_count` is null or looks small (text field — will match null and sub-500 patterns)

**Code change** in `IntelligenceDashboard.tsx`:
- Replace all `.eq("record_status", "published")` with `.in("record_status", ["verified", "active", "published"])` across all 8 panel queries

### Part 2: Glassmorphism Job Cards

**File**: `src/components/jobs/JobIntegrityCard.tsx`

- Card: `bg-card/80 backdrop-blur-sm border-white/10 dark:border-zinc-800/50`
- Hover: `hover:backdrop-blur-md hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10`
- "View Receipts" / Profile button gets high-contrast primary variant styling
- Certified ring stays amber but gets glow treatment

### Part 3: Heritage vs Progressive Value-Alignment Toggle

**File**: `src/pages/JobIntegrityBoard.tsx`

- Add a new state `alignment` with values: `all`, `traditional`, `progressive`
- After fetching jobs, do a secondary query to `institutional_alignment_signals` grouped by `company_id` and `institution_category`
- Client-side filter: match `traditional_policy` keywords (Heritage, Project 2025, Cato) vs `progress_policy` (CAP, HRC, Ford Foundation, WEF)
- UI: Pill-style segmented toggle using existing `ToggleGroup` component, placed between search bar and results

### Files to modify
- `src/components/landing/IntelligenceDashboard.tsx` — fix record_status filter
- `src/components/jobs/JobIntegrityCard.tsx` — glassmorphism styling
- `src/pages/JobIntegrityBoard.tsx` — add alignment toggle + filter logic

### Database updates (via insert tool)
- Seed `category_tags` for Government Contractors and HR Tech companies
- Seed `is_startup` for qualifying tech companies

