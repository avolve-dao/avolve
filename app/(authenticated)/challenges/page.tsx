"use client"

import { useState } from "react"
import { ChallengeCard } from "@/components/value-creation/challenge-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUser } from "@/contexts/user-context"
import { createClient } from "@/lib/supabase/client"

interface Challenge {
  id: string
  title: string
  description: string
  tokenReward: number
  difficulty: "beginner" | "intermediate" | "advanced"
  timeEstimate: string
  steps: string[]
  category: string
}

export default function ChallengesPage() {
  const { user, refreshTokenBalance } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")
  const supabase = createClient()

  // Sample challenges data
  const challenges: Challenge[] = [
    {
      id: "challenge-1",
      title: "Create a Value-Focused Personal Mission Statement",
      description: "Define your purpose as a value creator in the Supercivilization",
      tokenReward: 50,
      difficulty: "beginner",
      timeEstimate: "1-2 hours",
      category: "personal-growth",
      steps: [
        "Reflect on your unique strengths and abilities",
        "Identify how your strengths can create value for others",
        "Draft a mission statement that focuses on value creation",
        "Share your mission statement with the community for feedback",
        "Finalize your value-focused mission statement",
      ],
    },
    {
      id: "challenge-2",
      title: "Implement a Positive-Sum Solution to a Problem",
      description: "Apply Regen thinking to solve a real-world problem",
      tokenReward: 100,
      difficulty: "intermediate",
      timeEstimate: "3-5 hours",
      category: "problem-solving",
      steps: [
        "Identify a zero-sum problem in your life or work",
        "Reframe it as a positive-sum opportunity",
        "Design a solution that creates value for all parties",
        "Implement your solution and document the results",
        "Reflect on how this approach differs from Degen thinking",
      ],
    },
    {
      id: "challenge-3",
      title: "Create a Value Amplification Network",
      description: "Build connections that multiply your value creation capacity",
      tokenReward: 150,
      difficulty: "advanced",
      timeEstimate: "1-2 weeks",
      category: "community-building",
      steps: [
        "Identify 5-10 people whose values align with the Supercivilization",
        "Connect with them and explain the concept of value amplification",
        "Organize a value creation session to solve a shared challenge",
        "Document the multiplied impact of collaborative value creation",
        "Establish regular value amplification meetings",
      ],
    },
    {
      id: "challenge-4",
      title: "Transform a Degen Belief into a Regen Mindset",
      description: "Identify and transform a limiting belief that's holding you back",
      tokenReward: 75,
      difficulty: "beginner",
      timeEstimate: "2-3 hours",
      category: "mindset",
      steps: [
        "Identify a zero-sum or scarcity belief you currently hold",
        "Research evidence that contradicts this limiting belief",
        "Create a new, positive-sum belief to replace it",
        "Practice this new belief daily for one week",
        "Document how this transformation has impacted your actions",
      ],
    },
    {
      id: "challenge-5",
      title: "Design a Value Creation System",
      description: "Create a repeatable process for generating value",
      tokenReward: 200,
      difficulty: "advanced",
      timeEstimate: "1-2 weeks",
      category: "systems",
      steps: [
        "Identify your core value creation strengths",
        "Design a system that leverages these strengths consistently",
        "Create documentation for your value creation process",
        "Test your system by creating measurable value",
        "Refine your system based on results and feedback",
      ],
    },
  ]

  const handleAcceptChallenge = async (challengeId: string) => {
    if (!user) return

    try {
      // Record that the user has accepted this challenge
      await supabase.from("user_challenges").insert({
        user_id: user.id,
        challenge_id: challengeId,
        status: "in-progress",
        started_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error accepting challenge:", error)
    }
  }

  const handleCompleteChallenge = async (challengeId: string) => {
    if (!user) return

    try {
      // Find the challenge to get the reward amount
      const challenge = challenges.find((c) => c.id === challengeId)
      if (!challenge) return

      // Update the challenge status
      await supabase
        .from("user_challenges")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId)

      // Record token transaction
      await supabase.from("token_transactions").insert({
        user_id: user.id,
        amount: challenge.tokenReward,
        description: `Completed challenge: ${challenge.title}`,
        token_type: "GEN",
      })

      // Update user's token balance
      await supabase.rpc("update_token_balance", {
        user_id_param: user.id,
        token_type_param: "GEN",
        amount_param: challenge.tokenReward,
      })

      // Refresh the token balance in the UI
      refreshTokenBalance()
    } catch (error) {
      console.error("Error completing challenge:", error)
    }
  }

  // Filter challenges based on search query and difficulty
  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSearch =
      challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDifficulty = difficultyFilter === "all" || challenge.difficulty === difficultyFilter

    return matchesSearch && matchesDifficulty
  })

  // Group challenges by category
  const categorizedChallenges: Record<string, Challenge[]> = {}

  filteredChallenges.forEach((challenge) => {
    if (!categorizedChallenges[challenge.category]) {
      categorizedChallenges[challenge.category] = []
    }
    categorizedChallenges[challenge.category].push(challenge)
  })

  const categoryNames: Record<string, string> = {
    "personal-growth": "Personal Growth",
    "problem-solving": "Problem Solving",
    "community-building": "Community Building",
    mindset: "Mindset Transformation",
    systems: "Systems Design",
  }

  return (
    <div className="container py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Value Creation Challenges</h1>
        <p className="text-muted-foreground">
          Complete challenges to create value, earn GEN tokens, and accelerate your transformation
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-grow">
          <Input
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Challenges</TabsTrigger>
          {Object.keys(categorizedChallenges).map((category) => (
            <TabsTrigger key={category} value={category}>
              {categoryNames[category] || category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {Object.keys(categorizedChallenges).map((category) => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-4">{categoryNames[category] || category}</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categorizedChallenges[category].map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    id={challenge.id}
                    title={challenge.title}
                    description={challenge.description}
                    tokenReward={challenge.tokenReward}
                    difficulty={challenge.difficulty}
                    timeEstimate={challenge.timeEstimate}
                    steps={challenge.steps}
                    onAccept={handleAcceptChallenge}
                    onComplete={handleCompleteChallenge}
                  />
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {Object.keys(categorizedChallenges).map((category) => (
          <TabsContent key={category} value={category} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categorizedChallenges[category].map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  id={challenge.id}
                  title={challenge.title}
                  description={challenge.description}
                  tokenReward={challenge.tokenReward}
                  difficulty={challenge.difficulty}
                  timeEstimate={challenge.timeEstimate}
                  steps={challenge.steps}
                  onAccept={handleAcceptChallenge}
                  onComplete={handleCompleteChallenge}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
