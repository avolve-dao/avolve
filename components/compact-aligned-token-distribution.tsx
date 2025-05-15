"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Coins, Shield, Users, Sparkles, Lightbulb, Briefcase, Brain, Check, Award } from "lucide-react"

interface Challenge {
  id: string
  title: string
  description: string
  tokenReward: number
  tokenType: string
  category: string
  completed: boolean
}

export function CompactAlignedTokenDistribution() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("daily")
  const [tokenBalances, setTokenBalances] = useState({
    gen: 0,
    psp: 0,
    bsp: 0,
    sms: 0,
  })
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    async function loadChallenges() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Load token balances
          const { data: profileData } = await supabase
            .from("profiles")
            .select("gen_tokens, psp_tokens, bsp_tokens, sms_tokens")
            .eq("id", user.id)
            .single()

          if (profileData) {
            setTokenBalances({
              gen: profileData.gen_tokens || 0,
              psp: profileData.psp_tokens || 0,
              bsp: profileData.bsp_tokens || 0,
              sms: profileData.sms_tokens || 0,
            })
          }

          // Load completed challenges
          const { data: completedChallenges } = await supabase
            .from("completed_challenges")
            .select("challenge_id")
            .eq("user_id", user.id)

          const completedIds = completedChallenges?.map((c) => c.challenge_id) || []

          // Create sample challenges aligned with the Compact
          const sampleChallenges: Challenge[] = [
            // Daily challenges - Balanced between selfish and selfless
            {
              id: "daily-1",
              title: "Complete Your Daily Reflection",
              description: "Reflect on your progress in your Success Puzzle and identify one area for improvement.",
              tokenReward: 5,
              tokenType: "GEN",
              category: "daily",
              completed: completedIds.includes("daily-1"),
            },
            {
              id: "daily-2",
              title: "Contribute to Community Discussion",
              description: "Share an insight or helpful response in the community forum.",
              tokenReward: 5,
              tokenType: "GEN",
              category: "daily",
              completed: completedIds.includes("daily-2"),
            },
            {
              id: "daily-3",
              title: "Complete a Learning Module",
              description: "Complete a learning module to develop your Supermind Superpowers.",
              tokenReward: 5,
              tokenType: "GEN",
              category: "daily",
              completed: completedIds.includes("daily-3"),
            },

            // Personal challenges - Virtuously Selfish
            {
              id: "personal-1",
              title: "Create a Personal Growth Plan",
              description: "Develop a detailed plan for your personal growth with specific milestones.",
              tokenReward: 15,
              tokenType: "PSP",
              category: "personal",
              completed: completedIds.includes("personal-1"),
            },
            {
              id: "personal-2",
              title: "Track Health Metrics for a Week",
              description: "Consistently track your key health metrics for a full week.",
              tokenReward: 10,
              tokenType: "PSP",
              category: "personal",
              completed: completedIds.includes("personal-2"),
            },
            {
              id: "personal-3",
              title: "Complete a Skill Assessment",
              description: "Take a comprehensive assessment of your current skills and identify gaps.",
              tokenReward: 10,
              tokenType: "PSP",
              category: "personal",
              completed: completedIds.includes("personal-3"),
            },

            // Business challenges - Virtuously Selfish
            {
              id: "business-1",
              title: "Create a Business Value Proposition",
              description: "Develop a clear value proposition for your business or professional services.",
              tokenReward: 15,
              tokenType: "BSP",
              category: "business",
              completed: completedIds.includes("business-1"),
            },
            {
              id: "business-2",
              title: "Network with Three New Contacts",
              description: "Establish meaningful connections with three new professional contacts.",
              tokenReward: 10,
              tokenType: "BSP",
              category: "business",
              completed: completedIds.includes("business-2"),
            },
            {
              id: "business-3",
              title: "Analyze Your Business Metrics",
              description: "Conduct a thorough analysis of your key business or professional metrics.",
              tokenReward: 10,
              tokenType: "BSP",
              category: "business",
              completed: completedIds.includes("business-3"),
            },

            // Community challenges - Virtuously Selfless
            {
              id: "community-1",
              title: "Mentor a New Member",
              description: "Provide guidance and support to a new member of the Supercivilization.",
              tokenReward: 20,
              tokenType: "GEN",
              category: "community",
              completed: completedIds.includes("community-1"),
            },
            {
              id: "community-2",
              title: "Create Educational Content",
              description: "Create and share educational content that helps others develop their Success Puzzles.",
              tokenReward: 15,
              tokenType: "GEN",
              category: "community",
              completed: completedIds.includes("community-2"),
            },
            {
              id: "community-3",
              title: "Contribute to Governance",
              description: "Participate in governance by voting on proposals or suggesting improvements.",
              tokenReward: 10,
              tokenType: "GEN",
              category: "community",
              completed: completedIds.includes("community-3"),
            },

            // Supermind challenges - Balanced
            {
              id: "supermind-1",
              title: "Complete Conflict Resolution Exercise",
              description: "Practice advanced conflict resolution techniques and document your approach.",
              tokenReward: 15,
              tokenType: "SMS",
              category: "supermind",
              completed: completedIds.includes("supermind-1"),
            },
            {
              id: "supermind-2",
              title: "Create a Strategic Plan",
              description: "Develop a comprehensive strategic plan for a personal or community project.",
              tokenReward: 15,
              tokenType: "SMS",
              category: "supermind",
              completed: completedIds.includes("supermind-2"),
            },
            {
              id: "supermind-3",
              title: "Implement an Action Plan",
              description: "Successfully implement an action plan and document the results and learnings.",
              tokenReward: 15,
              tokenType: "SMS",
              category: "supermind",
              completed: completedIds.includes("supermind-3"),
            },
          ]

          setChallenges(sampleChallenges)
        }
      } catch (error) {
        console.error("Error loading challenges:", error)
        toast({
          title: "Error",
          description: "Failed to load challenges",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadChallenges()
  }, [supabase, toast])

  async function completeChallenge(challenge: Challenge) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Record completed challenge
      await supabase.from("completed_challenges").insert({
        user_id: user.id,
        challenge_id: challenge.id,
        completed_at: new Date().toISOString(),
      })

      // Update token balance based on token type
      const { data: profileData } = await supabase
        .from("profiles")
        .select(`${challenge.tokenType.toLowerCase()}_tokens`)
        .eq("id", user.id)
        .single()

      const currentBalance = profileData ? profileData[`${challenge.tokenType.toLowerCase()}_tokens`] || 0 : 0
      const newBalance = currentBalance + challenge.tokenReward

      // Update profile with new token balance
      await supabase
        .from("profiles")
        .update({ [`${challenge.tokenType.toLowerCase()}_tokens`]: newBalance })
        .eq("id", user.id)

      // Record token transaction
      await supabase.from("token_transactions").insert({
        user_id: user.id,
        amount: challenge.tokenReward,
        description: `Completed challenge: ${challenge.title}`,
        token_type: challenge.tokenType,
      })

      // Update local state
      setChallenges(challenges.map((c) => (c.id === challenge.id ? { ...c, completed: true } : c)))

      // Update token balances
      setTokenBalances({
        ...tokenBalances,
        [challenge.tokenType.toLowerCase()]:
          tokenBalances[challenge.tokenType.toLowerCase() as keyof typeof tokenBalances] + challenge.tokenReward,
      })

      toast({
        title: "Challenge Completed",
        description: `You earned ${challenge.tokenReward} ${challenge.tokenType} tokens!`,
      })
    } catch (error) {
      console.error("Error completing challenge:", error)
      toast({
        title: "Error",
        description: "Failed to complete challenge",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-10">
          <div className="text-center">
            <p className="text-muted-foreground">Loading challenges...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const filteredChallenges = challenges.filter((challenge) => challenge.category === activeTab)

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Compact-Aligned Challenges</CardTitle>
            <CardDescription>Complete challenges to earn tokens and advance in the Supercivilization</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
              {tokenBalances.gen} GEN
            </Badge>
            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              {tokenBalances.psp} PSP
            </Badge>
            <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300">
              {tokenBalances.bsp} BSP
            </Badge>
            <Badge className="bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300">
              {tokenBalances.sms} SMS
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            Compact Alignment
          </h3>

          <p className="text-xs text-muted-foreground mb-4">
            Challenges are designed to balance virtuously selfish behavior (improving yourself) with virtuously selfless
            behavior (improving society), in alignment with the Supercivilization Compact.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">Virtuously Selfish</span>
                <span className="text-xs text-muted-foreground">50%</span>
              </div>
              <Progress value={50} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">
                Personal and Business challenges focus on your individual growth and success.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">Virtuously Selfless</span>
                <span className="text-xs text-muted-foreground">50%</span>
              </div>
              <Progress value={50} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">
                Community and shared Supermind challenges focus on collective advancement.
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="daily" className="text-xs sm:text-sm">
              Daily
            </TabsTrigger>
            <TabsTrigger value="personal" className="text-xs sm:text-sm">
              Personal
            </TabsTrigger>
            <TabsTrigger value="business" className="text-xs sm:text-sm">
              Business
            </TabsTrigger>
            <TabsTrigger value="community" className="text-xs sm:text-sm">
              Community
            </TabsTrigger>
            <TabsTrigger value="supermind" className="text-xs sm:text-sm">
              Supermind
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {activeTab === "daily" && (
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                <span className="text-sm font-medium">Daily Challenges</span>
                <Badge variant="outline" className="ml-auto">
                  Balanced
                </Badge>
              </div>
            )}

            {activeTab === "personal" && (
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium">Personal Success Puzzle</span>
                <Badge variant="outline" className="ml-auto">
                  Virtuously Selfish
                </Badge>
              </div>
            )}

            {activeTab === "business" && (
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-medium">Business Success Puzzle</span>
                <Badge variant="outline" className="ml-auto">
                  Virtuously Selfish
                </Badge>
              </div>
            )}

            {activeTab === "community" && (
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                <span className="text-sm font-medium">Community Contributions</span>
                <Badge variant="outline" className="ml-auto">
                  Virtuously Selfless
                </Badge>
              </div>
            )}

            {activeTab === "supermind" && (
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <span className="text-sm font-medium">Supermind Superpowers</span>
                <Badge variant="outline" className="ml-auto">
                  Balanced
                </Badge>
              </div>
            )}

            {filteredChallenges.length === 0 ? (
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center">
                <p className="text-muted-foreground">No challenges available in this category.</p>
              </div>
            ) : (
              filteredChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className={`bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 ${
                    challenge.completed ? "opacity-70" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        {challenge.completed && (
                          <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                          </div>
                        )}
                        {challenge.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">{challenge.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        className={`
                          ${challenge.tokenType === "GEN" ? "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200" : ""}
                          ${challenge.tokenType === "PSP" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" : ""}
                          ${challenge.tokenType === "BSP" ? "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300" : ""}
                          ${challenge.tokenType === "SMS" ? "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300" : ""}
                        `}
                      >
                        +{challenge.tokenReward} {challenge.tokenType}
                      </Badge>

                      {!challenge.completed && (
                        <Button size="sm" onClick={() => completeChallenge(challenge)}>
                          Complete
                        </Button>
                      )}

                      {challenge.completed && (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        >
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>

        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            Token Distribution Principles
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-zinc-200 dark:bg-zinc-700 p-1 rounded-full mt-0.5">
                <Shield className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <h4 className="text-xs font-medium">Balanced Distribution</h4>
                <p className="text-xs text-muted-foreground">
                  Token distribution is balanced between virtuously selfish and virtuously selfless activities.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-zinc-200 dark:bg-zinc-700 p-1 rounded-full mt-0.5">
                <Sparkles className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <h4 className="text-xs font-medium">Value Creation Focus</h4>
                <p className="text-xs text-muted-foreground">
                  Tokens are awarded for demonstrated value creation rather than mere participation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-zinc-200 dark:bg-zinc-700 p-1 rounded-full mt-0.5">
                <Users className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <h4 className="text-xs font-medium">Graduated Rewards</h4>
                <p className="text-xs text-muted-foreground">
                  Token rewards increase with the complexity and impact of the value created.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-zinc-200 dark:bg-zinc-700 p-1 rounded-full mt-0.5">
                <Coins className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <h4 className="text-xs font-medium">Specialized Tokens</h4>
                <p className="text-xs text-muted-foreground">
                  Specialized tokens (PSP, BSP, SMS) are awarded for focused development in specific areas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
        <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
          Dashboard
        </Button>
        <Button onClick={() => (window.location.href = "/wallet")}>View Wallet</Button>
      </CardFooter>
    </Card>
  )
}
