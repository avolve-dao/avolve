'use client';

import { useCallback, useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { RoleService, Role, Permission } from '@/lib/auth/role-service';

/**
 * Role-Based Access Control (RBAC) Hook
 * 
 * This hook provides access to role and permission checking functionality
 * for use in React components. It integrates with the authentication system
 * and caches results for better performance.
 */
export function useRBAC() {
  const { user, isAuthenticated } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use browser instance for client-side components
  const roleService = RoleService.getBrowserInstance();
  
  // Load user roles and permissions
  useEffect(() => {
    const loadUserRolesAndPermissions = async () => {
      if (!isAuthenticated || !user) {
        setRoles([]);
        setPermissions([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Load roles
        const { data: userRoles } = await roleService.getUsersWithRole(user.id);
        if (userRoles) {
          const rolePromises = userRoles.map(async (userRole) => {
            const { data: role } = await roleService.getRoleById(userRole.id);
            return role;
          });
          
          const resolvedRoles = await Promise.all(rolePromises);
          setRoles(resolvedRoles.filter(Boolean) as Role[]);
        }
        
        // Load permissions
        const { data: userPermissions } = await roleService.getAllPermissions();
        if (userPermissions) {
          setPermissions(userPermissions);
        }
      } catch (error) {
        console.error('Error loading user roles and permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserRolesAndPermissions();
  }, [isAuthenticated, user]);
  
  /**
   * Check if the current user has a specific role
   */
  const hasRole = useCallback(async (roleName: string): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    
    // Check if user is admin (admins have all roles)
    if (user.isAdmin) return true;
    
    // Check cached roles first
    const hasRoleInCache = roles.some(role => role.name === roleName);
    if (hasRoleInCache) return true;
    
    // If not in cache, check with the server
    return await roleService.hasRole(user.id, roleName);
  }, [isAuthenticated, user, roles]);
  
  /**
   * Check if the current user has a specific permission
   */
  const hasPermission = useCallback(async (resource: string, action: string): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    
    // Check if user is admin (admins have all permissions)
    if (user.isAdmin) return true;
    
    // Check with the server (permissions are more dynamic, so we don't cache them)
    return await roleService.hasPermission(user.id, resource, action);
  }, [isAuthenticated, user]);
  
  /**
   * Check if the current user can perform an action on a resource
   * This is a more user-friendly version of hasPermission
   */
  const can = useCallback(async (action: string, resource: string): Promise<boolean> => {
    return await hasPermission(resource, action);
  }, [hasPermission]);
  
  /**
   * Check if the current user has any of the specified roles
   */
  const hasAnyRole = useCallback(async (roleNames: string[]): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    
    // Check if user is admin (admins have all roles)
    if (user.isAdmin) return true;
    
    // Check each role
    for (const roleName of roleNames) {
      if (await hasRole(roleName)) {
        return true;
      }
    }
    
    return false;
  }, [isAuthenticated, user, hasRole]);
  
  /**
   * Check if the current user has all of the specified roles
   */
  const hasAllRoles = useCallback(async (roleNames: string[]): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    
    // Check if user is admin (admins have all roles)
    if (user.isAdmin) return true;
    
    // Check each role
    for (const roleName of roleNames) {
      if (!(await hasRole(roleName))) {
        return false;
      }
    }
    
    return true;
  }, [isAuthenticated, user, hasRole]);
  
  return {
    roles,
    permissions,
    isLoading,
    hasRole,
    hasPermission,
    can,
    hasAnyRole,
    hasAllRoles,
  };
}
