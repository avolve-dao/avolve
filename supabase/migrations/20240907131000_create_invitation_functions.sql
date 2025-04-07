-- Migration: Create Invitation and Member Journey Functions
-- This migration adds functions to manage the invitation system and member journey

-- Function to generate a unique invitation code
create or replace function public.generate_invitation_code()
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excluding similar looking characters
  code text := '';
  i integer;
  random_index integer;
  code_exists boolean;
begin
  -- Generate a 6-character code
  for i in 1..6 loop
    random_index := floor(random() * length(chars)) + 1;
    code := code || substr(chars, random_index, 1);
  end loop;
  
  -- Check if the code already exists
  select exists(select 1 from public.invitations where invitations.code = code) into code_exists;
  
  -- If code exists, recursively generate a new one
  if code_exists then
    return public.generate_invitation_code();
  end if;
  
  return code;
end;
$$;

-- Function to create a new invitation
create or replace function public.create_invitation(p_email text default null)
returns json
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_current_level text;
  v_invitation_limit integer;
  v_used_invitations integer;
  v_code text;
  v_invitation_id uuid;
  v_result json;
begin
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if the user exists
  if v_user_id is null then
    return json_build_object(
      'success', false,
      'message', 'You must be logged in to create an invitation'
    );
  end if;
  
  -- Get the user's current level
  select current_level into v_current_level
  from public.member_journey
  where user_id = v_user_id;
  
  -- If the user doesn't have a journey record, they can't create invitations
  if v_current_level is null then
    return json_build_object(
      'success', false,
      'message', 'You must start your member journey before creating invitations'
    );
  end if;
  
  -- Set invitation limits based on level
  case v_current_level
    when 'full_member' then v_invitation_limit := 5;
    when 'contributor' then v_invitation_limit := 3;
    when 'vouched' then v_invitation_limit := 1;
    else v_invitation_limit := 0;
  end case;
  
  -- If the user is at the 'invited' level, they can't create invitations
  if v_current_level = 'invited' then
    return json_build_object(
      'success', false,
      'message', 'You need to be vouched for before you can invite others'
    );
  end if;
  
  -- Count invitations created in the last 30 days
  select count(*) into v_used_invitations
  from public.invitations
  where created_by = v_user_id
  and created_at > (now() - interval '30 days');
  
  -- Check if the user has reached their invitation limit
  if v_used_invitations >= v_invitation_limit then
    return json_build_object(
      'success', false,
      'message', format('You have reached your monthly invitation limit of %s', v_invitation_limit)
    );
  end if;
  
  -- Generate a unique invitation code
  v_code := public.generate_invitation_code();
  
  -- Create the invitation
  insert into public.invitations (code, created_by, email, expires_at)
  values (v_code, v_user_id, p_email, now() + interval '14 days')
  returning id into v_invitation_id;
  
  -- Record achievement for creating an invitation
  insert into public.achievements (user_id, type, data)
  values (v_user_id, 'created_invitation', json_build_object('code', v_code));
  
  return json_build_object(
    'success', true,
    'message', 'Invitation created successfully',
    'code', v_code,
    'invitation_id', v_invitation_id
  );
end;
$$;

-- Function to check if an invitation code is valid
create or replace function public.check_invitation_code(p_code text)
returns json
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_invitation record;
  v_result json;
begin
  -- Standardize the code format (uppercase)
  p_code := upper(trim(p_code));
  
  -- Check if the invitation exists and is valid
  select * into v_invitation
  from public.invitations
  where code = p_code;
  
  -- If invitation doesn't exist
  if v_invitation is null then
    return json_build_object(
      'valid', false,
      'message', 'Invalid invitation code'
    );
  end if;
  
  -- If invitation has expired
  if v_invitation.expires_at < now() then
    -- Update status to expired if it's still pending
    if v_invitation.status = 'pending' then
      update public.invitations
      set status = 'expired'
      where id = v_invitation.id;
    end if;
    
    return json_build_object(
      'valid', false,
      'message', 'This invitation code has expired'
    );
  end if;
  
  -- If invitation has already been accepted
  if v_invitation.status = 'accepted' then
    return json_build_object(
      'valid', false,
      'message', 'This invitation code has already been used'
    );
  end if;
  
  -- If invitation is valid
  return json_build_object(
    'valid', true,
    'message', 'Valid invitation code',
    'invitation_id', v_invitation.id,
    'created_by', v_invitation.created_by,
    'email', v_invitation.email
  );
