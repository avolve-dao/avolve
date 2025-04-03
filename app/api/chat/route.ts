import { StreamingTextResponse } from "ai/server"
import { streamGrokResponse } from "@/app/actions/grok"
import type { GrokModel } from "@/lib/xai"

export async function POST(req: Request) {
  try {
    const { messages, model, systemPrompt } = await req.json()

    // Get the last message from the user
    const lastMessage = messages[messages.length - 1]

    if (!lastMessage || lastMessage.role !== "user") {
      return new Response("Invalid request: No user message found", { status: 400 })
    }

    // Stream the response
    const stream = await streamGrokResponse(lastMessage.content, model as GrokModel, systemPrompt)

    return new StreamingTextResponse(stream.textStream)
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response("Error processing your request", { status: 500 })
  }
}
