import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

/**
 * Authentication middleware for API routes
 * 
 * This middleware verifies that the user is authenticated before allowing access to protected API routes.
 * It also adds the user's ID to the request headers for use in the API route handler.
 */
export async function authMiddleware(req: NextRequest) {
  try {
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    // If there's no session, return a 401 Unauthorized response
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Clone the request headers
    const requestHeaders = new Headers(req.headers);
    
    // Add the user's ID to the request headers
    requestHeaders.set('x-user-id', session.user.id);
    
    // Add the user's role to the request headers
    const userRole = session.user.app_metadata?.role || 'user';
    requestHeaders.set('x-user-role', userRole);
    
    // Create a new request with the modified headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    // Add cache control headers to prevent caching of authenticated responses
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

/**
 * Verifies that the user has the required role
 * 
 * @param req The Next.js request object
 * @param requiredRoles The roles that are allowed to access the resource
 * @returns A NextResponse if the user doesn't have the required role, undefined otherwise
 */
export function verifyRole(req: NextRequest, requiredRoles: string[]) {
  const userRole = req.headers.get('x-user-role');
  
  if (!userRole || !requiredRoles.includes(userRole)) {
    return NextResponse.json(
      { error: 'Forbidden: Insufficient permissions' },
      { status: 403 }
    );
  }
  
  return undefined;
}

/**
 * Gets the user ID from the request headers
 * 
 * @param req The Next.js request object
 * @returns The user ID or null if not found
 */
export function getUserId(req: NextRequest): string | null {
  return req.headers.get('x-user-id');
}

/**
 * Gets the user role from the request headers
 * 
 * @param req The Next.js request object
 * @returns The user role or null if not found
 */
export function getUserRole(req: NextRequest): string | null {
  return req.headers.get('x-user-role');
}
