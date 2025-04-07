# Role-Based Access Control (RBAC) System

This document provides detailed information about the Role-Based Access Control (RBAC) system implemented in the Avolve platform.

## Overview

The Avolve platform implements a comprehensive RBAC system that provides fine-grained access control to resources based on user roles and permissions. The system supports role hierarchies, allowing for inheritance of permissions, which simplifies role management and provides a more flexible security model.

## Database Structure

### Core Tables

#### 1. roles

Stores role definitions for the RBAC system.

```sql
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_system boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);
```

#### 2. permissions

Stores permission definitions based on resource-action pairs.

```sql
create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  resource text not null,
  action text not null,
  description text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  -- Ensure resource:action combination is unique
  unique(resource, action)
);
```

#### 3. role_permissions

Maps roles to permissions (many-to-many relationship).

```sql
create table public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  -- Ensure each permission is assigned to a role only once
  unique(role_id, permission_id)
);
```

#### 4. user_roles

Maps users to roles (many-to-many relationship).

```sql
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  -- Ensure each role is assigned to a user only once
  unique(user_id, role_id)
);
```

#### 5. role_hierarchy

Defines role inheritance relationships.

```sql
create table public.role_hierarchy (
  id uuid primary key default gen_random_uuid(),
  parent_role_id uuid not null references public.roles(id) on delete cascade,
  child_role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  -- Ensure each parent-child relationship is unique
  unique(parent_role_id, child_role_id),
  -- Prevent self-referencing
  constraint no_self_reference check (parent_role_id != child_role_id)
);
```

### Row Level Security (RLS) Policies

All RBAC tables are protected by RLS policies to ensure that only authorized users can access or modify the data:

```sql
-- Policy for admins (can do everything with roles)
create policy "Admins can do everything with roles"
  on public.roles
  to authenticated
  using (auth.jwt() ->> 'user_metadata' ? 'is_admin' and auth.jwt() ->> 'user_metadata' ->> 'is_admin' = 'true')
  with check (auth.jwt() ->> 'user_metadata' ? 'is_admin' and auth.jwt() ->> 'user_metadata' ->> 'is_admin' = 'true');

-- Policy for reading roles (everyone can read)
create policy "Everyone can read roles"
  on public.roles
  for select
  to authenticated
  using (true);
```

Similar policies are applied to all RBAC tables.

## Database Functions

### Core Functions

#### 1. get_user_roles

Gets all roles assigned to a user.

```sql
create or replace function public.get_user_roles(p_user_id uuid)
returns setof public.roles
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Check if user is admin via metadata
  if exists (
    select 1
    from auth.users
    where id = p_user_id
    and (
      (raw_user_meta_data->>'is_admin')::boolean = true or
      (raw_app_meta_data->>'is_admin')::boolean = true
    )
  ) then
    -- If admin, return all roles
    return query
    select * from public.roles;
  else
    -- Otherwise, return only assigned roles
    return query
    select r.*
    from public.roles r
    join public.user_roles ur on r.id = ur.role_id
    where ur.user_id = p_user_id;
  end if;
end;
$$;
```

#### 2. get_user_permissions

Gets all permissions assigned to a user.

```sql
create or replace function public.get_user_permissions(p_user_id uuid)
returns setof public.permissions
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Check if user is admin via metadata
  if exists (
    select 1
    from auth.users
    where id = p_user_id
    and (
      (raw_user_meta_data->>'is_admin')::boolean = true or
      (raw_app_meta_data->>'is_admin')::boolean = true
    )
  ) then
    -- If admin, return all permissions
    return query
    select * from public.permissions;
  else
    -- Otherwise, return only permissions from assigned roles
    return query
    select distinct p.*
    from public.permissions p
    join public.role_permissions rp on p.id = rp.permission_id
    join public.user_roles ur on rp.role_id = ur.role_id
    where ur.user_id = p_user_id;
  end if;
end;
$$;
```

#### 3. has_role

