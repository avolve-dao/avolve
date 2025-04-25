/**
 * Token-Based RBAC Hook
 *
 * This hook extends the traditional RBAC system with token-based permissions,
 * providing a unified API for access control that considers both roles and tokens.
 */

import { useCallback } from 'react';
import { useTokenService } from './use-token-service';
import { useRBAC } from '../auth/use-rbac';

export function useTokenRBAC() {
  const tokenService = useTokenService();
  const rbac = useRBAC();

  const hasTokenPermission = useCallback(
    async (permission: string, tokenId?: string) => {
      if (!permission) return false;

      try {
        const response = await tokenService.checkPermission(permission, tokenId);
        return response.success && response.data;
      } catch (error) {
        console.error('Error checking token permission:', error);
        return false;
      }
    },
    [tokenService]
  );

  const hasPermissionEnhanced = useCallback(
    async (resource: string, action: string) => {
      // First check regular RBAC permissions
      const hasRBACPermission = await rbac.hasPermission(resource, action);
      if (hasRBACPermission) return true;

      // Then check token-based permissions
      const permission = `${resource}:${action}`;
      return hasTokenPermission(permission);
    },
    [rbac, hasTokenPermission]
  );

  return {
    ...rbac,
    hasTokenPermission,
    hasPermissionEnhanced,
  };
}
