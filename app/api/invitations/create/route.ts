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
      console.error("Error creating invitation:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create invitation" },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    console.error("Error in invitation create API:", err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
