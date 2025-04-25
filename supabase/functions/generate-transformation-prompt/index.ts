import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { OpenAI } from 'https://deno.land/x/openai@1.4.2/mod.ts';

const openai = new OpenAI(Deno.env.get('OPENAI_API_KEY')!);

const PROMPT_TEMPLATES = {
  superachiever: [
    'Share a recent win in your personal or business growth journey',
    "What's a challenge you've overcome this week?",
    'How are you applying your Supermind skills in daily life?',
    'Describe a moment where you pushed past your comfort zone',
    "What's a valuable lesson you've learned in your transformation journey?",
  ],
  supercivilization: [
    'How are you contributing to building a better future?',
    'Share an insight about community and collaboration',
    "What's a regenerative practice you've adopted?",
    'How are you helping others in their transformation journey?',
    "Describe a positive impact you've made in your community",
  ],
};

serve(async req => {
  try {
    const { journeyType } = await req.json();

    if (!journeyType || !PROMPT_TEMPLATES[journeyType as keyof typeof PROMPT_TEMPLATES]) {
      return new Response(JSON.stringify({ error: 'Invalid journey type' }), { status: 400 });
    }

    const basePrompt =
      PROMPT_TEMPLATES[journeyType as keyof typeof PROMPT_TEMPLATES][
        Math.floor(
          Math.random() * PROMPT_TEMPLATES[journeyType as keyof typeof PROMPT_TEMPLATES].length
        )
      ];

    const completion = await openai.createChatCompletion({
      model: 'gpt-4-0125-preview',
      messages: [
        {
          role: 'system',
          content: `You are an AI coach helping users share their transformation journey on the Avolve platform. Generate an engaging, personalized prompt based on the given template. Focus on growth, achievement, and community impact.`,
        },
        {
          role: 'user',
          content: `Create a personalized version of this prompt template: "${basePrompt}". Make it specific and engaging, encouraging authentic sharing.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const prompt = completion.choices[0]?.message?.content || basePrompt;

    return new Response(JSON.stringify({ prompt }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
