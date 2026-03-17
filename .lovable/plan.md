

## Decision Checkpoint + Action Hub

### Files

| File | Action |
|------|--------|
| `src/components/dashboard/DecisionCheckpoint.tsx` | **Create** |
| `src/components/dashboard/DashboardOverview.tsx` | **Rewrite** |
| `src/pages/Dashboard.tsx` | **Edit** — add DecisionCheckpoint above overview |

### 1. DecisionCheckpoint.tsx (new)

Fixed overlay (`fixed inset-0 z-50 bg-background/80 backdrop-blur-sm`). Self-manages visibility:

- On mount: query `user_alerts` where `is_read = false`, order by `date_detected desc`, limit 5
- If zero unread → render nothing
- Check `localStorage.getItem("last_checkpoint_seen")` — if stored timestamp is newer than all unread alerts, skip
- Display:
  - Header: "Before you move forward, check this."
  - Subtext: "Here's what changed since your last visit — and what might impact your decision."
  - 3–5 signal cards: `change_description`, `company_name` (linked to `/company/{slug via company_id lookup}`), `signal_category` badge. Tight layout, no decoration.
  - Footer: primary "Continue your evaluation" button, secondary text links to `/check`, `/dashboard?tab=values`, `/dashboard?tab=tracked`
- On dismiss: mark only the rendered alert IDs as `is_read = true` via Supabase update, store `Date.now()` in localStorage `last_checkpoint_seen`

Note: `user_alerts` has `company_id` (uuid FK to companies) — we'll join to get the company slug for linking.

### 2. DashboardOverview.tsx (rewrite)

Replace entire file. New action hub with 4 sections + 2 kept sections:

**Data query** (single `useQuery`): fetch tracked companies (limit 5 with company join), recent apps (limit 3), recent alerts (limit 3), career profile, recent docs (limit 3).

**Sections rendered:**

1. **Continue where you left off** — show most recent tracked company OR most recent application, with direct link. If neither exists, show a prompt to check a company.
2. **Companies you're evaluating** — compact list of tracked companies (name, industry, score). Link each to `/company/:slug`. "Track more" link.
3. **Your compensation baseline** — from `user_career_profile`: salary range, skills count, seniority. If no profile, prompt to upload resume.
4. **Recent signals** — last 3 `user_alerts`, compact: `change_description`, `company_name`, `signal_category` badge.
5. **Recent Documents** — kept from current (same markup, lines 270-306).
6. **Recent Applications** — kept from current (same markup, lines 346-383).

**Removed:** greeting hero, quick stats grid, "Quick Actions" card, "Get Started" checklist.

### 3. Dashboard.tsx edit

When `tab === "overview"`, render:
```tsx
<>
  <DecisionCheckpoint />
  <DashboardOverview onNavigate={setTab} />
</>
```

No other changes to Dashboard.tsx.

### No schema changes

All queries use existing tables: `user_alerts`, `tracked_companies`, `companies`, `applications_tracker`, `user_career_profile`, `user_documents`.

