-- Signup tracking for the 100-user affiliate trigger.
--
-- We cannot count auth.users with the public anon key, so we keep a lightweight
-- public.signups table: one row per registered (email) user. No PII beyond the
-- auth user id is stored — country/locale are optional analytics.
--
-- Apply once in the Supabase SQL editor (Dashboard → SQL Editor → run).

create table if not exists public.signups (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  country    text,
  locale     text
);

alter table public.signups enable row level security;

-- A signed-in user may insert / view only their own row.
drop policy if exists "signups insert own" on public.signups;
create policy "signups insert own"
  on public.signups for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "signups select own" on public.signups;
create policy "signups select own"
  on public.signups for select
  to authenticated
  using (auth.uid() = user_id);

-- Public, privacy-safe total count for the monitor (no row data exposed).
create or replace function public.signup_count()
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::int from public.signups;
$$;

grant execute on function public.signup_count() to anon, authenticated;
