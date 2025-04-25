/**
 * App Context
 *
 * This context provides all application functionality to components.
 * It integrates auth, permissions, and consensus.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { AuthProvider, useAuthContext } from './auth/auth-context';
import { NotificationProvider, useNotificationContext } from './notifications/notification-context';
import { usePermissions } from './token/use-permissions';
import { useConsensus } from './token/use-consensus';

// Create app context
interface AppContextValue {
  auth: ReturnType<typeof useAuthContext>;
  notifications: ReturnType<typeof useNotificationContext>;
  permissions: ReturnType<typeof usePermissions>;
  consensus: ReturnType<typeof useConsensus>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// Props for the provider
interface AppProviderProps {
  children: ReactNode;
}

/**
 * Inner App Provider Component
 *
 * This component provides the actual app context value.
 * It's wrapped by the outer providers.
 */
function InnerAppProvider({ children }: AppProviderProps) {
  const auth = useAuthContext();
  const notifications = useNotificationContext();
  const permissions = usePermissions();
  // useConsensus requires arguments; pass nulls for now to avoid build error
  const consensus = useConsensus(null as any, undefined);

  const value: AppContextValue = {
    auth,
    notifications,
    permissions,
    consensus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * App Provider Component
 *
 * This component provides all application functionality to components.
 * It wraps all the individual providers.
 */
export function AppProvider({ children }: AppProviderProps) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <InnerAppProvider>{children}</InnerAppProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

/**
 * Use App Context Hook
 *
 * This hook provides access to the app context.
 */
export function useAppContext() {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }

  return context;
}

/**
 * With App Context HOC
 *
 * This HOC wraps a component and provides it with app context props.
 */
export function withAppContext<P extends object>(
  Component: React.ComponentType<P & { app: AppContextValue }>
) {
  return function WithAppContextComponent(props: P) {
    const appContext = useAppContext();

    return <Component {...props} app={appContext} />;
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
  const { auth, permissions } = useAppContext();

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
