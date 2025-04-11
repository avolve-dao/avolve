import { Metadata } from "next"
import { TransformationWall } from "@/components/transformation/transformation-wall"
import { PromptCard } from "@/components/transformation/prompt-card"
import { StatsCard } from "@/components/transformation/stats-card"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export const metadata: Metadata = {
  title: "Superachiever Journey | Avolve",
  description: "Track your personal transformation journey and earn SAP tokens",
}

export const revalidate = 0

async function getJourneyStats() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)
  
  const { data: stats } = await supabase.rpc('get_journey_stats', {
    journey_type: 'superachiever'
  })

  return stats ?? {
    total_posts: 0,
    total_engagement: 0,
    total_tokens_spent: 0,
    total_tokens_earned: 0,
    average_regen_score: 0
  }
}

export default async function SuperachieverPage() {
  const stats = await getJourneyStats()

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex-1">
          <h1 className="text-4xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-purple-600">
            Superachiever Journey
          </h1>
          <p className="text-muted-foreground">
            Share your transformation journey, inspire others, and earn SAP tokens for meaningful engagement.
          </p>
        </div>
        <StatsCard
          stats={stats}
          className="md:w-96"
          theme="superachiever"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <TransformationWall
          journeyType="superachiever"
          className="min-h-[calc(100vh-20rem)]"
        />
        <div className="space-y-6">
          <PromptCard
            theme="superachiever"
            prompts={[
              "Share a breakthrough moment in your journey",
              "What's your biggest transformation win today?",
              "How are you leveling up your game?",
              "What challenge did you overcome?",
              "Share a tool or technique that's working for you"
            ]}
          />
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Token Guide</h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="font-medium">Posting Fee</div>
                <div className="text-muted-foreground">1-5 GEN tokens (refunded at 75% engagement)</div>
              </div>
              <div>
                <div className="font-medium">Milestone Rewards</div>
                <div className="text-muted-foreground">10 SAP tokens at 50% engagement</div>
              </div>
              <div>
                <div className="font-medium">Interaction Rewards</div>
                <div className="text-muted-foreground">
                  • Like: +1 engagement<br />
                  • Comment: +2 engagement<br />
                  • Share: +3 engagement
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
