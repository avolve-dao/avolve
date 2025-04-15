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
    const { data, error } = await supabase.rpc('accept_invitation', {
      p_code: code.trim().toUpperCase()
    })
    
    if (error) {
      console.error("Error accepting invitation:", error)
      return NextResponse.json(
        { error: "Failed to accept invitation" },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in invitation accept API:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
