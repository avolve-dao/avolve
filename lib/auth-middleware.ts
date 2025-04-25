import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Middleware to require authentication and (optionally) specific roles for API/admin routes.
 * Usage: Call requireAuth(req, ['admin', 'moderator']) at the top of your handler.
 */
export async function requireAuth(req: NextRequest, requiredRoles?: string | string[]) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (requiredRoles) {
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();
    if (roleError || !userRole || !rolesArray.includes(userRole.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }
  // Authenticated and authorized
  return { session, user: session.user };
}

/**
 * Example usage in an API route:
 *
 * import { requireAuth } from '@/lib/auth-middleware';
 *
 * export async function POST(req: NextRequest) {
 *   const authResult = await requireAuth(req, ['admin', 'moderator']);
 *   if (authResult instanceof NextResponse) return authResult;
 *   // ...rest of your handler
 * }
 */
