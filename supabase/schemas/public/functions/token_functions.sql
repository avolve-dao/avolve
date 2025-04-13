-- Token management functions
-- This file contains functions for token-related operations

-- Function to get token hierarchy
create or replace function public.get_token_hierarchy()
returns setof public.tokens
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return query
  select t.*
  from public.tokens t
  order by 
    case when t.parent_token_id is null then 0 else 1 end,
    t.symbol;
end;
$$;

-- Function to get user tokens
create or replace function public.get_user_tokens(p_user_id uuid)
returns table (
  token_id uuid,
  token_symbol text,
  token_name text,
  description text,
  gradient_class text,
  icon_url text,
  is_primary boolean,
  is_transferable boolean,
  parent_token_id uuid,
  parent_token_symbol text,
  balance numeric,
  staked_balance numeric,
  pending_release numeric
)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Check if user exists
  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'User not found';
  end if;
  
  -- Return user tokens with details
  return query
  select
    t.id as token_id,
    t.symbol as token_symbol,
    t.name as token_name,
    t.description,
    t.gradient_class,
    t.icon_url,
    t.is_primary,
    t.is_transferable,
    t.parent_token_id,
    pt.symbol as parent_token_symbol,
    ut.balance,
    ut.staked_balance,
    ut.pending_release
  from
    public.tokens t
    left join public.tokens pt on t.parent_token_id = pt.id
    left join public.user_tokens ut on t.id = ut.token_id and ut.user_id = p_user_id
  where
    ut.user_id = p_user_id and ut.balance > 0
  order by
    t.is_primary desc,
    t.symbol;
end;
$$;

