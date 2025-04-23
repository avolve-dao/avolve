import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from '@/lib/auth-middleware';

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { code } = await req.json()
    
    if (!code) {
      return NextResponse.json(
        { error: "Invitation code is required" },
        { status: 400 }
      )
    }
    
    const supabase = createClient()
    
    // Accept the invitation
    const { data, error } = await (supabase as any).rpc('accept_invitation', {
      p_code: code.trim().toUpperCase()
    })
    
    if (error) {
      console.error(JSON.stringify({
        route: '/api/invitations/accept',
        supabaseError: error,
        input: { code },
        timestamp: new Date().toISOString(),
      }));
      return NextResponse.json({ error: error.message || 'Failed to accept invitation' }, { status: 500 });
    }
    
    return NextResponse.json(data)
  } catch (err) {
    console.error(JSON.stringify({
      route: '/api/invitations/accept',
      error: err instanceof Error ? err.message : err,
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString(),
    }));
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
