"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, CheckCircle2, Sparkles, Shield, Brain } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { ROUTES } from "@/constants"

export function SimplifiedOnboarding() {
  const router = useRouter()
  const { user, transformationProgress } = useUser()
  const [activeTab, setActiveTab] = useState("overview")

  // Calculate completed steps
  const completedSteps = [
    transformationProgress.hasAgreedToTerms,
    transformationProgress.hasGeniusId,
    transformationProgress.hasGenTokens,
    transformationProgress.hasGenieAi,
  ].filter(Boolean).length

  const totalSteps = 4
  const progress = Math.round((completedSteps / totalSteps) * 100)

  // Determine next step
  const getNextStep = () => {
    if (!transformationProgress.hasAgreedToTerms) return ROUTES.AGREEMENT
    if (!transformationProgress.hasGeniusId) return ROUTES.UNLOCK_GENIUS_ID
    if (!transformationProgress.hasGenTokens) return ROUTES.UNLOCK_GEN_TOKEN
    if (!transformationProgress.hasGenieAi) return ROUTES.UNLOCK_GENIE_AI
    return ROUTES.DASHBOARD
  }

  const handleContinue = () => {
    router.push(getNextStep())
  }

  const handleSkip = () => {
    router.push(ROUTES.DASHBOARD)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome to Avolve</CardTitle>
        <CardDescription>Your journey to becoming a value creator starts here</CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="journey">Your Journey</TabsTrigger>
            <TabsTrigger value="start">Get Started</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-0">
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Transform from Degen to Regen</h3>
                <p className="text-muted-foreground">
                  Avolve helps you transform from consuming value to creating value in your life, work, and community.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <span className="font-medium">Simple to use</span>
                      <p className="text-sm text-muted-foreground">Start your journey in minutes</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <span className="font-medium">Personalized guidance</span>
                      <p className="text-sm text-muted-foreground">Get help tailored to your goals</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <span className="font-medium">Track your progress</span>
                      <p className="text-sm text-muted-foreground">See your growth over time</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary/80" />
                  <h3 className="text-xl font-medium mb-2">Your Transformation Awaits</h3>
                  <p className="text-sm text-muted-foreground">
                    Join thousands of others who are creating more value in their lives
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="benefits" className="mt-0">
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-background">
                <CardHeader className="pb-2">
                  <Shield className="h-8 w-8 text-blue-500 mb-2" />
                  <CardTitle className="text-lg">Genius ID</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Establish your unique identity as a value creator and build trust in the community.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-background">
                <CardHeader className="pb-2">
                  <Sparkles className="h-8 w-8 text-amber-500 mb-2" />
                  <CardTitle className="text-lg">GEN Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Earn tokens by completing challenges and creating value. Use them to unlock new opportunities.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-background">
                <CardHeader className="pb-2">
                  <Brain className="h-8 w-8 text-purple-500 mb-2" />
                  <CardTitle className="text-lg">Genie AI</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Get personalized guidance from an AI assistant that helps you on your value creation journey.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Why This Matters</h3>
              <p className="text-sm text-muted-foreground">
                In today's world, those who create value thrive while those who only consume fall behind. Avolve gives
                you the tools, community, and guidance to become a value creator in every area of your life.
              </p>
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="journey" className="mt-0">
          <CardContent className="space-y-6">
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              {completedSteps} of {totalSteps} steps completed
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                {transformationProgress.hasAgreedToTerms ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <div className="flex items-center justify-center h-5 w-5 rounded-full border border-muted-foreground text-xs mt-0.5">
                    1
                  </div>
                )}
                <div>
                  <span
                    className={
                      transformationProgress.hasAgreedToTerms ? "text-green-600 dark:text-green-400 font-medium" : ""
                    }
                  >
                    Agree to Community Standards
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">Align with our principles of value creation</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {transformationProgress.hasGeniusId ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <div className="flex items-center justify-center h-5 w-5 rounded-full border border-muted-foreground text-xs mt-0.5">
                    2
                  </div>
                )}
                <div>
                  <span
                    className={
                      transformationProgress.hasGeniusId ? "text-green-600 dark:text-green-400 font-medium" : ""
                    }
                  >
                    Create Your Genius ID
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">Establish your unique identity</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {transformationProgress.hasGenTokens ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <div className="flex items-center justify-center h-5 w-5 rounded-full border border-muted-foreground text-xs mt-0.5">
                    3
                  </div>
                )}
                <div>
                  <span
                    className={
                      transformationProgress.hasGenTokens ? "text-green-600 dark:text-green-400 font-medium" : ""
                    }
                  >
                    Unlock GEN Tokens
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">Access the currency of transformation</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {transformationProgress.hasGenieAi ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <div className="flex items-center justify-center h-5 w-5 rounded-full border border-muted-foreground text-xs mt-0.5">
                    4
                  </div>
                )}
                <div>
                  <span
                    className={
                      transformationProgress.hasGenieAi ? "text-green-600 dark:text-green-400 font-medium" : ""
                    }
                  >
                    Access Genie AI
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">Get personalized guidance</p>
                </div>
              </div>
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="start" className="mt-0">
          <CardContent className="space-y-6">
            <div className="text-center py-4">
              <h3 className="text-xl font-medium mb-2">Ready to Begin?</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You can either continue with the guided journey or skip to explore the platform right away.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Guided Journey</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Complete each step of the transformation process with guidance along the way.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleContinue} className="w-full">
                    Continue Journey <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-background">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Explore First</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Skip the guided journey for now and explore the platform at your own pace.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSkip} variant="outline" className="w-full">
                    Skip to Dashboard
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> You can always return to complete any skipped steps from your dashboard.
              </p>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>

      <CardFooter className="flex justify-between border-t p-6">
        {activeTab !== "overview" && (
          <Button
            variant="outline"
            onClick={() => {
              const tabs = ["overview", "benefits", "journey", "start"]
              const currentIndex = tabs.indexOf(activeTab)
              setActiveTab(tabs[currentIndex - 1])
            }}
          >
            Back
          </Button>
        )}

        {activeTab !== "start" ? (
          <Button
            className={activeTab === "overview" ? "ml-auto" : ""}
            onClick={() => {
              const tabs = ["overview", "benefits", "journey", "start"]
              const currentIndex = tabs.indexOf(activeTab)
              setActiveTab(tabs[currentIndex + 1])
            }}
          >
            Next
          </Button>
        ) : (
          <div></div>
        )}
      </CardFooter>
    </Card>
  )
}