end;
$$;

-- Function to accept an invitation and start the member journey
create or replace function public.accept_invitation(p_code text)
returns json
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_invitation_id uuid;
  v_invitation_valid boolean;
  v_invitation_message text;
  v_created_by uuid;
  v_check_result json;
begin
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if the user exists
  if v_user_id is null then
    return json_build_object(
      'success', false,
      'message', 'You must be logged in to accept an invitation'
    );
  end if;
  
  -- Check if the user already has a journey record
  if exists (select 1 from public.member_journey where user_id = v_user_id) then
    return json_build_object(
      'success', false,
      'message', 'You have already started your member journey'
    );
  end if;
  
  -- Check if the invitation code is valid
  v_check_result := public.check_invitation_code(p_code);
  v_invitation_valid := (v_check_result->>'valid')::boolean;
  v_invitation_message := v_check_result->>'message';
  
  if not v_invitation_valid then
    return json_build_object(
      'success', false,
      'message', v_invitation_message
    );
  end if;
  
  -- Get the invitation ID and creator
  v_invitation_id := (v_check_result->>'invitation_id')::uuid;
  v_created_by := (v_check_result->>'created_by')::uuid;
  
  -- Update the invitation status
  update public.invitations
  set status = 'accepted', accepted_at = now()
  where id = v_invitation_id;
  
  -- Create a member journey record for the user
  insert into public.member_journey (user_id, current_level, invitation_id)
  values (v_user_id, 'invited', v_invitation_id);
  
  -- Record achievement for accepting an invitation
  insert into public.achievements (user_id, type, data)
  values (v_user_id, 'joined_platform', json_build_object('invitation_id', v_invitation_id));
  
  -- Record achievement for the inviter
  insert into public.achievements (user_id, type, data)
  values (v_created_by, 'invitation_accepted', json_build_object(
    'invitation_id', v_invitation_id,
    'invited_user_id', v_user_id
  ));
  
  return json_build_object(
    'success', true,
    'message', 'Invitation accepted successfully',
    'journey_started', true
  );
end;
$$;

-- Function to vouch for a user
create or replace function public.vouch_for_user(p_user_id uuid)
returns json
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_voucher_id uuid;
  v_voucher_level text;
  v_target_journey record;
  v_vouch_count integer;
  v_already_vouched boolean;
