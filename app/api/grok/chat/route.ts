import { StreamingTextResponse, streamText } from "ai"
import { getContextualGrokModel } from "@/lib/grok-context"

export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json()

    // Get the last message from the user
    const lastMessage = messages[messages.length - 1]

    if (!lastMessage || lastMessage.role !== "user") {
      return new Response("Invalid request: No user message found", { status: 400 })
    }

    // Get contextual Grok model
    const { model, systemPrompt } = await getContextualGrokModel(userId)

    // Stream the response
    const result = streamText({
      model,
      prompt: lastMessage.content,
      system: systemPrompt,
    })

    return new StreamingTextResponse(result.textStream)
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response("Error processing your request", { status: 500 })
  }
}
