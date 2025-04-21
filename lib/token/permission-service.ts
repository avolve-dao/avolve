/**
 * Permission Service
 * 
 * This service centralizes all permission-related functionality for the Avolve platform.
 * It provides methods for managing permissions, roles, and token-based access control.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AuthError } from '@supabase/supabase-js';

// Result interface
export interface PermissionResult<T = any> {
  data: T | null;
  error: AuthError | null;
  message?: string;
}

// Permission interface
export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Token Type Permission interface
export interface TokenTypePermission {
  id: string;
  token_type_id: string;
  permission_id: string;
  min_balance: number;
  created_at?: string;
  updated_at?: string;
}

// Permission Group interface
export interface PermissionGroup {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Permission Group Item interface
export interface PermissionGroupItem {
  id: string;
  group_id: string;
  permission_id: string;
  created_at?: string;
}

// User Permission interface
export interface UserPermission {
  id: string;
  user_id: string;
  resource: string;
  action: string;
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Role interface
export interface Role {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// User Role interface
export interface UserRole {
  id: string;
  user_id: string;
  role: string;
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Role Permission interface
export interface RolePermission {
  id: string;
  role: string;
  resource: string;
  action: string;
  created_at?: string;
  updated_at?: string;
}

// Helper function to convert database error to AuthError
function convertError(error: any): AuthError | null {
  if (!error) return null;
  return new AuthError(error.message || 'An unexpected error occurred');
}

/**
 * Permission Service Class
 */
export class PermissionService {
  private client: SupabaseClient;

  /**
   * Constructor
   */
  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /**
   * Get all permissions
   */
  public async getAllPermissions(): Promise<PermissionResult<Permission[]>> {
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
   * Get permission by ID
   */
  public async getPermissionById(id: string): Promise<PermissionResult<Permission>> {
    try {
      const { data, error } = await this.client
        .from('permissions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Get permission by ID error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get permission by ID error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting permission') 
      };
    }
  }

  /**
   * Get permission by resource and action
   */
  public async getPermissionByResourceAction(
    resource: string, 
    action: string
  ): Promise<PermissionResult<Permission>> {
    try {
      const { data, error } = await this.client
        .from('permissions')
        .select('*')
        .eq('resource', resource)
        .eq('action', action)
        .single();
      
      if (error) {
        console.error('Get permission by resource action error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get permission by resource action error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting permission') 
      };
    }
  }

