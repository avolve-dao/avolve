import { useCallback, useState } from 'react';
import { useSupabase } from '@/lib/supabase/use-supabase';

export type Role = {
  id: string;
  name: string;
  roleType: 'subscriber' | 'participant' | 'contributor' | 'associate' | 'builder' | 'partner';
  isAdmin: boolean;
  permissions: Record<string, boolean>;
  assignedAt: string;
  expiresAt?: string;
};

export type RoleResult<T> = {
  data: T | null;
  error: Error | null;
};

/**
 * Hook for role-related functionality
 */
export function useRoles() {
  const { supabase, session, user } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Get all user roles
   */
  const getUserRoles = useCallback(async (): Promise<RoleResult<Role[]>> => {
    if (!session?.user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .rpc('get_user_roles');
      
      if (error) throw error;
      
      const roles = data.map((role: any) => ({
        id: role.role_id,
        name: role.role_name,
        roleType: role.role_type,
        isAdmin: role.is_admin,
        permissions: role.permissions,
        assignedAt: role.assigned_at,
        expiresAt: role.expires_at
      }));
      
      return { data: roles, error: null };
    } catch (error) {
      console.error('Error getting user roles:', error);
      return { data: null, error: error as Error };
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session]);

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(async (roleName: string): Promise<boolean> => {
    if (!session?.user) return false;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .rpc('has_role', { p_role_name: roleName });
      
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session]);

  /**
   * Check if user is an admin
   */
  const isAdmin = useCallback(async (): Promise<boolean> => {
    if (!session?.user) return false;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .rpc('is_admin');
      
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback(async (permission: string): Promise<boolean> => {
    if (!session?.user) return false;

    try {
      setIsLoading(true);
      // Get all roles and check if any has the required permission
      const rolesResult = await getUserRoles();
      if (rolesResult.error) throw rolesResult.error;
      
      const roles = rolesResult.data || [];
      
      // Check if any role has the required permission
      return roles.some(role => role.permissions[permission] === true);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session, getUserRoles]);

  /**
   * Assign a role to a user (admin only)
   */
  const assignRole = useCallback(async (
    userId: string,
    roleName: string,
    expiresAt?: Date,
    metadata?: any
  ): Promise<boolean> => {
    if (!session?.user) return false;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .rpc('assign_role', { 
          p_user_id: userId,
          p_role_name: roleName,
          p_expires_at: expiresAt?.toISOString(),
          p_metadata: metadata
        });
      
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error assigning role:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session]);

  /**
   * Remove a role from a user (admin only)
   */
  const removeRole = useCallback(async (
    userId: string,
    roleName: string
  ): Promise<boolean> => {
    if (!session?.user) return false;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .rpc('remove_role', { 
          p_user_id: userId,
          p_role_name: roleName
        });
      
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error removing role:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session]);

  return {
    isLoading,
    getUserRoles,
    hasRole,
    isAdmin,
    hasPermission,
    assignRole,
    removeRole
  };
}
