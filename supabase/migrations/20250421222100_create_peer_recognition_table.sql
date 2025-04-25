-- Migration: Create peer_recognition table for user-to-user recognition events
-- Purpose: Enable users to thank or nominate peers, supporting feedback loops and community engagement
-- Affected: public.peer_recognition
-- RLS: Enabled, with granular policies for select/insert/update/delete for anon and authenticated roles

begin;

-- 1. Create peer_recognition table
create table public.peer_recognition (
  id bigserial primary key,
  sender_id uuid references public.profiles(id) on delete cascade,
  recipient_id uuid references public.profiles(id) on delete cascade,
  message text not null,
  badge text, -- optional: type of recognition (e.g., "helper", "innovator")
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sender_recipient_not_same check (sender_id <> recipient_id)
);

-- 2. Enable row level security
alter table public.peer_recognition enable row level security;

-- 3. RLS Policies
-- Select: Only sender or recipient can view
create policy "Peer recognition: sender can select" on public.peer_recognition
  for select using (auth.uid() = sender_id);

create policy "Peer recognition: recipient can select" on public.peer_recognition
  for select using (auth.uid() = recipient_id);

-- Insert: Only authenticated users can send recognition
create policy "Peer recognition: authenticated can insert" on public.peer_recognition
  for insert to authenticated
  with check (auth.uid() = sender_id);

-- Update: Only sender can update their own recognition (e.g., fix typo)
create policy "Peer recognition: sender can update" on public.peer_recognition
  for update using (auth.uid() = sender_id);

-- Delete: Only sender can delete their own recognition
create policy "Peer recognition: sender can delete" on public.peer_recognition
  for delete using (auth.uid() = sender_id);

-- 4. Add indexes for performance
create index idx_peer_recognition_sender_id on public.peer_recognition(sender_id);
create index idx_peer_recognition_recipient_id on public.peer_recognition(recipient_id);
create index idx_peer_recognition_created_at on public.peer_recognition(created_at desc);

-- 5. Create or replace updated_at trigger function if it doesn't exist
-- This follows our SQL best practices with SECURITY INVOKER and empty search_path
do $$
begin
  if not exists (select 1 from pg_proc where proname = 'update_updated_at') then
    create or replace function public.update_updated_at()
    returns trigger
    language plpgsql
    security invoker
    set search_path = ''
    as $$
    begin
      new.updated_at := now();
      return new;
    end;
    $$;
  end if;
end
$$;

-- 6. Create trigger for updated_at
create trigger update_peer_recognition_updated_at
before update on public.peer_recognition
for each row
execute function public.update_updated_at();

-- 7. Add service role policies for admin access
create policy "Peer recognition: service role can select all" on public.peer_recognition
  for select to service_role
  using (true);

commit;