Checks if a user has a specific role.

```sql
create or replace function public.has_role(p_user_id uuid, p_role_name text)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_has_role boolean;
begin
  -- Check if user is admin via metadata
  select exists (
    select 1
    from auth.users
    where id = p_user_id
    and (
      (raw_user_meta_data->>'is_admin')::boolean = true or
      (raw_app_meta_data->>'is_admin')::boolean = true
    )
  ) into v_has_role;
  
  -- If user is admin, return true immediately
  if v_has_role then
    return true;
  end if;
  
  -- Otherwise, check if user has the role
  select exists(
    select 1
    from public.user_roles ur
    join public.roles r on ur.role_id = r.id
    where ur.user_id = p_user_id
    and r.name = p_role_name
  ) into v_has_role;
  
  return v_has_role;
end;
$$;
```

#### 4. has_permission

Checks if a user has a specific permission.

```sql
create or replace function public.has_permission(p_user_id uuid, p_resource text, p_action text)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_has_permission boolean;
begin
  -- Check if user is admin via metadata
  select exists (
    select 1
    from auth.users
    where id = p_user_id
    and (
      (raw_user_meta_data->>'is_admin')::boolean = true or
      (raw_app_meta_data->>'is_admin')::boolean = true
    )
  ) into v_has_permission;
  
  -- If user is admin, return true immediately
  if v_has_permission then
    return true;
  end if;
  
  -- Otherwise, check if user has the permission through any of their roles
  select exists(
    select 1
    from public.permissions p
    join public.role_permissions rp on p.id = rp.permission_id
    join public.user_roles ur on rp.role_id = ur.role_id
    where ur.user_id = p_user_id
    and p.resource = p_resource
    and p.action = p_action
  ) into v_has_permission;
  
  return v_has_permission;
end;
$$;
```

### Role Hierarchy Functions

#### 1. get_role_hierarchy

Gets all roles in a hierarchy (including inherited roles).

```sql
create or replace function public.get_role_hierarchy(p_role_id uuid)
returns setof public.roles
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Return the role itself and all its parent roles
  return query
  with recursive role_tree as (
    -- Base case: the role itself
    select r.* from public.roles r where r.id = p_role_id
    
    union
    
    -- Recursive case: all parent roles
    select r.*
    from public.roles r
    join public.role_hierarchy rh on r.id = rh.parent_role_id
    join role_tree rt on rt.id = rh.child_role_id
  )
  select * from role_tree;
end;
$$;
```

#### 2. role_inherits_from

Checks if a role inherits from another role.

```sql
create or replace function public.role_inherits_from(p_child_role_id uuid, p_parent_role_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_inherits boolean;
begin
  -- Check if there's a direct or indirect inheritance relationship
  with recursive role_tree as (
    -- Base case: direct parent
    select parent_role_id, child_role_id
    from public.role_hierarchy
    where child_role_id = p_child_role_id
    
    union
    
    -- Recursive case: indirect parents
    select rh.parent_role_id, rh.child_role_id
    from public.role_hierarchy rh
    join role_tree rt on rt.parent_role_id = rh.child_role_id
  )
  select exists(
    select 1 from role_tree where parent_role_id = p_parent_role_id
  ) into v_inherits;
  
  return v_inherits;
end;
$$;
```

#### 3. has_role_enhanced

Checks if a user has a specific role (including inherited roles).

