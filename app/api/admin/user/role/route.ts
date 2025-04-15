import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { requireAuth } from '@/lib/auth-middleware';
import { logAuditAction } from '@/lib/audit-log';
import { cookies } from 'next/headers';

/**
 * POST /api/admin/user/role
 * Body: { userId: string, newRole: string }
 * Requires: admin or superadmin role
 */
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req, ['admin', 'superadmin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { userId, newRole } = await req.json();
    if (!userId || !newRole) {
      return NextResponse.json({ error: 'Missing userId or newRole' }, { status: 400 });
    }
    const supabase = createRouteHandlerClient({ cookies });
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
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error updating user role:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
