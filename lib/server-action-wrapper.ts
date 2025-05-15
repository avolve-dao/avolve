"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { Database } from "@/types/supabase"
import type { ZodSchema } from "zod"

type ActionResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * A wrapper for server actions that handles common tasks like:
 * - Authentication checking
 * - Input validation
 * - Error handling
 * - Response formatting
 */
export async function createServerAction<TInput, TOutput>({
  handler,
  schema,
  authRequired = true,
  adminRequired = false,
  revalidatePaths = [],
}: {
  handler: (input: TInput, supabase: ReturnType<typeof createServerComponentClient<Database>>) => Promise<TOutput>
  schema?: ZodSchema<TInput>
  authRequired?: boolean
  adminRequired?: boolean
  revalidatePaths?: string[]
}) {
  return async (input: TInput): Promise<ActionResponse<TOutput>> => {
    try {
      // Validate input if schema is provided
      if (schema) {
        const result = schema.safeParse(input)
        if (!result.success) {
          return {
            success: false,
            error: result.error.errors.map((e) => `${e.path}: ${e.message}`).join(", "),
          }
        }
      }

      // Create Supabase client
      const supabase = createServerComponentClient<Database>({ cookies })

      // Check authentication if required
      if (authRequired || adminRequired) {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          redirect("/auth/login")
        }

        // Check admin role if required
        if (adminRequired) {
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

          if (!profile || profile.role !== "admin") {
            return {
              success: false,
              error: "Admin access required",
            }
          }
        }
      }

      // Execute the handler
      const result = await handler(input, supabase)

      // Selectively revalidate paths if provided
      if (revalidatePaths.length > 0) {
        const { revalidatePath } = await import("next/cache")
        for (const path of revalidatePaths) {
          revalidatePath(path)
        }
      }

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      console.error("Server action error:", error)

      return {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }
    }
  }
}
