"use server"

import { generateText, streamText } from "@/lib/ai-sdk-setup"
import { getGrokModel, type GrokModel } from "@/lib/xai"

export async function generateGrokResponse(prompt: string, model: GrokModel, systemPrompt?: string) {
  try {
    const grokModel = getGrokModel(model)

    const response = await generateText({
      model: grokModel,
      prompt,
      system: systemPrompt,
    })

    return {
      success: true,
      text: response.text,
    }
  } catch (error) {
    console.error("Error generating response:", error)
    return {
      success: false,
      error: "Failed to generate response",
    }
  }
}

export async function streamGrokResponse(prompt: string, model: GrokModel, systemPrompt?: string) {
  try {
    const grokModel = getGrokModel(model)

    const response = streamText({
      model: grokModel,
      prompt,
      system: systemPrompt,
    })

    return response
  } catch (error) {
    console.error("Error streaming response:", error)
    throw error
  }
}
