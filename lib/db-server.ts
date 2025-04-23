import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react"

// Server-side database functions (cached)
export const getProfile = cache(async (userId: string) => {
  const supabase = await createClient() as SupabaseClient<Database>;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
})

export const getPosts = cache(async (limit = 10, page = 0) => {
  const supabase = await createClient() as SupabaseClient<Database>;
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)

  if (error) {
    console.error("Error fetching posts:", error)
    return []
  }

  return data
})

export const getSuggestedUsers = cache(async (userId: string, limit = 5) => {
  const supabase = await createClient() as SupabaseClient<Database>;
  const { data, error } = await supabase.from("profiles").select("*").neq("id", userId).limit(limit)

  if (error) {
    console.error("Error fetching suggested users:", error)
    return []
  }

  return data
})

// Move all other server functions here...
