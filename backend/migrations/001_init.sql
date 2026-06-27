-- Lumira initial schema
-- Studio/team management app for photographers & videographers.

create extension if not exists "pgcrypto";

-- Profiles extend auth.users (Supabase-managed).
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  phone        text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- A team == a studio.
create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  initials    text not null,
  color       text not null,
  invite_code text not null unique,
  owner_id    uuid not null references public.profiles(id) on delete restrict,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- A user's membership in a team. role is a free-form label
-- (e.g. "Lead Photographer", "Editor"). is_owner mirrors teams.owner_id
-- for fast membership queries.
create table if not exists public.team_members (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid not null references public.teams(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       text not null,
  color      text not null,
  is_owner   boolean not null default false,
  created_at timestamptz not null default now(),
  unique (team_id, user_id)
);

create index if not exists team_members_team_idx on public.team_members(team_id);
create index if not exists team_members_user_idx on public.team_members(user_id);

create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  team_id      uuid not null references public.teams(id) on delete cascade,
  type         text not null,
  title        text not null,
  event_date   date not null,
  time_label   text,
  venue        text,
  client_name  text,
  client_phone text,
  total        numeric(12,2) not null default 0,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists events_team_idx on public.events(team_id);
create index if not exists events_date_idx on public.events(event_date);

-- Crew assignment for an event.
-- member_id is set when the crew is a team_member; for external crew
-- it stays null and external_name + color are filled instead.
create table if not exists public.assignments (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events(id) on delete cascade,
  member_id     uuid references public.team_members(id) on delete set null,
  role          text not null,
  external_name text,
  color         text,
  created_at    timestamptz not null default now(),
  check (member_id is not null or external_name is not null)
);

create index if not exists assignments_event_idx on public.assignments(event_id);

create table if not exists public.payments (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  paid_on    date not null,
  amount     numeric(12,2) not null,
  method     text not null,
  note       text,
  created_at timestamptz not null default now()
);

create index if not exists payments_event_idx on public.payments(event_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['profiles','teams','events'] loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I;
       create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();', t, t);
  end loop;
end $$;
