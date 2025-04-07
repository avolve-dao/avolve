import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    const supabase = createClient()
    
    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }
    
    // Create the invitation
    const { data, error } = await supabase.rpc('create_invitation', {
      p_email: email || null
    })
    
    if (error) {
      console.error("Error creating invitation:", error)
      return NextResponse.json(
        { error: "Failed to create invitation" },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in invitation create API:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
