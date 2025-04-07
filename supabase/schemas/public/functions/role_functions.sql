-- Role management functions
-- This file contains functions for managing user roles

-- Function to get current user's roles
create or replace function public.get_user_roles()
returns table (
  role_id uuid,
  role_name text,
  role_type public.user_role_type,
  is_admin boolean,
  permissions jsonb,
  assigned_at timestamptz,
  expires_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return query
  select
    r.id as role_id,
    r.name as role_name,
    r.role_type,
    r.is_admin,
    r.permissions,
    ur.assigned_at,
    ur.expires_at
  from
    public.user_roles ur
    join public.roles r on ur.role_id = r.id
  where
    ur.user_id = auth.uid()
    and (ur.expires_at is null or ur.expires_at > now());
end;
$$;

-- Function to check if user has a specific role
create or replace function public.has_role(p_role_name text)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return exists (
    select 1
    from public.user_roles ur
    join public.roles r on ur.role_id = r.id
    where
      ur.user_id = auth.uid()
      and r.name = p_role_name
      and (ur.expires_at is null or ur.expires_at > now())
  );
end;
$$;

-- Function to check if user has admin privileges
create or replace function public.is_admin()
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return exists (
    select 1
    from public.user_roles ur
    join public.roles r on ur.role_id = r.id
    where
      ur.user_id = auth.uid()
      and r.is_admin = true
      and (ur.expires_at is null or ur.expires_at > now())
  );
end;
$$;

-- Function to assign a role to a user
create or replace function public.assign_role(
  p_user_id uuid,
  p_role_name text,
  p_expires_at timestamptz default null,
  p_metadata jsonb default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_role_id uuid;
begin
  -- Check if the current user has admin privileges
  if not public.is_admin() then
    raise exception 'Only admin users can assign roles';
  end if;
  
  -- Get the role ID
  select id into v_role_id
  from public.roles
  where name = p_role_name;
  
  if v_role_id is null then
    raise exception 'Role % does not exist', p_role_name;
  end if;
  
  -- Insert or update the user role
  insert into public.user_roles (
    user_id,
    role_id,
    assigned_by,
    expires_at,
    metadata
  )
  values (
    p_user_id,
    v_role_id,
    auth.uid(),
    p_expires_at,
    p_metadata
  )
  on conflict (user_id, role_id)
  do update set
    assigned_by = auth.uid(),
    expires_at = p_expires_at,
    metadata = p_metadata,
    updated_at = now();
  
  return true;
exception
  when others then
    return false;
end;
$$;

-- Function to remove a role from a user
create or replace function public.remove_role(
  p_user_id uuid,
  p_role_name text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_role_id uuid;
begin
  -- Check if the current user has admin privileges
  if not public.is_admin() then
    raise exception 'Only admin users can remove roles';
  end if;
  
  -- Get the role ID
  select id into v_role_id
  from public.roles
  where name = p_role_name;
  
  if v_role_id is null then
    raise exception 'Role % does not exist', p_role_name;
  end if;
  
  -- Delete the user role
  delete from public.user_roles
  where user_id = p_user_id and role_id = v_role_id;
  
  return true;
exception
  when others then
    return false;
end;
$$;

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_role_id uuid;
begin
  -- Get the role ID for the default role
  select id into v_role_id
  from public.roles
  where name = new.default_role or name = 'subscriber';
  
  if v_role_id is null then
    -- Fallback to subscriber if default role doesn't exist
    select id into v_role_id
    from public.roles
    where name = 'subscriber';
  end if;
  
  -- Assign the role to the new user
  if v_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, v_role_id);
  end if;
  
  return new;
end;
$$;
