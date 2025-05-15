"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { Coins, Shield, Lightbulb, Briefcase, Brain, Users, Sparkles, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface TokenBalance {
  token: string
  balance: number
  symbol: string
  color: string
}

interface TrustLevel {
  level: string
  description: string
  color: string
  progress: number
  nextMilestone: number
}

export function GeniusIdWithTrust() {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([])
  const [trustLevel, setTrustLevel] = useState<TrustLevel>({
    level: "Newcomer",
    description: "Just beginning your journey in the Supercivilization",
    color: "zinc",
    progress: 0,
    nextMilestone: 50,
  })
  const [activeTab, setActiveTab] = useState("overview")
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

          if (profileData) {
            setProfile(profileData)

            // Calculate token balances
            const balances: TokenBalance[] = [
              {
                token: "GEN",
                balance: profileData.gen_tokens || 0,
                symbol: "GEN",
                color: "zinc",
              },
              {
                token: "Personal Success Puzzle",
                balance: profileData.psp_tokens || 0,
                symbol: "PSP",
                color: "amber",
              },
              {
                token: "Business Success Puzzle",
                balance: profileData.bsp_tokens || 0,
                symbol: "BSP",
                color: "teal",
              },
              {
                token: "Supermind Superpowers",
                balance: profileData.sms_tokens || 0,
                symbol: "SMS",
                color: "violet",
              },
            ]
            setTokenBalances(balances)

            // Calculate trust level
            const genTokens = profileData.gen_tokens || 0
            let level: TrustLevel

            if (genTokens >= 500) {
              level = {
                level: "Architect",
                description: "Shaping the future of the Supercivilization",
                color: "indigo",
                progress: 100,
                nextMilestone: 500,
              }
            } else if (genTokens >= 250) {
              level = {
                level: "Builder",
                description: "Actively building value in the Supercivilization",
                color: "blue",
                progress: Math.min(((genTokens - 250) / 250) * 100, 100),
                nextMilestone: 500,
              }
            } else if (genTokens >= 100) {
              level = {
                level: "Contributor",
                description: "Regularly contributing to the Supercivilization",
                color: "emerald",
                progress: Math.min(((genTokens - 100) / 150) * 100, 100),
                nextMilestone: 250,
              }
            } else if (genTokens >= 50) {
              level = {
                level: "Participant",
                description: "Actively participating in the Supercivilization",
                color: "amber",
                progress: Math.min(((genTokens - 50) / 50) * 100, 100),
                nextMilestone: 100,
              }
            } else {
              level = {
                level: "Newcomer",
                description: "Just beginning your journey in the Supercivilization",
                color: "zinc",
                progress: Math.min((genTokens / 50) * 100, 100),
                nextMilestone: 50,
              }
            }

            setTrustLevel(level)
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [supabase, toast])

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-10">
          <div className="text-center">
            <p className="text-muted-foreground">Loading Genius ID...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-10">
          <div className="text-center">
            <p className="text-muted-foreground">Please create your Genius ID first.</p>
            <Button className="mt-4" onClick={() => (window.location.href = "/unlock/genius-id")}>
              Create Genius ID
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-zinc-200 dark:border-zinc-800">
              <AvatarImage
                src={profile.avatar_url || "/placeholder.svg?height=64&width=64&query=user"}
                alt={profile.full_name}
              />
              <AvatarFallback>{profile.full_name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
              <CardDescription className="max-w-md">{profile.bio || "No bio provided"}</CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              className={`bg-${trustLevel.color}-100 text-${trustLevel.color}-800 dark:bg-${trustLevel.color}-900/30 dark:text-${trustLevel.color}-300`}
            >
              {trustLevel.level}
            </Badge>
            <span className="text-xs text-muted-foreground">{trustLevel.description}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Trust Level Progress</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {trustLevel.nextMilestone > 0
                ? `${trustLevel.nextMilestone - profile.gen_tokens} GEN to next level`
                : "Maximum level reached"}
            </span>
          </div>
          <Progress value={trustLevel.progress} className="h-2" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="compact">Compact</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      Personal
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                    >
                      PSP
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{profile.personal_goals || "No personal goals set"}</p>
                </CardContent>
              </Card>

              <Card className="bg-teal-50 dark:bg-teal-900/10 border-teal-200 dark:border-teal-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      Business
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300"
                    >
                      BSP
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{profile.business_goals || "No business goals set"}</p>
                </CardContent>
              </Card>

              <Card className="bg-violet-50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Brain className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      Supermind
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300"
                    >
                      SMS
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{profile.supermind_goals || "No supermind goals set"}</p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                Trust Level Benefits
              </h3>

              <div className="space-y-2">
                {trustLevel.level === "Newcomer" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Basic platform access</span>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      >
                        Unlocked
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Genie AI basic guidance</span>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      >
                        Unlocked
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Community forum access</span>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      >
                        Unlocked
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Advanced Genie AI features</span>
                      <Badge
                        variant="outline"
                        className="bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                      >
                        Locked
                      </Badge>
                    </div>
                  </>
                )}

                {trustLevel.level === "Participant" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Basic platform access</span>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      >
                        Unlocked
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Genie AI basic guidance</span>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      >
                        Unlocked
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Community forum access</span>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      >
                        Unlocked
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Advanced Genie AI features</span>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      >
                        Unlocked
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Governance voting rights</span>
                      <Badge
                        variant="outline"
                        className="bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                      >
                        Locked
                      </Badge>
                    </div>
                  </>
                )}

                {trustLevel.level === "Contributor" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Advanced Genie AI features</span>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      >
                        Unlocked
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Governance voting rights</span>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      >
                        Unlocked
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Create governance proposals</span>
                      <Badge
                        variant="outline"
                        className="bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                      >
                        Locked
                      </Badge>
                    </div>
                  </>
                )}

                {trustLevel.level === "Builder" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Governance voting rights</span>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      >
                        Unlocked
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Create governance proposals</span>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      >
                        Unlocked
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Invitation creation rights</span>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      >
                        Unlocked
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Core governance rights</span>
                      <Badge
                        variant="outline"
                        className="bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                      >
                        Locked
                      </Badge>
                    </div>
                  </>
                )}

                {trustLevel.level === "Architect" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Create governance proposals</span>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      >
                        Unlocked
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Invitation creation rights</span>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      >
                        Unlocked
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Core governance rights</span>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      >
                        Unlocked
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Compact amendment rights</span>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      >
                        Unlocked
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tokens" className="space-y-4">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Coins className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                Token Balances
              </h3>

              <div className="space-y-3">
                {tokenBalances.map((token) => (
                  <div key={token.token} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full bg-${token.color}-400`} />
                      <span className="text-sm">{token.token}</span>
                    </div>
                    <Badge
                      className={`bg-${token.color}-100 text-${token.color}-800 dark:bg-${token.color}-900/30 dark:text-${token.color}-300`}
                    >
                      {token.balance} {token.symbol}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-medium mb-3">Token Earning Opportunities</h3>

              <div className="space-y-3">
                <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Complete Daily Challenges</h4>
                    <Badge variant="outline">+5-15 GEN</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete daily challenges to earn GEN tokens and contribute to the Supercivilization.
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Create Value in Forums</h4>
                    <Badge variant="outline">+1-10 GEN</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Contribute valuable insights and solutions in community forums to earn GEN tokens.
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Refer New Members</h4>
                    <Badge variant="outline">+25 GEN</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Refer new members who are approved and complete onboarding to earn GEN tokens.
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Participate in Governance</h4>
                    <Badge variant="outline">+5 GEN</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vote on governance proposals to earn GEN tokens and shape the future of the Supercivilization.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compact" className="space-y-4">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                Compact Alignment
              </h3>

              <div className="space-y-3">
                <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <h4 className="text-sm font-medium">Virtuously Selfish Behavior</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your commitment to constantly improving yourself via creating your Success Puzzle faster.
                  </p>
                  <div className="mt-2">
                    <Progress value={70} className="h-1.5" />
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <h4 className="text-sm font-medium">Virtuously Selfless Behavior</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your commitment to constantly improving society via co-creating the Superpuzzle faster.
                  </p>
                  <div className="mt-2">
                    <Progress value={55} className="h-1.5" />
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <h4 className="text-sm font-medium">Value Creation</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your demonstrated ability to create and produce value rather than usurp or destroy it.
                  </p>
                  <div className="mt-2">
                    <Progress value={65} className="h-1.5" />
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <h4 className="text-sm font-medium">Positive-Sum Outcomes</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your ability to create outcomes that benefit all participants rather than zero-sum or negative-sum
                    games.
                  </p>
                  <div className="mt-2">
                    <Progress value={60} className="h-1.5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                Compact Commitments
              </h3>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mt-0.5">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs">
                    I commit to creating positive-sum outcomes that benefit all participants.
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mt-0.5">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs">
                    I commit to being a value producer/creator rather than a value usurper/destroyer.
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mt-0.5">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs">
                    I commit to balancing virtuously selfish behavior with virtuously selfless behavior.
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mt-0.5">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs">
                    I accept the graduated trust architecture where access increases with demonstrated value creation.
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mt-0.5">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs">
                    I commit to regenerative thinking that creates sustainable value rather than extractive thinking.
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
        <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
          Dashboard
        </Button>
        <Button onClick={() => (window.location.href = "/profile/edit")}>Edit Profile</Button>
      </CardFooter>
    </Card>
  )
}
