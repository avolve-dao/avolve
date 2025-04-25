-- Migration: Enhance invitation system
-- Generated: 2025-04-23T13:45:00Z
-- Purpose: Enhance the existing invitation system for invitation-only onboarding
-- Author: @avolve-dao

/**
 * This migration enhances the existing invitations table and adds functions
 * to support the invitation-only onboarding strategy outlined in the
 * Avolve MVP launch plan.
 */

-- Add new columns to the existing invitations table
alter table public.invitations
  add column if not exists max_uses integer not null default 1,
  add column if not exists uses integer not null default 0,
  add column if not exists expires_at timestamptz,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists metadata jsonb default '{}',
  add column if not exists claimed_by uuid references auth.users(id) on delete set null;

-- Rename columns to match our naming convention if they don't exist
do $$
begin
  -- Only rename if the new column doesn't exist and the old one does
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'invitations' and column_name = 'created_by') 
     and exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'invitations' and column_name = 'invited_by') then
    alter table public.invitations rename column invited_by to created_by;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'invitations' and column_name = 'code') 
     and exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'invitations' and column_name = 'invite_code') then
    alter table public.invitations rename column invite_code to code;
  end if;
end $$;

-- Add columns if they don't exist (for backward compatibility)
alter table public.invitations
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists code text;

-- Update the uses column based on the used column
update public.invitations
set uses = case when used then 1 else 0 end
where uses = 0 and used is not null;

-- Add comments to table and columns
comment on table public.invitations is 'Invitation codes for new users to join the platform';
comment on column public.invitations.id is 'Unique identifier for the invitation';
comment on column public.invitations.code is 'Unique invitation code that users enter during signup';
comment on column public.invitations.email is 'Email address of the invited user';
comment on column public.invitations.created_by is 'User ID of the person who created this invitation';
comment on column public.invitations.claimed_by is 'User ID of the person who claimed this invitation';
comment on column public.invitations.max_uses is 'Maximum number of times this invitation can be used';
comment on column public.invitations.uses is 'Current number of times this invitation has been used';
comment on column public.invitations.used is 'Whether this invitation has been used';
comment on column public.invitations.used_at is 'When this invitation was used';
comment on column public.invitations.expires_at is 'When this invitation expires';
comment on column public.invitations.created_at is 'When this invitation was created';
comment on column public.invitations.updated_at is 'When this invitation was last updated';
comment on column public.invitations.metadata is 'Additional metadata for the invitation (e.g., event name, cohort)';

-- Create indexes for performance
create index if not exists idx_invitations_code on public.invitations(code);
create index if not exists idx_invitations_created_by on public.invitations(created_by);
create index if not exists idx_invitations_claimed_by on public.invitations(claimed_by);
create index if not exists idx_invitations_expires_at on public.invitations(expires_at);

-- Enable RLS if not already enabled
alter table public.invitations enable row level security;

-- Create RLS policies (will be skipped if they already exist)
do $$
begin
  -- Everyone can read their own invitations
  if not exists (
    select 1 from pg_policies 
    where tablename = 'invitations' 
    and policyname = 'Users can view their own invitations'
  ) then
    create policy "Users can view their own invitations"
      on public.invitations
      for select
      to authenticated
      using (
        auth.uid() = created_by or 
        auth.uid() = claimed_by or
        exists (
          select 1 from public.profiles
          where profiles.id = auth.uid()
          and profiles.is_admin = true
        )
      );
  end if;

  -- Only admins can create invitations
  if not exists (
    select 1 from pg_policies 
    where tablename = 'invitations' 
    and policyname = 'Only admins can create invitations'
  ) then
    create policy "Only admins can create invitations"
      on public.invitations
      for insert
      to authenticated
      with check (
        exists (
          select 1 from public.profiles
          where profiles.id = auth.uid()
          and profiles.is_admin = true
        )
      );
  end if;

  -- Users with enough tokens can create invitations
  if not exists (
    select 1 from pg_policies 
    where tablename = 'invitations' 
    and policyname = 'Users with enough tokens can create invitations'
  ) then
    create policy "Users with enough tokens can create invitations"
      on public.invitations
      for insert
      to authenticated
      with check (
        exists (
          select 1 from public.get_user_token_balances(auth.uid())
          where token_type = 'GEN' and balance >= 10
        )
      );
  end if;

  -- Only admins can update invitations
  if not exists (
    select 1 from pg_policies 
    where tablename = 'invitations' 
    and policyname = 'Only admins can update invitations'
  ) then
    create policy "Only admins can update invitations"
      on public.invitations
      for update
      to authenticated
      using (
        exists (
          select 1 from public.profiles
          where profiles.id = auth.uid()
          and profiles.is_admin = true
        )
      );
  end if;
