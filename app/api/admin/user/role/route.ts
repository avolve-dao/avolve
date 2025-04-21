import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { requireAuth } from '@/lib/auth-middleware';
import { logAuditAction } from '@/lib/audit-log';
import { cookies } from 'next/headers';

/**
 * POST /api/admin/user/role
 * Body: { userId: string, newRole: string }
 * Requires: admin or superadmin role
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ['admin', 'superadmin']);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { userId, newRole } = await req.json();
    if (!userId || !newRole) {
      return NextResponse.json({ error: 'Missing userId or newRole' }, { status: 400 });
    }
    const cookieStore = cookies();
    const supabase = createClient(undefined, undefined, { cookies: cookieStore });
    // Update user role
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);
    if (error) {
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }
    // Audit log
    await logAuditAction(user.id, 'role_change', userId, { newRole });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(JSON.stringify({
      route: '/api/admin/user/role',
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }));
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
