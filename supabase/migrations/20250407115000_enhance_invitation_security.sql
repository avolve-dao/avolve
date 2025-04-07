-- Migration: Enhance Invitation Security
-- Description: Improves the invitation system with additional security features and tracking
-- Date: 2025-04-07

-- Add additional fields to the invitations table for better tracking and security
alter table public.invitations 
  add column if not exists invitation_type text not null default 'standard' check (invitation_type in ('standard', 'admin', 'contributor', 'partner')),
  add column if not exists max_uses integer not null default 1 check (max_uses > 0),
  add column if not exists uses_count integer not null default 0 check (uses_count >= 0),
  add column if not exists security_level text not null default 'normal' check (security_level in ('low', 'normal', 'high')),
  add column if not exists metadata jsonb not null default '{}'::jsonb;

-- Create a secure function to generate invitation codes
create or replace function public.generate_invitation_code(
  p_length integer default 12,
  p_prefix text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Removed similar looking characters
  v_code text := '';
  v_i integer;
  v_random_bytes bytea;
  v_random_int integer;
  v_prefix text;
begin
  -- Set default prefix based on current date if not provided
  v_prefix := coalesce(p_prefix, to_char(now(), 'YYMM'));
  
  -- Start with the prefix
  v_code := v_prefix || '-';
  
  -- Generate random characters
  v_random_bytes := gen_random_bytes(p_length);
  
  for v_i in 0..(p_length-1) loop
    v_random_int := get_byte(v_random_bytes, v_i) % length(v_chars) + 1;
    v_code := v_code || substr(v_chars, v_random_int, 1);
    
    -- Add a hyphen every 4 characters for readability
    if v_i % 4 = 3 and v_i < p_length-1 then
      v_code := v_code || '-';
    end if;
  end loop;
  
  return v_code;
end;
$$;

-- Create a function to create new invitations with enhanced security
create or replace function public.create_secure_invitation(
  p_email text default null,
  p_invitation_type text default 'standard',
  p_max_uses integer default 1,
  p_security_level text default 'normal',
  p_expires_in interval default interval '14 days',
  p_metadata jsonb default '{}'::jsonb
)
returns json
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_code text;
  v_invitation_id uuid;
  v_prefix text;
  v_code_length integer;
begin
  -- Check if user is authenticated
  if v_user_id is null then
    return json_build_object('success', false, 'message', 'Authentication required');
  end if;
  
  -- Determine code prefix and length based on invitation type
  case p_invitation_type
    when 'admin' then
      v_prefix := 'ADM';
      v_code_length := 16;
    when 'contributor' then
      v_prefix := 'CON';
      v_code_length := 12;
    when 'partner' then
      v_prefix := 'PTR';
      v_code_length := 12;
    else
      v_prefix := 'INV';
      v_code_length := 8;
  end case;
  
  -- Generate a unique invitation code
  loop
    v_code := public.generate_invitation_code(v_code_length, v_prefix);
    
    -- Check if the code already exists
    if not exists (select 1 from public.invitations where code = v_code) then
      exit;
    end if;
  end loop;
  
  -- Insert the new invitation
  insert into public.invitations (
    code,
    created_by,
    email,
    status,
    expires_at,
    invitation_type,
    max_uses,
    security_level,
    metadata
  ) values (
    v_code,
    v_user_id,
    p_email,
    'pending',
    now() + p_expires_in,
    p_invitation_type,
    p_max_uses,
    p_security_level,
    p_metadata
  ) returning id into v_invitation_id;
  
  -- Log the invitation creation
  insert into public.security_logs (
    user_id,
    event_type,
    severity,
    details
  ) values (
    v_user_id,
    'invitation_created',
    'info',
    jsonb_build_object(
      'invitation_id', v_invitation_id,
      'code', v_code,
      'invitation_type', p_invitation_type,
      'security_level', p_security_level,
      'max_uses', p_max_uses
    )
  );
  
  return json_build_object(
    'success', true,
    'invitation_id', v_invitation_id,
    'code', v_code,
    'expires_at', now() + p_expires_in
  );
end;
$$;

-- Create a function to validate and use an invitation
create or replace function public.validate_and_use_invitation(
  p_code text
)
returns json
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_invitation_id uuid;
  v_created_by uuid;
  v_status text;
  v_expires_at timestamptz;
  v_max_uses integer;
  v_uses_count integer;
  v_invitation_type text;
  v_security_level text;
begin
  -- Check if user is authenticated
  if v_user_id is null then
    return json_build_object('success', false, 'message', 'Authentication required');
  end if;
  
  -- Get invitation details
  select 
    id, created_by, status, expires_at, max_uses, uses_count, invitation_type, security_level
  into 
    v_invitation_id, v_created_by, v_status, v_expires_at, v_max_uses, v_uses_count, v_invitation_type, v_security_level
  from public.invitations
  where code = p_code;
  
  -- Check if invitation exists
  if v_invitation_id is null then
    -- Log failed attempt
    insert into public.security_logs (
      user_id,
      event_type,
      severity,
      details
    ) values (
      v_user_id,
      'invitation_validation_failed',
      'warning',
      jsonb_build_object(
        'code', p_code,
        'reason', 'invalid_code'
      )
    );
    
    return json_build_object('success', false, 'message', 'Invalid invitation code');
  end if;
  
  -- Check if invitation is still valid
  if v_status != 'pending' then
    -- Log failed attempt
    insert into public.security_logs (
      user_id,
      event_type,
      severity,
      details
    ) values (
      v_user_id,
      'invitation_validation_failed',
      'info',
      jsonb_build_object(
        'invitation_id', v_invitation_id,
        'code', p_code,
        'reason', 'not_pending',
        'status', v_status
      )
    );
    
    return json_build_object('success', false, 'message', 'Invitation is no longer valid');
  end if;
  
  -- Check if invitation has expired
  if v_expires_at < now() then
    -- Update invitation status
    update public.invitations
    set status = 'expired'
    where id = v_invitation_id;
    
    -- Log failed attempt
    insert into public.security_logs (
      user_id,
      event_type,
      severity,
      details
    ) values (
      v_user_id,
      'invitation_validation_failed',
      'info',
      jsonb_build_object(
        'invitation_id', v_invitation_id,
        'code', p_code,
        'reason', 'expired',
        'expires_at', v_expires_at
      )
    );
    
    return json_build_object('success', false, 'message', 'Invitation has expired');
  end if;
  
  -- Check if invitation has reached max uses
  if v_uses_count >= v_max_uses then
    -- Update invitation status
    update public.invitations
    set status = 'expired'
    where id = v_invitation_id;
    
    -- Log failed attempt
    insert into public.security_logs (
      user_id,
      event_type,
      severity,
      details
    ) values (
      v_user_id,
      'invitation_validation_failed',
      'info',
      jsonb_build_object(
        'invitation_id', v_invitation_id,
        'code', p_code,
        'reason', 'max_uses_reached',
        'max_uses', v_max_uses
      )
    );
    
    return json_build_object('success', false, 'message', 'Invitation has reached maximum number of uses');
  end if;
  
  -- Increment the uses count
  update public.invitations
  set 
    uses_count = uses_count + 1,
    status = case when uses_count + 1 >= max_uses then 'accepted' else status end,
    accepted_at = case when status = 'pending' and uses_count = 0 then now() else accepted_at end
  where id = v_invitation_id;
  
  -- Create or update member journey record
  insert into public.member_journey (
    user_id,
    current_level,
    invitation_id,
    journey_started_at
  ) values (
    v_user_id,
    'invited',
    v_invitation_id,
    now()
  )
  on conflict (user_id)
  do update set
    invitation_id = v_invitation_id,
    level_updated_at = now();
  
  -- Log successful use
  insert into public.security_logs (
    user_id,
    event_type,
    severity,
    details
  ) values (
    v_user_id,
    'invitation_accepted',
    'info',
    jsonb_build_object(
      'invitation_id', v_invitation_id,
      'code', p_code,
      'invitation_type', v_invitation_type,
      'created_by', v_created_by
    )
  );
  
  -- Return success
  return json_build_object(
    'success', true,
    'message', 'Invitation accepted successfully',
    'invitation_id', v_invitation_id,
    'invitation_type', v_invitation_type
  );
end;
$$;