begin
  -- Get the current user ID (the voucher)
  v_voucher_id := auth.uid();
  
  -- Check if the voucher exists
  if v_voucher_id is null then
    return json_build_object(
      'success', false,
      'message', 'You must be logged in to vouch for someone'
    );
  end if;
  
  -- Check if the voucher is vouching for themselves
  if v_voucher_id = p_user_id then
    return json_build_object(
      'success', false,
      'message', 'You cannot vouch for yourself'
    );
  end if;
  
  -- Get the voucher's level
  select current_level into v_voucher_level
  from public.member_journey
  where user_id = v_voucher_id;
  
  -- Check if the voucher has the required level to vouch
  if v_voucher_level not in ('contributor', 'full_member') then
    return json_build_object(
      'success', false,
      'message', 'You must be a Contributor or Full Member to vouch for others'
    );
  end if;
  
  -- Get the target user's journey record
  select * into v_target_journey
  from public.member_journey
  where user_id = p_user_id;
  
  -- Check if the target user exists
  if v_target_journey is null then
    return json_build_object(
      'success', false,
      'message', 'The user you are trying to vouch for does not exist or has not started their journey'
    );
  end if;
  
  -- Check if the target user is already at a higher level
  if v_target_journey.current_level not in ('invited') then
    return json_build_object(
      'success', false,
      'message', 'This user has already been vouched for'
    );
  end if;
  
  -- Check if the voucher has already vouched for this user
  select exists(
    select 1 from public.vouches
    where voucher_id = v_voucher_id and vouched_user_id = p_user_id
  ) into v_already_vouched;
  
  if v_already_vouched then
    return json_build_object(
      'success', false,
      'message', 'You have already vouched for this user'
    );
  end if;
  
  -- Record the vouch
  insert into public.vouches (voucher_id, vouched_user_id)
  values (v_voucher_id, p_user_id);
  
  -- Update the vouch count for the user
  update public.member_journey
  set vouch_count = vouch_count + 1
  where user_id = p_user_id
  returning vouch_count into v_vouch_count;
  
  -- If the user has received enough vouches, upgrade their level
  if v_vouch_count >= 2 then
    update public.member_journey
    set current_level = 'vouched', level_updated_at = now()
    where user_id = p_user_id;
    
    -- Record achievement for being vouched
    insert into public.achievements (user_id, type, data)
    values (p_user_id, 'received_vouches', json_build_object('count', v_vouch_count));
  end if;
  
  -- Record achievement for the voucher
  insert into public.achievements (user_id, type, data)
  values (v_voucher_id, 'vouched_for_user', json_build_object('vouched_user_id', p_user_id));
  
  return json_build_object(
    'success', true,
    'message', 'Successfully vouched for the user',
    'vouch_count', v_vouch_count,
    'level_upgraded', v_vouch_count >= 2
  );
end;
$$;

-- Function to record a contribution and potentially upgrade membership level
create or replace function public.record_contribution(p_contribution_type text, p_data jsonb default '{}'::jsonb)
returns json
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_current_level text;
  v_contribution_count integer;
  v_level_upgraded boolean := false;
begin
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if the user exists
  if v_user_id is null then
    return json_build_object(
      'success', false,
      'message', 'You must be logged in to record a contribution'
    );
  end if;
  
  -- Get the user's current level and contribution count
  select current_level, contribution_count into v_current_level, v_contribution_count
  from public.member_journey
  where user_id = v_user_id;
  
  -- If the user doesn't have a journey record, they can't contribute
  if v_current_level is null then
    return json_build_object(
      'success', false,
      'message', 'You must start your member journey before making contributions'
    );
  end if;
  
  -- Record the contribution
  insert into public.contributions (user_id, type, data)
  values (v_user_id, p_contribution_type, p_data);
  
  -- Update the contribution count
  update public.member_journey
  set contribution_count = contribution_count + 1
  where user_id = v_user_id
  returning contribution_count into v_contribution_count;
  
  -- Check if the user should be upgraded based on contributions
  if v_current_level = 'vouched' and v_contribution_count >= 3 then
    update public.member_journey
    set current_level = 'contributor', level_updated_at = now()
    where user_id = v_user_id;
    v_level_upgraded := true;
    v_current_level := 'contributor';
    
    -- Record achievement for becoming a contributor
    insert into public.achievements (user_id, type, data)
    values (v_user_id, 'became_contributor', json_build_object('contribution_count', v_contribution_count));
  elsif v_current_level = 'contributor' and v_contribution_count >= 10 then
    update public.member_journey
    set current_level = 'full_member', level_updated_at = now()
    where user_id = v_user_id;
    v_level_upgraded := true;
    v_current_level := 'full_member';
    
    -- Record achievement for becoming a full member
    insert into public.achievements (user_id, type, data)
    values (v_user_id, 'became_full_member', json_build_object('contribution_count', v_contribution_count));
  end if;
  
  -- Record achievement for the contribution
  insert into public.achievements (user_id, type, data)
  values (v_user_id, 'made_contribution', json_build_object(
    'type', p_contribution_type,
    'contribution_count', v_contribution_count
  ));
  
  return json_build_object(
    'success', true,
    'message', 'Contribution recorded successfully',
    'contribution_count', v_contribution_count,
    'current_level', v_current_level,
    'level_upgraded', v_level_upgraded
  );
