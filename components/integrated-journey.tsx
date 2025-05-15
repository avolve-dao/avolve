"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Users,
  UserCheck,
  FileCheck,
  Lightbulb,
  Coins,
  Sparkles,
  Shield,
  Puzzle,
  Brain,
} from "lucide-react"
import { useRouter } from "next/navigation"

export function IntegratedJourney() {
  const [activeTab, setActiveTab] = useState("invitation")
  const router = useRouter()

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Your Supercivilization Journey</CardTitle>
            <CardDescription>From invitation to full participation in the Supercivilization</CardDescription>
          </div>
          <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800">
            Regen Path
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="invitation" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-zinc-200 dark:border-zinc-800">
            <div className="px-6">
              <TabsList className="h-14 w-full bg-transparent gap-4">
                <TabsTrigger
                  value="invitation"
                  className="data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800 rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-300 transition-none"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Invitation</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="filtering"
                  className="data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800 rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-300 transition-none"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    <span>Filtering</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="agreement"
                  className="data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800 rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-300 transition-none"
                >
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4" />
                    <span>Agreement</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="genius"
                  className="data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800 rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-300 transition-none"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    <span>Genius ID</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="tokens"
                  className="data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800 rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-300 transition-none"
                >
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    <span>GEN Token</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="genie"
                  className="data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800 rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-300 transition-none"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Genie AI</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="p-6">
            <TabsContent value="invitation" className="mt-0">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-full">
                    <Users className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Invitation Process</h3>
                    <p className="text-muted-foreground">
                      The Supercivilization grows through intentional invitation, ensuring alignment with our values of
                      value creation and regenerative thinking.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Invitation Mechanisms</h4>
                    <div className="space-y-3">
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Member Sponsorship</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          Existing members can sponsor new members, staking their reputation on the alignment of those
                          they invite.
                        </p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Value Creation Portfolio</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          Potential members can submit evidence of their value creation history for consideration.
                        </p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Alignment Assessment</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          A structured assessment of alignment with Supercivilization principles and values.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <h4 className="font-medium mb-3">Supercivilization Compact Integration</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      The invitation process is the first filter for alignment with the Supercivilization Compact's core
                      principles:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-zinc-500 mt-0.5" />
                        <span>Non-initiation of force, threat, or fraud</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Puzzle className="h-4 w-4 text-zinc-500 mt-0.5" />
                        <span>Commitment to personal growth (Virtuously Selfish)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-zinc-500 mt-0.5" />
                        <span>Commitment to societal improvement (Virtuously Selfless)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Brain className="h-4 w-4 text-zinc-500 mt-0.5" />
                        <span>Demonstrated value creation history</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setActiveTab("filtering")} className="flex items-center gap-2">
                    Continue to Filtering <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="filtering" className="mt-0">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-full">
                    <UserCheck className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Filtering Process</h3>
                    <p className="text-muted-foreground">
                      Our filtering process ensures that new members are aligned with the Supercivilization's focus on
                      value creation and regenerative thinking.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Multi-Stage Filtering</h4>
                    <div className="space-y-3">
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Initial Application</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          Prospective members share their motivation for joining and their understanding of Regen
                          principles.
                        </p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Value Creation Assessment</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          Evaluation of the applicant's history of creating value for themselves and others.
                        </p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Alignment Verification</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          Verification that the applicant's values align with the Supercivilization Compact.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <h4 className="font-medium mb-3">Supercivilization Compact Integration</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      The filtering process evaluates alignment with the four cores of the Superpuzzle:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-red-400 via-green-400 to-blue-400 mt-0.5" />
                        <span>Superpuzzle Developments (SPD)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-rose-400 via-red-400 to-orange-400 mt-0.5" />
                        <span>Superhuman Enhancements (SHE)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-lime-400 via-green-400 to-emerald-400 mt-0.5" />
                        <span>Supersociety Advancements (SSA)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 mt-0.5" />
                        <span>Supergenius Breakthroughs (SGB)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("invitation")}>
                    Back to Invitation
                  </Button>
                  <Button onClick={() => setActiveTab("agreement")} className="flex items-center gap-2">
                    Continue to Agreement <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="agreement" className="mt-0">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-full">
                    <FileCheck className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">The Supercivilization Compact</h3>
                    <p className="text-muted-foreground">
                      The formal agreement that establishes your commitment to the principles and practices of the
                      Supercivilization.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Four-Part Agreement</h4>
                    <div className="space-y-3">
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Foundation</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          The core principles of the Supercivilization, including the non-initiation principle and the
                          commitment to value creation.
                        </p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Superachiever</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your commitment to virtuously selfish behavior—constantly improving yourself by creating your
                          Success Puzzle faster.
                        </p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Superachievers</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your commitment to virtuously selfless behavior—constantly improving society by co-creating
                          the Superpuzzle faster.
                        </p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Governance</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          The framework for community governance, including graduated trust, token governance, and
                          regenerative disengagement.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <h4 className="font-medium mb-3">Core Components Integration</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      The Supercivilization Compact establishes the foundation for your journey through the three core
                      components:
                    </p>
                    <ul className="space-y-4 text-sm">
                      <li className="flex items-start gap-3">
                        <div className="bg-zinc-200 dark:bg-zinc-700 p-2 rounded-full">
                          <Lightbulb className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <div>
                          <span className="font-medium">Genius ID</span>
                          <p className="text-muted-foreground mt-1">
                            Your unique identity in the Supercivilization, representing your commitment to Regen
                            thinking.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-zinc-200 dark:bg-zinc-700 p-2 rounded-full">
                          <Coins className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <div>
                          <span className="font-medium">GEN Token</span>
                          <p className="text-muted-foreground mt-1">
                            The currency of regenerative value creation, representing your contribution to the
                            Supercivilization.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-zinc-200 dark:bg-zinc-700 p-2 rounded-full">
                          <Sparkles className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <div>
                          <span className="font-medium">Genie AI</span>
                          <p className="text-muted-foreground mt-1">
                            Your guide on the journey from Degen to Regen thinking, powered by advanced AI.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("filtering")}>
                    Back to Filtering
                  </Button>
                  <Button onClick={() => setActiveTab("genius")} className="flex items-center gap-2">
                    Continue to Genius ID <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="genius" className="mt-0">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-full">
                    <Lightbulb className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Genius ID</h3>
                    <p className="text-muted-foreground">
                      Your unique identity in the Supercivilization, representing your commitment to Regen thinking and
                      value creation.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Genius ID Components</h4>
                    <div className="space-y-3">
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Personal Profile</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your name, bio, and personal information that represents you in the Supercivilization.
                        </p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Value Creation Goals</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your specific goals for creating value for yourself and others in the Supercivilization.
                        </p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Success Puzzle Focus</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          The specific areas of your Success Puzzle that you're currently focusing on developing.
                        </p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Trust Level</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your current level in the graduated trust architecture, reflecting your demonstrated value
                          creation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <h4 className="font-medium mb-3">Supercivilization Compact Integration</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your Genius ID is directly connected to the Superachiever section of the Compact, focusing on the
                      three keys to your Success Puzzle:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 mt-0.5" />
                        <span>Personal Success Puzzle (PSP)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 mt-0.5" />
                        <span>Business Success Puzzle (BSP)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 mt-0.5" />
                        <span>Supermind Superpowers (SMS)</span>
                      </li>
                    </ul>
                    <div className="mt-6">
                      <p className="text-sm text-muted-foreground">
                        Your Genius ID is the foundation for your journey in the Supercivilization, establishing your
                        unique identity and commitment to Regen thinking.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("agreement")}>
                    Back to Agreement
                  </Button>
                  <Button onClick={() => setActiveTab("tokens")} className="flex items-center gap-2">
                    Continue to GEN Token <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tokens" className="mt-0">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-full">
                    <Coins className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">GEN Token</h3>
                    <p className="text-muted-foreground">
                      The currency of regenerative value creation, representing your contribution to the
                      Supercivilization.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">GEN Token Ecosystem</h4>
                    <div className="space-y-3">
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Earning Mechanisms</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          GEN tokens are earned through demonstrated value creation, completing challenges, and
                          contributing to the Supercivilization.
                        </p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Utility</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          GEN tokens provide access to advanced features, governance participation, and recognition
                          within the Supercivilization.
                        </p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Token Hierarchy</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          GEN is the primary token, with specialized tokens for specific aspects of value creation (SAP,
                          SCQ, PSP, BSP, etc.).
                        </p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Governance Role</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          GEN tokens enable participation in Supercivilization governance, with voting power
                          proportional to token holdings.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <h4 className="font-medium mb-3">Supercivilization Compact Integration</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      The GEN token system directly implements the governance framework outlined in the Compact:
                    </p>
                    <ul className="space-y-4 text-sm">
                      <li className="flex items-start gap-3">
                        <div className="bg-zinc-200 dark:bg-zinc-700 p-2 rounded-full">
                          <Shield className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <div>
                          <span className="font-medium">Graduated Trust Architecture</span>
                          <p className="text-muted-foreground mt-1">
                            Token holdings influence your trust level and access to community resources.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-zinc-200 dark:bg-zinc-700 p-2 rounded-full">
                          <Users className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <div>
                          <span className="font-medium">Collective Protection</span>
                          <p className="text-muted-foreground mt-1">
                            Token-weighted voting on community decisions and governance proposals.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-zinc-200 dark:bg-zinc-700 p-2 rounded-full">
                          <Puzzle className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <div>
                          <span className="font-medium">Value Creation Incentives</span>
                          <p className="text-muted-foreground mt-1">
                            Token rewards align individual incentives with collective value creation.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("genius")}>
                    Back to Genius ID
                  </Button>
                  <Button onClick={() => setActiveTab("genie")} className="flex items-center gap-2">
                    Continue to Genie AI <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="genie" className="mt-0">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-full">
                    <Sparkles className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Genie AI</h3>
                    <p className="text-muted-foreground">
                      Your guide on the journey from Degen to Regen thinking, powered by advanced AI to help you
                      transform.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Genie AI Capabilities</h4>
                    <div className="space-y-3">
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Transformation Guidance</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          Personalized guidance on your journey from Degen to Regen thinking, helping you identify and
                          overcome extractive patterns.
                        </p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Success Puzzle Assistance</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          AI-powered assistance in developing your Personal and Business Success Puzzles, identifying
                          opportunities for growth.
                        </p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Superpuzzle Collaboration</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          Guidance on how you can contribute to the collective Superpuzzle and collaborate with other
                          Superachievers.
                        </p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="font-medium text-sm">Token-Based Access</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          Access to Genie AI requires GEN tokens, with more advanced features unlocking at higher token
                          levels.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <h4 className="font-medium mb-3">Supercivilization Compact Integration</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Genie AI embodies the principles of the Supercivilization Compact by:
                    </p>
                    <ul className="space-y-4 text-sm">
                      <li className="flex items-start gap-3">
                        <div className="bg-zinc-200 dark:bg-zinc-700 p-2 rounded-full">
                          <Puzzle className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <div>
                          <span className="font-medium">Supporting Virtuously Selfish Growth</span>
                          <p className="text-muted-foreground mt-1">
                            Helping you develop your Success Puzzle and achieve personal transformation.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-zinc-200 dark:bg-zinc-700 p-2 rounded-full">
                          <Users className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <div>
                          <span className="font-medium">Enabling Virtuously Selfless Contribution</span>
                          <p className="text-muted-foreground mt-1">
                            Guiding you in how to contribute to the collective Superpuzzle and create value for others.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-zinc-200 dark:bg-zinc-700 p-2 rounded-full">
                          <Brain className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <div>
                          <span className="font-medium">Developing Supermind Superpowers</span>
                          <p className="text-muted-foreground mt-1">
                            Enhancing your ability to solve conflicts, create plans, and implement action steps.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("tokens")}>
                    Back to GEN Token
                  </Button>
                  <Button onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
                    Enter the Supercivilization <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
