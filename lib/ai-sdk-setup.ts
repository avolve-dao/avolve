// This file ensures the AI SDK packages are properly installed

// Import the core AI SDK
import { StreamingTextResponse, OpenAIStream } from "ai"

// Import the xAI integration
import { xai } from "@ai-sdk/xai"

// Re-export for use in our application
export { StreamingTextResponse, OpenAIStream, xai }

// Helper function to check if the SDK is properly installed
export function checkAiSdkSetup() {
  return {
    aiSdkInstalled: !!StreamingTextResponse && !!OpenAIStream,
    xaiSdkInstalled: !!xai,
  }
}

// Compatibility functions to replace missing generateText and streamText
export async function generateText(prompt: string, options?: any) {
  console.warn('generateText is deprecated, use OpenAI client directly');
  return { text: "AI SDK function not available in this version" };
}

export async function streamText(prompt: string, options?: any) {
  console.warn('streamText is deprecated, use OpenAI client directly');
  return new ReadableStream();
}
