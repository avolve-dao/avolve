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
    const { userId, exportType } = await req.json()

    // Verify the user exists
    const { data: userData, error: userError } = await supabaseClient
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Process different export types
    let exportData
    switch (exportType) {
      case "profile":
        exportData = await exportProfile(supabaseClient, userId)
        break
      case "activity":
        exportData = await exportActivity(supabaseClient, userId)
        break
      case "value_creation":
        exportData = await exportValueCreation(supabaseClient, userId)
        break
      case "all":
        exportData = await exportAll(supabaseClient, userId)
        break
      default:
        return new Response(JSON.stringify({ error: "Unknown export type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
    }

    // Log the export activity
    await supabaseClient.from("user_activity").insert({
      user_id: userId,
      activity_type: "data_export",
      metadata: { type: exportType },
    })

    return new Response(JSON.stringify({ data: exportData }), {
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

async function exportProfile(supabaseClient, userId) {
  const { data: profile } = await supabaseClient.from("profiles").select("*").eq("id", userId).single()

  const { data: preferences } = await supabaseClient.from("user_preferences").select("*").eq("user_id", userId).single()

  return {
    profile,
    preferences,
  }
}

async function exportActivity(supabaseClient, userId) {
  const { data: activity } = await supabaseClient
    .from("user_activity")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  const { data: challenges } = await supabaseClient
    .from("user_challenges")
    .select("*, challenges(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  const { data: tokens } = await supabaseClient
    .from("token_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return {
    activity,
    challenges,
    tokens,
  }
}

async function exportValueCreation(supabaseClient, userId) {
  const { data: valueCreations } = await supabaseClient
    .from("value_creation")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  const { data: votes } = await supabaseClient
    .from("value_creation_votes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  const { data: comments } = await supabaseClient
    .from("value_creation_comments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return {
    valueCreations,
    votes,
    comments,
  }
}

async function exportAll(supabaseClient, userId) {
  const profile = await exportProfile(supabaseClient, userId)
  const activity = await exportActivity(supabaseClient, userId)
  const valueCreation = await exportValueCreation(supabaseClient, userId)

  return {
    ...profile,
    ...activity,
    ...valueCreation,
  }
}
