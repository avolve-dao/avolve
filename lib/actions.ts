"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

/**
 * Creates a type-safe server action with Supabase client
 * @param actionFn - The action function
 * @param options - Options for the action
 * @returns A server action function
 */
export async function createAction<TInput, TOutput>(
  actionFn: (input: TInput, supabase: ReturnType<typeof createClient>) => Promise<TOutput>,
  options: {
    schema?: z.ZodSchema<TInput>
    revalidatePaths?: string[]
  } = {},
) {
  return async (input: TInput) => {
    try {
      // Validate input if schema is provided
      if (options.schema) {
        try {
          input = options.schema.parse(input) as TInput
        } catch (error) {
          if (error instanceof z.ZodError) {
            return {
              success: false,
              error: error.errors.map((e) => `${e.path}: ${e.message}`).join(", "),
            }
          }
          throw error
        }
      }

      // Create Supabase client
      const supabase = createClient()

      // Execute the action
      const result = await actionFn(input, supabase)

      // Revalidate paths if specified
      if (options.revalidatePaths) {
        for (const path of options.revalidatePaths) {
          revalidatePath(path)
        }
      }

      return { success: true, data: result }
    } catch (error) {
      console.error("Action error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      }
    }
  }
}
