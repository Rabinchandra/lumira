-- Row-level security.
-- The Express backend uses the service-role key and bypasses RLS, so these
-- policies only matter if the mobile app ever talks to Supabase directly.

alter table public.profiles      enable row level security;
alter table public.teams         enable row level security;
alter table public.team_members  enable row level security;
alter table public.events        enable row level security;
alter table public.assignments   enable row level security;
alter table public.payments      enable row level security;

-- profiles: each user reads/writes their own row.
drop policy if exists profiles_self_read   on public.profiles;
drop policy if exists profiles_self_write  on public.profiles;
create policy profiles_self_read  on public.profiles for select using (auth.uid() = id);
create policy profiles_self_write on public.profiles for all    using (auth.uid() = id) with check (auth.uid() = id);

-- Helper: is the current user a member of this team?
create or replace function public.is_team_member(t uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.team_members m
    where m.team_id = t and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_team_owner(t uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.teams where id = t and owner_id = auth.uid()
  );
$$;

-- teams: members can read; only owner can mutate.
drop policy if exists teams_member_read on public.teams;
drop policy if exists teams_owner_write on public.teams;
create policy teams_member_read on public.teams for select using (public.is_team_member(id) or owner_id = auth.uid());
create policy teams_owner_write on public.teams for all    using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- team_members: visible to members of the team.
drop policy if exists members_read  on public.team_members;
drop policy if exists members_write on public.team_members;
create policy members_read  on public.team_members for select using (public.is_team_member(team_id));
create policy members_write on public.team_members for all    using (public.is_team_owner(team_id)) with check (public.is_team_owner(team_id));

-- events: visible to members; mutations by any member (tighten later if needed).
drop policy if exists events_read  on public.events;
drop policy if exists events_write on public.events;
create policy events_read  on public.events for select using (public.is_team_member(team_id));
create policy events_write on public.events for all    using (public.is_team_member(team_id)) with check (public.is_team_member(team_id));

-- assignments / payments inherit access via parent event.
drop policy if exists assignments_read  on public.assignments;
drop policy if exists assignments_write on public.assignments;
create policy assignments_read  on public.assignments for select using (
  exists (select 1 from public.events e where e.id = event_id and public.is_team_member(e.team_id))
);
create policy assignments_write on public.assignments for all using (
  exists (select 1 from public.events e where e.id = event_id and public.is_team_member(e.team_id))
) with check (
  exists (select 1 from public.events e where e.id = event_id and public.is_team_member(e.team_id))
);

drop policy if exists payments_read  on public.payments;
drop policy if exists payments_write on public.payments;
create policy payments_read  on public.payments for select using (
  exists (select 1 from public.events e where e.id = event_id and public.is_team_member(e.team_id))
);
create policy payments_write on public.payments for all using (
  exists (select 1 from public.events e where e.id = event_id and public.is_team_member(e.team_id))
) with check (
  exists (select 1 from public.events e where e.id = event_id and public.is_team_member(e.team_id))
);
