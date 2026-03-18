create table public.job_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  preferred_locations text[] default '{}',
  remote_preference text default 'hybrid_ok',
  commute_tolerance text default 'moderate',
  willing_to_relocate boolean default false,
  target_compensation integer,
  minimum_compensation integer,
  preferred_functions text[] default '{}',
  seniority_level text,
  employment_type text,
  industry_preferences text[] default '{}',
  company_stage_preference text,
  sponsorship_required boolean default false,
  timezone_preference text,
  travel_tolerance text default 'minimal',
  search_urgency text default 'exploring',
  dealbreakers text[] default '{}',
  stretch_preference boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.job_preferences enable row level security;
create policy "Users manage own preferences" on public.job_preferences for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());