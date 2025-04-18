"use server"

import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { getCachedData, setCachedData, generateCacheKey } from "@/lib/cache"

/**
 * POST /api/token/stake
 * Stake tokens using a specific staking rule
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await NextRequest.json()
    const { tokenTypeId, stakingRuleId, amount } = body

    if (!tokenTypeId || !stakingRuleId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Stake tokens using the database function
    const { data: stakeResult, error: stakeError } = await supabase
      .rpc('stake_tokens', {
        p_user_id: user.id,
        p_token_type_id: tokenTypeId,
        p_staking_rule_id: stakingRuleId,
        p_amount: amount
      })

    if (stakeError) {
      console.error('Error staking tokens:', stakeError)
      return NextResponse.json(
        { error: stakeError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: stakeResult })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/token/stake
 * Get staking information for the authenticated user
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
    const cacheKey = generateCacheKey('api/token/stake', { userId: user.id });
    
    // Check if data is in cache
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return NextResponse.json({ data: cachedData });
    }

    // Get user's active stakes
    const { data: stakes, error: stakesError } = await supabase
      .from('user_stakes')
      .select(`
        id,
        amount,
        locked_until,
        token_types (
          id,
          name,
          symbol
        )
      `)
      .eq('user_id', user.id)
      .gt('locked_until', new Date().toISOString())

    if (stakesError) {
      console.error('Error fetching stakes:', stakesError)
      return NextResponse.json(
        { error: "Failed to fetch stakes" },
        { status: 500 }
      )
    }

    // Get available staking rules
    const { data: availableRules, error: rulesError } = await supabase
      .from('token_staking_rules')
      .select(`
        id,
        token_type_id,
        token_types (
          name,
          symbol
        ),
        lock_period_days,
        apy_percentage,
        voting_weight_multiplier,
        focus_areas,
        bonus_features
      `)
      .eq('active', true)

    if (rulesError) {
      console.error('Error fetching staking rules:', rulesError)
      return NextResponse.json(
        { error: "Failed to fetch staking rules" },
        { status: 500 }
      )
    }

    const responseData = {
      stakes,
      availableRules
    };

    // Store the result in cache with a TTL of 5 minutes (300 seconds)
    await setCachedData(cacheKey, responseData, 300);

    return NextResponse.json({
      data: responseData
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/token/stake
 * Unstake tokens from an active stake
 */
export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await NextRequest.json()
    const { stakeId } = body

    if (!stakeId) {
      return NextResponse.json(
        { error: "Missing stake ID" },
        { status: 400 }
      )
    }

    // Unstake tokens using the database function
    const { data: unstakeResult, error: unstakeError } = await supabase
      .rpc('unstake_tokens', {
        p_user_id: user.id,
        p_stake_id: stakeId
      })

    if (unstakeError) {
      console.error('Error unstaking tokens:', unstakeError)
      return NextResponse.json(
        { error: unstakeError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: unstakeResult })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
