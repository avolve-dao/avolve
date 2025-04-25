-- Migration: Enable Realtime for Peer Recognition
-- Generated: 2025-04-23T12:20:00Z
-- Purpose: Configure Supabase Realtime broadcast for peer recognition events
-- Author: @avolve-dao

begin;

-- 1. Enable realtime for the peer_recognition table
alter publication supabase_realtime add table public.peer_recognition;

-- 2. Create a function to broadcast recognition events
/**
 * Broadcast peer recognition events to Realtime
 * 
 * This function is triggered after a new recognition is inserted
 * and broadcasts the event to all subscribed clients.
 * 
 * @returns trigger
 */
create or replace function public.handle_new_recognition()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_sender_name text;
  v_recipient_name text;
  v_payload jsonb;
begin
  -- Get sender and recipient names for the payload
  select full_name into v_sender_name from public.profiles where id = new.sender_id;
  select full_name into v_recipient_name from public.profiles where id = new.recipient_id;
  
  -- Create the payload with sanitized data
  v_payload := jsonb_build_object(
    'id', new.id,
    'sender_id', new.sender_id,
    'sender_name', v_sender_name,
    'recipient_id', new.recipient_id,
    'recipient_name', v_recipient_name,
    'message', new.message,
    'badge', new.badge,
    'created_at', new.created_at
  );
  
  -- Broadcast to the realtime channel
  perform pg_notify(
    'recognition_events',
    v_payload::text
  );
  
  return new;
end;
$$;

-- 3. Create the trigger to call the function
create trigger broadcast_new_recognition
after insert on public.peer_recognition
for each row
execute function public.handle_new_recognition();

-- 4. Create function to handle recognition reactions
/**
 * Broadcast recognition reaction events
 * 
 * This function is triggered when a user reacts to a recognition
 * and broadcasts the event to all subscribed clients.
 * 
 * @returns trigger
 */
create or replace function public.handle_recognition_reaction()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_reactor_name text;
  v_payload jsonb;
begin
  -- Get reactor name
  select full_name into v_reactor_name from public.profiles where id = new.user_id;
  
  -- Create the payload
  v_payload := jsonb_build_object(
    'id', new.id,
    'recognition_id', new.recognition_id,
    'user_id', new.user_id,
    'user_name', v_reactor_name,
    'reaction_type', new.reaction_type,
    'created_at', new.created_at
  );
  
  -- Broadcast to the realtime channel
  perform pg_notify(
    'recognition_reaction_events',
    v_payload::text
  );
  
  return new;
end;
$$;

-- 5. Create the recognition_reactions table if it doesn't exist
create table if not exists public.recognition_reactions (
  id bigserial primary key,
  recognition_id bigint references public.peer_recognition(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  reaction_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_user_recognition_reaction unique (user_id, recognition_id, reaction_type)
);

-- 6. Enable RLS on the reactions table
alter table public.recognition_reactions enable row level security;

-- 7. Create RLS policies for the reactions table
create policy "Users can see all recognition reactions"
  on public.recognition_reactions
  for select
  using (true);

create policy "Users can add their own reactions"
  on public.recognition_reactions
  for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own reactions"
  on public.recognition_reactions
  for delete
  using (auth.uid() = user_id);

-- 8. Add the trigger to the reactions table
create trigger broadcast_recognition_reaction
after insert on public.recognition_reactions
for each row
execute function public.handle_recognition_reaction();

-- 9. Add updated_at trigger
create trigger update_recognition_reactions_updated_at
before update on public.recognition_reactions
for each row
execute function public.update_updated_at();

-- 10. Add indexes for performance
create index if not exists idx_recognition_reactions_recognition_id 
  on public.recognition_reactions(recognition_id);
create index if not exists idx_recognition_reactions_user_id 
  on public.recognition_reactions(user_id);

-- 11. Enable realtime for the reactions table
alter publication supabase_realtime add table public.recognition_reactions;

commit;
