"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { serverAction } from "@/lib/server-action"
import { z } from "zod"
import { TOKEN_REWARDS, TOKEN_TYPES, ROUTES } from "@/constants"

// Define validation schema
const genTokenSchema = z.object({
  quizResults: z.object({
    correct: z.number().min(0),
    total: z.number().min(1),
  }),
})

// Define the raw action function
async function unlockGenTokensRaw(data: z.infer<typeof genTokenSchema>) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error("User not authenticated")

  // Calculate tokens based on quiz performance
  const tokensPerCorrectAnswer = TOKEN_REWARDS.QUIZ_COMPLETION_PER_CORRECT
  const tokenAmount = data.quizResults.correct * tokensPerCorrectAnswer

  // Record token transaction
  await supabase.from("token_transactions").insert([
    {
      user_id: user.id,
      amount: tokenAmount,
      description: `Earned ${tokenAmount} GEN tokens by completing Regen principles quiz`,
      token_type: TOKEN_TYPES.GEN,
    },
  ])

  // Update user profile to mark GEN tokens as unlocked
  await supabase
    .from("profiles")
    .update({
      has_gen_tokens: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  revalidatePath(ROUTES.UNLOCK.GEN_TOKEN)
  revalidatePath(ROUTES.DASHBOARD)

  return {
    message: "GEN tokens unlocked successfully!",
    tokenAmount,
  }
}

// Create the wrapped server action
export const unlockGenTokens = serverAction(unlockGenTokensRaw, genTokenSchema)
