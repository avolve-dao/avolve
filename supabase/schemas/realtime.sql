-- avolve realtime broadcast functions
-- this file contains the realtime broadcast functions for the avolve platform

-- ensure realtime schema exists
create schema if not exists realtime;

-- token transaction broadcast function
create or replace function public.broadcast_token_transaction()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- broadcast to token channel
  perform realtime.broadcast_changes(
    'token:' || new.token_id::text,  -- topic
    tg_op,                           -- event
    tg_op,                           -- operation
    tg_table_name,                   -- table
    tg_table_schema,                 -- schema
    new,                             -- new record
    old                              -- old record
  );
  
  -- also broadcast to user-specific channels
  if new.from_user_id is not null then
    perform realtime.broadcast_changes(
      'user:' || new.from_user_id::text,  -- topic
      'token_transaction',                -- event
      tg_op,                              -- operation
      tg_table_name,                      -- table
      tg_table_schema,                    -- schema
      new,                                -- new record
      old                                 -- old record
    );
  end if;
  
  if new.to_user_id is not null then
    perform realtime.broadcast_changes(
      'user:' || new.to_user_id::text,    -- topic
      'token_transaction',                -- event
      tg_op,                              -- operation
      tg_table_name,                      -- table
      tg_table_schema,                    -- schema
      new,                                -- new record
      old                                 -- old record
    );
  end if;
  
  return null;
end;
$$;

-- create trigger for token transactions
create trigger broadcast_token_transactions
after insert or update
on public.token_transactions
for each row
execute function public.broadcast_token_transaction();

-- meeting status broadcast function
create or replace function public.broadcast_meeting_status()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- broadcast to meeting channel
  perform realtime.broadcast_changes(
    'meeting:' || new.id::text,     -- topic
    'status_change',                -- event
    tg_op,                          -- operation
    tg_table_name,                  -- table
    tg_table_schema,                -- schema
    new,                            -- new record
    old                             -- old record
  );
  
  -- broadcast to route channel
  perform realtime.broadcast_changes(
    'route:' || new.route_id::text, -- topic
    'meeting_update',               -- event
    tg_op,                          -- operation
    tg_table_name,                  -- table
    tg_table_schema,                -- schema
    new,                            -- new record
    old                             -- old record
  );
  
  return null;
end;
$$;

-- create trigger for meeting status changes
create trigger broadcast_meeting_status
after update of status
on public.weekly_meetings
for each row
execute function public.broadcast_meeting_status();

-- achievement broadcast function
create or replace function public.broadcast_achievement()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  -- get user_id from profile_id
  select user_id into v_user_id
  from public.genius_profiles
  where id = new.profile_id;
  
  -- broadcast to user channel
  if v_user_id is not null then
    perform realtime.broadcast_changes(
      'user:' || v_user_id::text,   -- topic
      'achievement',                -- event
      tg_op,                        -- operation
      tg_table_name,                -- table
      tg_table_schema,              -- schema
      new,                          -- new record
      null                          -- old record
    );
  end if;
  
  return null;
end;
$$;

-- create trigger for achievements
create trigger broadcast_achievements
after insert
on public.genius_achievements
for each row
execute function public.broadcast_achievement();

-- meeting participant broadcast function
create or replace function public.broadcast_meeting_participant()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- broadcast to meeting channel
  perform realtime.broadcast_changes(
    'meeting:' || new.meeting_id::text, -- topic
    'participant_update',               -- event
    tg_op,                              -- operation
    tg_table_name,                      -- table
    tg_table_schema,                    -- schema
    new,                                -- new record
    old                                 -- old record
  );
  
  -- broadcast to group channel if group_id exists
  if new.group_id is not null then
    perform realtime.broadcast_changes(
      'group:' || new.group_id::text,   -- topic
      'participant_update',             -- event
      tg_op,                            -- operation
      tg_table_name,                    -- table
      tg_table_schema,                  -- schema
      new,                              -- new record
      old                               -- old record
    );
  end if;
  
  return null;
end;
$$;

-- create trigger for meeting participants
create trigger broadcast_meeting_participants
after insert or update
on public.meeting_participants
for each row
execute function public.broadcast_meeting_participant();

-- create RLS policy for realtime messages
create policy "Authenticated users can receive broadcasts"
on realtime.messages
for select
to authenticated
using (true);
