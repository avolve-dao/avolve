import { StreamingTextResponse } from "@/lib/ai-sdk-setup"
import { rateLimit } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"
import { generateCacheKey, getCachedResponse, setCachedResponse } from "@/lib/cache"
import { withSecurityHeaders } from "@/lib/security-headers"
import { safeValidateChatRequest } from "@/lib/validators/chat"

const routeLogger = logger.withContext({ route: "api/chat-test" })

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1"
    const { success } = await rateLimit(ip)

    if (!success) {
      return new Response("Too many requests", { status: 429 })
    }

    const body = await req.json()
    const validatedBody = safeValidateChatRequest(body)

    if (!validatedBody || !validatedBody.success) {
      routeLogger.warn("Invalid request data", { 
        errors: validatedBody?.error?.errors 
      })
      return withSecurityHeaders(
        new Response(JSON.stringify({ 
          error: "Invalid request data", 
          details: validatedBody?.error?.errors 
        }), { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json"
          } 
        })
      )
    }

    // At this point we know validatedBody.data exists and is valid
    const { messages } = validatedBody.data
    
    // Check if we have a cached response
    const cacheKey = generateCacheKey(validatedBody.data)
    const cachedResponse = await getCachedResponse(cacheKey)
    
    if (cachedResponse) {
      routeLogger.debug("Using cached response for chat request", { cacheKey })
      return withSecurityHeaders(new Response(cachedResponse, {
        headers: {
          "Content-Type": "text/plain",
          "X-Cache-Hit": "true",
        },
      }))
    }

    // No cache hit, proceed with generating a response
    routeLogger.info("Generating new response for chat request", { 
      messageCount: messages.length,
      lastMessageContent: messages[messages.length - 1].content.substring(0, 50) + 
        (messages[messages.length - 1].content.length > 50 ? '...' : '')
    })
    
    // Generate a response
    const response = await generateText({ messages })

    // Cache the response for future requests
    if (response) {
      await setCachedResponse(cacheKey, response)
    }

    // Return the response
    return withSecurityHeaders(new StreamingTextResponse(response))
  } catch (error) {
    routeLogger.error("Error in chat API:", error)
    return withSecurityHeaders(new Response("An error occurred", { status: 500 }))
  }
}

// Helper function to generate text
async function generateText({ messages }: { messages: any[] }) {
  try {
    // Implementation would normally call an LLM API
    // This is a simplified version for the compatibility layer
    const lastMessage = messages[messages.length - 1]
    const mockResponse = `This is a test response to: "${lastMessage.content}". The AI SDK and integration are working correctly!`

    // For testing, we'll create a simple readable stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // Stream the response character by character
        for (const char of mockResponse) {
          controller.enqueue(encoder.encode(char))
        }
        controller.close()
      },
    })

    return stream
  } catch (error) {
    routeLogger.error("Error generating text:", error)
    throw error
  }
}
