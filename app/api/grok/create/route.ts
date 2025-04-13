import { getContextualGrokModel } from "@/lib/grok-context"
import { generateText } from "@/lib/ai-sdk-setup"

export async function POST(req: Request) {
  try {
    const { prompt, userId } = await req.json()

    // Get contextual Grok model
    const { model } = await getContextualGrokModel(userId)

    // Generate content
    const { text } = await generateText({
      model,
      prompt: `Create engaging social media content based on this request: "${prompt}"
      
      The content should be well-written, engaging, and suitable for sharing on a social platform.
      Focus on creating something that would resonate with the user's audience.
      
      Output just the content itself without any additional explanations or formatting.`,
    })

    return new Response(
      JSON.stringify({
        success: true,
        content: text,
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error in create API:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to generate content",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
