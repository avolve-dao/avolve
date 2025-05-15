"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Check, Sparkles, Brain, Lightbulb, Puzzle } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export function GenieAiEnhanced() {
  const [isComplete, setIsComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("introduction")
  const [question, setQuestion] = useState("")
  const [response, setResponse] = useState("")
  const [isAsking, setIsAsking] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function askQuestion() {
    if (!question.trim()) return

    setIsAsking(true)
    setResponse("")

    try {
      // Simulate AI response with a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate a response based on the question
      let aiResponse = ""

      if (question.toLowerCase().includes("degen") || question.toLowerCase().includes("regen")) {
        aiResponse =
          "The journey from Degen to Regen thinking involves transforming extractive patterns into regenerative ones. This means moving from zero-sum or negative-sum games to positive-sum outcomes that create value for all participants."
      } else if (question.toLowerCase().includes("token") || question.toLowerCase().includes("gen")) {
        aiResponse =
          "GEN tokens represent your contribution to the Supercivilization and enable participation in governance. They are earned through value creation and can be used to access advanced features and resources."
      } else if (question.toLowerCase().includes("success") || question.toLowerCase().includes("puzzle")) {
        aiResponse =
          "Your Success Puzzle consists of three key areas: Personal Success Puzzle (health, wealth, peace), Business Success Puzzle (users, admin, profit), and Supermind Superpowers (solving conflicts, creating plans, implementing actions)."
      } else {
        aiResponse =
          "As your guide on the journey from Degen to Regen thinking, I'm here to help you transform your thinking and create value for yourself and others. What specific aspect of the Supercivilization would you like to explore?"
      }

      setResponse(aiResponse)
    } catch (error) {
      console.error("Error generating response:", error)
      setResponse("I apologize, but I'm having trouble generating a response right now. Please try again later.")
    } finally {
      setIsAsking(false)
    }
  }

  async function completeGenieAiUnlock() {
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Update profile to mark Genie AI as unlocked
        await supabase.from("profiles").upsert({
          id: user.id,
          has_genie_ai: true,
          updated_at: new Date().toISOString(),
        })

        setIsComplete(true)
      }
    } catch (error) {
      console.error("Error completing Genie AI unlock:", error)
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
                <CardTitle className="text-2xl">Access Genie AI</CardTitle>
                <CardDescription>
                  Your guide on the journey from Degen to Regen thinking, powered by advanced AI.
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800">
                Step 4 of 4
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="introduction" className="text-xs sm:text-sm">
                  Introduction
                </TabsTrigger>
                <TabsTrigger value="capabilities" className="text-xs sm:text-sm">
                  Capabilities
                </TabsTrigger>
                <TabsTrigger value="tryit" className="text-xs sm:text-sm">
                  Try It
                </TabsTrigger>
              </TabsList>

              <TabsContent value="introduction" className="space-y-4">
                <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-zinc-600 dark:text-zinc-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-zinc-600 dark:text-zinc-400">Genie AI</h3>
                      <p className="text-sm text-zinc-600/80 dark:text-zinc-400/80">
                        Genie AI is your guide on the journey from Degen to Regen thinking, helping you transform your
                        mindset and create value for yourself and others.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <h4 className="font-medium text-sm mb-3">Supercivilization Compact Integration</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Genie AI embodies the principles of the Supercivilization Compact by:
                  </p>

                  <div className="space-y-3">
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <div className="flex items-start gap-2">
                        <Puzzle className="h-4 w-4 text-zinc-500 mt-0.5" />
                        <div>
                          <h5 className="text-sm font-medium">Supporting Virtuously Selfish Growth</h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            Helping you develop your Success Puzzle and achieve personal transformation.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-zinc-500 mt-0.5" />
                        <div>
                          <h5 className="text-sm font-medium">Enabling Virtuously Selfless Contribution</h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            Guiding you in how to contribute to the collective Superpuzzle and create value for others.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <div className="flex items-start gap-2">
                        <Brain className="h-4 w-4 text-zinc-500 mt-0.5" />
                        <div>
                          <h5 className="text-sm font-medium">Developing Supermind Superpowers</h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            Enhancing your ability to solve conflicts, create plans, and implement action steps.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <h4 className="font-medium text-sm mb-2">Token-Based Access</h4>
                  <p className="text-xs text-muted-foreground">
                    Access to Genie AI requires GEN tokens, with more advanced features unlocking at higher token
                    levels:
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Basic Guidance</span>
                      <Badge variant="outline">25 GEN</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Personalized Transformation</span>
                      <Badge variant="outline">50 GEN</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Advanced Supermind Development</span>
                      <Badge variant="outline">100 GEN</Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="capabilities" className="space-y-4">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <h4 className="font-medium text-sm mb-3">Genie AI Capabilities</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Genie AI offers a range of capabilities to support your journey in the Supercivilization:
                  </p>

                  <div className="space-y-3">
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <h5 className="font-medium text-sm">Transformation Guidance</h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        Personalized guidance on your journey from Degen to Regen thinking, helping you identify and
                        overcome extractive patterns.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <h5 className="font-medium text-sm">Success Puzzle Assistance</h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        AI-powered assistance in developing your Personal and Business Success Puzzles, identifying
                        opportunities for growth.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <h5 className="font-medium text-sm">Superpuzzle Collaboration</h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        Guidance on how you can contribute to the collective Superpuzzle and collaborate with other
                        Superachievers.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <h5 className="font-medium text-sm">Supermind Development</h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tools and techniques to develop your Supermind Superpowers, enhancing your ability to solve
                        conflicts, create plans, and implement actions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <h4 className="font-medium text-sm mb-2">Use Cases</h4>
                  <div className="space-y-2 mt-3">
                    <div className="flex items-start gap-2">
                      <div className="bg-zinc-200 dark:bg-zinc-700 p-1 rounded-full mt-0.5">
                        <Check className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <span className="text-xs">Identifying and overcoming Degen thinking patterns</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-zinc-200 dark:bg-zinc-700 p-1 rounded-full mt-0.5">
                        <Check className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <span className="text-xs">Developing strategies for personal and business growth</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-zinc-200 dark:bg-zinc-700 p-1 rounded-full mt-0.5">
                        <Check className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <span className="text-xs">Finding opportunities to contribute to the Superpuzzle</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-zinc-200 dark:bg-zinc-700 p-1 rounded-full mt-0.5">
                        <Check className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <span className="text-xs">Resolving conflicts and creating win-win scenarios</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-zinc-200 dark:bg-zinc-700 p-1 rounded-full mt-0.5">
                        <Check className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <span className="text-xs">Developing and implementing action plans for value creation</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tryit" className="space-y-4">
                <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-zinc-600 dark:text-zinc-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-zinc-600 dark:text-zinc-400">Try Genie AI</h3>
                      <p className="text-sm text-zinc-600/80 dark:text-zinc-400/80">
                        Experience a preview of Genie AI's capabilities by asking a question about the
                        Supercivilization.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask a question about the Supercivilization..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      disabled={isAsking}
                    />
                    <Button onClick={askQuestion} disabled={!question.trim() || isAsking}>
                      {isAsking ? "Thinking..." : "Ask"}
                    </Button>
                  </div>

                  {response && (
                    <div className="mt-4 bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-zinc-600 dark:text-zinc-400 mt-0.5" />
                        <p className="text-sm">{response}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-muted-foreground">
                    <p>This is a preview of Genie AI. Unlock full access by completing this onboarding step.</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={completeGenieAiUnlock} disabled={isLoading}>
                    {isLoading ? "Unlocking..." : "Unlock Genie AI"}
                  </Button>
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
                <CardTitle className="text-2xl">Genie AI Unlocked!</CardTitle>
                <CardDescription>
                  You've successfully unlocked Genie AI and completed your onboarding to the Supercivilization.
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
                <h3 className="text-xl font-medium text-center">Genie AI Unlocked!</h3>
                <p className="text-center text-muted-foreground mt-2 max-w-md">
                  You now have access to Genie AI, your guide on the journey from Degen to Regen thinking.
                </p>
              </div>

              <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                  Onboarding Complete
                </h4>
                <p className="text-sm text-muted-foreground">
                  Congratulations! You've completed all the onboarding steps and are now a full member of the
                  Supercivilization. You can now access all the features and resources available to members.
                </p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700" />
            </motion.div>
          </CardContent>
        </>
      )}
    </Card>
  )
}
