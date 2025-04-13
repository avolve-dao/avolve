/**
 * Permission Hook
 * 
 * This hook provides permission-related functionality for React components.
 * It wraps the PermissionService to provide a more React-friendly interface.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/use-auth';
import { 
  PermissionService, 
  Permission, 
  Role, 
  PermissionGroup,
  TokenTypePermission
} from './permission-service';

export interface PermissionContextState {
  isLoading: boolean;
  permissions: Permission[];
  roles: Role[];
  error: Error | null;
}

export function usePermissions() {
  const { user, authService, isAuthenticated } = useAuth();
  const permissionService = useMemo(() => new PermissionService(authService.getSupabaseClient()), [authService]);
  
  const [state, setState] = useState<PermissionContextState>({
    isLoading: false,
    permissions: [],
    roles: [],
    error: null
  });

  // Load user permissions and roles
  const loadPermissionsAndRoles = useCallback(async () => {
    if (!user || !isAuthenticated) {
      setState({
        isLoading: false,
        permissions: [],
        roles: [],
        error: null
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Get user permissions
      const { data: permissions, error: permissionsError } = await permissionService.getUserPermissions(user.id);
      
      if (permissionsError) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: permissionsError 
        }));
        return;
      }
      
      // Get user roles
      const { data: roles, error: rolesError } = await permissionService.getUserRoles(user.id);
      
      if (rolesError) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: rolesError 
        }));
        return;
      }
      
      setState({
        isLoading: false,
        permissions: permissions || [],
        roles: roles || [],
        error: null
      });
    } catch (error) {
      console.error('Error loading permissions and roles:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to load permissions and roles')
      }));
    }
  }, [user, isAuthenticated, permissionService]);

  // Load permissions and roles when user changes
  useEffect(() => {
    loadPermissionsAndRoles();
  }, [user, loadPermissionsAndRoles]);

  // Check if user has permission
  const hasPermission = useCallback(async (
    resource: string,
    action: string
  ): Promise<boolean> => {
    if (!user || !isAuthenticated) {
      return false;
    }

    try {
      const { data } = await permissionService.hasPermission(user.id, resource, action);
      return !!data;
    } catch (error) {
      console.error('Check permission error:', error);
      return false;
    }
  }, [user, isAuthenticated, permissionService]);

  // Check if user has permission via token
  const hasPermissionViaToken = useCallback(async (
    resource: string,
    action: string
  ): Promise<boolean> => {
    if (!user || !isAuthenticated) {
      return false;
    }

    try {
      const { data } = await permissionService.hasPermissionViaToken(user.id, resource, action);
      return !!data;
    } catch (error) {
      console.error('Check permission via token error:', error);
      return false;
    }
  }, [user, isAuthenticated, permissionService]);

  // Check if user has permission in group
  const hasPermissionInGroup = useCallback(async (
    groupName: string
  ): Promise<boolean> => {
    if (!user || !isAuthenticated) {
      return false;
    }

    try {
      const { data } = await permissionService.hasPermissionInGroup(user.id, groupName);
      return !!data;
    } catch (error) {
      console.error('Check permission in group error:', error);
      return false;
    }
  }, [user, isAuthenticated, permissionService]);

  // Get all permissions
  const getAllPermissions = useCallback(async (): Promise<Permission[]> => {
    try {
      const { data } = await permissionService.getAllPermissions();
      return data || [];
    } catch (error) {
      console.error('Get all permissions error:', error);
      return [];
    }
  }, [permissionService]);

  // Get all roles
  const getAllRoles = useCallback(async (): Promise<Role[]> => {
    try {
      const { data } = await permissionService.getAllRoles();
      return data || [];
    } catch (error) {
      console.error('Get all roles error:', error);
      return [];
    }
  }, [permissionService]);

  // Get all permission groups
  const getAllPermissionGroups = useCallback(async (): Promise<PermissionGroup[]> => {
    try {
      const { data } = await permissionService.getAllPermissionGroups();
      return data || [];
    } catch (error) {
      console.error('Get all permission groups error:', error);
      return [];
    }
  }, [permissionService]);

  // Get permissions in group
  const getPermissionsInGroup = useCallback(async (
    groupId: string
  ): Promise<Permission[]> => {
    try {
      const { data } = await permissionService.getPermissionsInGroup(groupId);
      return data || [];
    } catch (error) {
      console.error('Get permissions in group error:', error);
      return [];
    }
  }, [permissionService]);

  // Get token type permissions
  const getTokenTypePermissions = useCallback(async (
    tokenTypeId?: string
  ): Promise<TokenTypePermission[]> => {
    try {
      const { data } = await permissionService.getTokenTypePermissions(tokenTypeId);
      return data || [];
    } catch (error) {
      console.error('Get token type permissions error:', error);
      return [];
    }
  }, [permissionService]);

  // Get role permissions
  const getRolePermissions = useCallback(async (
    role: string
  ): Promise<Permission[]> => {
    try {
      const { data } = await permissionService.getRolePermissions(role);
      return data || [];
    } catch (error) {
      console.error('Get role permissions error:', error);
      return [];
    }
  }, [permissionService]);

  // Create a permission
  const createPermission = useCallback(async (
    resource: string,
    action: string,
    description?: string
  ) => {
    try {
      return await permissionService.createPermission(resource, action, description);
    } catch (error) {
      console.error('Create permission error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to create permission')
      };
    }
  }, [permissionService]);

  // Create a permission group
  const createPermissionGroup = useCallback(async (
    name: string,
    description?: string
  ) => {
    try {
      return await permissionService.createPermissionGroup(name, description);
    } catch (error) {
      console.error('Create permission group error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to create permission group')
      };
    }
  }, [permissionService]);

  // Add permission to group
  const addPermissionToGroup = useCallback(async (
    groupId: string,
    permissionId: string
  ) => {
    try {
      return await permissionService.addPermissionToGroup(groupId, permissionId);
    } catch (error) {
      console.error('Add permission to group error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to add permission to group')
      };
    }
  }, [permissionService]);

  // Assign permission to token type
  const assignPermissionToTokenType = useCallback(async (
    tokenTypeId: string,
    permissionId: string,
    minBalance: number = 1
  ) => {
    try {
      return await permissionService.assignPermissionToTokenType(tokenTypeId, permissionId, minBalance);
    } catch (error) {
      console.error('Assign permission to token type error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to assign permission to token type')
      };
    }
  }, [permissionService]);

  // Assign role to user
  const assignRoleToUser = useCallback(async (
    userId: string,
    role: string,
    grantedBy?: string,
    expiresAt?: Date
  ) => {
    try {
      return await permissionService.assignRoleToUser(userId, role, grantedBy, expiresAt);
    } catch (error) {
      console.error('Assign role to user error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to assign role to user')
      };
    }
  }, [permissionService]);

  // Assign permission to role
  const assignPermissionToRole = useCallback(async (
    role: string,
    resource: string,
    action: string
  ) => {
    try {
      return await permissionService.assignPermissionToRole(role, resource, action);
    } catch (error) {
      console.error('Assign permission to role error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to assign permission to role')
      };
    }
  }, [permissionService]);

  return {
    // State
    ...state,
    
    // Permission checks
    hasPermission,
    hasPermissionViaToken,
    hasPermissionInGroup,
    
    // Getters
    getAllPermissions,
    getAllRoles,
    getAllPermissionGroups,
    getPermissionsInGroup,
    getTokenTypePermissions,
    getRolePermissions,
    
    // Creators
    createPermission,
    createPermissionGroup,
    
    // Assigners
    addPermissionToGroup,
    assignPermissionToTokenType,
    assignRoleToUser,
    assignPermissionToRole,
    
    // Reload
    loadPermissionsAndRoles,
    
    // Service (for direct access if needed)
    permissionService
  };
}
