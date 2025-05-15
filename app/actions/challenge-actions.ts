"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { serverAction } from "@/lib/server-action"
import { z } from "zod"
import { TOKEN_TYPES, ROUTES } from "@/constants"

// Define validation schemas
const challengeIdSchema = z.object({
  challengeId: z.string().uuid(),
})

// Define the raw action functions
async function startChallengeRaw(data: z.infer<typeof challengeIdSchema>) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error("User not authenticated")

  // Get challenge details
  const { data: challenge, error: challengeError } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", data.challengeId)
    .single()

  if (challengeError || !challenge) {
    throw new Error("Challenge not found")
  }

  // Check if user already has this challenge in progress
  const { data: existingChallenge, error: existingError } = await supabase
    .from("user_challenges")
    .select("*")
    .eq("user_id", user.id)
    .eq("challenge_id", data.challengeId)
    .single()

  if (existingChallenge) {
    // If challenge is completed and repeatable, reset it
    if (existingChallenge.status === "completed" && challenge.is_repeatable) {
      const { error: updateError } = await supabase
        .from("user_challenges")
        .update({
          status: "in_progress",
          progress: {},
          started_at: new Date().toISOString(),
          completed_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingChallenge.id)

      if (updateError) throw updateError

      revalidatePath(ROUTES.DASHBOARD)
      return { message: "Challenge restarted successfully!" }
    } else if (existingChallenge.status === "in_progress") {
      return { message: "Challenge already in progress" }
    } else if (existingChallenge.status === "completed" && !challenge.is_repeatable) {
      throw new Error("Challenge already completed and is not repeatable")
    }
  }

  // Create new user challenge
  const { error: insertError } = await supabase.from("user_challenges").insert([
    {
      user_id: user.id,
      challenge_id: data.challengeId,
      status: "in_progress",
      progress: {},
      started_at: new Date().toISOString(),
    },
  ])

  if (insertError) throw insertError

  revalidatePath(ROUTES.DASHBOARD)
  return { message: "Challenge started successfully!" }
}

async function completeChallengeRaw(data: z.infer<typeof challengeIdSchema>) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error("User not authenticated")

  // Get user challenge
  const { data: userChallenge, error: challengeError } = await supabase
    .from("user_challenges")
    .select("*, challenges(*)")
    .eq("user_id", user.id)
    .eq("challenge_id", data.challengeId)
    .eq("status", "in_progress")
    .single()

  if (challengeError || !userChallenge) {
    throw new Error("Challenge not found or not in progress")
  }

  // Get the challenge details
  const challenge = userChallenge.challenges

  // Calculate token reward
  let tokenReward = challenge.token_reward

  // Check if this is a daily focus challenge and apply bonus
  const today = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
  const tokenIdByDay = ["SPD", "SHE", "PSP", "SSA", "BSP", "SGB", "SMS"]
  const todayToken = tokenIdByDay[today]

  if (challenge.challenge_type.toUpperCase() === todayToken) {
    // Double the reward for daily focus challenges
    tokenReward *= 2
  }

  // Update user challenge to completed
  const { error: updateError } = await supabase
    .from("user_challenges")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userChallenge.id)

  if (updateError) throw updateError

  // Award tokens
  await supabase.from("token_transactions").insert([
    {
      user_id: user.id,
      amount: tokenReward,
      description: `Completed challenge: ${challenge.title}`,
      token_type: TOKEN_TYPES.GEN,
    },
  ])

  revalidatePath(ROUTES.DASHBOARD)
  return {
    message: "Challenge completed successfully!",
    tokenReward,
  }
}

// Create the wrapped server actions
export const startChallenge = serverAction(startChallengeRaw, challengeIdSchema)
export const completeChallenge = serverAction(completeChallengeRaw, challengeIdSchema)
