"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { serverAction } from "@/lib/server-action"
import { z } from "zod"
import { TOKEN_COSTS, TOKEN_TYPES, ROUTES } from "@/constants"

// Define validation schema
const genieAiSchema = z.object({
  commitment: z.string().min(20, "Commitment must be at least 20 characters"),
  tokenCost: z.number().int().positive().default(TOKEN_COSTS.GENIE_AI_UNLOCK),
})

// Define the raw action function
async function unlockGenieAIRaw(data: z.infer<typeof genieAiSchema>) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error("User not authenticated")

  // Check if user has enough tokens
  const { data: profile } = await supabase.from("profiles").select("gen_tokens").eq("id", user.id).single()

  if (!profile || profile.gen_tokens < data.tokenCost) {
    throw new Error(`Not enough GEN tokens. You need ${data.tokenCost} tokens to unlock Genie AI.`)
  }

  // Record token transaction (spending tokens)
  await supabase.from("token_transactions").insert([
    {
      user_id: user.id,
      amount: -data.tokenCost,
      description: "Spent GEN tokens to unlock Genie AI",
      token_type: TOKEN_TYPES.GEN,
    },
  ])

  // Update user profile
  await supabase
    .from("profiles")
    .update({
      has_genie_ai: true,
      regen_commitment: data.commitment,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  revalidatePath(ROUTES.UNLOCK.GENIE_AI)
  revalidatePath(ROUTES.DASHBOARD)

  return { message: "Genie AI unlocked successfully!" }
}

// Create the wrapped server action
export const unlockGenieAI = serverAction(unlockGenieAIRaw, genieAiSchema)
