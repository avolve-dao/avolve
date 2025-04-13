import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GeneratePromptBody {
  theme: 'superachiever' | 'superachievers' | 'supercivilization'
}

const themePrompts = {
  superachiever: [
    "Share a personal breakthrough that demonstrates your growth mindset",
    "What daily practice has been most transformative for you?",
    "How are you turning challenges into opportunities?",
    "What's one limiting belief you've overcome?",
    "Share a tool or technique that's accelerating your growth"
  ],
  superachievers: [
    "How are you contributing to collective growth?",
    "Share a collaboration that led to unexpected insights",
    "What community practice has been most impactful?",
    "How are you helping others level up?",
    "Share a group achievement that inspired you"
  ],
  supercivilization: [
    "How are you contributing to regenerative systems?",
    "Share an initiative that's creating positive impact",
    "What ecosystem improvement have you observed?",
    "How are you helping build a better future?",
    "Share a breakthrough in collective consciousness"
  ]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { theme } = await req.json() as GeneratePromptBody

    // Get auth token from request header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get user's journey data
    const { data: journeyData, error: journeyError } = await supabaseClient
      .from('journey_posts')
      .select('content, engagement_score, regen_score')
      .eq('journey_type', theme)
      .order('created_at', { ascending: false })
      .limit(5)

    if (journeyError) throw journeyError

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(configuration)

    // Generate personalized prompt
    const completion = await openai.createChatCompletion({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an AI mentor helping users on their transformation journey. 
          Theme: ${theme}
          Recent posts: ${JSON.stringify(journeyData)}
          Base prompts: ${JSON.stringify(themePrompts[theme])}
          
          Generate a personalized prompt that:
          1. Builds on their recent posts and engagement
          2. Encourages deeper reflection and sharing
          3. Aligns with the theme's focus
          4. Maintains an inspiring and supportive tone
          5. Keeps the response under 150 characters`
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    })

    const generatedPrompt = completion.data.choices[0]?.message?.content || 
      themePrompts[theme][Math.floor(Math.random() * themePrompts[theme].length)]

    return new Response(
      JSON.stringify({ prompt: generatedPrompt }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
