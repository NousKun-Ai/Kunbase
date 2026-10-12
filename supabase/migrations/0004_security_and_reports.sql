-- 0004_security_and_reports.sql
-- Add automated security status tracking and community reporting for malicious prompts / skills

alter table public.skills
  add column if not exists security_status text not null default 'verified'
  check (security_status in ('verified', 'flagged', 'quarantined'));

-- Table for user reports on malicious or violating skills
create table if not exists public.skill_reports (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in ('malware_virus', 'prompt_injection', 'phishing_spam', 'copyright', 'other')),
  details text not null default '',
  created_at timestamptz not null default now(),
  unique (skill_id, reporter_id)
);

alter table public.skill_reports enable row level security;

-- Authenticated users can submit a report
create policy "users can report skills"
  on public.skill_reports for insert
  with check (auth.uid() = reporter_id);

-- Reporters can view their submitted reports
create policy "users can view their reports"
  on public.skill_reports for select
  using (auth.uid() = reporter_id);

-- Auto-flag a skill if it receives 3 or more distinct user reports
create or replace function public.check_skill_flag_threshold()
returns trigger as $$
declare
  report_count int;
begin
  select count(*) into report_count
  from public.skill_reports
  where skill_id = new.skill_id;

  if report_count >= 3 then
    update public.skills
    set security_status = 'flagged'
    where id = new.skill_id;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_skill_reported on public.skill_reports;
create trigger on_skill_reported
  after insert on public.skill_reports
  for each row execute procedure public.check_skill_flag_threshold();
