import { createClient, createAdminClient } from './client';
import { captureException } from '@/lib/monitoring/error-tracking';
import { executeQuery } from './db-utils';

/**
 * Role types supported in the application
 */
export type UserRole = 'admin' | 'moderator' | 'member' | 'guest';

/**
 * Permission types for various actions
 */
export type Permission = 
  | 'create:post' 
  | 'edit:post' 
  | 'delete:post'
  | 'create:comment'
  | 'edit:comment'
  | 'delete:comment'
  | 'invite:user'
  | 'manage:user'
  | 'view:analytics'
  | 'manage:feature_flags'
  | 'access:admin_panel';

/**
 * Interface for role-permission mapping
 */
interface RolePermissions {
  [role: string]: Permission[];
}

/**
 * Default role-permission mappings
 */
const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    'create:post', 'edit:post', 'delete:post',
    'create:comment', 'edit:comment', 'delete:comment',
    'invite:user', 'manage:user', 'view:analytics',
    'manage:feature_flags', 'access:admin_panel'
  ],
  moderator: [
    'create:post', 'edit:post', 'delete:post',
    'create:comment', 'edit:comment', 'delete:comment',
    'invite:user', 'view:analytics'
  ],
  member: [
    'create:post', 'edit:post', 'delete:post',
    'create:comment', 'edit:comment', 'delete:comment'
  ],
  guest: [
    'create:comment'
  ]
};

/**
 * Get user roles for a specific user
 * @param userId - User ID to check roles for
 * @returns Array of roles assigned to the user
 */
export async function getUserRoles(userId: string): Promise<UserRole[]> {
  try {
    const { data, error } = await createClient()
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // If no roles found, default to 'guest'
    if (!data || data.length === 0) {
      return ['guest'];
    }
    
    return data.map(item => item.role as UserRole);
  } catch (error) {
    captureException('Error getting user roles', error, { userId });
    // Default to guest on error for security
    return ['guest'];
  }
}

/**
 * Check if a user has a specific role
 * @param userId - User ID to check
 * @param role - Role to check for
 * @returns Boolean indicating if user has the role
 */
export async function hasRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    const roles = await getUserRoles(userId);
    return roles.includes(role);
  } catch (error) {
    captureException('Error checking user role', error, { userId, role });
    return false;
  }
}

/**
 * Check if a user has a specific permission
 * @param userId - User ID to check
 * @param permission - Permission to check for
 * @returns Boolean indicating if user has the permission
 */
export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  try {
    const roles = await getUserRoles(userId);
    
    // Check if any of the user's roles grant the permission
    return roles.some(role => {
      const permissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
      return permissions.includes(permission);
    });
  } catch (error) {
    captureException('Error checking user permission', error, { userId, permission });
    return false;
  }
}

/**
 * Assign a role to a user
 * @param userId - User ID to assign role to
 * @param role - Role to assign
 * @returns Boolean indicating success
 */
export async function assignRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    // Use admin client to ensure permission to modify roles
    const client = createAdminClient();
    
    const { error } = await client
      .from('user_roles')
      .upsert({ user_id: userId, role }, { onConflict: 'user_id,role' });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    captureException('Error assigning user role', error, { userId, role });
    return false;
  }
}

/**
 * Remove a role from a user
 * @param userId - User ID to remove role from
 * @param role - Role to remove
 * @returns Boolean indicating success
 */
export async function removeRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    // Use admin client to ensure permission to modify roles
    const client = createAdminClient();
    
    const { error } = await client
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    captureException('Error removing user role', error, { userId, role });
    return false;
  }
}

/**
 * Get all permissions for a user based on their roles
 * @param userId - User ID to get permissions for
 * @returns Array of permissions
 */
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  try {
    const roles = await getUserRoles(userId);
    
    // Combine all permissions from all roles
    const permissions = roles.reduce((acc, role) => {
      const rolePermissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
      return [...acc, ...rolePermissions];
    }, [] as Permission[]);
    
    // Remove duplicates
    return [...new Set(permissions)];
  } catch (error) {
    captureException('Error getting user permissions', error, { userId });
    return [];
  }
}

/**
 * Create a database migration to set up the user_roles table
 * This should be run as part of the initial database setup
 */
export async function createRolesTableMigration(): Promise<string> {
  return `
-- Create the user_roles table
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'moderator', 'member', 'guest')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Ensure each user can have a role only once
  unique(user_id, role)
);

-- Add RLS policies
alter table public.user_roles enable row level security;

-- Allow users to view their own roles
create policy "Users can view their own roles"
  on public.user_roles
  for select
  using (auth.uid() = user_id);

-- Only allow admins to manage roles
create policy "Only admins can insert roles"
  on public.user_roles
  for insert
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Only admins can update roles"
  on public.user_roles
  for update
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Only admins can delete roles"
  on public.user_roles
  for delete
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Create function to check if user has a specific permission
create or replace function public.user_has_permission(
  p_user_id uuid,
  p_permission text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_has_permission boolean;
begin
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = p_user_id
    and (
      (ur.role = 'admin') or
      (ur.role = 'moderator' and p_permission in (
        'create:post', 'edit:post', 'delete:post',
        'create:comment', 'edit:comment', 'delete:comment',
        'invite:user', 'view:analytics'
      )) or
      (ur.role = 'member' and p_permission in (
        'create:post', 'edit:post', 'delete:post',
        'create:comment', 'edit:comment', 'delete:comment'
      )) or
      (ur.role = 'guest' and p_permission in (
        'create:comment'
      ))
    )
  ) into v_has_permission;
  
  return v_has_permission;
end;
$$;

-- Create function to get all permissions for a user
create or replace function public.get_user_permissions(
  p_user_id uuid
)
returns setof text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_role text;
  v_permissions text[];
begin
  -- Default to empty array
  v_permissions := '{}';
  
  -- Add permissions based on roles
  for v_role in (
    select role from public.user_roles
    where user_id = p_user_id
  ) loop
    case v_role
      when 'admin' then
        v_permissions := v_permissions || array[
          'create:post', 'edit:post', 'delete:post',
          'create:comment', 'edit:comment', 'delete:comment',
          'invite:user', 'manage:user', 'view:analytics',
          'manage:feature_flags', 'access:admin_panel'
        ];
      when 'moderator' then
        v_permissions := v_permissions || array[
          'create:post', 'edit:post', 'delete:post',
          'create:comment', 'edit:comment', 'delete:comment',
          'invite:user', 'view:analytics'
        ];
      when 'member' then
        v_permissions := v_permissions || array[
          'create:post', 'edit:post', 'delete:post',
          'create:comment', 'edit:comment', 'delete:comment'
        ];
      when 'guest' then
        v_permissions := v_permissions || array[
          'create:comment'
        ];
      else
        -- No permissions for unknown roles
    end case;
  end loop;
  
  -- Return distinct permissions
  return query
  select distinct unnest(v_permissions);
end;
$$;
  `;
}
