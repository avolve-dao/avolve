"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useUser } from "@/contexts/user-context"
import { TourButton } from "@/components/tour/tour-button"
import { FeatureTour } from "@/components/tour/feature-tour"
import { useTour, type TourStep } from "@/contexts/tour-context"
import { ArrowRight, Trophy, Users, Sparkles, BarChart } from "lucide-react"
import { ResponsiveContainer } from "@/components/layout/responsive-container"
import { PageHeader } from "@/components/page-header"

// Import your existing dashboard components
import { TransformationSummary } from "@/components/dashboard/transformation-summary"
import { ValueMetrics } from "@/components/dashboard/value-metrics"
import { ChallengesList } from "@/components/challenges-list"

// Feature-specific tour steps
const challengesTourSteps: TourStep[] = [
  {
    id: "challenges-intro",
    title: "Value Creation Challenges",
    content: "Challenges help you develop your value creation skills and earn GEN tokens.",
    target: "[data-tour='challenges-section']",
    position: "top",
  },
  {
    id: "challenge-difficulty",
    title: "Challenge Difficulty",
    content: "Challenges are categorized by difficulty. Start with beginner challenges and work your way up.",
    target: "[data-tour='challenge-difficulty']",
    position: "bottom",
  },
  {
    id: "challenge-rewards",
    title: "Challenge Rewards",
    content: "Each challenge offers GEN token rewards. The more difficult the challenge, the greater the reward.",
    target: "[data-tour='challenge-rewards']",
    position: "left",
  },
  {
    id: "challenge-completion",
    title: "Completing Challenges",
    content: "Click on a challenge to view details and mark it as complete when you've finished it.",
    target: "[data-tour='challenge-card']",
    position: "bottom",
  },
]

export default function DashboardPage() {
  const { user, profile, transformationProgress } = useUser()
  const { isOpen } = useTour()

  if (!user) {
    return null // Handle loading or redirect
  }

  return (
    <ResponsiveContainer>
      <div className="py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <PageHeader
            title="Dashboard"
            description={`Welcome back, ${profile?.full_name || user.email?.split("@")[0] || "User"}`}
            className="mb-0"
          />
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <TourButton showText />
            <Button>
              View Progress <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full sm:w-auto flex flex-wrap">
            <TabsTrigger value="overview" className="flex-1 sm:flex-initial">
              Overview
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex-1 sm:flex-initial">
              Challenges
            </TabsTrigger>
            <TabsTrigger value="community" className="flex-1 sm:flex-initial">
              Community
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex-1 sm:flex-initial">
              Metrics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <TransformationSummary />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Recent Challenges</CardTitle>
                    <FeatureTour steps={challengesTourSteps} buttonText="Learn about challenges" />
                  </div>
                  <CardDescription>Your latest value creation opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div data-tour="challenges-section" className="space-y-4">
                    <ChallengesList limit={3} />
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href="/challenges">
                        View All Challenges <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Community Activity</CardTitle>
                  <CardDescription>See what others are creating</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Placeholder for community activity */}
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Sarah completed "Create Daily Value"</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Trophy className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Michael earned 50 GEN tokens</p>
                        <p className="text-xs text-muted-foreground">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Alex unlocked Genie AI</p>
                        <p className="text-xs text-muted-foreground">Yesterday</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Value Creation Metrics</CardTitle>
                  <Button variant="ghost" size="sm">
                    <BarChart className="h-4 w-4 mr-2" /> View Details
                  </Button>
                </div>
                <CardDescription>Track your progress as a value creator</CardDescription>
              </CardHeader>
              <CardContent>
                <ValueMetrics />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="challenges">
            <Card>
              <CardHeader>
                <CardTitle>Value Creation Challenges</CardTitle>
                <CardDescription>Complete challenges to earn GEN tokens and develop your skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div data-tour="challenges-section" className="space-y-6">
                  <div className="flex flex-wrap gap-2" data-tour="challenge-difficulty">
                    <Button variant="outline" size="sm" className="rounded-full">
                      All Challenges
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full">
                      Beginner
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full">
                      Intermediate
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full">
                      Advanced
                    </Button>
                  </div>

                  <ChallengesList />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community">
            <Card>
              <CardHeader>
                <CardTitle>Community Activity</CardTitle>
                <CardDescription>Connect with other value creators</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Community content would go here */}
                <p>Community features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <CardTitle>Value Creation Metrics</CardTitle>
                <CardDescription>Track your progress over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ValueMetrics detailed />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveContainer>
  )
}
