"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowRight,
  Shield,
  Sparkles,
  Scale,
  Users,
  Briefcase,
  Brain,
  Globe,
  Rocket,
  Gem,
  Award,
  Puzzle,
} from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function SupercivilizationAgreement() {
  const [agreements, setAgreements] = useState({
    superachieverCommitment: false,
    superachieversCommitment: false,
    nonInitiation: false,
    valueCreation: false,
    personalResponsibility: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("foundation")
  const router = useRouter()
  const supabase = createClient()

  const allAgreed = Object.values(agreements).every((value) => value === true)

  const handleAgreementChange = (key: keyof typeof agreements) => {
    setAgreements((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSubmit = async () => {
    if (!allAgreed) return

    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Update user profile with agreement timestamp
        await supabase.from("profiles").upsert({
          id: user.id,
          has_agreed_to_terms: true,
          agreement_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        // Redirect to the first unlock step
        router.push("/unlock/genius-id")
      }
    } catch (error) {
      console.error("Error saving agreement:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto border-zinc-300 dark:border-zinc-700">
      <CardHeader className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-950/40 dark:to-zinc-900/30 border-b border-zinc-200 dark:border-zinc-800/50">
        <CardTitle className="text-2xl">The Supercivilization Compact</CardTitle>
        <CardDescription>
          Avolve from Degen to Regen: A commitment to value creation and collective advancement
        </CardDescription>
      </CardHeader>

      <Tabs defaultValue="foundation" value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6 pt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="foundation">Foundation</TabsTrigger>
            <TabsTrigger value="superachiever">Superachiever</TabsTrigger>
            <TabsTrigger value="superachievers">Superachievers</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-6">
          <TabsContent value="foundation">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-zinc-600 dark:text-zinc-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-zinc-600 dark:text-zinc-400">The Supercivilization Foundation</h3>
                    <p className="text-sm text-zinc-600/80 dark:text-zinc-400/80">
                      The Supercivilization is built on the understanding that human flourishing comes through value
                      creation and non-initiation of force. These principles guide our community.
                    </p>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">One Focus: Supercivilization</h3>
                    <p className="text-muted-foreground">
                      The Supercivilization represents our collective commitment to avolve from Degen to Regen thinking
                      and behavior. It is the environment where value creators thrive, collaborate, and accelerate human
                      progress.
                    </p>

                    <div className="mt-4 bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Gem className="h-5 w-5 text-zinc-500" />
                        <h4 className="font-medium">GEN Token: The Currency of Regenerative Value</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        GEN tokens represent your regenerative potential and the value you create in the
                        Supercivilization. They are earned through demonstrated value creation and used for governance
                        participation.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Two Views: Superachiever & Superachievers</h3>
                    <p className="text-muted-foreground">
                      The Supercivilization balances two complementary perspectives: the individual Superachiever
                      creating their own Success Puzzle, and the collective Superachievers co-creating the Superpuzzle.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-gradient-to-r from-stone-50 to-stone-100 dark:from-stone-900/50 dark:to-stone-800/30 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Puzzle className="h-5 w-5 text-stone-500" />
                          <h4 className="font-medium">Superachiever</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Create Your Success Puzzle with joy and ease by becoming a greater Superachiever.
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/30 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-slate-500" />
                          <h4 className="font-medium">Superachievers</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Co-Create the Superpuzzle through collective advancement and collaborative value creation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">The Prime Law: Non-Initiation Principle</h3>
                    <p className="text-muted-foreground">
                      The foundation of the Supercivilization is the principle that no person or group shall initiate
                      force, threat of force, or fraud against any individual's self, property, or contracts. This
                      creates the conditions for all to prosper through voluntary exchange and cooperation.
                    </p>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Degen vs. Regen: The Fundamental Distinction</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">
                        <h5 className="font-medium text-red-600 dark:text-red-400">Degen Thinking (Transcended)</h5>
                        <ul className="text-sm text-red-600/80 dark:text-red-400/80 space-y-1 mt-2 list-disc pl-4">
                          <li>Initiates force against others</li>
                          <li>Uses threats to control others</li>
                          <li>Employs fraud to gain advantage</li>
                          <li>Creates zero or negative-sum outcomes</li>
                          <li>Takes value without creating it</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                        <h5 className="font-medium text-green-600 dark:text-green-400">Regen Thinking (Embraced)</h5>
                        <ul className="text-sm text-green-600/80 dark:text-green-400/80 space-y-1 mt-2 list-disc pl-4">
                          <li>Respects others' autonomy</li>
                          <li>Engages in voluntary exchange</li>
                          <li>Practices honesty in all dealings</li>
                          <li>Creates positive-sum outcomes</li>
                          <li>Generates new value for self and others</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("superachiever")} className="flex items-center gap-2">
                  Continue to Superachiever <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="superachiever">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-stone-50 to-stone-100 dark:from-stone-900/50 dark:to-stone-800/30 border border-stone-200 dark:border-stone-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Puzzle className="h-5 w-5 text-stone-600 dark:text-stone-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-stone-600 dark:text-stone-400">
                      Superachiever: Create Your Success Puzzle
                    </h3>
                    <p className="text-sm text-stone-600/80 dark:text-stone-400/80">
                      The virtuously selfish behavior of constantly improving oneself via further creating your Success
                      Puzzle faster as a Superachiever.
                    </p>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Three Keys to Your Success Puzzle</h3>
                    <p className="text-muted-foreground mb-4">
                      As a Superachiever, you focus on three key areas that together form your complete Success Puzzle:
                    </p>

                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-amber-500" />
                          <h4 className="font-medium">Personal Success Puzzle (PSP)</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Enjoy greater personal successes faster via boosting your overall health, wealth, and peace in
                          life.
                        </p>
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className="bg-amber-100/50 dark:bg-amber-900/20 p-2 rounded text-xs text-center">
                            Health & Energy
                          </div>
                          <div className="bg-amber-100/50 dark:bg-amber-900/20 p-2 rounded text-xs text-center">
                            Wealth & Career
                          </div>
                          <div className="bg-amber-100/50 dark:bg-amber-900/20 p-2 rounded text-xs text-center">
                            Peace & People
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-teal-500" />
                          <h4 className="font-medium">Business Success Puzzle (BSP)</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Enjoy greater business successes faster by enhancing your network and advancing your net
                          worth.
                        </p>
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className="bg-teal-100/50 dark:bg-teal-900/20 p-2 rounded text-xs text-center">
                            Front-Stage Users
                          </div>
                          <div className="bg-teal-100/50 dark:bg-teal-900/20 p-2 rounded text-xs text-center">
                            Back-Stage Admin
                          </div>
                          <div className="bg-teal-100/50 dark:bg-teal-900/20 p-2 rounded text-xs text-center">
                            Bottom-Line Profit
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-violet-50 via-fuchsia-50 to-pink-50 dark:from-violet-900/30 dark:via-fuchsia-900/30 dark:to-pink-900/30 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-violet-500" />
                          <h4 className="font-medium">Supermind Superpowers (SMS)</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Improve your ability to solve a conflict, create a plan for the future & implement your action
                          plan.
                        </p>
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className="bg-violet-100/50 dark:bg-violet-900/20 p-2 rounded text-xs text-center">
                            Current → Desired
                          </div>
                          <div className="bg-fuchsia-100/50 dark:bg-fuchsia-900/20 p-2 rounded text-xs text-center">
                            Desired → Actions
                          </div>
                          <div className="bg-pink-100/50 dark:bg-pink-900/20 p-2 rounded text-xs text-center">
                            Actions → Results
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Virtuous Selfishness</h3>
                    <p className="text-muted-foreground">
                      In the Supercivilization, we recognize that virtuous selfishness—the pursuit of your own growth
                      and prosperity through value creation—is essential to your ability to contribute to the
                      collective. By becoming a greater Superachiever, you enhance your capacity to participate in the
                      Supercivilization.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Superachiever Commitments</h3>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="superachieverCommitment"
                        checked={agreements.superachieverCommitment}
                        onCheckedChange={() => handleAgreementChange("superachieverCommitment")}
                      />
                      <div className="grid gap-1.5">
                        <label
                          htmlFor="superachieverCommitment"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Superachiever Commitment
                        </label>
                        <p className="text-sm text-muted-foreground">
                          I commit to constantly improving myself in a virtuously selfish way by creating my Success
                          Puzzle faster. I recognize that my personal and business growth enhances my capacity to create
                          value for myself and others.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="valueCreation"
                        checked={agreements.valueCreation}
                        onCheckedChange={() => handleAgreementChange("valueCreation")}
                      />
                      <div className="grid gap-1.5">
                        <label
                          htmlFor="valueCreation"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Value Creation Commitment
                        </label>
                        <p className="text-sm text-muted-foreground">
                          I commit to consistently producing and creating values that enhance human life and prosperity.
                          I recognize that I am already on this path and seek to accelerate my journey through the
                          Supercivilization.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("foundation")}>
                  Back to Foundation
                </Button>
                <Button
                  onClick={() => setActiveTab("superachievers")}
                  disabled={!agreements.superachieverCommitment || !agreements.valueCreation}
                  className="flex items-center gap-2"
                >
                  Continue to Superachievers <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="superachievers">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-slate-600 dark:text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-slate-600 dark:text-slate-400">
                      Superachievers: Co-Create the Superpuzzle
                    </h3>
                    <p className="text-sm text-slate-600/80 dark:text-slate-400/80">
                      The virtuously selfless behavior of constantly improving society via further co-creating our
                      Superpuzzle faster with Superachievers.
                    </p>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Four Cores of the Superpuzzle</h3>
                    <p className="text-muted-foreground mb-4">
                      As Superachievers, we collectively focus on four core areas that together form the complete
                      Superpuzzle:
                    </p>

                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-red-50 via-green-50 to-blue-50 dark:from-red-900/30 dark:via-green-900/30 dark:to-blue-900/30 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Puzzle className="h-5 w-5 text-red-500" />
                          <h4 className="font-medium">Superpuzzle Developments (SPD)</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Progress our grand Superpuzzle & worldwide drive to ensure wealth, health, & peace in your
                          lifetime.
                        </p>
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className="bg-red-100/50 dark:bg-red-900/20 p-2 rounded text-xs text-center">
                            Enhanced Individuals
                          </div>
                          <div className="bg-green-100/50 dark:bg-green-900/20 p-2 rounded text-xs text-center">
                            Advanced Collectives
                          </div>
                          <div className="bg-blue-100/50 dark:bg-blue-900/20 p-2 rounded text-xs text-center">
                            Balanced Ecosystems
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-rose-50 via-red-50 to-orange-50 dark:from-rose-900/30 dark:via-red-900/30 dark:to-orange-900/30 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-rose-500" />
                          <h4 className="font-medium">Superhuman Enhancements (SHE)</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Free yourself & loved ones via superhuman enhancements that support everyone: child, youth, &
                          adult.
                        </p>
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className="bg-rose-100/50 dark:bg-rose-900/20 p-2 rounded text-xs text-center">
                            Superhuman Academy
                          </div>
                          <div className="bg-red-100/50 dark:bg-red-900/20 p-2 rounded text-xs text-center">
                            Superhuman University
                          </div>
                          <div className="bg-orange-100/50 dark:bg-orange-900/20 p-2 rounded text-xs text-center">
                            Superhuman Institute
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-lime-50 via-green-50 to-emerald-50 dark:from-lime-900/30 dark:via-green-900/30 dark:to-emerald-900/30 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-lime-500" />
                          <h4 className="font-medium">Supersociety Advancements (SSA)</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Free others & everybody via supersociety advancements that help companies, communities, &
                          countries.
                        </p>
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className="bg-lime-100/50 dark:bg-lime-900/20 p-2 rounded text-xs text-center">
                            Supersociety Company
                          </div>
                          <div className="bg-green-100/50 dark:bg-green-900/20 p-2 rounded text-xs text-center">
                            Supersociety Community
                          </div>
                          <div className="bg-emerald-100/50 dark:bg-emerald-900/20 p-2 rounded text-xs text-center">
                            Supersociety Country
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 dark:from-sky-900/30 dark:via-blue-900/30 dark:to-indigo-900/30 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Rocket className="h-5 w-5 text-sky-500" />
                          <h4 className="font-medium">Supergenius Breakthroughs (SGB)</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Solve Superpuzzles via Supergenius Breakthroughs that help grow ventures, enterprises, &
                          industries.
                        </p>
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className="bg-sky-100/50 dark:bg-sky-900/20 p-2 rounded text-xs text-center">
                            Supergenius Ventures
                          </div>
                          <div className="bg-blue-100/50 dark:bg-blue-900/20 p-2 rounded text-xs text-center">
                            Supergenius Enterprises
                          </div>
                          <div className="bg-indigo-100/50 dark:bg-indigo-900/20 p-2 rounded text-xs text-center">
                            Supergenius Industries
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Virtuous Selflessness</h3>
                    <p className="text-muted-foreground">
                      In the Supercivilization, we recognize that virtuous selflessness—contributing to collective
                      advancement through value creation—accelerates our progress. By collaborating with other
                      Superachievers, we can go further, faster, forever, together.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Superachievers Commitments</h3>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="superachieversCommitment"
                        checked={agreements.superachieversCommitment}
                        onCheckedChange={() => handleAgreementChange("superachieversCommitment")}
                      />
                      <div className="grid gap-1.5">
                        <label
                          htmlFor="superachieversCommitment"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Superachievers Commitment
                        </label>
                        <p className="text-sm text-muted-foreground">
                          I commit to constantly improving society in a virtuously selfless way by co-creating our
                          Superpuzzle faster with other Superachievers. I recognize that collective advancement
                          accelerates individual progress.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="nonInitiation"
                        checked={agreements.nonInitiation}
                        onCheckedChange={() => handleAgreementChange("nonInitiation")}
                      />
                      <div className="grid gap-1.5">
                        <label
                          htmlFor="nonInitiation"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Non-Initiation Commitment
                        </label>
                        <p className="text-sm text-muted-foreground">
                          I commit to never initiate force, threat of force, or fraud against any individual's self,
                          property, or contracts. I understand that force is justified only for protection from those
                          who violate this principle.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("superachiever")}>
                  Back to Superachiever
                </Button>
                <Button
                  onClick={() => setActiveTab("governance")}
                  disabled={!agreements.superachieversCommitment || !agreements.nonInitiation}
                  className="flex items-center gap-2"
                >
                  Continue to Governance <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="governance">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Scale className="h-5 w-5 text-zinc-600 dark:text-zinc-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-zinc-600 dark:text-zinc-400">Supercivilization Governance</h3>
                    <p className="text-sm text-zinc-600/80 dark:text-zinc-400/80">
                      The Supercivilization operates under a governance framework designed to protect individual rights
                      while enabling collective advancement.
                    </p>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Graduated Trust Architecture</h3>
                    <p className="text-muted-foreground">
                      The Supercivilization employs a graduated trust architecture where access to community resources
                      increases with demonstrated alignment with value-creating principles.
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border-l-4 border-zinc-300 dark:border-zinc-700">
                        <h4 className="font-medium">Level 1: Explorer</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          New members begin as Explorers with access to basic community resources and learning
                          materials.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border-l-4 border-blue-300 dark:border-blue-700">
                        <h4 className="font-medium">Level 2: Contributor</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Members who consistently demonstrate value-creating behaviors advance to Contributors.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border-l-4 border-purple-300 dark:border-purple-700">
                        <h4 className="font-medium">Level 3: Builder</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Members who have established a track record of significant value creation become Builders.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border-l-4 border-amber-300 dark:border-amber-700">
                        <h4 className="font-medium">Level 4: Steward</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Members who demonstrate exceptional value creation and alignment become Stewards.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Token Governance</h3>
                    <p className="text-muted-foreground">
                      The Supercivilization employs a multi-token system that reflects different aspects of value
                      creation and enables participation in governance:
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">GEN Token (Supercivilization)</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          The primary governance token representing your overall contribution to the Supercivilization.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">SAP Token (Superachiever)</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Represents your personal success puzzle development and individual achievements.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">SCQ Token (Superachievers)</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Represents your contribution to collective quests and the Superpuzzle.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Regenerative Disengagement</h3>
                    <p className="text-muted-foreground">
                      When community members persistently engage in value-destroying behaviors, we practice regenerative
                      disengagement—a process designed to protect the community while preserving dignity:
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">1. Education and Awareness</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Our first response is education about the impact of the behavior on value creation.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">2. Guided Reflection</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          For repeated violations, we implement a guided reflection process to help members understand
                          patterns.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">3. Temporary Disengagement</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          When necessary, we implement temporary disengagement periods with clear conditions for
                          re-engagement.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">4. Permanent Disengagement</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          As a last resort for persistent, severe violations, we may implement permanent disengagement.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Personal Responsibility</h3>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="personalResponsibility"
                        checked={agreements.personalResponsibility}
                        onCheckedChange={() => handleAgreementChange("personalResponsibility")}
                      />
                      <div className="grid gap-1.5">
                        <label
                          htmlFor="personalResponsibility"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Personal Responsibility Commitment
                        </label>
                        <p className="text-sm text-muted-foreground">
                          I commit to taking full responsibility for my actions, growth, and contributions. I understand
                          that my advancement in the Supercivilization depends on my own choices and efforts, not on
                          external circumstances or the actions of others.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("superachievers")}>
                  Back to Superachievers
                </Button>
                <Button onClick={handleSubmit} disabled={!allAgreed || isLoading} className="flex items-center gap-2">
                  {isLoading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      Accept & Join the Supercivilization <Sparkles className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-muted-foreground">
            {allAgreed ? (
              <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                <Shield className="h-4 w-4" /> All commitments acknowledged
              </span>
            ) : (
              <span>Please acknowledge all commitments to continue</span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">Version 1.0 • {new Date().toLocaleDateString()}</div>
        </div>
      </CardFooter>
    </Card>
  )
}