```sql
create or replace function public.has_role_enhanced(p_user_id uuid, p_role_name text)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_has_role boolean;
  v_role_id uuid;
begin
  -- Check if user is admin via metadata
  select exists (
    select 1
    from auth.users
    where id = p_user_id
    and (
      (raw_user_meta_data->>'is_admin')::boolean = true or
      (raw_app_meta_data->>'is_admin')::boolean = true
    )
  ) into v_has_role;
  
  -- If user is admin, return true immediately
  if v_has_role then
    return true;
  end if;
  
  -- Get the role ID for the specified role name
  select id into v_role_id from public.roles where name = p_role_name;
  
  if v_role_id is null then
    -- Role doesn't exist
    return false;
  end if;
  
  -- Check if user has the role directly or through inheritance
  with user_roles_with_hierarchy as (
    -- Get directly assigned roles
    select r.id as role_id
    from public.roles r
    join public.user_roles ur on r.id = ur.role_id
    where ur.user_id = p_user_id
    
    union
    
    -- Get roles inherited through hierarchy
    select rh.parent_role_id as role_id
    from public.role_hierarchy rh
    join public.user_roles ur on rh.child_role_id = ur.role_id
    where ur.user_id = p_user_id
  )
  select exists(
    select 1 from user_roles_with_hierarchy where role_id = v_role_id
  ) into v_has_role;
  
  return v_has_role;
end;
$$;
```

## Frontend Integration

### RoleService

The `RoleService` provides methods for managing roles and permissions from the client side.

```typescript
export class RoleService {
  // Core methods
  public async getAllRoles(): Promise<RoleResult<Role[]>> { /* ... */ }
  public async getRoleById(id: string): Promise<RoleResult<Role>> { /* ... */ }
  public async getRoleByName(name: string): Promise<RoleResult<Role>> { /* ... */ }
  public async createRole(name: string, description?: string): Promise<RoleResult<Role>> { /* ... */ }
  public async updateRole(id: string, updates: Partial<Role>): Promise<RoleResult<Role>> { /* ... */ }
  public async deleteRole(id: string): Promise<RoleResult<boolean>> { /* ... */ }
  
  // Permission methods
  public async getAllPermissions(): Promise<RoleResult<Permission[]>> { /* ... */ }
  public async getRolePermissions(roleId: string): Promise<RoleResult<Permission[]>> { /* ... */ }
  public async assignPermissionToRole(roleId: string, permissionId: string): Promise<RoleResult<RolePermission>> { /* ... */ }
  public async removePermissionFromRole(roleId: string, permissionId: string): Promise<RoleResult<boolean>> { /* ... */ }
  
  // User role methods
  public async getUsersWithRole(roleId: string): Promise<RoleResult<{ id: string, email: string }[]>> { /* ... */ }
  public async assignRoleToUser(userId: string, roleId: string): Promise<RoleResult<UserRole>> { /* ... */ }
  public async removeRoleFromUser(userId: string, roleId: string): Promise<RoleResult<boolean>> { /* ... */ }
  
  // Role check methods
  public async hasRole(userId: string, roleName: string): Promise<boolean> { /* ... */ }
  public async hasPermission(userId: string, resource: string, action: string): Promise<boolean> { /* ... */ }
  
  // Role hierarchy methods
  public async getRoleHierarchy(roleId: string): Promise<RoleResult<Role[]>> { /* ... */ }
  public async roleInheritsFrom(childRoleId: string, parentRoleId: string): Promise<boolean> { /* ... */ }
  public async createRoleHierarchy(parentRoleName: string, childRoleName: string): Promise<RoleResult<RoleHierarchy>> { /* ... */ }
  public async removeRoleHierarchy(parentRoleName: string, childRoleName: string): Promise<RoleResult<boolean>> { /* ... */ }
  public async getAllRoleHierarchies(): Promise<RoleResult<RoleHierarchy[]>> { /* ... */ }
  
  // Enhanced role check methods (with hierarchy)
  public async hasRoleEnhanced(userId: string, roleName: string): Promise<boolean> { /* ... */ }
  public async hasPermissionEnhanced(userId: string, resource: string, action: string): Promise<boolean> { /* ... */ }
  public async getUserPermissionsEnhanced(userId: string): Promise<RoleResult<Permission[]>> { /* ... */ }
}
```

### React Hooks

#### useRBAC

The `useRBAC` hook provides a convenient way to check roles and permissions in React components.

