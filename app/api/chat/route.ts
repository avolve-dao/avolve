import { StreamingTextResponse } from "ai"
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

    // Create a text encoder for streaming
    const encoder = new TextEncoder()
    
    // Create a readable stream for the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Use the streamGrokResponse function to get the response
          const response = await streamGrokResponse(lastMessage.content, model as GrokModel, systemPrompt)
          
          // If response is already a stream, use it directly
          if (response.textStream) {
            // Forward the stream data
            const reader = response.textStream.getReader()
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              controller.enqueue(value)
            }
          } else {
            // Fallback to text response if no stream is available
            const text = response.text || "No response generated"
            for (const char of text) {
              controller.enqueue(encoder.encode(char))
              // Add a small delay for realistic streaming
              await new Promise(resolve => setTimeout(resolve, 10))
            }
          }
          controller.close()
        } catch (error) {
          console.error("Error generating content:", error)
          controller.enqueue(encoder.encode("Error generating response"))
          controller.close()
        }
      }
    })

    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response("Error processing your request", { status: 500 })
  }
}
