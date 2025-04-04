// This file ensures the AI SDK packages are properly installed

// Import the core AI SDK
import { generateText, streamText } from "ai"

// Import the xAI integration
import { xai } from "@ai-sdk/xai"

// Re-export for use in our application
export { generateText, streamText, xai }

// Helper function to check if the SDK is properly installed
export function checkAiSdkSetup() {
  return {
    aiSdkInstalled: !!generateText && !!streamText,
    xaiSdkInstalled: !!xai,
  }
}

