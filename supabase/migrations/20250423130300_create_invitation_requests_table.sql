-- Create invitation_requests table to manage waitlist and invitation requests
-- This migration adds support for users to request invitations when they don't have an invitation code

-- Create enum for invitation request status
create type public.invitation_request_status as enum (
  'pending',
  'approved',
  'denied',
  'invited'
);

-- Create the invitation_requests table
create table if not exists public.invitation_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text not null,
  reason text,
  status public.invitation_request_status not null default 'pending',
  request_count integer not null default 1,
  approved_by uuid references auth.users(id) on delete set null,
  invitation_id uuid references public.invitations(id) on delete set null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  
  -- Add a unique constraint to ensure one record per email
  constraint invitation_requests_email_key unique (email)
);

-- Add helpful comments
comment on table public.invitation_requests is 'Tracks user requests to join the platform';
comment on column public.invitation_requests.email is 'Email address of the user requesting an invitation';
comment on column public.invitation_requests.name is 'Full name of the user requesting an invitation';
comment on column public.invitation_requests.reason is 'Reason provided by the user for wanting to join';
comment on column public.invitation_requests.status is 'Current status of the invitation request';
comment on column public.invitation_requests.request_count is 'Number of times this user has requested an invitation';
comment on column public.invitation_requests.approved_by is 'User ID of the admin who approved the request';
comment on column public.invitation_requests.invitation_id is 'ID of the invitation created for this request';

-- Create indexes for faster lookups
create index if not exists invitation_requests_email_idx on public.invitation_requests (email);
create index if not exists invitation_requests_status_idx on public.invitation_requests (status);
create index if not exists invitation_requests_created_at_idx on public.invitation_requests (created_at);

-- Enable row level security
alter table public.invitation_requests enable row level security;

-- Create RLS policies
-- Admins can view all invitation requests
create policy "Admins can view all invitation requests"
  on public.invitation_requests
  for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

-- Admins can update invitation requests
create policy "Admins can update invitation requests"
  on public.invitation_requests
  for update
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

-- Anyone can insert an invitation request
create policy "Anyone can insert an invitation request"
  on public.invitation_requests
  for insert
  to anon, authenticated
  with check (true);

-- Create trigger to update the updated_at column
create or replace function public.handle_invitation_request_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create trigger for updated_at
drop trigger if exists set_invitation_requests_updated_at on public.invitation_requests;
create trigger set_invitation_requests_updated_at
  before update on public.invitation_requests
  for each row
  execute function public.handle_invitation_request_updated_at();

-- Create function to approve an invitation request and generate an invitation
create or replace function public.approve_invitation_request(
  p_request_id uuid,
  p_max_uses integer default 1,
  p_expires_in interval default interval '7 days'
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_email text;
  v_invitation_id uuid;
  v_invitation_code text;
  v_result jsonb;
begin
  -- Get the current admin ID
  v_admin_id := auth.uid();
  
  -- Check if user is an admin
  if not exists (
    select 1 from public.users
    where id = v_admin_id and is_admin = true
  ) then
    raise exception 'Only admins can approve invitation requests';
  end if;
  
  -- Get the email from the request
  select email into v_email
  from public.invitation_requests
  where id = p_request_id;
  
  if v_email is null then
    raise exception 'Invitation request not found';
  end if;
  
  -- Create an invitation for the email
  insert into public.invitations (
    email,
    code,
    created_by,
    max_uses,
    expires_at
  )
  values (
    v_email,
    public.generate_invitation_code(),
    v_admin_id,
    p_max_uses,
    now() + p_expires_in
  )
  returning id, code into v_invitation_id, v_invitation_code;
  
  -- Update the invitation request
  update public.invitation_requests
  set
    status = 'invited',
    approved_by = v_admin_id,
    invitation_id = v_invitation_id,
    updated_at = now()
  where id = p_request_id
  returning jsonb_build_object(
    'id', id,
    'email', email,
    'status', status,
    'invitation_id', invitation_id
  ) into v_result;
  
  -- Add invitation code to result
  v_result := v_result || jsonb_build_object('invitation_code', v_invitation_code);
  
  return v_result;
end;
$$;

-- Create function to deny an invitation request
create or replace function public.deny_invitation_request(
  p_request_id uuid,
  p_reason text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_result jsonb;
begin
  -- Get the current admin ID
  v_admin_id := auth.uid();
  
  -- Check if user is an admin
  if not exists (
    select 1 from public.users
    where id = v_admin_id and is_admin = true
  ) then
    raise exception 'Only admins can deny invitation requests';
  end if;
  
  -- Update the invitation request
  update public.invitation_requests
  set
    status = 'denied',
    approved_by = v_admin_id,
    updated_at = now()
  where id = p_request_id
  returning jsonb_build_object(
    'id', id,
    'email', email,
    'status', status
  ) into v_result;
  
  if v_result is null then
    raise exception 'Invitation request not found';
  end if;
  
  -- Add denial reason to metrics
  insert into public.metrics (
    event_type,
    user_id,
    details
  )
  values (
    'invitation_request_denied',
    v_admin_id,
    jsonb_build_object(
      'request_id', p_request_id,
      'reason', p_reason
    )
  );
  
  return v_result;
end;
$$;

-- Create function to get pending invitation requests
create or replace function public.get_pending_invitation_requests()
returns setof public.invitation_requests
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_admin_id uuid;
begin
  -- Get the current admin ID
  v_admin_id := auth.uid();
  
  -- Check if user is an admin
  if not exists (
    select 1 from public.users
    where id = v_admin_id and is_admin = true
  ) then
    raise exception 'Only admins can view pending invitation requests';
  end if;
  
  -- Return pending requests
  return query
  select *
  from public.invitation_requests
  where status = 'pending'
  order by created_at desc;
end;
$$;
