import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1"

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

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    })
    const openai = new OpenAIApi(configuration)

    // Get the request body
    const { userId, prompt, type } = await req.json()

    // Verify the user has access to AI features
    const { data: userData, error: userError } = await supabaseClient
      .from("profiles")
      .select("has_genie_ai")
      .eq("id", userId)
      .single()

    if (userError || !userData || !userData.has_genie_ai) {
      return new Response(JSON.stringify({ error: "User does not have access to AI features" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Process different AI request types
    let result
    switch (type) {
      case "value_analysis":
        result = await processValueAnalysis(openai, prompt)
        break
      case "regen_guidance":
        result = await processRegenGuidance(openai, prompt)
        break
      case "challenge_suggestion":
        result = await processChallengesuggestion(openai, prompt, userId, supabaseClient)
        break
      default:
        return new Response(JSON.stringify({ error: "Unknown AI request type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
    }

    // Log the AI interaction
    await supabaseClient.from("user_activity").insert({
      user_id: userId,
      activity_type: "ai_interaction",
      metadata: { type, prompt_length: prompt.length },
    })

    return new Response(JSON.stringify({ result }), {
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

async function processValueAnalysis(openai, prompt) {
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant that helps analyze value creation proposals and provides constructive feedback to improve them.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  })

  return response.data.choices[0].message.content
}

async function processRegenGuidance(openai, prompt) {
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant that helps users understand and apply Regen principles in their daily lives and work.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  })

  return response.data.choices[0].message.content
}

async function processChallengesuggestion(openai, prompt, userId, supabaseClient) {
  // Get user's completed challenges
  const { data: completedChallenges } = await supabaseClient
    .from("user_challenges")
    .select("challenge_id")
    .eq("user_id", userId)
    .eq("status", "completed")

  const completedIds = completedChallenges.map((c) => c.challenge_id)

  // Get available challenges
  const { data: availableChallenges } = await supabaseClient
    .from("challenges")
    .select("*")
    .not("id", "in", completedIds.length > 0 ? `(${completedIds.join(",")})` : "(0)") // Handle empty array
    .or("is_repeatable.eq.true")

  // Generate personalized challenge suggestions
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an AI assistant that suggests personalized challenges based on user input and available challenges. Available challenges: ${JSON.stringify(availableChallenges)}`,
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  })

  return {
    suggestion: response.data.choices[0].message.content,
    availableChallenges,
  }
}
