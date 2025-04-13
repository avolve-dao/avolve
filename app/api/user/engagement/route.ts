// app/api/user/engagement/route.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { getCachedData, setCachedData, generateCacheKey } from "@/lib/cache"

/**
 * GET /api/user/engagement
 * Get engagement score for the authenticated user
 */
export async function GET(req: NextRequest) {
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
    const cacheKey = generateCacheKey('api/user/engagement', { userId: user.id });
    
    // Check if data is in cache
    const cachedScore = await getCachedData(cacheKey);
    if (cachedScore !== null) {
      return NextResponse.json({ data: { score: cachedScore } });
    }

    // Call the database function to get engagement score
    const { data: score, error: scoreError } = await supabase
      .rpc('calculate_user_engagement_score', { p_user_id: user.id });

    if (scoreError) {
      console.error('Error fetching engagement score:', scoreError)
      return NextResponse.json(
        { error: "Failed to fetch engagement score" },
        { status: 500 }
      )
    }

    // Store the result in cache with a TTL of 1 hour (3600 seconds)
    await setCachedData(cacheKey, score, 3600);
    
    return NextResponse.json({ data: { score } })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
