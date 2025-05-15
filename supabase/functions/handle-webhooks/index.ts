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
    const body = await req.json()

    // Verify the webhook signature (implement your own verification logic)
    const signature = req.headers.get("x-signature")
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Process different webhook types
    switch (body.type) {
      case "user.created":
        // Handle user creation event
        await handleUserCreated(supabaseClient, body.data)
        break
      case "challenge.completed":
        // Handle challenge completion event
        await handleChallengeCompleted(supabaseClient, body.data)
        break
      case "value.created":
        // Handle value creation event
        await handleValueCreated(supabaseClient, body.data)
        break
      default:
        return new Response(JSON.stringify({ error: "Unknown webhook type" }), {
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

async function handleUserCreated(supabaseClient, userData) {
  // Send welcome email, create initial profile data, etc.
  await supabaseClient.from("user_activity").insert({
    user_id: userData.id,
    activity_type: "account_created",
    metadata: { email: userData.email },
  })
}

async function handleChallengeCompleted(supabaseClient, challengeData) {
  // Award tokens, update user stats, etc.
  await supabaseClient.from("token_transactions").insert({
    user_id: challengeData.user_id,
    amount: challengeData.token_reward,
    description: `Completed challenge: ${challengeData.title}`,
    token_type: "GEN",
  })
}

async function handleValueCreated(supabaseClient, valueData) {
  // Process value creation, notify relevant users, etc.
  await supabaseClient.from("notifications").insert({
    user_id: valueData.user_id,
    type: "system",
    message: "Your value creation has been received and is being reviewed",
    is_read: false,
  })
}
