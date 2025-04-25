/**
 * RBAC Middleware Configuration
 *
 * This file defines the route protection rules for the application.
 * It maps routes to required roles and permissions for access control.
 */

import { RouteProtection } from './rbac-middleware';

/**
 * Route Protection Configuration
 *
 * Each key is a route pattern, and the value is an object with required roles and permissions.
 * - requiredRoles: Array of role names, user must have at least one of these roles
 * - requiredPermissions: Array of permissions in format "resource:action", user must have all of these permissions
 * - requireAllRoles: If true, user must have all specified roles (default: false - user needs at least one)
 */
export type RouteProtectionConfig = Record<string, RouteProtection>;

export const routeProtection: RouteProtectionConfig = {
  // Public routes
  '/': { requiredRoles: [], requiredPermissions: [] },
  '/unauthorized': { requiredRoles: [], requiredPermissions: [] },

  // Auth routes (public)
  '/signin': { requiredRoles: [], requiredPermissions: [], unauthorizedRedirect: '/signin' },
  '/signup': { requiredRoles: [], requiredPermissions: [], unauthorizedRedirect: '/signin' },
  '/verify': { requiredRoles: [], requiredPermissions: [], unauthorizedRedirect: '/signin' },
  '/reset-password': {
    requiredRoles: [],
    requiredPermissions: [],
    unauthorizedRedirect: '/signin',
  },
  '/update-password': {
    requiredRoles: [],
    requiredPermissions: [],
    unauthorizedRedirect: '/signin',
  },
  '/error': { requiredRoles: [], requiredPermissions: [], unauthorizedRedirect: '/signin' },
  '/invite': { requiredRoles: [], requiredPermissions: [], unauthorizedRedirect: '/signin' },

  // Core features (authenticated)
  '/dashboard': {
    requiredRoles: ['user'],
    requiredPermissions: [],
    unauthorizedRedirect: '/signin',
  },
  '/profile': { requiredRoles: ['user'], requiredPermissions: [], unauthorizedRedirect: '/signin' },
  '/teams': { requiredRoles: ['user'], requiredPermissions: [], unauthorizedRedirect: '/signin' },
  '/teams/[id]': {
    requiredRoles: ['user'],
    requiredPermissions: [],
    unauthorizedRedirect: '/signin',
  },
  '/teams/create': {
    requiredRoles: ['user'],
    requiredPermissions: [],
    unauthorizedRedirect: '/signin',
  },
  '/teams/discover': {
    requiredRoles: ['user'],
    requiredPermissions: [],
    unauthorizedRedirect: '/signin',
  },
  '/tokens': { requiredRoles: ['user'], requiredPermissions: [], unauthorizedRedirect: '/signin' },

  // Super features
  '/super/puzzles': {
    requiredRoles: ['super'],
    requiredPermissions: [],
    unauthorizedRedirect: '/unauthorized',
  },
  '/super/puzzles/[id]': {
    requiredRoles: ['super'],
    requiredPermissions: [],
    unauthorizedRedirect: '/unauthorized',
  },
  '/super/puzzles/[id]/contribute': {
    requiredRoles: ['super'],
    requiredPermissions: [],
    unauthorizedRedirect: '/unauthorized',
  },
  '/super/puzzles/today': {
    requiredRoles: ['super'],
    requiredPermissions: [],
    unauthorizedRedirect: '/unauthorized',
  },
  '/super/sacred-geometry': {
    requiredRoles: ['super'],
    requiredPermissions: [],
    unauthorizedRedirect: '/unauthorized',
  },
  '/super/participation': {
    requiredRoles: ['super'],
    requiredPermissions: [],
    unauthorizedRedirect: '/unauthorized',
  },

  // Admin routes
  '/admin': {
    requiredRoles: ['admin'],
    requiredPermissions: [],
    unauthorizedRedirect: '/unauthorized',
  },
  '/admin/analytics': {
    requiredRoles: ['admin'],
    requiredPermissions: [],
    unauthorizedRedirect: '/unauthorized',
  },
  '/admin/users': {
    requiredRoles: ['admin'],
    requiredPermissions: [],
    unauthorizedRedirect: '/unauthorized',
  },
  '/admin/content': {
    requiredRoles: ['admin'],
    requiredPermissions: [],
    unauthorizedRedirect: '/unauthorized',
  },
  '/admin/security': {
    requiredRoles: ['admin'],
    requiredPermissions: [],
    unauthorizedRedirect: '/unauthorized',
  },

  // System routes
  '/api/health': { requiredRoles: [], requiredPermissions: [] },
  '/api/metrics': { requiredRoles: ['admin'], requiredPermissions: [] },
  '/api/feedback': { requiredRoles: ['user'], requiredPermissions: [] },
  '/protected': {
    requiredRoles: ['user'],
    requiredPermissions: [],
    unauthorizedRedirect: '/signin',
  },
  '/subscription': {
    requiredRoles: ['user'],
    requiredPermissions: [],
    unauthorizedRedirect: '/signin',
  },
  '/unauthenticated': { requiredRoles: [], requiredPermissions: [] },

  // API routes
  '/api/teams': { requiredRoles: ['user'], requiredPermissions: [] },
  '/api/tokens': { requiredRoles: ['user'], requiredPermissions: [] },
  '/api/puzzles': { requiredRoles: ['super'], requiredPermissions: [] },
  '/api/auth': { requiredRoles: [], requiredPermissions: [] },
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
  const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+').replace(/\//g, '\\/');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(route);
}

/**
 * Get protection rules for a route
 *
 * @param route - The route to get protection rules for
 * @returns Protection rules for the route, or null if not protected
 */
export function getRouteProtection(route: string): RouteProtection {
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
  return {
    requiredRoles: ['user'],
    requiredPermissions: [],
    unauthorizedRedirect: '/signin',
  };
}
