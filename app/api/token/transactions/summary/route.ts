// app/api/token/transactions/summary/route.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getCachedData, setCachedData, generateCacheKey } from "@/lib/cache"

/**
 * GET /api/token/transactions/summary
 * Get a summary of token transactions for the authenticated user
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
    const cacheKey = generateCacheKey('api/token/transactions/summary', { userId: user.id });
    
    // Check if data is in cache
    const cachedSummary = await getCachedData(cacheKey);
    if (cachedSummary) {
      return NextResponse.json({ data: cachedSummary });
    }

    // Call the database function to get transaction summary
    const { data: summary, error: summaryError } = await supabase
      .rpc('summarize_user_transactions', { p_user_id: user.id });

    if (summaryError) {
      console.error('Error fetching transaction summary:', summaryError)
      return NextResponse.json(
        { error: "Failed to fetch transaction summary" },
        { status: 500 }
      )
    }

    // Store the result in cache with a TTL of 10 minutes (600 seconds)
    await setCachedData(cacheKey, summary, 600);
    
    return NextResponse.json({ data: summary })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
