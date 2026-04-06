-- Forensic integrity reports: public read + publish contract parallel to bi-hourly desk.
-- Latest bi-hourly desk stays on wdiwf_latest_live_desk_publication(); forensic uses new RPCs.

alter table public.wdiwf_desk_publications
  drop constraint if exists wdiwf_desk_publications_kind_valid_check;

alter table public.wdiwf_desk_publications
  add constraint wdiwf_desk_publications_kind_valid_check
  check (kind is null or kind in ('bi_hourly', 'friday', 'forensic'));

alter table public.wdiwf_desk_publications
  drop constraint if exists wdiwf_desk_publications_published_to_site_contract_check;

alter table public.wdiwf_desk_publications
  add constraint wdiwf_desk_publications_published_to_site_contract_check
  check (
    published_to_site = false
    or (
      publish_status = 'success'
      and generation_status = 'completed'
      and kind in ('bi_hourly', 'forensic')
      and site_markdown is not null
    )
  );

drop policy if exists "Public read live bi-hourly desk publications" on public.wdiwf_desk_publications;

create policy "Public read live desk and forensic publications"
  on public.wdiwf_desk_publications
  for select
  to anon, authenticated
  using (
    publish_status = 'success'
    and published_to_site = true
    and generation_status = 'completed'
    and kind in ('bi_hourly', 'forensic')
    and site_markdown is not null
  );

comment on table public.wdiwf_desk_publications is
  'WDIWF desk publications. Bi-hourly live desk: wdiwf_latest_live_desk_publication(). Forensic reports: wdiwf_latest_forensic_publication() + wdiwf_forensic_publications_recent().';

create index if not exists wdiwf_desk_publications_live_forensic_idx
  on public.wdiwf_desk_publications (created_at desc)
  where published_to_site = true
    and generation_status = 'completed'
    and kind = 'forensic'
    and site_markdown is not null
    and publish_status = 'success';

-- Newest published forensic report (same visibility contract as RLS for kind = forensic).
create or replace function public.wdiwf_latest_forensic_publication()
returns table (
  id uuid,
  created_at timestamptz,
  run_id text,
  kind text,
  generation_status text,
  publish_status text,
  published_to_site boolean,
  site_markdown text,
  newsletter_markdown text,
  email_subject text,
  email_preview_text text,
  social_linkedin text,
  social_bluesky text,
  social_x text,
  social_instagram text,
  social_facebook text,
  run_log jsonb
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    p.id,
    p.created_at,
    p.run_id,
    p.kind,
    p.generation_status,
    p.publish_status,
    p.published_to_site,
    p.site_markdown,
    p.newsletter_markdown,
    p.email_subject,
    p.email_preview_text,
    p.social_linkedin,
    p.social_bluesky,
    p.social_x,
    p.social_instagram,
    p.social_facebook,
    p.run_log
  from public.wdiwf_desk_publications p
  where p.published_to_site = true
    and p.generation_status = 'completed'
    and p.kind = 'forensic'
    and p.site_markdown is not null
    and p.publish_status = 'success'
  order by p.created_at desc
  limit 1;
$$;

comment on function public.wdiwf_latest_forensic_publication() is
  'Newest live forensic integrity report for /integrity-report (kind = forensic, same publish contract as RLS).';

grant execute on function public.wdiwf_latest_forensic_publication() to anon, authenticated;

-- Archive list for /integrity-report (newest first).
create or replace function public.wdiwf_forensic_publications_recent(p_limit integer default 20)
returns table (
  id uuid,
  created_at timestamptz,
  run_id text,
  kind text,
  generation_status text,
  publish_status text,
  published_to_site boolean,
  site_markdown text,
  newsletter_markdown text,
  email_subject text,
  email_preview_text text,
  social_linkedin text,
  social_bluesky text,
  social_x text,
  social_instagram text,
  social_facebook text,
  run_log jsonb
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    p.id,
    p.created_at,
    p.run_id,
    p.kind,
    p.generation_status,
    p.publish_status,
    p.published_to_site,
    p.site_markdown,
    p.newsletter_markdown,
    p.email_subject,
    p.email_preview_text,
    p.social_linkedin,
    p.social_bluesky,
    p.social_x,
    p.social_instagram,
    p.social_facebook,
    p.run_log
  from public.wdiwf_desk_publications p
  where p.published_to_site = true
    and p.generation_status = 'completed'
    and p.kind = 'forensic'
    and p.site_markdown is not null
    and p.publish_status = 'success'
  order by p.created_at desc
  limit greatest(1, least(p_limit, 50));
$$;

comment on function public.wdiwf_forensic_publications_recent(integer) is
  'Recent live forensic reports (newest first), capped at 50 rows.';

grant execute on function public.wdiwf_forensic_publications_recent(integer) to anon, authenticated;
