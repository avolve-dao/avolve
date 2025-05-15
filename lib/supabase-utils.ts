import { handleServerSupabaseError } from "@/lib/supabase/server"
import type { PostgrestError } from "@supabase/supabase-js"

/**
 * Safely executes a Supabase query with proper error handling
 * @param queryFn Function that executes the Supabase query
 * @param errorMessage Custom error message
 * @returns The query result data
 */
export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  errorMessage?: string,
): Promise<T> {
  try {
    const { data, error } = await queryFn()

    if (error) {
      throw handleServerSupabaseError(error, errorMessage)
    }

    if (data === null) {
      throw new Error(errorMessage || "No data returned from query")
    }

    return data
  } catch (error) {
    throw handleServerSupabaseError(error, errorMessage)
  }
}

/**
 * Safely executes a Supabase mutation with proper error handling
 * @param mutationFn Function that executes the Supabase mutation
 * @param errorMessage Custom error message
 * @returns The mutation result data
 */
export async function safeMutation<T>(
  mutationFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  errorMessage?: string,
): Promise<T | null> {
  try {
    const { data, error } = await mutationFn()

    if (error) {
      throw handleServerSupabaseError(error, errorMessage)
    }

    return data
  } catch (error) {
    throw handleServerSupabaseError(error, errorMessage)
  }
}

/**
 * Safely executes a Supabase RPC call with proper error handling
 * @param rpcFn Function that executes the Supabase RPC call
 * @param errorMessage Custom error message
 * @returns The RPC result data
 */
export async function safeRpc<T>(
  rpcFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  errorMessage?: string,
): Promise<T | null> {
  try {
    const { data, error } = await rpcFn()

    if (error) {
      throw handleServerSupabaseError(error, errorMessage)
    }

    return data
  } catch (error) {
    throw handleServerSupabaseError(error, errorMessage)
  }
}
