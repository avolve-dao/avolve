import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

    // Get the request body
    const { action, userId, challengeId, data } = await req.json()

    // Process different challenge actions
    switch (action) {
      case "start":
        await startChallenge(supabaseClient, userId, challengeId)
        break
      case "update_progress":
        await updateChallengeProgress(supabaseClient, userId, challengeId, data.progress)
        break
      case "complete":
        const result = await completeChallenge(supabaseClient, userId, challengeId)
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      case "get_user_challenges":
        const challenges = await getUserChallenges(supabaseClient, userId)
        return new Response(JSON.stringify({ challenges }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      case "get_recommended_challenges":
        const recommended = await getRecommendedChallenges(supabaseClient, userId)
        return new Response(JSON.stringify({ challenges: recommended }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})

async function startChallenge(supabaseClient, userId, challengeId) {
  // Check if user already has this challenge in progress
  const { data: existingChallenge } = await supabaseClient
    .from("user_challenges")
    .select("*")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .single()

  // Get challenge details
  const { data: challenge } = await supabaseClient.from("challenges").select("*").eq("id", challengeId).single()

  if (!challenge) {
    throw new Error("Challenge not found")
  }

  if (existingChallenge) {
    // If challenge is completed and repeatable, reset it
    if (existingChallenge.status === "completed" && challenge.is_repeatable) {
      await supabaseClient
        .from("user_challenges")
        .update({
          status: "in_progress",
          progress: {},
          started_at: new Date().toISOString(),
          completed_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingChallenge.id)
    } else if (existingChallenge.status === "in_progress") {
      // Already in progress, do nothing
      return
    } else if (existingChallenge.status === "completed" && !challenge.is_repeatable) {
      throw new Error("Challenge already completed and is not repeatable")
    }
  } else {
    // Create new user challenge
    await supabaseClient.from("user_challenges").insert({
      user_id: userId,
      challenge_id: challengeId,
      status: "in_progress",
      progress: {},
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }
}

async function updateChallengeProgress(supabaseClient, userId, challengeId, progress) {
  const { data: userChallenge } = await supabaseClient
    .from("user_challenges")
    .select("*")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .single()

  if (!userChallenge) {
    throw new Error("Challenge not found or not started")
  }

  if (userChallenge.status !== "in_progress") {
    throw new Error("Challenge is not in progress")
  }

  // Update progress
  await supabaseClient
    .from("user_challenges")
    .update({
      progress: progress,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userChallenge.id)
}

async function completeChallenge(supabaseClient, userId, challengeId) {
  // Get user challenge
  const { data: userChallenge } = await supabaseClient
    .from("user_challenges")
    .select("*")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .single()

  if (!userChallenge) {
    throw new Error("Challenge not found or not started")
  }

  if (userChallenge.status !== "in_progress") {
    throw new Error("Challenge is not in progress")
  }

  // Get challenge details
  const { data: challenge } = await supabaseClient.from("challenges").select("*").eq("id", challengeId).single()

  if (!challenge) {
    throw new Error("Challenge not found")
  }

  // Update user challenge to completed
  await supabaseClient
    .from("user_challenges")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userChallenge.id)

  // Award tokens if applicable
  if (challenge.token_reward && challenge.token_reward > 0) {
    // Record token transaction
    await supabaseClient.from("token_transactions").insert({
      user_id: userId,
      amount: challenge.token_reward,
      type: "reward",
      description: `Completed challenge: ${challenge.title}`,
      created_at: new Date().toISOString(),
    })

    // Update user token balance
    const { data: profile } = await supabaseClient.from("profiles").select("token_balance").eq("id", userId).single()

    if (profile) {
      await supabaseClient
        .from("profiles")
        .update({
          token_balance: (profile.token_balance || 0) + challenge.token_reward,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
    }

    // Also update value creation if we have that feature
    try {
      await supabaseClient.rpc("increment_user_value", {
        p_user_id: userId,
        p_amount: challenge.token_reward,
      })

      // Record value creation
      await supabaseClient.from("value_creation").insert({
        user_id: userId,
        amount: challenge.token_reward,
        type: "challenge_completion",
        description: `Completed challenge: ${challenge.title}`,
        created_at: new Date().toISOString(),
      })
    } catch (error) {
      // If value creation tables don't exist yet, just ignore
      console.log("Value creation update failed, might not be set up yet:", error)
    }

    return {
      success: true,
      tokens_awarded: challenge.token_reward,
      message: `Challenge completed! You earned ${challenge.token_reward} tokens.`,
    }
  }

  return {
    success: true,
    message: "Challenge completed!",
  }
}

async function getUserChallenges(supabaseClient, userId) {
  const { data: userChallenges, error } = await supabaseClient
    .from("user_challenges")
    .select(`
      *,
      challenge:challenge_id (*)
    `)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) {
    throw error
  }

  return userChallenges
}

async function getRecommendedChallenges(supabaseClient, userId) {
  // Get user's completed challenges
  const { data: userChallenges } = await supabaseClient
    .from("user_challenges")
    .select("challenge_id, status")
    .eq("user_id", userId)

  const completedChallengeIds =
    userChallenges?.filter((uc) => uc.status === "completed" && !uc.is_repeatable).map((uc) => uc.challenge_id) || []

  // Get challenges that the user hasn't completed yet
  const { data: recommendedChallenges } = await supabaseClient
    .from("challenges")
    .select("*")
    .not("id", "in", completedChallengeIds.length > 0 ? `(${completedChallengeIds.join(",")})` : "(0)")
    .order("difficulty", { ascending: true })
    .limit(5)

  return recommendedChallenges || []
}
