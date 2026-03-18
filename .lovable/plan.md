

# Live Negotiation Simulator + Job Preferences Profile

## Part 1 — Job Preferences Profile

### Database
Add a `job_preferences` table (new migration) to persist structured preferences per user:

```sql
create table public.job_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  preferred_locations text[] default '{}',
  remote_preference text default 'hybrid_ok', -- remote_only | hybrid_ok | onsite_ok
  commute_tolerance text default 'moderate', -- short | moderate | long | any
  willing_to_relocate boolean default false,
  target_compensation integer,
  minimum_compensation integer,
  preferred_functions text[] default '{}',
  seniority_level text,
  employment_type text, -- full_time | contract | part_time | any
  industry_preferences text[] default '{}',
  company_stage_preference text, -- startup | growth | enterprise | any
  sponsorship_required boolean default false,
  timezone_preference text,
  travel_tolerance text default 'minimal', -- none | minimal | moderate | heavy
  search_urgency text default 'exploring', -- urgent | active | exploring | passive
  dealbreakers text[] default '{}',
  stretch_preference boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.job_preferences enable row level security;
create policy "Users manage own preferences" on public.job_preferences for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
```

### New Files
- **`src/hooks/use-job-preferences.ts`** — CRUD hook for `job_preferences` table with upsert logic
- **`src/components/jobs/JobPreferencesForm.tsx`** — Lightweight multi-section form (collapsible sections: Location, Compensation, Role, Constraints). Not a giant form — progressive disclosure with smart defaults. Accessible from job board sidebar and career intelligence page.
- **`src/lib/jobFitEngine.ts`** — Pure function that takes a job + user preferences and returns:
  - `fitScore` (0-100)
  - `fitBadges` (Strong Fit, Location Mismatch, Compensation Mismatch, Flexible Work Fit, Relocation Required)
  - `mismatches` array with reason strings
  - `strengths` array

### Modified Files
- **`src/pages/JobIntegrityBoard.tsx`** — Read preferences, pass to ranking/filtering. Add fit badges to cards. Down-rank mismatches (remote_only vs onsite, compensation below minimum, relocation required when unwilling).
- **`src/components/jobs/JobIntegrityCard.tsx`** — Accept and display fit badges from engine
- **`src/pages/JobDetailPage.tsx`** — Show fit summary section (remote viability, compensation fit, location match). Add "Practice the conversation" CTA linking to simulator.
- **`src/pages/StrategicOfferReview.tsx`** — Feed preferences into OfferRealityCheck for personalized gap detection
- **`src/components/policy-intelligence/SituationContextBanner.tsx`** — Also read job preferences for richer "What this means for you" context

### Behavior Logic
| User Preference | Job Signal | Result |
|---|---|---|
| `remote_only` + job is `on-site` | Location Mismatch badge, heavy down-rank |
| `minimum_compensation` > job salary | Compensation Mismatch badge |
| `willing_to_relocate = false` + job requires relocation | Down-rank, show warning |
| `remote_only` + job is `remote` | Flexible Work Fit badge, boost |
| Compensation within range | Strong Fit badge on comp dimension |

## Part 2 — Live Negotiation Simulator

### Edge Function
**`supabase/functions/negotiation-simulator/index.ts`** — Streaming edge function using Lovable AI (Gemini 3 Flash) that:
- Accepts: company name, role, offer details, user preferences, negotiation style (direct/collaborative/reserved), risk tolerance (low/balanced/high), scenario type, conversation history
- System prompt instructs the AI to role-play as a recruiter/hiring manager, adapt to user style, incorporate company signals, and provide round-by-round feedback
- Returns streamed responses with structured feedback (what worked, what could be stronger, one better version, one shorter version, tone assessment)
- Uses tool calling to extract structured feedback JSON alongside the conversational response

### New Files
- **`src/pages/NegotiationSimulator.tsx`** — Full page at `/negotiation-simulator` with:
  - Setup panel: company, role, offer details (pre-fillable from Offer Review), style selector, risk tolerance, scenario mode
  - Chat interface with round tracking
  - After each round: collapsible feedback panel (what worked, improvements, better version, shorter version, tone meter)
  - "End Session" with summary of all rounds
- **`src/components/negotiation/SimulatorSetup.tsx`** — Setup form with scenario selection (salary, remote/flexibility, title/level, team stability, best-and-final)
- **`src/components/negotiation/SimulatorChat.tsx`** — Streaming chat interface with markdown rendering, round markers
- **`src/components/negotiation/RoundFeedback.tsx`** — Feedback card after each AI response showing strengths, improvements, alternative phrasings, tone gauge (too soft / balanced / too aggressive)
- **`src/components/negotiation/SessionSummary.tsx`** — End-of-session review with progress across rounds

### Modified Files
- **`src/App.tsx`** — Add `/negotiation-simulator` route
- **`src/pages/JobDetailPage.tsx`** — Add "Practice the conversation" CTA button
- **`src/pages/StrategicOfferReview.tsx`** — Add "Practice this negotiation" button that pre-fills simulator with current offer data
- **`supabase/config.toml`** — Add negotiation-simulator function config with `verify_jwt = false`

## Part 3 — Integration Points

- **Job Board → Preferences**: Fit badges on cards, personalized ranking, preference-aware filtering
- **Job Detail → Simulator**: CTA to launch simulator pre-filled with job context
- **Offer Review → Simulator**: Button passes offer strength, transparency signals, risk signals, and user preferences into simulator setup
- **Offer Reality Check**: Reads `job_preferences` to personalize gap detection (e.g., remote mismatch, compensation shortfall relative to user's minimum)

## File Summary

**New (10 files):**
- `src/hooks/use-job-preferences.ts`
- `src/components/jobs/JobPreferencesForm.tsx`
- `src/lib/jobFitEngine.ts`
- `src/pages/NegotiationSimulator.tsx`
- `src/components/negotiation/SimulatorSetup.tsx`
- `src/components/negotiation/SimulatorChat.tsx`
- `src/components/negotiation/RoundFeedback.tsx`
- `src/components/negotiation/SessionSummary.tsx`
- `supabase/functions/negotiation-simulator/index.ts`

**Modified (7 files):**
- `src/App.tsx`
- `src/pages/JobIntegrityBoard.tsx`
- `src/components/jobs/JobIntegrityCard.tsx`
- `src/pages/JobDetailPage.tsx`
- `src/pages/StrategicOfferReview.tsx`
- `src/components/strategic-offer/OfferRealityCheck.tsx`
- `src/components/policy-intelligence/SituationContextBanner.tsx`

**Database:** 1 new table (`job_preferences`) with RLS

