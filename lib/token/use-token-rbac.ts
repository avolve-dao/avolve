/**
 * Token-Based RBAC Hook
 * 
 * This hook extends the traditional RBAC system with token-based permissions,
 * providing a unified API for access control that considers both roles and tokens.
 */

import { useState, useCallback, useEffect } from 'react';
import { useSupabase } from '../supabase/use-supabase';
import { TokenService } from './token-service';
import { useAuth } from '../auth/use-auth';

// Import the RBAC hook from the correct location
import { useRBAC } from '../hooks/use-rbac';

export interface UseTokenRBACResult {
  loading: boolean;
  error: Error | null;
  hasPermission: (resource: string, action: string) => Promise<boolean>;
  hasTokenPermission: (tokenCode: string, action: string) => Promise<boolean>;
  hasPermissionEnhanced: (resource: string, action: string) => Promise<boolean>;
  getAllPermissions: () => Promise<any[]>;
}

/**
 * Hook for token-based RBAC functionality
 */
export function useTokenRBAC(): UseTokenRBACResult {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const rbac = useRBAC();
  const [tokenService] = useState(() => new TokenService(supabase));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Check if the user has permission via a specific token type
   */
  const hasTokenPermission = useCallback(async (tokenCode: string, action: string): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      // First get the token type ID from the code
      const { data: tokenTypes, error: tokenTypesError } = await tokenService.getAllTokenTypes();
      if (tokenTypesError) {
        throw tokenTypesError;
      }
      
      const tokenType = tokenTypes?.find((tt: any) => tt.code === tokenCode);
      if (!tokenType) {
        return false;
      }
      
      // Now check if the user has any tokens of this type with sufficient balance
      const { data: tokens, error: tokensError } = await tokenService.getTokensByType(tokenType.id);
      if (tokensError) {
        throw tokensError;
      }
      
      if (!tokens || tokens.length === 0) {
        return false;
      }
      
      // Check if the user has permission via this token type
      const { data, error: permError } = await supabase.rpc('has_permission_via_token_type', {
        p_user_id: user.id,
        p_token_type_id: tokenType.id,
        p_action: action
      });
      
      if (permError) {
        throw permError;
      }
      
      return !!data;
    } catch (err) {
      console.error(`Error checking permission for token ${tokenCode}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase, user, tokenService]);

  /**
   * Check if user has permission through either roles or tokens
   */
  const hasPermissionEnhanced = useCallback(async (resource: string, action: string): Promise<boolean> => {
    if (!user) return false;
    
    // First check traditional RBAC permissions
    const hasRbacPermission = await rbac.hasPermission(resource, action);
    if (hasRbacPermission) return true;
    
    // If no RBAC permission, check token-based permissions
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.rpc('has_permission_enhanced_with_tokens', {
        p_user_id: user.id,
        p_resource: resource,
        p_action: action
      });
      
      if (error) throw error;
      return !!data;
    } catch (err) {
      console.error('Error checking enhanced permission:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, rbac, supabase]);

  /**
   * Get all permissions for the user (including from tokens)
   */
  const getAllPermissions = useCallback(async () => {
    if (!user) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.rpc('get_user_permissions_with_tokens', {
        p_user_id: user.id
      });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error getting all permissions:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  /**
   * Forward the hasPermission method from the RBAC hook
   */
  const hasPermission = useCallback(async (resource: string, action: string): Promise<boolean> => {
    return rbac.hasPermission(resource, action);
  }, [rbac]);

  return {
    loading: loading || rbac.loading,
    error: error || rbac.error,
    hasPermission,
    hasTokenPermission,
    hasPermissionEnhanced,
    getAllPermissions
  };
}
