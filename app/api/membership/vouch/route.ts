import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from '@/lib/auth-middleware';

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { userId } = await req.json()
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }
    
    const supabase = createClient()
    
    // Vouch for the user
    const { data, error } = await (supabase as any).rpc('vouch_for_user', {
      p_user_id: userId
    })
    
    if (error) {
      console.error("Error vouching for user:", error)
      return NextResponse.json(
        { error: "Failed to vouch for user" },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in vouch API:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
