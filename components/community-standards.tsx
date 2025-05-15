"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowRight, Shield, Lightbulb, Sparkles, Zap, Users, Lock } from "lucide-react"
import { motion } from "framer-motion"

export function CommunityStandards() {
  const [activeTab, setActiveTab] = useState("principles")

  return (
    <Card className="w-full max-w-4xl mx-auto border-zinc-300 dark:border-zinc-700">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/30 border-b border-amber-200 dark:border-amber-800/50">
        <CardTitle className="text-2xl">Supercivilization Community Standards</CardTitle>
        <CardDescription>How we create and maintain an environment for maximum value creation</CardDescription>
      </CardHeader>

      <Tabs defaultValue="principles" value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6 pt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="principles">Value Creation</TabsTrigger>
            <TabsTrigger value="boundaries">Community Boundaries</TabsTrigger>
            <TabsTrigger value="trust">Trust Architecture</TabsTrigger>
            <TabsTrigger value="protection">Collective Protection</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-6">
          <TabsContent value="principles">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-amber-600 dark:text-amber-400">Value Creation Principles</h3>
                    <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                      The Supercivilization is built on the understanding that the purpose of human life is to prosper
                      and live happily through value production and creation. These principles guide our community.
                    </p>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">The Essence of Value Creation</h3>
                    <p className="text-muted-foreground">
                      Value creation is the process of generating new or improved resources, products, services, or
                      experiences that enhance human life and prosperity. In the Supercivilization, we recognize two
                      primary forms of value creation:
                    </p>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-600 dark:text-blue-400">Value Production</h4>
                        <p className="text-sm text-blue-600/80 dark:text-blue-400/80 mt-2">
                          Improving existing values through refinement, optimization, and enhancement. Value producers
                          take what exists and make it better, more efficient, or more accessible.
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
                        <h4 className="font-medium text-purple-600 dark:text-purple-400">Value Creation</h4>
                        <p className="text-sm text-purple-600/80 dark:text-purple-400/80 mt-2">
                          Generating entirely new values that didn't previously exist. Value creators innovate, invent,
                          and bring novel solutions to human challenges and opportunities.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Positive-Sum Interactions</h3>
                    <p className="text-muted-foreground">
                      The Supercivilization is committed to positive-sum interactions, where all parties benefit from
                      exchanges and collaborations. We recognize that the greatest value creation occurs when:
                    </p>

                    <ul className="mt-2 space-y-2">
                      <li className="flex items-start gap-2">
                        <Zap className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Voluntary exchanges occur without coercion or deception</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Collaboration amplifies individual capabilities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Knowledge and resources are shared to accelerate collective advancement</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Competition drives innovation rather than destruction</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">The Path of Honesty and Effort</h3>
                    <p className="text-muted-foreground">
                      We acknowledge that honesty and effort lift us to producing and creating values, bringing us into
                      harmony with our essence and enabling us to live happily. Conversely, laziness and dishonesty
                      block this path and prevent us from achieving our purpose.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">The Power of Collective Advancement</h3>
                    <p className="text-muted-foreground">
                      By uniting value creators in a supportive ecosystem, we can go further, faster, forever, together.
                      The Supercivilization exists to amplify the impact of those committed to creating and improving
                      values.
                    </p>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("boundaries")} className="flex items-center gap-2">
                  Continue to Community Boundaries <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="boundaries">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-600 dark:text-blue-400">Community Boundaries</h3>
                    <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                      Boundaries create the conditions for maximum value creation. They are not restrictions but
                      foundations that enable all members to thrive and contribute their best.
                    </p>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">The Prime Law: Our Foundational Boundary</h3>
                    <p className="text-muted-foreground">
                      The Prime Law establishes that no person or group shall initiate force, threat of force, or fraud
                      against any individual's self, property, or contracts. This boundary is non-negotiable and creates
                      the foundation for all value creation.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Value-Creating vs. Value-Destroying Behaviors</h3>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                        <h4 className="font-medium text-green-600 dark:text-green-400">Value-Creating Behaviors</h4>
                        <ul className="text-sm text-green-600/80 dark:text-green-400/80 mt-2 space-y-1">
                          <li>• Voluntary exchange and collaboration</li>
                          <li>• Honest communication and feedback</li>
                          <li>• Knowledge sharing and mentorship</li>
                          <li>• Innovation and problem-solving</li>
                          <li>• Conflict resolution through dialogue</li>
                          <li>• Respecting others' autonomy and property</li>
                        </ul>
                      </div>

                      <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
                        <h4 className="font-medium text-red-600 dark:text-red-400">Value-Destroying Behaviors</h4>
                        <ul className="text-sm text-red-600/80 dark:text-red-400/80 mt-2 space-y-1">
                          <li>• Initiating force against others</li>
                          <li>• Threatening or coercing others</li>
                          <li>• Engaging in fraud or deception</li>
                          <li>• Violating agreements or contracts</li>
                          <li>• Deliberately harming others' property</li>
                          <li>• Persistent disruption of community function</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Boundaries as Value Creation</h3>
                    <p className="text-muted-foreground">
                      In the Supercivilization, we view boundary maintenance as a form of value creation rather than
                      restriction. By creating and maintaining clear boundaries, we:
                    </p>

                    <ul className="mt-2 space-y-2">
                      <li className="flex items-start gap-2">
                        <Zap className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Create an environment of psychological safety where innovation can flourish</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Reduce friction and transaction costs in community interactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Establish clear expectations that enable deeper collaboration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Protect the community's accumulated social and intellectual capital</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Regenerative Disengagement</h3>
                    <p className="text-muted-foreground">
                      When community members persistently engage in value-destroying behaviors, we practice regenerative
                      disengagement—a process designed to protect the community while preserving dignity and creating
                      opportunities for growth.
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">1. Education and Awareness</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          When boundary violations occur, our first response is education about the impact of the
                          behavior and how it affects value creation in the community.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">2. Guided Reflection</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          For repeated violations, we implement a guided reflection process to help members understand
                          the patterns in their behavior and develop strategies for change.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">3. Temporary Disengagement</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          When necessary, we implement temporary disengagement periods ("cooling off") with clear
                          conditions for re-engagement based on demonstrated behavior change.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">4. Permanent Disengagement</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          As a last resort for persistent, severe violations, we may implement permanent disengagement
                          to protect the community's value-creating capacity.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("principles")}>
                  Back to Value Creation
                </Button>
                <Button onClick={() => setActiveTab("trust")} className="flex items-center gap-2">
                  Continue to Trust Architecture <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="trust">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-purple-600 dark:text-purple-400">Trust Architecture</h3>
                    <p className="text-sm text-purple-600/80 dark:text-purple-400/80">
                      The Supercivilization employs a graduated trust architecture where access to community resources
                      increases with demonstrated alignment with value-creating principles.
                    </p>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Graduated Trust Levels</h3>
                    <p className="text-muted-foreground">
                      Trust in the Supercivilization is earned through demonstrated behavior rather than declarations or
                      credentials. Our graduated trust system creates natural protection while encouraging growth.
                    </p>

                    <div className="mt-4 space-y-4">
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border-l-4 border-zinc-300 dark:border-zinc-700">
                        <h4 className="font-medium">Level 1: Explorer</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          New members begin as Explorers with access to basic community resources and learning
                          materials. This level allows members to understand community values and demonstrate initial
                          alignment.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border-l-4 border-blue-300 dark:border-blue-700">
                        <h4 className="font-medium">Level 2: Contributor</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Members who consistently demonstrate value-creating behaviors advance to Contributors. This
                          level grants access to collaboration opportunities and more community resources.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border-l-4 border-purple-300 dark:border-purple-700">
                        <h4 className="font-medium">Level 3: Builder</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Members who have established a track record of significant value creation become Builders.
                          This level includes invitation privileges and access to advanced community resources.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border-l-4 border-amber-300 dark:border-amber-700">
                        <h4 className="font-medium">Level 4: Steward</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Members who demonstrate exceptional value creation and alignment with community principles
                          become Stewards. This level includes governance participation and mentorship responsibilities.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Trust Advancement Criteria</h3>
                    <p className="text-muted-foreground">
                      Advancement through trust levels is based on demonstrated behaviors rather than time or status.
                      Key criteria include:
                    </p>

                    <ul className="mt-2 space-y-2">
                      <li className="flex items-start gap-2">
                        <Zap className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span>Consistent demonstration of value-creating behaviors</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span>Positive reputation among existing community members</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span>Completion of specific value-creation challenges</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span>Contribution to community knowledge and resources</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Trust Recalibration</h3>
                    <p className="text-muted-foreground">
                      Trust levels are not permanent entitlements but reflect ongoing behavior. The Supercivilization
                      employs trust recalibration mechanisms to ensure alignment:
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">Regular Review</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Trust levels are periodically reviewed based on recent behavior and contributions.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">Peer Feedback</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Community members provide structured feedback on others' value-creating behaviors.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">Trust Adjustment</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Trust levels may be adjusted based on demonstrated behavior, with clear communication about
                          reasons.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Transformation Pathways</h3>
                    <p className="text-muted-foreground">
                      The Supercivilization provides explicit pathways for members to transform their thinking and
                      behavior:
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">Mentorship Programs</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Pairing members with mentors who exemplify value-creating behaviors.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">Structured Learning</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Educational resources on value creation principles and practices.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">Practice Opportunities</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Structured challenges that allow members to practice and demonstrate value creation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("boundaries")}>
                  Back to Community Boundaries
                </Button>
                <Button onClick={() => setActiveTab("protection")} className="flex items-center gap-2">
                  Continue to Collective Protection <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="protection">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-green-600 dark:text-green-400">Collective Protection</h3>
                    <p className="text-sm text-green-600/80 dark:text-green-400/80">
                      The Supercivilization distributes the responsibility for community protection across members,
                      creating resilient systems that maintain integrity without centralizing coercive power.
                    </p>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Reputation Systems</h3>
                    <p className="text-muted-foreground">
                      The Supercivilization employs reputation systems that reflect demonstrated value creation and
                      alignment with community principles:
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">Multi-Dimensional Reputation</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Reputation is tracked across multiple dimensions including value creation, collaboration,
                          knowledge sharing, and community contribution.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">Contextual Reputation</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Reputation is context-specific, recognizing that members may excel in different domains of
                          value creation.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">Transparent Criteria</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Reputation criteria are explicit and transparent, allowing members to understand how their
                          actions affect their standing.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Invitation System</h3>
                    <p className="text-muted-foreground">
                      The Supercivilization uses an invitation system where members stake their reputation on those they
                      invite:
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">Reputation Staking</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          When inviting new members, existing members stake a portion of their reputation on the
                          invitee's alignment with community values.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">Graduated Invitation Rights</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          The ability to invite new members is tied to trust level, with higher levels able to issue
                          more invitations.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">Invitation Outcomes</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          The behavior of invited members affects the inviter's reputation, creating natural incentives
                          for careful invitation decisions.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Dispute Resolution</h3>
                    <p className="text-muted-foreground">
                      The Supercivilization employs a multi-tiered dispute resolution system that emphasizes restoration
                      and value creation:
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">Direct Resolution</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Members are encouraged to resolve disputes directly through honest communication and mutual
                          understanding.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">Facilitated Mediation</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          When direct resolution is unsuccessful, trusted community members facilitate mediation to find
                          mutually beneficial solutions.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">Community Arbitration</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          For complex disputes, a panel of respected community members provides binding arbitration
                          based on community principles.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Collective Decision-Making</h3>
                    <p className="text-muted-foreground">
                      The Supercivilization employs collective decision-making processes for community protection:
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">Graduated Voting Rights</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Voting rights on community decisions increase with trust level, reflecting demonstrated
                          alignment with community values.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">Transparent Processes</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Decision-making processes are transparent and documented, allowing all members to understand
                          how decisions are made.
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                        <h4 className="font-medium">Principle-Based Decisions</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Decisions are evaluated based on their alignment with community principles and their potential
                          to create value.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("trust")}>
                  Back to Trust Architecture
                </Button>
                <Button variant="default" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Join the Supercivilization
                </Button>
              </div>
            </motion.div>
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="h-4 w-4" /> Creating the conditions for maximum value creation
            </span>
          </div>
          <div className="text-sm text-muted-foreground">Version 1.0 • {new Date().toLocaleDateString()}</div>
        </div>
      </CardFooter>
    </Card>
  )
}
