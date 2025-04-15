import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase
      .from('token_balances')
      .select(`*, token_type:token_types(*)`)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ balances: data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
