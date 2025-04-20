"use server"

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getCachedData, setCachedData, generateCacheKey } from "@/lib/cache"

/**
 * GET /api/token/balance
 * Get token balances for the authenticated user
 */
export async function GET(req: Request) {
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
    const cacheKey = generateCacheKey('api/token/balance', { userId: user.id });
    
    // Check if data is in cache
    const cachedBalances = await getCachedData(cacheKey);
    if (cachedBalances) {
      return NextResponse.json({ data: cachedBalances });
    }

    // Get token balances from the view
    const { data: balances, error: balanceError } = await supabase
      .from('user_token_summary')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (balanceError) {
      console.error('Error fetching token balances:', balanceError)
      return NextResponse.json(
        { error: "Failed to fetch token balances" },
        { status: 500 }
      )
    }

    // Store the result in cache with a TTL of 5 minutes (300 seconds)
    await setCachedData(cacheKey, balances, 300);
    
    return NextResponse.json({ data: balances })
  } catch (error) {
    console.error(JSON.stringify({
      route: '/api/token/balance',
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }));
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
