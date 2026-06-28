-- Add created_by_user_id to events to track who created each event.
alter table public.events
  add column if not exists created_by_user_id uuid references public.profiles(id) on delete set null;
