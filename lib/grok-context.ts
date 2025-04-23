import { xai } from "@ai-sdk/xai"
import { createClient } from "@/lib/supabase/server"
import type { GrokModel } from "@/lib/xai"
import type { Database } from "@/lib/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

// Enhanced context provider for Grok
export async function getGrokContext(userId: string) {
  const supabase = await createClient() as SupabaseClient<Database>;

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

  // Get user's recent activity
  const { data: recentActivity } = await supabase
    .from("user_activity_feed")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get trending topics from the platform
  const { data: trendingTopics } = await supabase
    .from("posts")
    .select("content")
    .order("like_count", { ascending: false })
    .limit(5)

  // Get user's connections
  const { data: connections } = await supabase.from("follows").select("following_id").eq("follower_id", userId)

  return {
    profile,
    recentActivity,
    trendingTopics,
    connections: connections?.map((c) => c.following_id) || [],
  }
}

// Generate a personalized system prompt based on user context
export function generatePersonalizedPrompt(context: any) {
  return `You are Grok, an AI assistant integrated with the Super social platform.
  
Current user: ${context.profile?.full_name || "User"}
User interests: ${context.profile?.interests || "Not specified"}
Platform trends: ${context.trendingTopics?.map((t: any) => t.content.substring(0, 30)).join(", ") || "None available"}

You have access to the user's recent activity and social connections.
When appropriate, reference relevant platform content or suggest connections.
Be helpful, conversational, and personalized to this specific user's context.
`
}

// Enhanced Grok model with context
export async function getContextualGrokModel(userId: string, modelName: GrokModel = "grok-2") {
  const context = await getGrokContext(userId)
  const systemPrompt = generatePersonalizedPrompt(context)

  return {
    model: xai(modelName),
    systemPrompt,
    context,
  }
}
