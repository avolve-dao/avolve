/**
 * Role Service
 * 
 * This service centralizes all role and permission management functionality for the Avolve platform.
 * It provides methods for managing roles, permissions, and user role assignments.
 */

import { AuthError, SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@/lib/supabase/client';
import { createUniversalClient } from '@/lib/supabase/universal';
import { Database } from '@/lib/database.types';

// Helper function to convert database error to AuthError
function convertError(error: any): AuthError | null {
  if (!error) return null;
  return new AuthError(error.message || 'An unexpected error occurred');
}

// Result interface
export interface RoleResult<T = any> {
  data: T | null;
  error: AuthError | null;
  message?: string;
}

// Role interface
export interface Role {
  id: string;
  name: string;
  description?: string;
  is_system?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Permission interface
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Role Permission interface
export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  created_at?: string;
}

// User Role interface
export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  created_at?: string;
}

// Role Hierarchy interface
export interface RoleHierarchy {
  id: string;
  parent_role_id: string;
  child_role_id: string;
  created_at?: string;
}

/**
 * Role Service Class
 */
export class RoleService {
  private client: SupabaseClient<Database>;
  private static instance: RoleService;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor(client: SupabaseClient<Database>) {
    this.client = client;
  }

  /**
   * Get browser-side instance of the role service
   */
  public static getBrowserInstance(): RoleService {
    if (!RoleService.instance) {
      RoleService.instance = new RoleService(createBrowserClient());
    }
    return RoleService.instance;
  }

  /**
   * Get universal instance of the role service
   */
  public static getUniversalInstance(): RoleService {
    // Universal instance is always created fresh to ensure correct cookie handling
    return new RoleService(createUniversalClient());
  }

  /**
   * Get the Supabase client
   * This is needed for direct access to the client in certain scenarios
   */
  public getSupabaseClient(): SupabaseClient<Database> {
    return this.client;
  }

