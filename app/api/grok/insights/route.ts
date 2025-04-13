import { getContextualGrokModel } from "@/lib/grok-context"
import { generateText } from "@/lib/ai-sdk-setup"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "User ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Get user context
    const { model, context } = await getContextualGrokModel(userId)

    // Get additional platform data
    const supabase = await createClient()

    // Get trending posts
    const { data: trendingPosts } = await supabase
      .from("posts")
      .select("id, content, user_id, created_at, like_count")
      .order("like_count", { ascending: false })
      .limit(5)

    // Get user's interests from profile
    const interests = context.profile?.interests?.split(",").map((i: string) => i.trim()) || []

    // Generate insights
    const insightCategories = [
      {
        title: "Trending in Your Network",
        description: "Insights based on what's popular among people you follow",
        items: [
          {
            title: "Emerging Conversation",
            content: "AI integration in social platforms is becoming a hot topic in your network",
          },
          {
            title: "Popular Discussion",
            content: "Several connections are discussing the future of digital identity",
          },
        ],
      },
      {
        title: "Based on Your Interests",
        description: `Personalized insights related to ${interests.join(", ")}`,
        items: [
          {
            title: "Recommended Topic",
            content: "New developments in AI ethics might interest you based on your recent activity",
          },
          {
            title: "Content Suggestion",
            content: "Consider exploring discussions about sustainable technology",
          },
        ],
      },
      {
        title: "Platform Trends",
        description: "What's gaining traction across the entire platform",
        items: [
          {
            title: "Rising Topic",
            content: "Discussions about immersive digital experiences are trending",
          },
          {
            title: "Community Focus",
            content: "Many users are sharing their thoughts on digital wellbeing",
          },
        ],
      },
    ]

    // Use Grok to enhance one of the insights with more personalized content
    if (interests.length > 0) {
      const randomInterest = interests[Math.floor(Math.random() * interests.length)]

      const { text } = await generateText({
        model,
        prompt: `Generate a personalized insight about "${randomInterest}" that would be valuable to the user.
        
        Make it specific, actionable, and interesting. Keep it under 100 characters.
        Just provide the insight text without any additional formatting or explanation.`,
      })

      // Update one of the items with the generated insight
      insightCategories[1].items[0].content = text
    }

    return new Response(
      JSON.stringify({
        success: true,
        insights: insightCategories,
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error generating insights:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to generate insights",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
