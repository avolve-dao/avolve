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
    const { action, userId, data } = await req.json()

    // Process different analytics actions
    switch (action) {
      case "track_event":
        await trackEvent(supabaseClient, userId, data)
        break
      case "get_user_stats":
        const stats = await getUserStats(supabaseClient, userId)
        return new Response(JSON.stringify({ stats }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      case "get_platform_stats":
        const platformStats = await getPlatformStats(supabaseClient)
        return new Response(JSON.stringify({ stats: platformStats }), {
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

async function trackEvent(supabaseClient, userId, eventData) {
  // Log user activity
  await supabaseClient.from("user_activity").insert({
    user_id: userId,
    activity_type: eventData.eventType,
    metadata: eventData.metadata || {},
  })
}

async function getUserStats(supabaseClient, userId) {
  // Get user stats using stored procedure
  const { data } = await supabaseClient.rpc("get_user_stats", {
    p_user_id: userId,
  })

  // Get user progress
  const { data: progressData } = await supabaseClient.rpc("get_user_progress", {
    p_user_id: userId,
  })

  // Get recent activity
  const { data: recentActivity } = await supabaseClient
    .from("user_activity")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10)

  return {
    stats: data[0],
    progress: progressData[0],
    recentActivity,
  }
}

async function getPlatformStats(supabaseClient) {
  // Get total users
  const { count: totalUsers } = await supabaseClient.from("profiles").select("*", { count: "exact", head: true })

  // Get total value creations
  const { count: totalValueCreations } = await supabaseClient
    .from("value_creation")
    .select("*", { count: "exact", head: true })

  // Get total challenges completed
  const { count: totalChallengesCompleted } = await supabaseClient
    .from("user_challenges")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed")

  // Get total tokens in circulation
  const { data: tokenData } = await supabaseClient.rpc("get_total_tokens")

  // Get recent activity
  const { data: recentActivity } = await supabaseClient.rpc("get_recent_activity", {
    p_limit: 10,
  })

  return {
    totalUsers,
    totalValueCreations,
    totalChallengesCompleted,
    totalTokens: tokenData[0].total_tokens,
    recentActivity,
  }
}
