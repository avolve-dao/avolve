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
    const { action, userId, valueCreationId, data } = await req.json()

    // Process different value creation actions
    switch (action) {
      case "create":
        const newValueCreation = await createValueCreation(supabaseClient, userId, data)
        return new Response(JSON.stringify({ valueCreation: newValueCreation }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      case "vote":
        await voteValueCreation(supabaseClient, userId, valueCreationId, data.voteType)
        break
      case "comment":
        await commentValueCreation(supabaseClient, userId, valueCreationId, data.content)
        break
      case "verify":
        await verifyValueCreation(supabaseClient, valueCreationId)
        break
      case "get_leaderboard":
        const leaderboard = await getValueCreationLeaderboard(supabaseClient)
        return new Response(JSON.stringify({ leaderboard }), {
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

async function createValueCreation(supabaseClient, userId, valueCreationData) {
  // Create value creation record
  const { data, error } = await supabaseClient
    .from("value_creation")
    .insert({
      user_id: userId,
      title: valueCreationData.title,
      description: valueCreationData.description,
      value_type: valueCreationData.valueType,
      impact_score: null, // Will be calculated based on votes
      verified: false,
    })
    .select()
    .single()

  if (error) throw error

  // Award tokens for creating value
  await supabaseClient.from("token_transactions").insert({
    user_id: userId,
    amount: 10, // Base reward for creating value
    description: "Created value: " + valueCreationData.title,
    token_type: "GEN",
  })

  // Update user's token balance
  await supabaseClient.rpc("update_user_tokens", {
    p_user_id: userId,
    p_amount: 10,
  })

  // Log activity
  await supabaseClient.from("user_activity").insert({
    user_id: userId,
    activity_type: "value_creation",
    metadata: { title: valueCreationData.title, type: valueCreationData.valueType },
  })

  return data
}

async function voteValueCreation(supabaseClient, userId, valueCreationId, voteType) {
  // Check if user already voted
  const { data: existingVote } = await supabaseClient
    .from("value_creation_votes")
    .select("id, vote_type")
    .eq("value_creation_id", valueCreationId)
    .eq("user_id", userId)
    .single()

  if (existingVote) {
    // Update existing vote if different
    if (existingVote.vote_type !== voteType) {
      await supabaseClient.from("value_creation_votes").update({ vote_type: voteType }).eq("id", existingVote.id)
    }
  } else {
    // Create new vote
    await supabaseClient.from("value_creation_votes").insert({
      value_creation_id: valueCreationId,
      user_id: userId,
      vote_type: voteType,
    })
  }

  // Recalculate impact score
  await recalculateImpactScore(supabaseClient, valueCreationId)
}

async function commentValueCreation(supabaseClient, userId, valueCreationId, content) {
  // Create comment
  await supabaseClient.from("value_creation_comments").insert({
    value_creation_id: valueCreationId,
    user_id: userId,
    content,
  })

  // Get value creation details
  const { data: valueCreation } = await supabaseClient
    .from("value_creation")
    .select("user_id, title")
    .eq("id", valueCreationId)
    .single()

  // Create notification for value creation owner
  if (valueCreation && valueCreation.user_id !== userId) {
    await supabaseClient.from("notifications").insert({
      user_id: valueCreation.user_id,
      actor_id: userId,
      type: "comment",
      message: `Someone commented on your value creation: ${valueCreation.title}`,
      is_read: false,
    })
  }
}

async function verifyValueCreation(supabaseClient, valueCreationId) {
  // Update value creation to verified
  await supabaseClient.from("value_creation").update({ verified: true }).eq("id", valueCreationId)

  // Get value creation details
  const { data: valueCreation } = await supabaseClient
    .from("value_creation")
    .select("user_id, title")
    .eq("id", valueCreationId)
    .single()

  if (valueCreation) {
    // Award bonus tokens for verified value creation
    await supabaseClient.from("token_transactions").insert({
      user_id: valueCreation.user_id,
      amount: 50, // Bonus for verified value
      description: "Value verified: " + valueCreation.title,
      token_type: "GEN",
    })

    // Update user's token balance
    await supabaseClient.rpc("update_user_tokens", {
      p_user_id: valueCreation.user_id,
      p_amount: 50,
    })

    // Create notification
    await supabaseClient.from("notifications").insert({
      user_id: valueCreation.user_id,
      type: "system",
      message: `Your value creation "${valueCreation.title}" has been verified! You earned 50 GEN tokens.`,
      is_read: false,
    })
  }
}

async function recalculateImpactScore(supabaseClient, valueCreationId) {
  // Count upvotes and downvotes
  const { data: votes } = await supabaseClient
    .from("value_creation_votes")
    .select("vote_type")
    .eq("value_creation_id", valueCreationId)

  if (!votes) return

  const upvotes = votes.filter((vote) => vote.vote_type === "upvote").length
  const downvotes = votes.filter((vote) => vote.vote_type === "downvote").length

  // Calculate impact score (simple algorithm)
  const impactScore = upvotes - downvotes

  // Update value creation
  await supabaseClient.from("value_creation").update({ impact_score: impactScore }).eq("id", valueCreationId)
}

async function getValueCreationLeaderboard(supabaseClient) {
  // Get top value creators
  const { data: topCreators } = await supabaseClient.rpc("get_top_value_creators", {
    limit_count: 10,
  })

  // Get top value creations
  const { data: topCreations } = await supabaseClient
    .from("value_creation")
    .select("*, profiles(full_name, avatar_url)")
    .order("impact_score", { ascending: false })
    .limit(10)

  return {
    topCreators: topCreators || [],
    topCreations: topCreations || [],
  }
}
