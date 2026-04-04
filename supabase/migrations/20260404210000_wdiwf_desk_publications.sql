-- WDIWF content engine: live desk publications for /newsletter (Phase 1 website delivery).
-- Bi-hourly completed runs: published_to_site = true, readable by anon.
-- Skipped runs and Friday drafts: insert via service role; not exposed to public until policies extended.

create table if not exists public.wdiwf_desk_publications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  run_id text,
  kind text not null check (kind in ('bi_hourly', 'friday')),
  generation_status text not null check (generation_status in ('completed', 'skipped')),
  site_markdown text,
  newsletter_markdown text,
  email_subject text,
  email_preview_text text,
  social_linkedin text,
  social_bluesky text,
  social_x text,
  social_instagram text,
  social_facebook text,
  run_log jsonb not null default '{}'::jsonb,
  published_to_site boolean not null default false
);

comment on table public.wdiwf_desk_publications is 'WDIWF desk: site-update.md + channel copy. Public reads only live bi-hourly completed rows.';

create index if not exists wdiwf_desk_publications_live_bi_hourly_idx
  on public.wdiwf_desk_publications (created_at desc)
  where published_to_site = true
    and generation_status = 'completed'
    and kind = 'bi_hourly'
    and site_markdown is not null;

alter table public.wdiwf_desk_publications enable row level security;

create policy "Public read live bi-hourly desk publications"
  on public.wdiwf_desk_publications
  for select
  to anon, authenticated
  using (
    published_to_site = true
    and generation_status = 'completed'
    and kind = 'bi_hourly'
    and site_markdown is not null
  );

-- Writes: service role (Edge Function) only — no insert policy for anon/authenticated.

grant select on public.wdiwf_desk_publications to anon, authenticated;
