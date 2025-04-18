"use server"

import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/token/permissions
 * Get token-based permissions for the authenticated user
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get token-based permissions
    const { data: permissions, error: permError } = await supabase
      .rpc('get_user_permissions_with_tokens', {
        p_user_id: user.id
      })

    if (permError) {
      console.error('Error fetching permissions:', permError)
      return NextResponse.json(
        { error: "Failed to fetch permissions" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: permissions })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/token/permissions
 * Check if user has a specific token-based permission
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { tokenCode, action } = body

    if (!tokenCode || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check permission for specific token and action
    const { data: hasPermission, error: permError } = await supabase
      .rpc('has_permission_via_token_type', {
        p_user_id: user.id,
        p_token_code: tokenCode,
        p_action: action
      })

    if (permError) {
      console.error('Error checking permission:', permError)
      return NextResponse.json(
        { error: "Failed to check permission" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { hasPermission } })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
