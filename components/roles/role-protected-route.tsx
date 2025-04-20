import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useRoles } from '@/lib/roles/useRoles';
import LoadingSpinner from '@/components/ui/loading-spinner';
import AccessDeniedView from '@/components/token/access-denied-view';

interface RoleProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  adminOnly?: boolean;
  fallbackUrl?: string;
  userId: string;
}

/**
 * Component that protects routes based on user roles
 */
export default function RoleProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  adminOnly = false,
  fallbackUrl = '/',
  userId,
}: RoleProtectedRouteProps) {
  const router = useRouter();
  const { hasRole, hasPermission, isAdmin, isLoading } = useRoles(userId);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      // If userId is not provided, treat as unauthenticated
      if (!userId) {
        setHasAccess(false);
        setIsChecking(false);
        return;
      }

      try {
        // Check for admin access if required
        if (adminOnly) {
          const adminAccess = await isAdmin();
          setHasAccess(adminAccess);
          setIsChecking(false);
          return;
        }
        // Check for specific permission if required
        if (requiredPermission) {
          const permissionAccess = await hasPermission(requiredPermission);
          if (permissionAccess) {
            setHasAccess(true);
            setIsChecking(false);
            return;
          }
        }
        // Check for specific role if required
        if (requiredRole) {
          const roleAccess = await hasRole(requiredRole);
          setHasAccess(roleAccess);
          setIsChecking(false);
          return;
        }
        // If no specific requirements, allow access
        setHasAccess(true);
        setIsChecking(false);
      } catch (error) {
        setHasAccess(false);
        setIsChecking(false);
      }
    };
    checkAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiredRole, requiredPermission, adminOnly, userId]);

  useEffect(() => {
    if (hasAccess === false && !isChecking && fallbackUrl) {
      router.replace(fallbackUrl);
    }
  }, [hasAccess, isChecking, fallbackUrl, router]);

  if (isChecking || isLoading) {
    return <LoadingSpinner />;
  }
  if (!hasAccess) {
    return <AccessDeniedView />;
  }
  return <>{children}</>;
}
