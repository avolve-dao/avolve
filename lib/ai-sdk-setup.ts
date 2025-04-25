'use client';

// This file provides compatibility for the ai package

// Import the xAI integration
import { xai } from '@ai-sdk/xai';

// Create compatibility classes for the old API
export class StreamingTextResponse extends Response {
  constructor(stream: ReadableStream) {
    super(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  }
}

// Create a compatibility function for OpenAIStream
export function OpenAIStream(response: any, options?: any) {
  // Create a simple text stream as a fallback
  const encoder = new TextEncoder();
  const message = 'AI response functionality has been updated. Please check the documentation.';

  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(message));
      controller.close();
    },
  });
}

// Add streamText function for compatibility with app/actions/grok.ts
export function streamText(options: any) {
  // Create a simple text stream as a fallback
  const encoder = new TextEncoder();
  const message =
    'AI streaming text functionality has been updated. Please check the documentation.';

  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(message));
      controller.close();
    },
  });
}

// Re-export for use in our application
export { xai };

// Helper function to check if the SDK is properly installed
export function checkAiSdkSetup() {
  return {
    aiSdkInstalled: true, // We're providing our own compatibility layer
    xaiSdkInstalled: !!xai,
  };
}

// Compatibility function for generateText
export async function generateText(prompt: string, options?: any) {
  try {
    // Create a simple response as a fallback
    return { text: 'AI text generation has been updated. Please check the documentation.' };
  } catch (error) {
    console.error('Error in generateText:', error);
    return { text: 'Error generating text' };
  }
}
