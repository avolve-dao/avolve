import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';

// POST /api/admin/onboarding-reminder
// Body: { userId: string, message?: string }
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { userId, message } = await req.json();

  // Auth: Only admins can send reminders
  const {
    data: { user },
    error: authError,
  } = await (supabase as any).auth.getUser(); // TODO: Review type safety
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Check admin role
  const { data: roles } = await (supabase as any)
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);
  if (
    !Array.isArray(roles) ||
    !roles.some(r => r && typeof r === 'object' && 'role' in r && r.role === 'admin')
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Insert notification (reminder)
  // TODO: Restore type safety for user_notifications insert when types are in sync
  const { error: insertError } = await (supabase as any).from('user_notifications').insert([
    {
      user_id: userId as string,
      type: 'onboarding_reminder',
      message: message || 'Friendly reminder: Please complete your onboarding steps.',
      sent_by: user.id as string,
      status: 'sent',
      metadata: {},
    },
  ]);
  if (insertError) {
    return NextResponse.json({ error: 'Failed to log reminder.' }, { status: 500 });
  }

  // (Stub) Integrate with real email/notification system here
  // For now, just return success
  return NextResponse.json({ success: true });
}
