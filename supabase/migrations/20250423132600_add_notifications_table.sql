-- Add notifications table for in-app notifications
-- This migration adds a table to store user notifications for features and invitations

-- Create notifications table
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  content text not null,
  read boolean not null default false,
  data jsonb,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone
);

-- Add comment to table
comment on table public.notifications is 'User notifications for features, invitations, and system events';

-- Add indexes for better performance
create index notifications_user_id_idx on public.notifications(user_id);
create index notifications_read_idx on public.notifications(read);
create index notifications_type_idx on public.notifications(type);

-- Enable Row Level Security
alter table public.notifications enable row level security;

-- Create policies for authenticated users to view their own notifications
create policy "Users can view their own notifications"
  on public.notifications
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Create policy for users to update their own notifications (e.g., mark as read)
create policy "Users can update their own notifications"
  on public.notifications
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create policy for the system to insert notifications for any user
create policy "System can insert notifications"
  on public.notifications
  for insert
  to authenticated
  with check (true);

-- Add function to mark notifications as read
create or replace function public.mark_notifications_read(
  p_notification_ids uuid[] default null,
  p_mark_all boolean default false
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if p_mark_all then
    -- Mark all notifications as read
    update public.notifications
    set read = true, updated_at = now()
    where user_id = auth.uid() and read = false;
  elsif p_notification_ids is not null then
    -- Mark specific notifications as read
    update public.notifications
    set read = true, updated_at = now()
    where id = any(p_notification_ids) and user_id = auth.uid();
  else
    return false;
  end if;

  return true;
end;
$$;

-- Add function to get unread notification count
create or replace function public.get_unread_notification_count()
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count integer;
begin
  select count(*)
  into v_count
  from public.notifications
  where user_id = auth.uid() and read = false;
  
  return v_count;
end;
$$;
