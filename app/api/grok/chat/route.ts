import { StreamingTextResponse, streamText } from "@/lib/ai-sdk-setup"
import { getContextualGrokModel } from "@/lib/grok-context"
import { rateLimit } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"
import { generateCacheKey, getCachedResponse } from "@/lib/cache"
import { applySecurityHeaders } from "@/lib/security-headers"
import { safeValidateGrokChatRequest } from "@/lib/validators/chat"
import { NextRequest, NextResponse } from 'next/server';

// Create a logger with context for this route
const routeLogger = logger.withContext({ route: "api/grok/chat" })

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(req)
  if (!rateLimitResult.success) {
    routeLogger.warn("Rate limit exceeded", { 
      ip: req.headers.get("x-forwarded-for") || "unknown" 
    })
    const response = new NextResponse("Rate limit exceeded", { 
      status: 429,
    });
    return applySecurityHeaders(response);
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
      const response = NextResponse.json(
        { 
          error: "Invalid request", 
          details: validation.error?.errors 
        },
        { 
          status: 400 
        }
      );
      return applySecurityHeaders(response);
    }

    if (!validation.data) {
        routeLogger.error("Validation succeeded but data is missing", { body });
        const response = new NextResponse("Internal Server Error: Invalid validation result", { status: 500 });
        return applySecurityHeaders(response);
    }

    const { messages, userId } = validation.data
    
    // Provide default userId if undefined
    const effectiveUserId = userId || 'anonymous_user'; 

    // Check for cached response if it's not a long conversation
    if (messages.length < 5) {
      const cachedResponseData = await getCachedResponse(cacheKey)
      if (cachedResponseData) {
        routeLogger.debug("Returning cached response", { cacheKey })
        const response = new NextResponse(cachedResponseData, {
          headers: { 'Content-Type': 'text/plain', 'X-Cache-Hit': 'true' }
        });
        return applySecurityHeaders(response);
      }
    }

    routeLogger.info("Processing Grok chat request", { 
      messageCount: messages.length,
      userId: effectiveUserId 
    })

    // Get contextual Grok model
    const { model, systemPrompt } = await getContextualGrokModel(effectiveUserId)

    // Use streamText from AI SDK
    const result = await streamText({ 
      model: model, 
      system: systemPrompt, 
      messages: messages // Pass the whole message history
    });

    // Get the stream from the result using the correct method
    const stream = result; // Call directly on result

    // Create the streaming response
    const streamingResponse = new StreamingTextResponse(stream) 

    // Apply security headers by copying from a dummy NextResponse
    const dummyResponse = applySecurityHeaders(new NextResponse());
    dummyResponse.headers.forEach((value, key) => {
      streamingResponse.headers.set(key, value);
    });

    return streamingResponse;

  } catch (error) {
    routeLogger.error("Error in Grok chat API", error)
    const response = NextResponse.json(
      { error: "Error processing your request" },
      { status: 500 }
    );
    return applySecurityHeaders(response);
  }
}
