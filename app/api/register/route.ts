// Route handler for /api/register
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, inviteCode } = body;
    if (!email || !password || !inviteCode) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    // 1. Validate invitation code
    const { data: invites, error: inviteError } = await supabase
      .from('invitations')
      .select('*')
      .eq('invite_code', inviteCode)
      .eq('used', false)
      .limit(1);
    if (inviteError) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    if (!invites || invites.length === 0) {
      return NextResponse.json({ error: 'Invalid or already used invitation code.' }, { status: 403 });
    }
    // 2. Register user
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }
    // 3. Mark invitation as used
    await supabase
      .from('invitations')
      .update({ used: true })
      .eq('invite_code', inviteCode);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
