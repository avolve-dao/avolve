import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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
export async function rbacMiddleware(
  req: NextRequest,
  options: {
    requiredRoles?: string[];
    requiredPermissions?: string[];
    unauthorizedRedirect?: string;
  } = {}
) {
  const {
    requiredRoles = [],
    requiredPermissions = [],
    unauthorizedRedirect = '/unauthorized'
  } = options;

  // If no roles or permissions are required, allow access
  if (requiredRoles.length === 0 && requiredPermissions.length === 0) {
    return NextResponse.next();
  }

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
        },
      },
    }
  );

  // Get session
  const { data: { session } } = await supabase.auth.getSession();

  // If no session, redirect to login
  if (!session) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Get user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url));
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
        p_role_name: role
      });

      if (data) {
        hasRequiredRole = true;
        break;
      }
    }

    if (!hasRequiredRole) {
      // Add required roles to the redirect URL
      const redirectUrl = new URL(unauthorizedRedirect, req.url);
      redirectUrl.searchParams.set('roles', requiredRoles.join(','));
      redirectUrl.searchParams.set('resource', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Check permissions if required
  if (requiredPermissions.length > 0) {
    for (const permission of requiredPermissions) {
      const [resource, action] = permission.split(':');
      
      const { data } = await supabase.rpc('has_permission', {
        p_user_id: user.id,
        p_resource: resource,
        p_action: action
      });

      if (!data) {
        // Add required permissions to the redirect URL
        const redirectUrl = new URL(unauthorizedRedirect, req.url);
        redirectUrl.searchParams.set('permissions', requiredPermissions.join(','));
        redirectUrl.searchParams.set('resource', req.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  // User has all required roles and permissions
  return NextResponse.next();
}
