import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Singleton pattern for client-side Supabase client
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

/**
 * Creates a Supabase client for client-side usage
 * Uses singleton pattern to prevent multiple instances
 * @returns Supabase client
 */
export function createClient() {
  if (supabaseClient) return supabaseClient

  supabaseClient = createClientComponentClient<Database>({
    options: {
      db: {
        schema: "public",
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          "x-client-info": "avolve/client",
        },
      },
    },
  })

  return supabaseClient
}

/**
 * Resets the Supabase client singleton
 * Useful for testing or when auth state changes
 */
export function resetClient() {
  supabaseClient = null
}

/**
 * Helper function to handle Supabase errors consistently
 * @param error Supabase error object
 * @param customMessage Optional custom error message
 */
export function handleSupabaseError(error: any, customMessage?: string): Error {
  console.error("Supabase error:", error)

  // Format a user-friendly error message
  const message = customMessage || error?.message || "An unexpected error occurred"

  // Create an error object with additional context
  const formattedError = new Error(message)

  // Attach the original error details for debugging
  if (error) {
    // @ts-ignore - Adding custom properties to Error
    formattedError.originalError = error
    // @ts-ignore - Adding custom properties to Error
    formattedError.code = error.code
  }

  return formattedError
}
