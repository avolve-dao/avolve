import { StreamingTextResponse } from "ai"
import { streamGrokResponse } from "@/app/actions/grok"
import type { GrokModel } from "@/lib/xai"
import { rateLimit } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"
import { generateCacheKey, getCachedResponse, setCachedResponse } from "@/lib/cache"
import { withSecurityHeaders } from "@/lib/security-headers"
import { safeValidateChatRequest } from "@/lib/validators/chat"

// Create a logger with context for this route
const routeLogger = logger.withContext({ route: "api/chat" })

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

    const { messages, model, systemPrompt } = validation.data
    
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

    routeLogger.info("Processing chat request", { 
      messageCount: messages.length,
      model: model || "default" 
    })

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
            
            // Buffer for collecting the full response for caching
            let fullResponseText = ""
            
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              
              // Add to the full response text if we're going to cache it
              if (messages.length < 5) {
                const chunk = new TextDecoder().decode(value)
                fullResponseText += chunk
              }
              
              controller.enqueue(value)
            }
            
            // Cache the full response if it's a short conversation
            if (messages.length < 5 && fullResponseText) {
              // Create a new response for caching
              const responseToCache = new StreamingTextResponse(
                new ReadableStream({
                  start(controller) {
                    controller.enqueue(encoder.encode(fullResponseText))
                    controller.close()
                  }
                })
              )
              
              setCachedResponse(cacheKey, withSecurityHeaders(responseToCache))
            }
          } else {
            // Fallback to text response if no stream is available
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
            
            for (const char of text) {
              controller.enqueue(encoder.encode(char))
              // Add a small delay for realistic streaming
              await new Promise(resolve => setTimeout(resolve, 10))
            }
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
    routeLogger.error("Error in chat API", error)
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
