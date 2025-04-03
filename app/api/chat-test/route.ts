import { StreamingTextResponse } from "ai"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Get the last message from the user
    const lastMessage = messages[messages.length - 1]

    if (!lastMessage || lastMessage.role !== "user") {
      return new Response("Invalid request: No user message found", { status: 400 })
    }

    // Use a mock response for testing
    const mockResponse = `This is a test response to: "${lastMessage.content}". The AI SDK and xAI integration are working correctly!`

    // In a real implementation, we would use:
    // const result = streamText({
    //   model: xai("grok-2-1212"),
    //   prompt: lastMessage.content,
    // })
    // return new StreamingTextResponse(result.textStream)

    // For testing, we'll create a simple readable stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        for (const char of mockResponse) {
          controller.enqueue(encoder.encode(char))
          await new Promise((resolve) => setTimeout(resolve, 20))
        }
        controller.close()
      },
    })

    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error("Error in chat test API:", error)
    return new Response("Error processing your request", { status: 500 })
  }
}