end;
$$;

-- Create function to generate a random invitation code
create or replace function public.generate_invitation_code()
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_code text;
  v_exists boolean;
begin
  loop
    -- Generate a random 8-character alphanumeric code
    v_code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if the code already exists
    select exists(
      select 1 from public.invitations where code = v_code
    ) into v_exists;
    
    -- If the code doesn't exist, return it
    if not v_exists then
      return v_code;
    end if;
  end loop;
end;
$$;

-- Create function to create a new invitation
create or replace function public.create_invitation(
  p_email text default null,
  p_max_uses integer default 1,
  p_expires_in interval default interval '7 days',
  p_metadata jsonb default '{}'
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_code text;
  v_invitation public.invitations;
  v_user_id uuid;
  v_is_admin boolean;
  v_token_balance numeric;
begin
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if the user is authenticated
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  
  -- Check if the user is an admin
  select is_admin into v_is_admin
  from public.profiles
  where id = v_user_id;
  
  -- If not an admin, check if they have enough tokens
  if not v_is_admin then
    select balance into v_token_balance
    from public.get_user_token_balances(v_user_id)
    where token_type = 'GEN';
    
    if v_token_balance is null or v_token_balance < 10 then
      raise exception 'Insufficient tokens to create invitation';
    end if;
    
    -- Deduct tokens for creating an invitation
    perform public.update_user_token_balance(v_user_id, 'GEN', -10, 'Created invitation');
  end if;
  
  -- Generate a unique invitation code
  v_code := public.generate_invitation_code();
  
  -- Create the invitation
  insert into public.invitations (
    code,
    email,
    created_by,
    max_uses,
    expires_at,
    metadata
  ) values (
    v_code,
    p_email,
    v_user_id,
    p_max_uses,
    now() + p_expires_in,
    p_metadata
  ) returning * into v_invitation;
  
  -- Return the invitation details
  return jsonb_build_object(
    'id', v_invitation.id,
    'code', v_invitation.code,
    'email', v_invitation.email,
    'max_uses', v_invitation.max_uses,
    'expires_at', v_invitation.expires_at,
    'created_at', v_invitation.created_at
  );
end;
$$;

-- Create function to validate an invitation code
create or replace function public.validate_invitation_code(
  p_code text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_invitation public.invitations;
begin
  -- Get the invitation
  select * into v_invitation
  from public.invitations
  where code = upper(p_code);
  
  -- Check if the invitation exists
  if v_invitation is null then
    return false;
  end if;
  
  -- Check if the invitation has expired
  if v_invitation.expires_at is not null and v_invitation.expires_at < now() then
    return false;
  end if;
  
  -- Check if the invitation has reached its maximum uses
  if v_invitation.uses >= v_invitation.max_uses then
    return false;
  end if;
  
  -- Invitation is valid
  return true;
end;
$$;

-- Create function to claim an invitation
create or replace function public.claim_invitation(
  p_code text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_invitation public.invitations;
  v_user_id uuid;
begin
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if the user is authenticated
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  
  -- Validate the invitation code
  if not public.validate_invitation_code(p_code) then
    return false;
  end if;
  
  -- Get the invitation
  select * into v_invitation
  from public.invitations
  where code = upper(p_code);
  
  -- Update the invitation
  update public.invitations
  set 
    uses = uses + 1,
    used = true,
    used_at = now(),
    claimed_by = v_user_id,
    updated_at = now()
  where id = v_invitation.id;
  
  -- Add a record to the metrics table
  insert into public.metrics (
    user_id,
    event_type,
    event_data
  ) values (
    v_user_id,
    'invitation_claimed',
    jsonb_build_object(
      'invitation_id', v_invitation.id,
      'invitation_code', v_invitation.code,
      'created_by', v_invitation.created_by
    )
  );
  
  -- Invitation claimed successfully
  return true;
end;
$$;

-- Create trigger to update the updated_at timestamp
create or replace function public.update_invitations_updated_at()
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

-- Only create the trigger if it doesn't already exist
do $$
begin
  if not exists (
    select 1 from pg_trigger 
    where tgname = 'update_invitations_updated_at'
  ) then
    execute '
    create trigger update_invitations_updated_at
    before update on public.invitations
    for each row
    execute function public.update_invitations_updated_at();
    ';
  end if;
end;
$$;
