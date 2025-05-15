"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { ArrowRight, Check, Coins, Shield, Users, Puzzle } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"

export function GenTokenEnhanced() {
  const [isComplete, setIsComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [genTokens, setGenTokens] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")
  const [challengeProgress, setChallengeProgress] = useState({
    challenge1: false,
    challenge2: false,
    challenge3: false,
  })
  const supabase = createClient()
  const router = useRouter()

  const totalChallenges = Object.keys(challengeProgress).length
  const completedChallenges = Object.values(challengeProgress).filter(Boolean).length
  const progressPercentage = (completedChallenges / totalChallenges) * 100

  async function completeChallenge(challenge: string, tokenAmount: number) {
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Update challenge progress
        setChallengeProgress((prev) => ({
          ...prev,
          [challenge]: true,
        }))

        // Update user's token balance
        const { data: profileData } = await supabase.from("profiles").select("gen_tokens").eq("id", user.id).single()

        const currentTokens = profileData?.gen_tokens || 0
        const newTokenBalance = currentTokens + tokenAmount

        // Update profile
        await supabase.from("profiles").upsert({
          id: user.id,
          gen_tokens: newTokenBalance,
          updated_at: new Date().toISOString(),
        })

        // Record token transaction
        await supabase.from("token_transactions").insert({
          user_id: user.id,
          amount: tokenAmount,
          description: `Completed ${challenge} challenge`,
          token_type: "GEN",
        })

        setGenTokens((prev) => prev + tokenAmount)

        // Check if all challenges are complete
        const updatedChallenges = {
          ...challengeProgress,
          [challenge]: true,
        }

        if (Object.values(updatedChallenges).every(Boolean)) {
          // Update profile to mark GEN tokens as unlocked
          await supabase.from("profiles").upsert({
            id: user.id,
            has_gen_tokens: true,
            updated_at: new Date().toISOString(),
          })

          setIsComplete(true)
        }
      }
    } catch (error) {
      console.error("Error completing challenge:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      {!isComplete ? (
        <>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Unlock GEN Tokens</CardTitle>
                <CardDescription>
                  Complete challenges to earn GEN tokens and understand their role in the Supercivilization.
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800">
                Step 3 of 4
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Challenge Progress</h3>
                <span className="text-sm text-muted-foreground">
                  {completedChallenges} of {totalChallenges} complete
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="challenges" className="text-xs sm:text-sm">
                  Challenges
                </TabsTrigger>
                <TabsTrigger value="utility" className="text-xs sm:text-sm">
                  Utility
                </TabsTrigger>
                <TabsTrigger value="governance" className="text-xs sm:text-sm">
                  Governance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-start gap-3">
                    <Coins className="h-5 w-5 text-zinc-600 dark:text-zinc-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-zinc-600 dark:text-zinc-400">GEN Tokens</h3>
                      <p className="text-sm text-zinc-600/80 dark:text-zinc-400/80">
                        GEN tokens are the currency of regenerative value creation in the Supercivilization. They
                        represent your contribution and enable participation in governance.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <h4 className="font-medium text-sm mb-2">Token Hierarchy</h4>
                    <p className="text-xs text-muted-foreground">
                      GEN is the primary token in the Supercivilization, with specialized tokens for specific aspects of
                      value creation.
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-zinc-400" />
                          GEN (Supercivilization)
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Primary
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-stone-400" />
                          SAP (Superachiever)
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Secondary
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-slate-400" />
                          SCQ (Superachievers)
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Secondary
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <h4 className="font-medium text-sm mb-2">Your Token Balance</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">GEN Tokens</span>
                      <Badge className="bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
                        {genTokens} GEN
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Complete challenges to earn more GEN tokens and unlock additional features in the
                      Supercivilization.
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <h4 className="font-medium text-sm mb-2">Compact Integration</h4>
                  <p className="text-xs text-muted-foreground">
                    GEN tokens directly implement the governance framework outlined in the Supercivilization Compact:
                  </p>
                  <ul className="mt-3 space-y-2 text-xs">
                    <li className="flex items-start gap-2">
                      <Shield className="h-3 w-3 text-zinc-500 mt-0.5" />
                      <span>Graduated Trust Architecture: Token holdings influence your trust level</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Users className="h-3 w-3 text-zinc-500 mt-0.5" />
                      <span>Collective Protection: Token-weighted voting on governance proposals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Puzzle className="h-3 w-3 text-zinc-500 mt-0.5" />
                      <span>Value Creation Incentives: Token rewards align with collective value creation</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="challenges" className="space-y-4">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <h4 className="font-medium text-sm mb-3">Complete Challenges to Earn GEN Tokens</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    These challenges help you understand the role of GEN tokens in the Supercivilization while earning
                    your initial token balance.
                  </p>

                  <div className="space-y-4">
                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium text-sm">Understanding Token Utility</h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            Learn about the various ways GEN tokens are used in the Supercivilization.
                          </p>
                        </div>
                        {challengeProgress.challenge1 ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Completed
                          </Badge>
                        ) : (
                          <Button size="sm" onClick={() => completeChallenge("challenge1", 15)} disabled={isLoading}>
                            Complete
                          </Button>
                        )}
                      </div>
                      {challengeProgress.challenge1 && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Tokens earned</span>
                          <Badge variant="outline">+15 GEN</Badge>
                        </div>
                      )}
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium text-sm">Token Governance Basics</h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            Learn how GEN tokens enable participation in Supercivilization governance.
                          </p>
                        </div>
                        {challengeProgress.challenge2 ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Completed
                          </Badge>
                        ) : (
                          <Button size="sm" onClick={() => completeChallenge("challenge2", 20)} disabled={isLoading}>
                            Complete
                          </Button>
                        )}
                      </div>
                      {challengeProgress.challenge2 && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Tokens earned</span>
                          <Badge variant="outline">+20 GEN</Badge>
                        </div>
                      )}
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium text-sm">Token Hierarchy Overview</h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            Learn about the relationship between GEN and specialized tokens in the ecosystem.
                          </p>
                        </div>
                        {challengeProgress.challenge3 ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Completed
                          </Badge>
                        ) : (
                          <Button size="sm" onClick={() => completeChallenge("challenge3", 25)} disabled={isLoading}>
                            Complete
                          </Button>
                        )}
                      </div>
                      {challengeProgress.challenge3 && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Tokens earned</span>
                          <Badge variant="outline">+25 GEN</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="utility" className="space-y-4">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <h4 className="font-medium text-sm mb-3">GEN Token Utility</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    GEN tokens provide various utilities within the Supercivilization ecosystem:
                  </p>

                  <div className="space-y-3">
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <h5 className="font-medium text-sm">Access Control</h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        GEN tokens provide access to advanced features and resources in the Supercivilization, including
                        Genie AI.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <h5 className="font-medium text-sm">Reputation Signaling</h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your GEN token balance signals your contribution to the Supercivilization and influences your
                        reputation.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <h5 className="font-medium text-sm">Governance Participation</h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        GEN tokens enable participation in governance decisions, with voting power proportional to token
                        holdings.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <h5 className="font-medium text-sm">Resource Allocation</h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        GEN tokens influence the allocation of community resources to various projects and initiatives.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="governance" className="space-y-4">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <h4 className="font-medium text-sm mb-3">Token Governance</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    GEN tokens enable participation in the governance of the Supercivilization:
                  </p>

                  <div className="space-y-3">
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <h5 className="font-medium text-sm">Proposal Voting</h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        Token holders can vote on governance proposals, with voting power proportional to their token
                        holdings.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <h5 className="font-medium text-sm">Proposal Creation</h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        Members with sufficient token holdings can create governance proposals for community
                        consideration.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <h5 className="font-medium text-sm">Graduated Trust</h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        Token holdings influence your level in the graduated trust architecture, determining your access
                        to community resources.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <h5 className="font-medium text-sm">Regenerative Disengagement</h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        Token-weighted voting on regenerative disengagement decisions when necessary to protect the
                        community.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">GEN Tokens Unlocked!</CardTitle>
                <CardDescription>
                  You've successfully unlocked GEN tokens and can now participate in the Supercivilization.
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800">
                Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="flex flex-col items-center justify-center py-6">
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-medium text-center">GEN Tokens Unlocked!</h3>
                <p className="text-center text-muted-foreground mt-2 max-w-md">
                  You've earned GEN tokens and can now participate in the governance of the Supercivilization.
                </p>
              </div>

              <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <Coins className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    Total GEN Tokens Earned
                  </h4>
                  <Badge className="bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
                    {genTokens} GEN
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  You've earned GEN tokens by completing challenges. These tokens represent your contribution to the
                  Supercivilization and enable participation in governance.
                </p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-medium text-sm mb-2">Next Steps</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="bg-zinc-200 dark:bg-zinc-700 p-1 rounded-full mt-0.5">
                      <Check className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <span>Create your Genius ID</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-zinc-200 dark:bg-zinc-700 p-1 rounded-full mt-0.5">
                      <Check className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <span>Unlock GEN Tokens</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-zinc-200 dark:bg-zinc-700 p-1 rounded-full mt-0.5">
                      <ArrowRight className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <span>Access Genie AI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-zinc-200 dark:bg-zinc-700 p-1 rounded-full mt-0.5">
                      <ArrowRight className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <span>Begin your journey in the Supercivilization</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => router.push("/unlock/genie-ai")} className="flex items-center gap-2">
              Continue to Genie AI <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
