"use server"

import { createClient } from "@/lib/supabase/server"
import { serverAction } from "@/lib/server-action"
import { DB_TABLES, TOKEN_TYPES, ROUTES } from "@/constants"

// Unlock Genius ID
export const unlockGeniusId = serverAction(
  async (formData: FormData) => {
    const supabase = await createClient()

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      throw new Error("You must be logged in to unlock Genius ID")
    }

    const userId = session.user.id

    // Check if user already has Genius ID
    const { data: existingToken } = await supabase
      .from(DB_TABLES.TOKENS)
      .select("id")
      .eq("user_id", userId)
      .eq("type", TOKEN_TYPES.GENIUS_ID)
      .single()

    if (existingToken) {
      throw new Error("You already have a Genius ID")
    }

    // Create Genius ID token
    const { data: token, error: tokenError } = await supabase
      .from(DB_TABLES.TOKENS)
      .insert({
        user_id: userId,
        type: TOKEN_TYPES.GENIUS_ID,
        value: `GID-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      })
      .select()
      .single()

    if (tokenError) {
      throw new Error("Failed to create Genius ID")
    }

    // Record token transaction
    const { error: transactionError } = await supabase.from(DB_TABLES.TOKEN_TRANSACTIONS).insert({
      user_id: userId,
      token_id: token.id,
      token_type: TOKEN_TYPES.GENIUS_ID,
      amount: 1,
      description: "Genius ID unlocked",
    })

    if (transactionError) {
      throw new Error("Failed to record token transaction")
    }

    return { success: true, token }
  },
  {
    revalidatePaths: [ROUTES.DASHBOARD, ROUTES.WALLET],
    requireAuth: true,
  },
)
