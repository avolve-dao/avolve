import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabase } from '@/lib/supabase/use-supabase';
import { useRoles } from '@/lib/roles/useRoles';
import LoadingSpinner from '@/components/ui/loading-spinner';
import AccessDeniedView from '@/components/token/access-denied-view';

interface RoleProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  adminOnly?: boolean;
  fallbackUrl?: string;
}

/**
 * Component that protects routes based on user roles
 */
export default function RoleProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  adminOnly = false,
  fallbackUrl = '/'
}: RoleProtectedRouteProps) {
  const router = useRouter();
  const { session } = useSupabase();
  const { hasRole, hasPermission, isAdmin, isLoading } = useRoles();
  
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!session) {
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
        console.error('Error checking role access:', error);
        setHasAccess(false);
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [
    session, 
    requiredRole, 
    requiredPermission, 
    adminOnly, 
    hasRole, 
    hasPermission, 
    isAdmin
  ]);

  if (isChecking || isLoading) {
    return <LoadingSpinner />;
  }

  if (!hasAccess) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-700 p-6 text-white">
            <h2 className="text-2xl font-bold">Access Restricted</h2>
            <p className="text-white/80">
              {adminOnly ? 'Admin access required' : 
               requiredRole ? `${requiredRole} role required` : 
               requiredPermission ? `${requiredPermission} permission required` : 
               'You do not have permission to access this page'}
            </p>
          </div>
          
          <div className="p-6">
            <p className="mb-4">
              You don't have the necessary permissions to view this page. Please contact an administrator if you believe you should have access.
            </p>
            
            <div className="flex justify-end">
              <button
                onClick={() => router.push(fallbackUrl)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
