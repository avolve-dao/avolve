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
    
    const { data, error } = await supabase.rpc('check_invitation_code', {
      p_code: code.trim().toUpperCase()
    })
    
    if (error) {
      console.error("Error checking invitation code:", error)
      return NextResponse.json(
        { error: "Failed to check invitation code" },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in invitation check API:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