```typescript
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { RoleService } from '@/lib/auth/role-service';

export function useRBAC() {
  const { user } = useAuth();
  const roleService = RoleService.getBrowserInstance();
  
  const checkRole = async (roleName: string): Promise<boolean> => {
    if (!user) return false;
    return roleService.hasRoleEnhanced(user.id, roleName);
  };
  
  const checkPermission = async (resource: string, action: string): Promise<boolean> => {
    if (!user) return false;
    return roleService.hasPermissionEnhanced(user.id, resource, action);
  };
  
  return {
    checkRole,
    checkPermission,
  };
}
```

### UI Components

#### ProtectedPage

The `ProtectedPage` component provides page-level access control based on user roles and permissions.

```tsx
import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth/auth-context';
import { RoleService } from '@/lib/auth/role-service';
import { UnauthorizedPage } from '@/components/auth/unauthorized-page';

interface ProtectedPageProps {
  children: ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: { resource: string; action: string }[];
  fallback?: ReactNode;
}

export const ProtectedPage: React.FC<ProtectedPageProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallback,
}) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const roleService = RoleService.getBrowserInstance();
  
  useEffect(() => {
    const checkAuthorization = async () => {
      if (!user) {
        setIsAuthorized(false);
        return;
      }
      
      // Check roles
      if (requiredRoles.length > 0) {
        for (const role of requiredRoles) {
          const hasRole = await roleService.hasRoleEnhanced(user.id, role);
          if (hasRole) {
            setIsAuthorized(true);
            return;
          }
        }
      }
      
      // Check permissions
      if (requiredPermissions.length > 0) {
        for (const { resource, action } of requiredPermissions) {
          const hasPermission = await roleService.hasPermissionEnhanced(user.id, resource, action);
          if (hasPermission) {
            setIsAuthorized(true);
            return;
          }
        }
      }
      
      // If no roles or permissions are required, authorize by default
      if (requiredRoles.length === 0 && requiredPermissions.length === 0) {
        setIsAuthorized(true);
        return;
      }
      
      setIsAuthorized(false);
    };
    
    if (!isLoading) {
      checkAuthorization();
    }
  }, [user, isLoading, requiredRoles, requiredPermissions]);
  
  if (isLoading || isAuthorized === null) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthorized) {
    return fallback || (
      <UnauthorizedPage
        requiredRoles={requiredRoles}
        requiredPermissions={requiredPermissions}
      />
    );
  }
  
  return <>{children}</>;
};
```

#### Authorized

The `Authorized` component provides component-level access control.

```tsx
import React, { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { RoleService } from '@/lib/auth/role-service';

interface AuthorizedProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: { resource: string; action: string }[];
}

export const Authorized: React.FC<AuthorizedProps> = ({
  children,
  fallback = null,
  requiredRoles = [],
  requiredPermissions = [],
}) => {
  const { user } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const roleService = RoleService.getBrowserInstance();
  
  useEffect(() => {
    const checkAuthorization = async () => {
      if (!user) {
        setIsAuthorized(false);
        return;
      }
      
      // Check roles
      if (requiredRoles.length > 0) {
        for (const role of requiredRoles) {
          const hasRole = await roleService.hasRoleEnhanced(user.id, role);
          if (hasRole) {
            setIsAuthorized(true);
            return;
          }
        }
      }
      
      // Check permissions
      if (requiredPermissions.length > 0) {
        for (const { resource, action } of requiredPermissions) {
          const hasPermission = await roleService.hasPermissionEnhanced(user.id, resource, action);
          if (hasPermission) {
            setIsAuthorized(true);
            return;
          }
        }
      }
      
      // If no roles or permissions are required, authorize by default
      if (requiredRoles.length === 0 && requiredPermissions.length === 0) {
        setIsAuthorized(true);
        return;
      }
      
      setIsAuthorized(false);
    };
    
    checkAuthorization();
  }, [user, requiredRoles, requiredPermissions]);
  
  return isAuthorized ? <>{children}</> : <>{fallback}</>;
};
```