-- Function to check if user has token access
create or replace function public.has_token_access(
  content_token_symbol text,
  user_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token_id uuid;
  v_min_role_id uuid;
  v_user_has_role boolean;
  v_is_introductory boolean;
  v_user_phase text;
begin
  -- Get token ID and minimum role requirement
  select id, min_role_id into v_token_id, v_min_role_id
  from public.tokens
  where symbol = content_token_symbol;
  
  if v_token_id is null then
    return false;
  end if;
  
  -- Check if user has the token
  if exists (
    select 1
    from public.user_tokens
    where user_id = has_token_access.user_id
    and token_id = v_token_id
    and balance > 0
  ) then
    return true;
  end if;
  
  -- If token has a minimum role requirement, check if user has that role or higher
  if v_min_role_id is not null then
    select exists (
      select 1
      from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = has_token_access.user_id
      and (
        ur.role_id = v_min_role_id
        or r.is_admin = true
      )
      and (ur.expires_at is null or ur.expires_at > now())
    ) into v_user_has_role;
    
    if v_user_has_role then
      return true;
    end if;
  end if;
  
  -- Check if user is in discovery or onboarding phase
  -- and if the content is introductory or a top-level token
  select 
    case 
      when count(ut.*) = 0 then 'discovery'
      when count(ut.*) <= 2 then 'onboarding'
      when count(ut.*) <= 6 then 'scaffolding'
      else 'endgame'
    end into v_user_phase
  from public.user_tokens ut
  where ut.user_id = has_token_access.user_id
  and ut.balance > 0;
  
  if v_user_phase in ('discovery', 'onboarding') and 
     (content_token_symbol in ('GEN', 'SAP', 'SCQ') or
      content_token_symbol = 'introductory') then
    return true;
  end if;
  
  return false;
end;
$$;

-- Function to check if user has access to a pillar
create or replace function public.has_pillar_access(
  pillar_id uuid,
  user_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token_symbol text;
  v_min_role_id uuid;
  v_user_has_role boolean;
begin
  -- Get pillar details
  select token_symbol, min_role_id into v_token_symbol, v_min_role_id
  from public.pillars
  where id = pillar_id;
  
  -- If pillar has a token requirement, check token access
  if v_token_symbol is not null then
    if public.has_token_access(v_token_symbol, user_id) then
      return true;
    end if;
  end if;
  
  -- If pillar has a minimum role requirement, check if user has that role or higher
  if v_min_role_id is not null then
    select exists (
      select 1
      from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = has_pillar_access.user_id
      and (
        ur.role_id = v_min_role_id
        or r.is_admin = true
      )
      and (ur.expires_at is null or ur.expires_at > now())
    ) into v_user_has_role;
    
    if v_user_has_role then
      return true;
    end if;
  end if;
  
  -- If no token or role requirement, allow access
  if v_token_symbol is null and v_min_role_id is null then
    return true;
  end if;
  
  return false;
end;
$$;

-- Function to check if user has access to a section
create or replace function public.has_section_access(
  section_id uuid,
  user_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token_symbol text;
  v_min_role_id uuid;
  v_pillar_id uuid;
  v_user_has_role boolean;
  v_is_first_section boolean;
  v_user_phase text;
begin
  -- Get section details
  select 
    token_symbol, 
    min_role_id,
    pillar_id
  into 
    v_token_symbol, 
    v_min_role_id,
    v_pillar_id
  from public.sections
  where id = section_id;
  
  -- If section has a token requirement, check token access
  if v_token_symbol is not null then
    if public.has_token_access(v_token_symbol, user_id) then
      return true;
    end if;
  end if;
  
  -- If section has a minimum role requirement, check if user has that role or higher
  if v_min_role_id is not null then
    select exists (
      select 1
      from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = has_section_access.user_id
      and (
        ur.role_id = v_min_role_id
        or r.is_admin = true
      )
      and (ur.expires_at is null or ur.expires_at > now())
    ) into v_user_has_role;
    
    if v_user_has_role then
      return true;
    end if;
  end if;
  
  -- Check if this is the first section in the pillar
  select section_id = min(s.id)
  into v_is_first_section
  from public.sections s
  where s.pillar_id = v_pillar_id
  group by s.pillar_id;
  
  -- Check if user is in discovery or onboarding phase
  select 
    case 
      when count(ut.*) = 0 then 'discovery'
      when count(ut.*) <= 2 then 'onboarding'
      when count(ut.*) <= 6 then 'scaffolding'
      else 'endgame'
    end into v_user_phase
  from public.user_tokens ut
  where ut.user_id = has_section_access.user_id
  and ut.balance > 0;
  
  -- Grant access to first section for users in discovery or onboarding phase
  if v_is_first_section and v_user_phase in ('discovery', 'onboarding') then
    return true;
  end if;
  
  -- If no token or role requirement, allow access
  if v_token_symbol is null and v_min_role_id is null then
    return true;
  end if;
  
  return false;
end;
$$;

-- Function to check if user has access to a component
create or replace function public.has_component_access(
  component_id uuid,
  user_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token_symbol text;
  v_min_role_id uuid;
  v_section_id uuid;
  v_is_introductory boolean;
  v_user_has_role boolean;
  v_user_phase text;
begin
  -- Get component details
  select 
    token_symbol, 
    min_role_id,
    section_id,
    is_introductory
  into 
    v_token_symbol, 
    v_min_role_id,
    v_section_id,
    v_is_introductory
  from public.components
  where id = component_id;
  
  -- If component has a token requirement, check token access
  if v_token_symbol is not null then
    if public.has_token_access(v_token_symbol, user_id) then
      return true;
    end if;
  end if;
  
  -- If component has a minimum role requirement, check if user has that role or higher
  if v_min_role_id is not null then
    select exists (
      select 1
      from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = has_component_access.user_id
      and (
        ur.role_id = v_min_role_id
        or r.is_admin = true
      )
      and (ur.expires_at is null or ur.expires_at > now())
    ) into v_user_has_role;
    
    if v_user_has_role then
      return true;
    end if;
  end if;
  
  -- Check if user is in discovery or onboarding phase
  select 
    case 
      when count(ut.*) = 0 then 'discovery'
      when count(ut.*) <= 2 then 'onboarding'
      when count(ut.*) <= 6 then 'scaffolding'
      else 'endgame'
    end into v_user_phase
  from public.user_tokens ut
  where ut.user_id = has_component_access.user_id
  and ut.balance > 0;
  
  -- Grant access to introductory components for users in discovery or onboarding phase
  if v_is_introductory and v_user_phase in ('discovery', 'onboarding') then
    return true;
  end if;
  
  -- If no token or role requirement, allow access
  if v_token_symbol is null and v_min_role_id is null then
    return true;
  end if;
  
  -- Check if user has access to the parent section
  return public.has_section_access(v_section_id, user_id);
end;
$$;