  /**
   * Get all roles
   */
  public async getAllRoles(): Promise<RoleResult<Role[]>> {
    try {
      const { data, error } = await this.client
        .from('roles')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Get all roles error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get all roles error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting roles') 
      };
    }
  }

  /**
   * Get a role by ID
   */
  public async getRoleById(id: string): Promise<RoleResult<Role>> {
    try {
      const { data, error } = await this.client
        .from('roles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Get role by ID error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get role by ID error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting role') 
      };
    }
  }

  /**
   * Get a role by name
   */
  public async getRoleByName(name: string): Promise<RoleResult<Role>> {
    try {
      const { data, error } = await this.client
        .from('roles')
        .select('*')
        .eq('name', name)
        .single();
      
      if (error) {
        console.error('Get role by name error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get role by name error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting role') 
      };
    }
  }

  /**
   * Create a new role
   */
  public async createRole(name: string, description?: string): Promise<RoleResult<Role>> {
    try {
      const { data, error } = await this.client
        .from('roles')
        .insert([{ name, description, is_system: false }])
        .select()
        .single();
      
      if (error) {
        console.error('Create role error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected create role error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while creating role') 
      };
    }
  }

  /**
   * Update a role
   */
  public async updateRole(id: string, updates: Partial<Role>): Promise<RoleResult<Role>> {
    try {
      // Don't allow updating system roles
      const { data: existingRole } = await this.getRoleById(id);
      if (existingRole?.is_system) {
        return { 
          data: null, 
          error: new AuthError('Cannot update system roles') 
        };
      }
      
      const { data, error } = await this.client
        .from('roles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Update role error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected update role error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while updating role') 
      };
    }
  }

  /**
   * Delete a role
   */
  public async deleteRole(id: string): Promise<RoleResult<boolean>> {
    try {
      // Don't allow deleting system roles
      const { data: existingRole } = await this.getRoleById(id);
      if (existingRole?.is_system) {
        return { 
          data: null, 
          error: new AuthError('Cannot delete system roles') 
        };
      }
      
      const { error } = await this.client
        .from('roles')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Delete role error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: true, error: null };
    } catch (error) {
      console.error('Unexpected delete role error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while deleting role') 
      };
    }
  }

  /**
   * Get all permissions
   */
  public async getAllPermissions(): Promise<RoleResult<Permission[]>> {
    try {
      const { data, error } = await this.client
        .from('permissions')
        .select('*')
        .order('resource', { ascending: true })
        .order('action', { ascending: true });
      
      if (error) {
        console.error('Get all permissions error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get all permissions error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting permissions') 
      };
    }
  }

  /**
   * Get permissions for a role
   * Handles both array and object cases for item.permissions
   */
  public async getRolePermissions(roleId: string): Promise<RoleResult<Permission[]>> {
    try {
      const { data, error } = await this.client
        .from('role_permissions')
        .select('*, permissions:permission_id (*)')
        .eq('role_id', roleId);
      if (error) {
        console.error('Get role permissions error:', error);
        return { data: null, error: convertError(error) };
      }
      // Normalize permissions: handle both array and object cases
      const permissions = (data || []).map((item: any) => {
        if (Array.isArray(item.permissions)) {
          // If it's an array, take the first element (or handle as needed)
          if (item.permissions.length > 0 && item.permissions[0].id) {
            return item.permissions[0] as Permission;
          }
        } else if (item.permissions && typeof item.permissions === 'object' && 'id' in item.permissions) {
          // Sometimes permissions is a single object
          return item.permissions as Permission;
        }
        return undefined;
      }).filter(Boolean) as Permission[];
      return { data: permissions, error: null };
    } catch (error) {
      console.error('Unexpected get role permissions error:', error);
      return {
        data: null,
        error: new AuthError('An unexpected error occurred while getting role permissions')
      };
    }
  }

  /**
   * Assign a permission to a role
   */
  public async assignPermissionToRole(roleId: string, permissionId: string): Promise<RoleResult<RolePermission>> {
    try {
      const { data, error } = await this.client
        .from('role_permissions')
        .insert([{ role_id: roleId, permission_id: permissionId }])
        .select()
        .single();
      
      if (error) {
        console.error('Assign permission to role error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected assign permission to role error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while assigning permission to role') 
      };
    }
  }

  /**
   * Revoke a permission from a role
   */
  public async removePermissionFromRole(roleId: string, permissionId: string): Promise<RoleResult<boolean>> {
    try {
      const { error } = await this.client
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId)
        .eq('permission_id', permissionId);
      
      if (error) {
        console.error('Revoke permission from role error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: true, error: null };
    } catch (error) {
      console.error('Unexpected revoke permission from role error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while revoking permission from role') 
      };
    }
  }

  /**
   * Get all users with a specific role
   */
  public async getUsersWithRole(roleId: string): Promise<RoleResult<{ id: string, email: string }[]>> {
    try {
      const { data, error } = await this.client
        .from('user_roles')
        .select(`
          user_id,
          users:user_id (
            id,
            email
          )
        `)
        .eq('role_id', roleId);
      
      if (error) {
        console.error('Get users with role error:', error);
        return { data: null, error: convertError(error) };
      }
      
      // Extract users from the nested structure and ensure proper typing
      const users: { id: string, email: string }[] = data.map(item => ({
        // item.users may be an array or an object
        ...(Array.isArray(item.users)
          ? item.users[0] || {}
          : (typeof item.users === 'object' && item.users !== null ? item.users : {}))
      } as { id: string, email: string }));
      
      return { data: users, error: null };
    } catch (error) {
      console.error('Unexpected get users with role error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting users with role') 
      };
    }
  }

  /**
   * Assign a role to a user
   */
  public async assignRoleToUser(userId: string, roleId: string): Promise<RoleResult<UserRole>> {
    try {
      const { data, error } = await this.client
        .from('user_roles')
        .insert([{ user_id: userId, role_id: roleId }])
        .select()
        .single();
      
      if (error) {
        console.error('Assign role to user error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected assign role to user error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while assigning role to user') 
      };
    }
  }

  /**
   * Remove a role from a user
   */
  public async removeRoleFromUser(userId: string, roleId: string): Promise<RoleResult<boolean>> {
    try {
      const { error } = await this.client
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', roleId);
      
      if (error) {
        console.error('Remove role from user error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: true, error: null };
    } catch (error) {
      console.error('Unexpected remove role from user error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while removing role from user') 
      };
    }
  }

  /**
   * Check if a user has a specific role
   */
  public async hasRole(userId: string, roleName: string): Promise<boolean> {
    try {
      const { data, error } = await this.client.rpc('has_role', {
        p_user_id: userId,
        p_role_name: roleName
      });
      
      if (error) {
        console.error('Check role error:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Unexpected check role error:', error);
      return false;
    }
  }

  /**
   * Check if a user has a specific permission
   */
  public async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    try {
      const { data, error } = await this.client.rpc('has_permission', {
        p_user_id: userId,
        p_resource: resource,
        p_action: action
      });
      
      if (error) {
        console.error('Check permission error:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Unexpected check permission error:', error);
      return false;
    }
  }

  /**
   * Get all roles in a hierarchy (including inherited roles)
   */
  public async getRoleHierarchy(roleId: string): Promise<RoleResult<Role[]>> {
    try {
      const { data, error } = await this.client.rpc('get_role_hierarchy', {
        p_role_id: roleId
      });
      
      if (error) {
        console.error('Get role hierarchy error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get role hierarchy error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting role hierarchy') 
      };
    }
  }

  /**
   * Check if a role inherits from another role
   */
  public async roleInheritsFrom(childRoleId: string, parentRoleId: string): Promise<boolean> {
    try {
      const { data, error } = await this.client.rpc('role_inherits_from', {
        p_child_role_id: childRoleId,
        p_parent_role_id: parentRoleId
      });
      
      if (error) {
        console.error('Check role inheritance error:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Unexpected check role inheritance error:', error);
      return false;
    }
  }

  /**
   * Create a role hierarchy relationship
   */
  public async createRoleHierarchy(parentRoleName: string, childRoleName: string): Promise<RoleResult<RoleHierarchy>> {
    try {
      const { data, error } = await this.client.rpc('create_role_hierarchy', {
        p_parent_role_name: parentRoleName,
        p_child_role_name: childRoleName
      });
      
      if (error) {
        console.error('Create role hierarchy error:', error);
        return { data: null, error: convertError(error) };
      }
      
      // Fetch the created hierarchy relationship
      if (data) {
        const { data: hierarchyData, error: hierarchyError } = await this.client
          .from('role_hierarchy')
          .select('*')
          .eq('id', data)
          .single();
          
        if (hierarchyError) {
          console.error('Fetch created hierarchy error:', hierarchyError);
          return { data: null, error: convertError(hierarchyError) };
        }
        
        return { data: hierarchyData, error: null };
      }
      
      return { data: null, error: new AuthError('Failed to create role hierarchy') };
    } catch (error) {
      console.error('Unexpected create role hierarchy error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while creating role hierarchy') 
      };
    }
  }

  /**
   * Remove a role hierarchy relationship
   */
  public async removeRoleHierarchy(parentRoleName: string, childRoleName: string): Promise<RoleResult<boolean>> {
    try {
      const { data, error } = await this.client.rpc('remove_role_hierarchy', {
        p_parent_role_name: parentRoleName,
        p_child_role_name: childRoleName
      });
      
      if (error) {
        console.error('Remove role hierarchy error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: !!data, error: null };
    } catch (error) {
      console.error('Unexpected remove role hierarchy error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while removing role hierarchy') 
      };
    }
  }

  /**
   * Get all role hierarchy relationships
   */
  public async getAllRoleHierarchies(): Promise<RoleResult<RoleHierarchy[]>> {
    try {
      const { data, error } = await this.client
        .from('role_hierarchy')
        .select('*')
        .order('parent_role_id');
      
      if (error) {
        console.error('Get all role hierarchies error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get all role hierarchies error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting role hierarchies') 
      };
    }
  }

  /**
   * Check if a user has a specific role (including inherited roles)
   */
  public async hasRoleEnhanced(userId: string, roleName: string): Promise<boolean> {
    try {
      const { data, error } = await this.client.rpc('has_role_enhanced', {
        p_user_id: userId,
        p_role_name: roleName
      });
      
      if (error) {
        console.error('Check enhanced role error:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Unexpected check enhanced role error:', error);
      return false;
    }
  }

  /**
   * Check if a user has a specific permission (including from inherited roles)
   */
  public async hasPermissionEnhanced(userId: string, resource: string, action: string): Promise<boolean> {
    try {
      const { data, error } = await this.client.rpc('has_permission_enhanced', {
        p_user_id: userId,
        p_resource: resource,
        p_action: action
      });
      
      if (error) {
        console.error('Check enhanced permission error:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Unexpected check enhanced permission error:', error);
      return false;
    }
  }

  /**
   * Get all permissions for a user (including from inherited roles)
   */
  public async getUserPermissionsEnhanced(userId: string): Promise<RoleResult<Permission[]>> {
    try {
      const { data, error } = await this.client.rpc('get_user_permissions_enhanced', {
        p_user_id: userId
      });
      
      if (error) {
        console.error('Get enhanced user permissions error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get enhanced user permissions error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting enhanced user permissions') 
      };
    }
  }
}
