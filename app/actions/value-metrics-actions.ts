"use server"

import { serverAction } from "@/lib/server-action"
import { createClient } from "@/lib/supabase/server"
import { safeMutation, safeRpc } from "@/lib/supabase-utils"
import { z } from "zod"
import type { ValueCreation } from "@/types/supabase"

// Schema for adding value creation
const addValueCreationSchema = z.object({
  amount: z.number().min(1, "Amount must be at least 1"),
  type: z.string().min(1, "Type is required"),
  description: z.string().optional(),
})

// Server action to add value creation
export const addValueCreation = serverAction(
  addValueCreationSchema,
  async ({ amount, type, description }, { userId }) => {
    if (!userId) {
      throw new Error("User not authenticated")
    }

    const supabase = createClient()

    // Insert value creation record
    const data = await safeMutation<ValueCreation>(
      () =>
        supabase
          .from("value_creation")
          .insert({
            user_id: userId,
            amount,
            type,
            description: description || `Value created through ${type}`,
          })
          .select()
          .single(),
      "Failed to add value creation",
    )

    // Update total value in user profile
    await safeRpc(
      () =>
        supabase.rpc("increment_user_value", {
          p_user_id: userId,
          p_amount: amount,
        }),
      "Failed to update user value",
    )

    return { success: true, data }
  },
)

// Server action to update value goal
export const updateValueGoal = serverAction(
  z.object({
    goal: z.number().min(100, "Goal must be at least 100"),
  }),
  async ({ goal }, { userId }) => {
    if (!userId) {
      throw new Error("User not authenticated")
    }

    const supabase = createClient()

    await safeMutation(
      () => supabase.from("profiles").update({ value_goal: goal }).eq("id", userId),
      "Failed to update value goal",
    )

    return { success: true }
  },
)

// Server action to get value metrics
export const getValueMetrics = serverAction(
  z.object({
    days: z.number().optional(),
  }),
  async ({ days = 30 }, { userId }) => {
    if (!userId) {
      throw new Error("User not authenticated")
    }

    const supabase = createClient()

    // Get metrics using the database function
    const data = await safeRpc(
      () =>
        supabase.rpc("get_user_value_metrics", {
          p_user_id: userId,
          p_days: days,
        }),
      "Failed to get value metrics",
    )

    return { success: true, data }
  },
)
