-- Operability: final publish_status per edge run, failure columns, explicit published_to_site contract,
-- RPC for "what is live now?", RLS aligned with contract.

drop policy if exists "Public read live bi-hourly desk publications" on public.wdiwf_desk_publications;

alter table public.wdiwf_desk_publications
  drop constraint if exists wdiwf_desk_publications_kind_check,
  drop constraint if exists wdiwf_desk_publications_generation_status_check;

alter table public.wdiwf_desk_publications
  alter column kind drop not null,
  alter column generation_status drop not null;

alter table public.wdiwf_desk_publications
  add column if not exists publish_status text,
  add column if not exists failure_code text,
  add column if not exists failure_message text;

update public.wdiwf_desk_publications
set publish_status = case
  when generation_status = 'skipped' then 'skipped'
  else 'success'
end
where publish_status is null;

alter table public.wdiwf_desk_publications
  alter column publish_status set not null;

alter table public.wdiwf_desk_publications
  add constraint wdiwf_desk_publications_publish_status_check
  check (publish_status in ('success', 'skipped', 'failed'));

alter table public.wdiwf_desk_publications
  add constraint wdiwf_desk_publications_kind_valid_check
  check (kind is null or kind in ('bi_hourly', 'friday'));

alter table public.wdiwf_desk_publications
  add constraint wdiwf_desk_publications_generation_valid_check
  check (generation_status is null or generation_status in ('completed', 'skipped'));

alter table public.wdiwf_desk_publications
  add constraint wdiwf_desk_publications_success_requires_context_check
  check (
    publish_status <> 'success'
    or (kind is not null and generation_status is not null)
  );

alter table public.wdiwf_desk_publications
  add constraint wdiwf_desk_publications_skipped_aligned_check
  check (
    publish_status <> 'skipped' or generation_status = 'skipped'
  );

alter table public.wdiwf_desk_publications
  add constraint wdiwf_desk_publications_failed_not_live_check
  check (
    publish_status <> 'failed' or published_to_site = false
  );

alter table public.wdiwf_desk_publications
  add constraint wdiwf_desk_publications_skipped_not_live_check
  check (
    publish_status <> 'skipped' or published_to_site = false
  );

alter table public.wdiwf_desk_publications
  add constraint wdiwf_desk_publications_failed_has_code_check
  check (
    publish_status <> 'failed' or failure_code is not null
  );

alter table public.wdiwf_desk_publications
  add constraint wdiwf_desk_publications_published_to_site_contract_check
  check (
    published_to_site = false
    or (
      publish_status = 'success'
      and generation_status = 'completed'
      and kind = 'bi_hourly'
      and site_markdown is not null
    )
  );

comment on column public.wdiwf_desk_publications.published_to_site is
  'Authoritative gate for public website: when true, this row MUST satisfy the live bi-hourly contract (success + completed + markdown). RLS exposes ONLY rows where this is true AND all contract columns match; anon cannot read skipped/failed/draft rows.';

comment on column public.wdiwf_desk_publications.publish_status is
  'Final outcome of publish-desk-publication for this row: success (accepted payload), skipped (engine skipped — audit only), failed (validation/ingest error — audit only, never public).';

comment on column public.wdiwf_desk_publications.failure_code is
  'Stable machine code when publish_status = failed (e.g. empty_site_markdown_bi_hourly_live).';

comment on column public.wdiwf_desk_publications.failure_message is
  'Human-readable failure detail for operators; safe to store without request body PII.';

comment on table public.wdiwf_desk_publications is
  'WDIWF desk publications. Website reads latest live row via RLS or wdiwf_latest_live_desk_publication().';

drop index if exists wdiwf_desk_publications_live_bi_hourly_idx;

create index if not exists wdiwf_desk_publications_live_bi_hourly_idx
  on public.wdiwf_desk_publications (created_at desc)
  where published_to_site = true
    and generation_status = 'completed'
    and kind = 'bi_hourly'
    and site_markdown is not null
    and publish_status = 'success';

create policy "Public read live bi-hourly desk publications"
  on public.wdiwf_desk_publications
  for select
  to anon, authenticated
  using (
    publish_status = 'success'
    and published_to_site = true
    and generation_status = 'completed'
    and kind = 'bi_hourly'
    and site_markdown is not null
  );

-- At-a-glance: single newest row that matches the same contract as RLS (invoker = respects RLS).
create or replace function public.wdiwf_latest_live_desk_publication()
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
    and p.kind = 'bi_hourly'
    and p.site_markdown is not null
    and p.publish_status = 'success'
  order by p.created_at desc
  limit 1;
$$;

comment on function public.wdiwf_latest_live_desk_publication() is
  'Returns the newest row that is live on /newsletter (identical filter to RLS). Prefer this RPC for a stable "current live content" contract.';

grant execute on function public.wdiwf_latest_live_desk_publication() to anon, authenticated;
