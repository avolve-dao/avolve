import { requireAuth } from '@/lib/auth-middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { email } = await req.json();
    const supabase = createClient();
    // Create the invitation
    const { data, error } = await supabase.rpc('create_invitation', {
      p_email: email || null
    });
    if (error) {
      console.error(JSON.stringify({
        route: '/api/invitations/create',
        supabaseError: error,
        input: { email },
        timestamp: new Date().toISOString(),
      }));
      return NextResponse.json(
        { error: error.message || "Failed to create invitation" },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error(JSON.stringify({
      route: '/api/invitations/create',
      error: err instanceof Error ? err.message : err,
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString(),
    }));
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
