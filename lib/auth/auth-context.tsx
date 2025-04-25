/**
 * Auth Context
 *
 * This context provides authentication and permission functionality
 * to all components in the application.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './use-auth';
import { usePermissions } from '../token/use-permissions';

// Create the context
const AuthContext = createContext<ReturnType<typeof useAuth> | undefined>(undefined);
const PermissionContext = createContext<ReturnType<typeof usePermissions> | undefined>(undefined);

// Props for the provider
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 *
 * This component provides authentication and permission functionality
 * to all components in the application.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();
  const permissions = usePermissions();

  return (
    <AuthContext.Provider value={auth}>
      <PermissionContext.Provider value={permissions}>{children}</PermissionContext.Provider>
    </AuthContext.Provider>
  );
}

/**
 * Use Auth Context Hook
 *
 * This hook provides access to the auth context.
 */
export function useAuthContext() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}

/**
 * Use Permission Context Hook
 *
 * This hook provides access to the permission context.
 */
export function usePermissionContext() {
  const context = useContext(PermissionContext);

  if (context === undefined) {
    throw new Error('usePermissionContext must be used within an AuthProvider');
  }

  return context;
}

/**
 * With Auth HOC
 *
 * This HOC wraps a component and provides it with auth and permission props.
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<
    P & {
      auth: ReturnType<typeof useAuth>;
      permissions: ReturnType<typeof usePermissions>;
    }
  >
) {
  return function WithAuthComponent(props: P) {
    const auth = useAuthContext();
    const permissions = usePermissionContext();

    return <Component {...props} auth={auth} permissions={permissions} />;
  };
}

/**
 * Protected Route Component
 *
 * This component only renders its children if the user is authenticated.
 * Otherwise, it renders the fallback component.
 */
interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredPermission?: { resource: string; action: string };
  requiredRole?: string;
}

export function ProtectedRoute({
  children,
  fallback = null,
  requiredPermission,
  requiredRole,
}: ProtectedRouteProps) {
  const auth = useAuthContext();
  const permissions = usePermissionContext();

  // Show loading state
  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  // Check if user is authenticated
  if (!auth.isAuthenticated) {
    return <>{fallback}</>;
  }

  // Check if user has required permission
  if (requiredPermission) {
    const hasPermission = permissions.permissions.some(
      p => p.resource === requiredPermission.resource && p.action === requiredPermission.action
    );

    if (!hasPermission) {
      return <div>You don't have permission to access this page.</div>;
    }
  }

  // Check if user has required role
  if (requiredRole) {
    // Role interface only has id and name, so compare to name
    const hasRole = permissions.roles.some(r => r.name === requiredRole);

    if (!hasRole) {
      return <div>You don't have the required role to access this page.</div>;
    }
  }

  // User is authenticated and has required permissions/roles
  return <>{children}</>;
}

/**
 * Permission Gate Component
 *
 * This component only renders its children if the user has the required permission.
 */
interface PermissionGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  resource: string;
  action: string;
}

export function PermissionGate({
  children,
  fallback = null,
  resource,
  action,
}: PermissionGateProps) {
  const permissions = usePermissionContext();

  const hasPermission = permissions.permissions.some(
    p => p.resource === resource && p.action === action
  );

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Role Gate Component
 *
 * This component only renders its children if the user has the required role.
 */
interface RoleGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  role: string;
}

export function RoleGate({ children, fallback = null, role }: RoleGateProps) {
  const permissions = usePermissionContext();

  // Role interface only has id and name, so compare to name
  const hasRole = permissions.roles.some(r => r.name === role);

  if (!hasRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Token Permission Gate Component
 *
 * This component only renders its children if the user has the required token-based permission.
 */
interface TokenPermissionGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  resource: string;
  action: string;
}

export function TokenPermissionGate({
  children,
  fallback = null,
  resource,
  action,
}: TokenPermissionGateProps) {
  const { user } = useAuthContext();
  const { permissionService } = usePermissionContext();
  const [hasPermission, setHasPermission] = React.useState(false);
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    async function checkPermission() {
      if (!user) {
        setHasPermission(false);
        setIsChecking(false);
        return;
      }

      try {
        const { data } = await permissionService.hasPermissionViaToken(user.id, resource, action);

        setHasPermission(!!data);
      } catch (error) {
        console.error('Error checking token permission:', error);
        setHasPermission(false);
      } finally {
        setIsChecking(false);
      }
    }

    checkPermission();
  }, [user, permissionService, resource, action]);

  if (isChecking) {
    return null;
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