## Admin Components

### UserRoleManager

The `UserRoleManager` component provides an interface for managing user roles.

```tsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Select, Table } from '@/components/ui';
import { RoleService, Role } from '@/lib/auth/role-service';

export const UserRoleManager: React.FC = () => {
  // Component implementation...
};
```

### RoleHierarchyManager

The `RoleHierarchyManager` component provides an interface for managing role hierarchies.

```tsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Select, Table } from '@/components/ui';
import { RoleService, Role, RoleHierarchy } from '@/lib/auth/role-service';

export const RoleHierarchyManager: React.FC = () => {
  // Component implementation...
};
```

## Best Practices

### 1. Role Design

- **Principle of Least Privilege**: Assign users the minimum roles and permissions necessary to perform their job functions.
- **Role Granularity**: Create roles that align with job functions rather than individual users.
- **Role Hierarchy**: Use role hierarchies to simplify role management and reduce the number of direct role assignments.

### 2. Permission Design

- **Resource-Action Pairs**: Design permissions as resource-action pairs (e.g., `users:view`, `content:edit`).
- **Granular Permissions**: Create fine-grained permissions that can be combined to create flexible role definitions.
- **Permission Naming**: Use consistent naming conventions for permissions to make them easier to understand and manage.

### 3. Security Considerations

- **Audit Logging**: Log all changes to roles and permissions for security monitoring and compliance.
- **Regular Reviews**: Periodically review role and permission assignments to ensure they remain appropriate.
- **Separation of Duties**: Implement separation of duties by ensuring that sensitive operations require multiple roles.

## Usage Examples

### Protecting a Page

```tsx
// pages/admin/users.tsx
import { ProtectedPage } from '@/components/auth/protected-page';
import { UserList } from '@/components/admin/user-list';

export default function UsersPage() {
  return (
    <ProtectedPage
      requiredRoles={['admin', 'manager']}
      requiredPermissions={[{ resource: 'users', action: 'view' }]}
    >
      <UserList />
    </ProtectedPage>
  );
}
```

### Conditional Rendering

```tsx
// components/user-profile.tsx
import { Authorized } from '@/components/auth/authorized';

export const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  return (
    <div>
      <h1>User Profile</h1>
      
      {/* Basic information visible to everyone */}
      <div>Basic user information...</div>
      
      {/* Edit button only visible to users with appropriate permission */}
      <Authorized
        requiredPermissions={[{ resource: 'users', action: 'edit' }]}
      >
        <button>Edit Profile</button>
      </Authorized>
      
      {/* Admin actions only visible to admins */}
      <Authorized requiredRoles={['admin']}>
        <div>
          <h2>Admin Actions</h2>
          <button>Reset Password</button>
          <button>Disable Account</button>
        </div>
      </Authorized>
    </div>
  );
};
```

### Programmatic Access Control

```tsx
// components/content-editor.tsx
import { useRBAC } from '@/lib/auth/use-rbac';
import { useState, useEffect } from 'react';

export const ContentEditor: React.FC<{ contentId: string }> = ({ contentId }) => {
  const { checkPermission } = useRBAC();
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  
  useEffect(() => {
    const checkPermissions = async () => {
      setCanEdit(await checkPermission('content', 'edit'));
      setCanDelete(await checkPermission('content', 'delete'));
    };
    
    checkPermissions();
  }, [contentId]);
  
  return (
    <div>
      <h1>Content Editor</h1>
      
      {canEdit ? (
        <button>Edit Content</button>
      ) : (
        <p>You do not have permission to edit this content.</p>
      )}
      
      {canDelete && (
        <button>Delete Content</button>
      )}
    </div>
  );
};
```

## Conclusion

The RBAC system provides a comprehensive solution for managing access control in the Avolve platform. By leveraging role hierarchies and fine-grained permissions, it offers a flexible and secure way to control access to resources based on user roles and permissions.
