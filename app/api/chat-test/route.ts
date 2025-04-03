import { StreamingTextResponse } from "ai"
import { rateLimit } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"
import { generateCacheKey, getCachedResponse, setCachedResponse } from "@/lib/cache"
import { withSecurityHeaders } from "@/lib/security-headers"
import { safeValidateChatRequest } from "@/lib/validators/chat"

// Create a logger with context for this route
const routeLogger = logger.withContext({ route: "api/chat-test" })

export async function POST(req: Request) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(req)
  if (!rateLimitResult.success) {
    routeLogger.warn("Rate limit exceeded", { 
      ip: req.headers.get("x-forwarded-for") || "unknown" 
    })
    return withSecurityHeaders(
      new Response(rateLimitResult.message, { 
        status: 429,
        headers: rateLimitResult.headers 
      })
    )
  }

  // Generate cache key
  const cacheKey = generateCacheKey(req)
  
  try {
    // Parse request body
    const body = await req.json()
    
    // Validate request data
    const validation = safeValidateChatRequest(body)
    if (!validation.success) {
      routeLogger.warn("Invalid request data", { 
        errors: validation.error?.errors 
      })
      return withSecurityHeaders(
        new Response(JSON.stringify({ 
          error: "Invalid request", 
          details: validation.error?.errors 
        }), { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...rateLimitResult.headers 
          } 
        })
      )
    }

    const { messages } = validation.data
    
    // Get the last message from the user
    const lastMessage = messages[messages.length - 1]

    // Check for cached response if it's not a long conversation
    // Only cache short conversations to avoid cache poisoning
    if (messages.length < 5) {
      const cachedResponse = getCachedResponse(cacheKey)
      if (cachedResponse) {
        routeLogger.debug("Returning cached response", { cacheKey })
        return withSecurityHeaders(cachedResponse)
      }
    }

    routeLogger.info("Processing chat-test request", { 
      messageCount: messages.length,
      lastMessageContent: lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? '...' : '')
    })

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
        // Cache this response if it's a short conversation
        if (messages.length < 5) {
          const responseToCache = new StreamingTextResponse(
            new ReadableStream({
              start(controller) {
                controller.enqueue(encoder.encode(mockResponse))
                controller.close()
              }
            })
          )
          
          setCachedResponse(cacheKey, withSecurityHeaders(responseToCache))
        }
        
        // Stream the response character by character
        for (const char of mockResponse) {
          controller.enqueue(encoder.encode(char))
          await new Promise((resolve) => setTimeout(resolve, 20))
        }
        controller.close()
      },
    })

    // Create and return the streaming response with security headers
    return withSecurityHeaders(
      new StreamingTextResponse(stream, {
        headers: rateLimitResult.headers
      })
    )
  } catch (error) {
    routeLogger.error("Error in chat-test API", error)
    return withSecurityHeaders(
      new Response(JSON.stringify({ error: "Error processing your request" }), { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...rateLimitResult.headers
        }
      })
    )
  }
}
