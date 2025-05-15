import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

/**
 * Creates a Supabase client for server-side usage in Server Components
 * @returns Supabase server client
 */
export function createClient() {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
    options: {
      db: {
        schema: "public",
      },
    },
  })
}

/**
 * Creates a Supabase admin client for server-side usage
 * Requires SUPABASE_SERVICE_ROLE_KEY environment variable
 * @returns Supabase admin client
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined")
  }

  return createServerComponentClient<Database>({
    cookies: () => cookies(),
    options: {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    },
  })
}

/**
 * Helper function to handle Supabase errors in server components
 * @param error Supabase error object
 * @param customMessage Optional custom error message
 */
export function handleServerSupabaseError(error: any, customMessage?: string): Error {
  console.error("Server Supabase error:", error)

  // Format a user-friendly error message
  const message = customMessage || error?.message || "An unexpected database error occurred"

  // Create an error object with additional context
  const formattedError = new Error(message)

  // Attach the original error details for debugging
  if (error) {
    // @ts-ignore - Adding custom properties to Error
    formattedError.originalError = error
    // @ts-ignore - Adding custom properties to Error
    formattedError.code = error.code
    // @ts-ignore - Adding custom properties to Error
    formattedError.details = error.details
  }

  return formattedError
}