  /**
   * Create a new permission
   */
  public async createPermission(
    resource: string,
    action: string,
    description?: string
  ): Promise<PermissionResult<Permission>> {
    try {
      const { data, error } = await this.client
        .from('permissions')
        .insert([{
          resource,
          action,
          description
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Create permission error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected create permission error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while creating permission') 
      };
    }
  }

  /**
   * Update a permission
   */
  public async updatePermission(
    id: string,
    updates: Partial<Permission>
  ): Promise<PermissionResult<Permission>> {
    try {
      const { data, error } = await this.client
        .from('permissions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Update permission error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected update permission error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while updating permission') 
      };
    }
  }

  /**
   * Delete a permission
   */
  public async deletePermission(id: string): Promise<PermissionResult<boolean>> {
    try {
      const { error } = await this.client
        .from('permissions')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Delete permission error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: true, error: null };
    } catch (error) {
      console.error('Unexpected delete permission error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while deleting permission') 
      };
    }
  }

  /**
   * Get all token type permissions
   */
  public async getTokenTypePermissions(
    tokenTypeId?: string
  ): Promise<PermissionResult<TokenTypePermission[]>> {
    try {
      let query = this.client
        .from('token_type_permissions')
        .select('*, permissions(*)');
      
      if (tokenTypeId) {
        query = query.eq('token_type_id', tokenTypeId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Get token type permissions error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get token type permissions error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting token type permissions') 
      };
    }
  }

  /**
   * Assign permission to token type
   */
  public async assignPermissionToTokenType(
    tokenTypeId: string,
    permissionId: string,
    minBalance: number = 1
  ): Promise<PermissionResult<TokenTypePermission>> {
    try {
      const { data, error } = await this.client
        .from('token_type_permissions')
        .insert([{
          token_type_id: tokenTypeId,
          permission_id: permissionId,
          min_balance: minBalance
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Assign permission to token type error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected assign permission to token type error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while assigning permission to token type') 
      };
    }
  }

  /**
   * Revoke permission from token type
   */
  public async removePermissionFromTokenType(
    tokenTypeId: string,
    permissionId: string
  ): Promise<PermissionResult<boolean>> {
    try {
      const { error } = await this.client
        .from('token_type_permissions')
        .delete()
        .eq('token_type_id', tokenTypeId)
        .eq('permission_id', permissionId);
      
      if (error) {
        console.error('Revoke permission from token type error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: true, error: null };
    } catch (error) {
      console.error('Unexpected revoke permission from token type error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while revoking permission from token type') 
      };
    }
  }

  /**
   * Get all permission groups
   */
  public async getAllPermissionGroups(): Promise<PermissionResult<PermissionGroup[]>> {
    try {
      const { data, error } = await this.client
        .from('permission_groups')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Get all permission groups error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get all permission groups error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting permission groups') 
      };
    }
  }

  /**
   * Get permission group by ID
   */
  public async getPermissionGroupById(id: string): Promise<PermissionResult<PermissionGroup>> {
    try {
      const { data, error } = await this.client
        .from('permission_groups')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Get permission group by ID error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get permission group by ID error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting permission group') 
      };
    }
  }

  /**
   * Get permissions in a group
   */
  public async getPermissionsInGroup(groupId: string): Promise<PermissionResult<Permission[]>> {
    try {
      const { data, error } = await this.client
        .from('permission_group_items')
        .select('permissions(*)')
        .eq('group_id', groupId);
      
      if (error) {
        console.error('Get permissions in group error:', error);
        return { data: null, error: convertError(error) };
      }
      
      // Fix: Flatten permissions array if nested (any[][] to Permission[])
      const flatPermissions = Array.isArray(data[0].permissions) ? data.map(item => item.permissions).flat() : data.map(item => item.permissions);
      
      return { data: flatPermissions, error: null };
    } catch (error) {
      console.error('Unexpected get permissions in group error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting permissions in group') 
      };
    }
  }

  /**
   * Create a permission group
   */
  public async createPermissionGroup(
    name: string,
    description?: string
  ): Promise<PermissionResult<PermissionGroup>> {
    try {
      const { data, error } = await this.client
        .from('permission_groups')
        .insert([{
          name,
          description
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Create permission group error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected create permission group error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while creating permission group') 
      };
    }
  }

  /**
   * Add permission to group
   */
  public async addPermissionToGroup(
    groupId: string,
    permissionId: string
  ): Promise<PermissionResult<PermissionGroupItem>> {
    try {
      const { data, error } = await this.client
        .from('permission_group_items')
        .insert([{
          group_id: groupId,
          permission_id: permissionId
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Add permission to group error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected add permission to group error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while adding permission to group') 
      };
    }
  }

  /**
   * Remove permission from group
   */
  public async removePermissionFromGroup(
    groupId: string,
    permissionId: string
  ): Promise<PermissionResult<boolean>> {
    try {
      const { error } = await this.client
        .from('permission_group_items')
        .delete()
        .eq('group_id', groupId)
        .eq('permission_id', permissionId);
      
      if (error) {
        console.error('Remove permission from group error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: true, error: null };
    } catch (error) {
      console.error('Unexpected remove permission from group error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while removing permission from group') 
      };
    }
  }

  /**
   * Get all roles
   */
  public async getAllRoles(): Promise<PermissionResult<Role[]>> {
    try {
      const { data, error } = await this.client
        .from('roles')
        .select('*')
        .order('name', { ascending: true });
      
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
   * Get user roles
   */
  public async getUserRoles(userId: string): Promise<PermissionResult<UserRole[]>> {
    try {
      const { data, error } = await this.client
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .is('expires_at', null)
        .or(`expires_at.gt.${new Date().toISOString()}`);
      
      if (error) {
        console.error('Get user roles error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get user roles error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting user roles') 
      };
    }
  }

  /**
   * Assign role to user
   */
  public async assignRoleToUser(
    userId: string,
    role: string,
    grantedBy?: string,
    expiresAt?: Date
  ): Promise<PermissionResult<UserRole>> {
    try {
      const { data, error } = await this.client
        .from('user_roles')
        .insert([{
          user_id: userId,
          role,
          granted_by: grantedBy,
          granted_at: new Date().toISOString(),
          expires_at: expiresAt?.toISOString()
        }])
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
   * Revoke role from user
   */
  public async removeRoleFromUser(
    userId: string,
    role: string
  ): Promise<PermissionResult<boolean>> {
    try {
      const { error } = await this.client
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);
      
      if (error) {
        console.error('Revoke role from user error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: true, error: null };
    } catch (error) {
      console.error('Unexpected revoke role from user error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while revoking role from user') 
      };
    }
  }

  /**
   * Get role permissions
   */
  public async getRolePermissions(role: string): Promise<PermissionResult<Permission[]>> {
    try {
      const { data, error } = await this.client
        .from('role_permissions')
        .select('permissions(*)')
        .eq('role', role);
      
      if (error) {
        console.error('Get role permissions error:', error);
        return { data: null, error: convertError(error) };
      }
      
      // Fix: Flatten permissions array if nested (any[][] to Permission[])
      const flatPermissions = Array.isArray(data[0].permissions) ? data.map(item => item.permissions).flat() : data.map(item => item.permissions);
      
      return { data: flatPermissions, error: null };
    } catch (error) {
      console.error('Unexpected get role permissions error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting role permissions') 
      };
    }
  }

  /**
   * Assign permission to role
   */
  public async assignPermissionToRole(
    role: string,
    resource: string,
    action: string
  ): Promise<PermissionResult<RolePermission>> {
    try {
      const { data, error } = await this.client
        .from('role_permissions')
        .insert([{
          role,
          resource,
          action
        }])
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
   * Revoke permission from role
   */
  public async removePermissionFromRole(
    role: string,
    resource: string,
    action: string
  ): Promise<PermissionResult<boolean>> {
    try {
      const { error } = await this.client
        .from('role_permissions')
        .delete()
        .eq('role', role)
        .eq('resource', resource)
        .eq('action', action);
      
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
   * Get user permissions
   */
  public async getUserPermissions(userId: string): Promise<PermissionResult<Permission[]>> {
    try {
      const { data, error } = await this.client.rpc('get_user_permissions', {
        p_user_id: userId
      });
      
      if (error) {
        console.error('Get user permissions error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get user permissions error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting user permissions') 
      };
    }
  }

  /**
   * Check if user has permission
   */
  public async hasPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<PermissionResult<boolean>> {
    try {
      const { data, error } = await this.client.rpc('has_permission', {
        p_resource: resource,
        p_action: action
      });
      
      if (error) {
        console.error('Has permission error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected has permission error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while checking permission') 
      };
    }
  }

  /**
   * Check if user has permission via token
   */
  public async hasPermissionViaToken(
    userId: string,
    resource: string,
    action: string
  ): Promise<PermissionResult<boolean>> {
    try {
      const { data, error } = await this.client.rpc('has_permission_via_token', {
        p_user_id: userId,
        p_resource: resource,
        p_action: action
      });
      
      if (error) {
        console.error('Has permission via token error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected has permission via token error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while checking permission via token') 
      };
    }
  }

  /**
   * Check if user has permission in group
   */
  public async hasPermissionInGroup(
    userId: string,
    groupName: string
  ): Promise<PermissionResult<boolean>> {
    try {
      const { data, error } = await this.client.rpc('has_permission_in_group', {
        p_user_id: userId,
        p_group_name: groupName
      });
      
      if (error) {
        console.error('Has permission in group error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected has permission in group error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while checking permission in group') 
      };
    }
  }
}
