/**
 * RBAC Middleware Configuration
 * 
 * This file defines the route protection rules for the application.
 * It maps routes to required roles and permissions for access control.
 */

/**
 * Route Protection Configuration
 * 
 * Each key is a route pattern, and the value is an object with required roles and permissions.
 * - requiredRoles: Array of role names, user must have at least one of these roles
 * - requiredPermissions: Array of permissions in format "resource:action", user must have all of these permissions
 * - requireAllRoles: If true, user must have all specified roles (default: false - user needs at least one)
 */
export const routeProtection: Record<string, {
  requiredRoles?: string[];
  requiredPermissions?: string[];
  requireAllRoles?: boolean;
  unauthorizedRedirect?: string;
}> = {
  // Admin routes
  '/admin': {
    requiredRoles: ['admin'],
    unauthorizedRedirect: '/unauthorized'
  },
  '/admin/users': {
    requiredRoles: ['admin'],
    requiredPermissions: ['users:manage'],
    unauthorizedRedirect: '/unauthorized'
  },
  '/admin/roles': {
    requiredRoles: ['admin'],
    unauthorizedRedirect: '/unauthorized'
  },
  
  // Content management routes
  '/content/create': {
    requiredPermissions: ['content:create'],
    unauthorizedRedirect: '/unauthorized'
  },
  '/content/edit/:id': {
    requiredPermissions: ['content:edit'],
    unauthorizedRedirect: '/unauthorized'
  },
  '/content/delete/:id': {
    requiredPermissions: ['content:delete'],
    unauthorizedRedirect: '/unauthorized'
  },
  
  // Moderation routes
  '/moderation': {
    requiredRoles: ['admin', 'moderator'],
    requiredPermissions: ['content:moderate'],
    unauthorizedRedirect: '/unauthorized'
  },
  
  // Settings routes
  '/settings/system': {
    requiredRoles: ['admin'],
    requiredPermissions: ['settings:manage'],
    unauthorizedRedirect: '/settings'
  }
};

/**
 * Check if a route matches a pattern
 * 
 * @param route - The actual route to check
 * @param pattern - The pattern to match against
 * @returns Whether the route matches the pattern
 */
export function matchRoute(route: string, pattern: string): boolean {
  // Convert pattern to regex
  // Replace :param with regex to match any segment
  const regexPattern = pattern
    .replace(/:[^/]+/g, '[^/]+')
    .replace(/\//g, '\\/');
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(route);
}

/**
 * Get protection rules for a route
 * 
 * @param route - The route to get protection rules for
 * @returns Protection rules for the route, or null if not protected
 */
export function getRouteProtection(route: string) {
  // Check for exact match first
  if (routeProtection[route]) {
    return routeProtection[route];
  }
  
  // Check for pattern matches
  for (const pattern in routeProtection) {
    if (matchRoute(route, pattern)) {
      return routeProtection[pattern];
    }
  }
  
  // No protection rules found
  return null;
}
