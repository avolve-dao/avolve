// app/api/user/profile/route.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getCachedData, setCachedData, generateCacheKey } from "@/lib/cache"

/**
 * GET /api/user/profile
 * Get profile information for the authenticated user
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

    // Generate a cache key based on the user ID
    const cacheKey = generateCacheKey('api/user/profile', { userId: user.id });
    
    // Check if data is in cache
    const cachedProfile = await getCachedData(cacheKey);
    if (cachedProfile) {
      return NextResponse.json({ data: cachedProfile });
    }

    // Get profile data from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      )
    }

    // Store the result in cache with a TTL of 10 minutes (600 seconds)
    await setCachedData(cacheKey, profile, 600);
    
    return NextResponse.json({ data: profile })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
