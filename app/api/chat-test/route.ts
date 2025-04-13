import { StreamingTextResponse } from "@/lib/ai-sdk-setup"
import { rateLimit } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"
import { generateCacheKey, getCachedResponse, setCachedResponse } from "@/lib/cache"
import { applySecurityHeaders } from "@/lib/security-headers"
import { safeValidateChatRequest } from "@/lib/validators/chat"
import { NextRequest, NextResponse } from 'next/server';

const routeLogger = logger.withContext({ route: "api/chat-test" })

export async function POST(req: NextRequest) {
  try {
    const { success } = await rateLimit(req)

    if (!success) {
      const response = new NextResponse("Too many requests", { status: 429 })
      return applySecurityHeaders(response);
    }

    const body = await req.json()
    const validatedBody = safeValidateChatRequest(body)

    if (!validatedBody || !validatedBody.success) {
      routeLogger.warn("Invalid request data", { 
        errors: validatedBody?.error?.errors 
      })
      const response = NextResponse.json(
        { 
          error: "Invalid request data", 
          details: validatedBody?.error?.errors 
        },
        { 
          status: 400 
        }
      );
      return applySecurityHeaders(response);
    }

    if (!validatedBody.data) {
      routeLogger.error("Validation succeeded but data is missing", { body });
      const response = new NextResponse("Internal Server Error: Invalid validation result", { status: 500 });
      return applySecurityHeaders(response);
    }

    const { messages } = validatedBody.data
    
    const cacheKey = generateCacheKey('chat_test_api', { 
    });
    const cachedResponse = await getCachedResponse(cacheKey)
    
    if (cachedResponse) {
      routeLogger.debug("Using cached response for chat request", { cacheKey })
      const response = new NextResponse(cachedResponse, {
        headers: {
          "Content-Type": "text/plain",
          "X-Cache-Hit": "true",
        },
      });
      return applySecurityHeaders(response);
    }

    routeLogger.info("Generating new response for chat request", { 
      messageCount: messages.length,
      lastMessageContent: messages[messages.length - 1].content.substring(0, 50) + 
        (messages[messages.length - 1].content.length > 50 ? '...' : '')
    })
    
    const { stream: responseStream, content: responseContent } = await generateText({ messages })

    if (!responseStream) {
      routeLogger.error("Failed to generate text response stream.");
      const response = new NextResponse("Error generating response", { status: 500 });
      return applySecurityHeaders(response);
    }

    if (responseContent) {
      await setCachedResponse(cacheKey, responseContent)
    }

    const streamingResponse = new StreamingTextResponse(responseStream)

    const dummyResponse = applySecurityHeaders(new NextResponse());
    dummyResponse.headers.forEach((value, key) => {
      streamingResponse.headers.set(key, value);
    });

    return streamingResponse;

  } catch (error) {
    routeLogger.error("Error in chat API:", error)
    const response = new NextResponse("An error occurred", { status: 500 })
    return applySecurityHeaders(response);
  }
}

async function generateText({ messages }: { messages: any[] }): Promise<{ stream: ReadableStream | null; content: string | null }> {
  try {
    const lastMessage = messages[messages.length - 1]
    const mockResponse = `This is a test response to: "${lastMessage.content}". The AI SDK and integration are working correctly!`

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        for (const char of mockResponse) {
          controller.enqueue(encoder.encode(char))
        }
        controller.close()
      },
    })

    return { stream, content: mockResponse }; 

  } catch (error) {
    routeLogger.error("Error generating text:", error)
    return { stream: null, content: null }; 
  }
}
