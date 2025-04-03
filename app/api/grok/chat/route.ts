import { StreamingTextResponse } from "ai"
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

    // Create a text encoder for streaming
    const encoder = new TextEncoder()
    
    // Create a readable stream for the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Process the message with the model
          const response = await model.generateContent({
            prompt: lastMessage.content,
            system: systemPrompt,
          })
          
          // Stream the response text
          const text = response.text || "No response generated"
          for (const char of text) {
            controller.enqueue(encoder.encode(char))
            // Add a small delay for realistic streaming
            await new Promise(resolve => setTimeout(resolve, 10))
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