end;
$$;

-- Function to get a user's member journey status
create or replace function public.get_member_journey_status()
returns json
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_journey record;
  v_achievements record;
  v_progress json;
begin
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if the user exists
  if v_user_id is null then
    return json_build_object(
      'has_started', false,
      'message', 'You must be logged in to view your journey'
    );
  end if;
  
  -- Get the user's journey record
  select * into v_journey
  from public.member_journey
  where user_id = v_user_id;
  
  -- If the user doesn't have a journey record
  if v_journey is null then
    return json_build_object(
      'has_started', false,
      'message', 'You have not started your member journey yet'
    );
  end if;
  
  -- Calculate progress percentages for each level
  case v_journey.current_level
    when 'invited' then
      v_progress := json_build_object(
        'invited', 100,
        'vouched', v_journey.vouch_count * 50, -- 50% per vouch, need 2
        'contributor', 0,
        'full_member', 0
      );
    when 'vouched' then
      v_progress := json_build_object(
        'invited', 100,
        'vouched', 100,
        'contributor', v_journey.contribution_count * 33.33, -- ~33% per contribution, need 3
        'full_member', 0
      );
    when 'contributor' then
      v_progress := json_build_object(
        'invited', 100,
        'vouched', 100,
        'contributor', 100,
        'full_member', v_journey.contribution_count >= 10 ? 100 : (v_journey.contribution_count - 3) * 14.28 -- ~14% per contribution after becoming contributor, need 7 more
      );
    when 'full_member' then
      v_progress := json_build_object(
        'invited', 100,
        'vouched', 100,
        'contributor', 100,
        'full_member', 100
      );
  end case;
  
  -- Get the user's achievements
  with user_achievements as (
    select type, data, unlocked_at
    from public.achievements
    where user_id = v_user_id
    order by unlocked_at desc
  )
  select json_agg(json_build_object(
    'type', type,
    'data', data,
    'unlocked_at', unlocked_at
  )) into v_achievements
  from user_achievements;
  
  -- Return the journey status
  return json_build_object(
    'has_started', true,
    'user_id', v_journey.user_id,
    'current_level', v_journey.current_level,
    'vouch_count', v_journey.vouch_count,
    'contribution_count', v_journey.contribution_count,
    'has_paid', v_journey.has_paid,
    'journey_started_at', v_journey.journey_started_at,
    'level_updated_at', v_journey.level_updated_at,
    'achievements', coalesce(v_achievements, '[]'::json),
    'progress', v_progress
  );
end;
$$;

-- Create missing tables if they don't exist
create table if not exists public.vouches (
  id uuid primary key default gen_random_uuid(),
  voucher_id uuid not null references auth.users(id) on delete cascade,
  vouched_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(voucher_id, vouched_user_id)
);

create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  data jsonb not null default '{}'::jsonb,
  unlocked_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.vouches enable row level security;
alter table public.contributions enable row level security;
alter table public.achievements enable row level security;

-- Create RLS policies for vouches
create policy "Users can view their own vouches (given or received)"
on public.vouches for select
to authenticated
using (
  auth.uid() = voucher_id or auth.uid() = vouched_user_id
);

create policy "Users can create vouches"
on public.vouches for insert
to authenticated
with check (
  auth.uid() = voucher_id
);

-- Create RLS policies for contributions
create policy "Users can view their own contributions"
on public.contributions for select
to authenticated
using (
  auth.uid() = user_id
);

create policy "Users can create their own contributions"
on public.contributions for insert
to authenticated
with check (
  auth.uid() = user_id
);

-- Create RLS policies for achievements
create policy "Users can view their own achievements"
on public.achievements for select
to authenticated
using (
  auth.uid() = user_id
);

create policy "Users can create their own achievements"
on public.achievements for insert
to authenticated
with check (
  auth.uid() = user_id
);
