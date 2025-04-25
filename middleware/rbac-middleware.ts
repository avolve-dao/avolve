import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

/**
 * Role-Based Access Control (RBAC) Middleware
 *
 * This middleware checks if the user has the required roles or permissions
 * to access a protected route. If not, it redirects them to the unauthorized page.
 *
 * @param req - The Next.js request object
 * @param options - Configuration options for the middleware
 * @returns NextResponse object
 */
export type RouteProtection = {
  requiredRoles: string[];
  requiredPermissions: string[];
  unauthorizedRedirect?: string;
};

export type Cookie = {
  name: string;
  value: string;
  options?: any;
};

const defaultRouteProtection: RouteProtection = {
  requiredRoles: [],
  requiredPermissions: [],
  unauthorizedRedirect: '/unauthorized',
};

export async function rbacMiddleware(req: NextRequest, options: Partial<RouteProtection> = {}) {
  const {
    requiredRoles = defaultRouteProtection.requiredRoles,
    requiredPermissions = defaultRouteProtection.requiredPermissions,
    unauthorizedRedirect = defaultRouteProtection.unauthorizedRedirect,
  } = options;

  // If no roles or permissions are required, allow access
  if (requiredRoles.length === 0 && requiredPermissions.length === 0) {
    return NextResponse.next();
  }

  // Create Supabase client
  const supabase = createClient(undefined, undefined, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any = {}) {
        const {
          name: cookieName,
          value: cookieValue,
          ...cookieOptions
        } = { name, value, ...options };
        req.cookies.set(cookieName, cookieValue);
      },
      remove(name: string) {
        req.cookies.delete(name);
      },
    },
  });

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session, redirect to login
  if (!session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user is admin (admins have all roles and permissions)
  const isAdmin = user.user_metadata?.is_admin === true;
  if (isAdmin) {
    return NextResponse.next();
  }

  // Check roles if required
  if (requiredRoles.length > 0) {
    let hasRequiredRole = false;

    for (const role of requiredRoles) {
      const { data } = await supabase.rpc('has_role', {
        p_user_id: user.id,
        p_role_name: role,
      });

      if (data) {
        hasRequiredRole = true;
        break;
      }
    }

    if (!hasRequiredRole) {
      // Add required roles to the redirect URL
      const unauthorizedUrl = new URL(unauthorizedRedirect || '/unauthorized', req.url);
      unauthorizedUrl.searchParams.set('roles', requiredRoles.join(','));
      unauthorizedUrl.searchParams.set('resource', req.nextUrl.pathname);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  // Check permissions if required
  if (requiredPermissions.length > 0) {
    for (const permission of requiredPermissions) {
      const [resource, action] = permission.split(':');

      const { data } = await supabase.rpc('has_permission', {
        p_user_id: user.id,
        p_resource: resource,
        p_action: action,
      });

      if (!data) {
        // Add required permissions to the redirect URL
        const unauthorizedUrl = new URL(unauthorizedRedirect || '/unauthorized', req.url);
        unauthorizedUrl.searchParams.set('permissions', requiredPermissions.join(','));
        unauthorizedUrl.searchParams.set('resource', req.nextUrl.pathname);
        return NextResponse.redirect(unauthorizedUrl);
      }
    }
  }

  // User has all required roles and permissions
  return NextResponse.next();
}
