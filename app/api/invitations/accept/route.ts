import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    
    if (!code) {
      return NextResponse.json(
        { error: "Invitation code is required" },
        { status: 400 }
      )
    }
    
    const supabase = createClient()
    
    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }
    
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
