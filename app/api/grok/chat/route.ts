import { StreamingTextResponse } from "@/lib/ai-sdk-setup"
import { getContextualGrokModel } from "@/lib/grok-context"
import { rateLimit } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"
import { generateCacheKey, getCachedResponse, setCachedResponse } from "@/lib/cache"
import { withSecurityHeaders } from "@/lib/security-headers"
import { safeValidateGrokChatRequest } from "@/lib/validators/chat"

// Create a logger with context for this route
const routeLogger = logger.withContext({ route: "api/grok/chat" })

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
    const validation = safeValidateGrokChatRequest(body)
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

    const { messages, userId } = validation.data
    
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

    routeLogger.info("Processing Grok chat request", { 
      messageCount: messages.length,
      userId: userId || "anonymous" 
    })

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
          
          // Get the response text
          const text = response.text || "No response generated"
          
          // Cache this response if it's a short conversation
          if (messages.length < 5) {
            const responseToCache = new StreamingTextResponse(
              new ReadableStream({
                start(controller) {
                  controller.enqueue(encoder.encode(text))
                  controller.close()
                }
              })
            )
            
            setCachedResponse(cacheKey, withSecurityHeaders(responseToCache))
          }
          
          // Stream the response character by character
          for (const char of text) {
            controller.enqueue(encoder.encode(char))
            // Add a small delay for realistic streaming
            await new Promise(resolve => setTimeout(resolve, 10))
          }
          
          controller.close()
        } catch (error) {
          routeLogger.error("Error generating content", error)
          controller.enqueue(encoder.encode("Error generating response"))
          controller.close()
        }
      }
    })

    // Create and return the streaming response with security headers
    return withSecurityHeaders(
      new StreamingTextResponse(stream, {
        headers: rateLimitResult.headers
      })
    )
  } catch (error) {
    routeLogger.error("Error in Grok chat API", error)
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
