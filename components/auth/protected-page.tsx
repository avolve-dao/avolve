'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useRBAC } from '@/lib/hooks/use-rbac';
import { useAuth } from '@/lib/hooks/use-auth';
import { Spinner } from '@/components/ui/spinner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface ProtectedPageProps {
  /**
   * The content to render if the user is authorized
   */
  children: ReactNode;

  /**
   * The role(s) required to access the page
   * If multiple roles are provided, the user must have at least one of them
   */
  requiredRoles?: string | string[];

  /**
   * The permission(s) required to access the page
   * Each permission is in the format "resource:action"
   * If multiple permissions are provided, the user must have all of them
   */
  requiredPermissions?: string | string[];

  /**
   * Whether to use AND logic for multiple roles (user must have all roles)
   * Default: false (OR logic - user must have at least one role)
   */
  requireAllRoles?: boolean;

  /**
   * The title to display on the loading and unauthorized screens
   * Default: "Protected Page"
   */
  title?: string;

  /**
   * The description to display on the unauthorized screen
   * Default: "You don't have permission to access this page."
   */
  description?: string;

  /**
   * Whether to show a fallback UI instead of redirecting to the unauthorized page
   * Default: true
   */
  showFallback?: boolean;

  /**
   * The path to redirect to if the user is not authenticated
   * Default: "/auth/login"
   */
  loginRedirectPath?: string;
}

/**
 * Protected Page Component
 *
 * A wrapper component for pages that require authentication and specific roles or permissions.
 * It handles loading states, authentication checks, and authorization checks.
 *
 * @example
 * ```tsx
 * // Basic usage - protect a page with a role
 * export default function AdminPage() {
 *   return (
 *     <ProtectedPage requiredRoles="admin" title="Admin Dashboard">
 *       <AdminDashboardContent />
 *     </ProtectedPage>
 *   );
 * }
 *
 * // Protect a page with a permission
 * export default function ContentEditorPage() {
 *   return (
 *     <ProtectedPage
 *       requiredPermissions="content:edit"
 *       title="Content Editor"
 *       description="You need content editing permissions to access this page."
 *     >
 *       <ContentEditorContent />
 *     </ProtectedPage>
 *   );
 * }
 * ```
 */
export function ProtectedPage({
  children,
  requiredRoles,
  requiredPermissions,
  requireAllRoles = false,
  title = 'Protected Page',
  description = "You don't have permission to access this page.",
  showFallback = true,
  loginRedirectPath = '/auth/login',
}: ProtectedPageProps) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { hasRole, hasAllRoles, hasAnyRole, hasPermission, isLoading: isRbacLoading } = useRBAC();
  const [isAuthorized, setIsAuthorized] = React.useState(false);
  const [isChecking, setIsChecking] = React.useState(true);

  // Convert role and permission options to arrays
  const roles = requiredRoles
    ? Array.isArray(requiredRoles)
      ? requiredRoles
      : [requiredRoles]
    : [];

  const permissions = requiredPermissions
    ? Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions]
    : [];

  // Check if user is authorized
  React.useEffect(() => {
    const checkAuthorization = async () => {
      if (isAuthLoading || isRbacLoading) return;

      // If no user, redirect to login
      if (!user) {
        const redirectUrl = new URL(loginRedirectPath, window.location.origin);
        redirectUrl.searchParams.set('redirectTo', window.location.pathname);
        router.push(redirectUrl.toString());
        return;
      }

      setIsChecking(true);

      try {
        let roleAuthorized = true;
        let permissionAuthorized = true;

        // Check roles if specified
        if (roles.length > 0) {
          if (requireAllRoles) {
            roleAuthorized = await hasAllRoles(roles);
          } else {
            roleAuthorized = await hasAnyRole(roles);
          }
        }

        // Check permissions if specified and role check passed
        if (permissions.length > 0 && roleAuthorized) {
          // Check each permission (all must pass)
          for (const permission of permissions) {
            const [resource, action] = permission.split(':');
            if (!(await hasPermission(resource, action))) {
              permissionAuthorized = false;
              break;
            }
          }
        }

        // User is authorized if they pass both role and permission checks
        setIsAuthorized(roleAuthorized && permissionAuthorized);
      } catch (error) {
        console.error('Error checking authorization:', error);
        setIsAuthorized(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuthorization();
  }, [user, isAuthLoading, isRbacLoading, hasRole, hasAllRoles, hasAnyRole, hasPermission, router]);

  // Show loading state
  if (isAuthLoading || isRbacLoading || isChecking) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized state
  if (!isAuthorized) {
    if (!showFallback) {
      // Redirect to unauthorized page with context
      React.useEffect(() => {
        const url = new URL('/unauthorized', window.location.origin);

        // Add roles and permissions to query params
        if (roles.length > 0) {
          url.searchParams.set('roles', roles.join(','));
        }

        if (permissions.length > 0) {
          url.searchParams.set('permissions', permissions.join(','));
        }

        // Add the attempted resource to query params
        url.searchParams.set('resource', window.location.pathname);

        router.push(url.toString());
      }, []);

      return null;
    }

    // Show fallback UI
    return (
      <div className="container flex items-center justify-center py-10">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ShieldAlert className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-muted-foreground mb-4">
              <p>
                This page requires specific permissions or roles that your account doesn't have.
              </p>

              {roles.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Required Role{roles.length > 1 ? 's' : ''}:</p>
                  <p>{roles.join(', ')}</p>
                </div>
              )}

              {permissions.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">
                    Required Permission{permissions.length > 1 ? 's' : ''}:
                  </p>
                  <p>{permissions.join(', ')}</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show authorized content
  return <>{children}</>;
}
