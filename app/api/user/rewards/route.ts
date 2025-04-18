// app/api/user/rewards/route.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getCachedData, setCachedData, generateCacheKey } from "@/lib/cache"

/**
 * GET /api/user/rewards
 * Get potential rewards for the authenticated user
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
    const cacheKey = generateCacheKey('api/user/rewards', { userId: user.id });
    
    // Check if data is in cache
    const cachedRewards = await getCachedData(cacheKey);
    if (cachedRewards) {
      return NextResponse.json({ data: cachedRewards });
    }

    // Call the database function to get potential rewards
    const { data: rewards, error: rewardsError } = await supabase
      .rpc('calculate_user_rewards', { p_user_id: user.id });

    if (rewardsError) {
      console.error('Error fetching rewards:', rewardsError)
      return NextResponse.json(
        { error: "Failed to fetch rewards" },
        { status: 500 }
      )
    }

    // Store the result in cache with a TTL of 1 hour (3600 seconds)
    await setCachedData(cacheKey, rewards, 3600);
    
    return NextResponse.json({ data: rewards })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
