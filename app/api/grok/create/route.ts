import { getContextualGrokModel } from "@/lib/grok-context"
import { streamText } from "@/lib/ai-sdk-setup"

export async function POST(req: Request) {
  try {
    const { prompt, userId } = await req.json()

    // Get contextual Grok model
    const { model } = await getContextualGrokModel(userId)

    // Generate content
    const response = await streamText({
      model,
      prompt: `Create engaging social media content based on this request: "${prompt}"
      
      The content should be well-written, engaging, and suitable for sharing on a social platform.
      Focus on creating something that would resonate with the user's audience.
      
      Output just the content itself without any additional explanations or formatting.`,
    })

    // Read the stream content manually
    let text = '';
    const reader = response.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += value;
    }

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
