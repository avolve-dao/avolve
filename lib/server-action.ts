"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

/**
 * Server action result type
 */
export type ActionResult<T = unknown> = { success: true; data: T } | { success: false; error: string }

/**
 * Creates a type-safe server action with Supabase client
 * @param handler The action handler function
 * @param options Options for the action
 * @returns A server action function
 */
export async function serverAction<TInput, TOutput>(
  handler: (input: TInput, supabase: ReturnType<typeof createClient>) => Promise<TOutput>,
  options?: {
    schema?: z.ZodType<TInput>
    revalidatePaths?: string[]
    requireAuth?: boolean
    requireAdmin?: boolean
  },
) {
  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    try {
      // Validate input if schema is provided
      if (options?.schema) {
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

      // Execute handler
      const result = await handler(input, supabase)

      // Revalidate paths if specified
      if (options?.revalidatePaths) {
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

/**
 * Creates a type-safe server action with Supabase client
 * This is an alias for serverAction to maintain backward compatibility
 * @param handler The action handler function
 * @param options Options for the action
 * @returns A server action function
 */
export async function createServerAction<TInput, TOutput>(
  handler: (input: TInput, supabase: ReturnType<typeof createClient>) => Promise<TOutput>,
  options?: {
    schema?: z.ZodType<TInput>
    revalidatePaths?: string[]
    requireAuth?: boolean
    requireAdmin?: boolean
  },
) {
  return serverAction(handler, options)
}

/**
 * Factory function to create typed server actions with built-in error handling and revalidation
 * @param actionFn - The server action function implementation
 * @param options - Options for the server action
 * @returns A typed server action function
 */
export async function createSimpleServerAction<TInput, TOutput>(
  actionFn: (input: TInput, supabase: ReturnType<typeof createClient>) => Promise<TOutput>,
  options: {
    revalidatePaths?: string[]
    actionName?: string
    validateInput?: (input: TInput) => { valid: boolean; errors?: Record<string, string> }
  } = {},
) {
  const { revalidatePaths = [], actionName = "unnamed_action", validateInput } = options

  return async (input: TInput) => {
    const startTime = performance.now()

    // Validate input if a validation function is provided
    if (validateInput) {
      const validation = validateInput(input)
      if (!validation.valid) {
        return { data: null, error: "Validation failed", validationErrors: validation.errors }
      }
    }

    try {
      const supabase = createClient()
      const result = await actionFn(input, supabase)

      // Revalidate paths if specified
      revalidatePaths.forEach((path) => {
        revalidatePath(path)
      })

      const endTime = performance.now()
      console.log(`Server action ${actionName} took ${endTime - startTime}ms`)

      return { data: result, error: null }
    } catch (error) {
      console.error(`Error in server action ${actionName}:`, error)
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }
    }
  }
}
