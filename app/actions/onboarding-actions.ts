"use server"

import { createClient } from "@/lib/supabase/server"
import { sendTransformationEmail } from "@/lib/email-service"

export async function completeOnboardingStep(userId: string, step: number) {
  const supabase = createClient()

  try {
    let updateData = {}
    let emailType: "welcome" | "genius-id" | "gen-tokens" | "genie-ai" | "complete" = "welcome"

    switch (step) {
      case 1:
        updateData = { has_agreed_to_terms: true }
        emailType = "genius-id" // Send email about next step
        break
      case 2:
        updateData = { has_genius_id: true }
        emailType = "gen-tokens"
        break
      case 3:
        updateData = { has_gen_tokens: true }
        emailType = "genie-ai"
        break
      case 4:
        updateData = { has_genie_ai: true }
        emailType = "complete"
        break
      default:
        throw new Error(`Invalid step: ${step}`)
    }

    // Update the user's profile
    const { error } = await supabase.from("profiles").update(updateData).eq("id", userId)

    if (error) throw error

    // Send email notification
    await sendTransformationEmail(userId, emailType)

    // Log the completion
    await supabase.from("user_activity").insert({
      user_id: userId,
      activity_type: `completed_step_${step}`,
      created_at: new Date().toISOString(),
    })

    return { success: true }
  } catch (error) {
    console.error(`Error completing onboarding step ${step}:`, error)
    return { success: false, error }
  }
}

export async function resetOnboardingProgress(userId: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        has_agreed_to_terms: false,
        has_genius_id: false,
        has_gen_tokens: false,
        has_genie_ai: false,
      })
      .eq("id", userId)

    if (error) throw error

    // Log the reset
    await supabase.from("user_activity").insert({
      user_id: userId,
      activity_type: "reset_onboarding",
      created_at: new Date().toISOString(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error resetting onboarding progress:", error)
    return { success: false, error }
  }
}

export async function updateUserPreferences(
  userId: string,
  preferences: {
    primaryGoal?: string
    interests?: string[]
    communicationFrequency?: string
    theme?: string
  },
) {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("user_preferences").upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error updating user preferences:", error)
    return { success: false, error }
  }
}
