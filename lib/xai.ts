import { xai } from "@ai-sdk/xai"

// Available Grok models
export const GROK_MODELS = {
  "grok-2": "Grok 2",
  "grok-1": "Grok 1",
} as const

export type GrokModel = keyof typeof GROK_MODELS

// Default model to use
export const DEFAULT_GROK_MODEL: GrokModel = "grok-2"

// Helper function to get a configured xAI model
export function getGrokModel(modelName: GrokModel = DEFAULT_GROK_MODEL) {
  return xai(modelName)
}

