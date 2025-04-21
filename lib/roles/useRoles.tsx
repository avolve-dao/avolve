import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type Role = {
  id: string;
  name: string;
  description: string;
};

export type RoleResult<T> = {
  data: T | null;
  error: Error | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient();

/**
 * Hook for role-related functionality
 */
export function useRoles(userId: string) {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Get all roles for a user
   */
  const getUserRoles = async (): Promise<RoleResult<Role[]>> => {
    if (!userId) {
      return { data: null, error: new Error('User not authenticated') };
    }
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role:roles(id, name, description)')
        .eq('user_id', userId);
      if (error) {
        return { data: null, error };
      }
      const roles = (data || []).map((r: any) => r.role).filter(Boolean);
      return { data: roles, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = async (roleName: string): Promise<boolean> => {
    if (!userId) return false;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role:roles(name)')
        .eq('user_id', userId)
        .eq('roles.name', roleName)
        .single();
      if (error) return false;
      return !!data;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if user is an admin
   */
  const isAdmin = async (): Promise<boolean> => {
    return hasRole('admin');
  };

  /**
   * Check if user has a specific permission
   */
  const hasPermission = async (permission: string): Promise<boolean> => {
    if (!userId) return false;
    try {
      setIsLoading(true);
      // Get all roles and check if any has the required permission
      const { data, error } = await supabase
        .from('user_roles')
        .select('role:roles(permissions)')
        .eq('user_id', userId);
      if (error) return false;
      const roles = (data || []).map((r: any) => r.role).filter(Boolean);
      for (const role of roles) {
        if (role.permissions && Array.isArray(role.permissions)) {
          if (role.permissions.some((p: any) => p.name === permission)) {
            return true;
          }
        }
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Assign a role to a user (admin only)
   */
  const assignRole = async (
    targetUserId: string,
    roleName: string,
    expiresAt?: Date,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .insert([
          {
            user_id: targetUserId,
            role_name: roleName,
            expires_at: expiresAt ? expiresAt.toISOString() : null,
          },
        ]);
      return !error;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Remove a role from a user (admin only)
   */
  const removeRole = async (
    targetUserId: string,
    roleName: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', targetUserId)
        .eq('role_name', roleName);
      return !error;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getUserRoles,
    hasRole,
    isAdmin,
    hasPermission,
    assignRole,
    removeRole,
  };
}
