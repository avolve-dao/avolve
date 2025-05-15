import { createClient } from "@/lib/supabase/server"
import { cache } from "react"

/**
 * Cached version of getProfile that uses React's cache function
 * to prevent duplicate requests in the same render cycle
 */
export const getProfileCached = cache(async (userId: string) => {
  const supabase = createClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) throw error
  return data
})

/**
 * Cached version of getAgreements that uses React's cache function
 */
export const getAgreementsCached = cache(async (userId: string) => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("agreements")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
})

/**
 * Optimized query for fetching user data with related information
 * Uses a single query with joins to reduce database roundtrips
 */
export async function getUserWithRelatedData(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      *,
      agreements:agreements(id, status, created_at),
      tokens:tokens(id, type, amount),
      challenges:challenges(id, title, completed)
    `)
    .eq("id", userId)
    .single()

  if (error) throw error
  return data
}
