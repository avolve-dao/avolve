"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowRight, Shield, Lightbulb, Sparkles, Scale, Handshake } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function UserAgreement() {
  const [agreements, setAgreements] = useState({
    valueCreation: false,
    nonInitiation: false,
    honestEffort: false,
    communityContribution: false,
    personalResponsibility: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("principles")
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
      <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/30 border-b border-amber-200 dark:border-amber-800/50">
        <CardTitle className="text-2xl">The Supercivilization Compact</CardTitle>
        <CardDescription>A commitment to value creation, non-initiation, and collective advancement</CardDescription>
      </CardHeader>

      <Tabs defaultValue="principles" value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6 pt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="foundation">The Prime Law</TabsTrigger>
            <TabsTrigger value="personal">Personal Growth</TabsTrigger>
            <TabsTrigger value="societal">Societal Impact</TabsTrigger>
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
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-amber-600 dark:text-amber-400">The Prime Law</h3>
                    <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                      The foundation of the Supercivilization is The Prime Law - the recognition that no person or group
                      shall initiate force, threat of force, or fraud against any individual's self, property, or
                      contracts.
                    </p>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">The Essence of The Prime Law</h3>
                    <p className="text-muted-foreground">
                      The Prime Law establishes the fundamental boundary that enables all value creation: no person or
                      group shall initiate force, threat of force, or fraud against any individual's self, property, or
                      contracts. This law creates the conditions for all to prosper through voluntary exchange and
                      cooperation.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Protection of Self</h3>
                    <p className="text-muted-foreground">
                      Each individual has the right to protect themselves from those who would violate The Prime Law.
                      Force is justified only in defense against those who initiate force, threat of force, or fraud.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">The Boundary Between Degen and Regen</h3>
                    <p className="text-muted-foreground">
                      The Prime Law establishes the clear boundary between Degen thinking (which relies on force,
                      threats, and fraud) and Regen thinking (which relies on voluntary exchange and value creation).
                      This boundary is non-negotiable in the Supercivilization.
                    </p>
                  </div>

                  <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Degen vs. Regen: The Fundamental Distinction</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">
                        <h5 className="font-medium text-red-600 dark:text-red-400">Degen Thinking (Excluded)</h5>
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

                  <div>
                    <h3 className="text-lg font-medium mb-2">Universal Application</h3>
                    <p className="text-muted-foreground">
                      The Prime Law applies equally to all individuals and groups, regardless of size, power, or claimed
                      authority. No exception exists for any person or organization, including governments or
                      corporations.
                    </p>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("personal")} className="flex items-center gap-2">
                  Continue to Personal Growth <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="personal">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-purple-600 dark:text-purple-400">
                      The Prime Pledge: Personal Growth
                    </h3>
                    <p className="text-sm text-purple-600/80 dark:text-purple-400/80">
                      I commit to constantly improving myself in a virtuously selfish way, recognizing that my own
                      growth and prosperity are essential to my ability to create value.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Growth Commitments</h3>

                <div className="space-y-4 mt-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="honestEffort"
                      checked={agreements.honestEffort}
                      onCheckedChange={() => handleAgreementChange("honestEffort")}
                    />
                    <div className="grid gap-1.5">
                      <label
                        htmlFor="honestEffort"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Honest Effort Commitment
                      </label>
                      <p className="text-sm text-muted-foreground">
                        I commit to consistently exert effort and honesty in all my endeavors. I will actively work to
                        remove all forms of laziness and dishonesty from my life, recognizing these as barriers to
                        living in harmony with my essence.
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
                        I commit to consistently producing and creating values that enhance my life and prosperity. I
                        recognize that I am already on this path and seek to accelerate my journey through the
                        Supercivilization.
                      </p>
                    </div>
                  </div>

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

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("foundation")}>
                  Back to Foundation
                </Button>
                <Button
                  onClick={() => setActiveTab("societal")}
                  disabled={!agreements.honestEffort || !agreements.valueCreation || !agreements.personalResponsibility}
                  className="flex items-center gap-2"
                >
                  Continue to Societal Impact <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="societal">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Handshake className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-600 dark:text-blue-400">The Prime Pledge: Societal Impact</h3>
                    <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                      I commit to constantly improving society in a virtuously selfless way, recognizing that my
                      contributions to the collective advance us all further, faster, forever, together.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Societal Impact Commitments</h3>

                <div className="space-y-4 mt-4">
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
                        property, or contracts. I understand that force is justified only for protection from those who
                        violate this principle.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="communityContribution"
                      checked={agreements.communityContribution}
                      onCheckedChange={() => handleAgreementChange("communityContribution")}
                    />
                    <div className="grid gap-1.5">
                      <label
                        htmlFor="communityContribution"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Community Contribution Commitment
                      </label>
                      <p className="text-sm text-muted-foreground">
                        I commit to contributing to the Supercivilization community, sharing insights, supporting fellow
                        members, and participating in collective advancement. I recognize that we go further, faster
                        when we move together.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("personal")}>
                  Back to Personal Growth
                </Button>
                <Button
                  onClick={() => setActiveTab("governance")}
                  disabled={!agreements.nonInitiation || !agreements.communityContribution}
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
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Scale className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-green-600 dark:text-green-400">Governance Framework</h3>
                    <p className="text-sm text-green-600/80 dark:text-green-400/80">
                      The Supercivilization operates under a governance framework designed to protect individual rights
                      while enabling collective advancement. This section outlines how we govern ourselves.
                    </p>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Consensual Governance</h3>
                    <p className="text-muted-foreground">
                      The Supercivilization operates on the principle of consensual governance. All members explicitly
                      opt in to the governance framework by signing this agreement. You may withdraw your consent and
                      exit the community at any time.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Protection of Rights</h3>
                    <p className="text-muted-foreground">
                      The primary function of our governance is to protect the rights of all members. This includes
                      protection of self, property, and contracts from force, fraud, or coercion by any person or group.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Reputation System</h3>
                    <p className="text-muted-foreground">
                      The Supercivilization employs a reputation system that reflects each member's contributions,
                      adherence to commitments, and value creation. Your reputation is tied to your Genius ID and
                      influences your standing and privileges within the community.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Invitation Responsibility</h3>
                    <p className="text-muted-foreground">
                      Members who invite others to join the Supercivilization stake their reputation on those they
                      invite. This creates a self-regulating system where members are incentivized to invite only those
                      who will uphold our principles and contribute positively.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Dispute Resolution</h3>
                    <p className="text-muted-foreground">
                      Disputes between members are resolved through a multi-tiered system that emphasizes voluntary
                      resolution, mediation by trusted community members, and, if necessary, binding arbitration by
                      designated arbiters. The system prioritizes restoration over punishment.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Removal Process</h3>
                    <p className="text-muted-foreground">
                      Members who consistently violate the principles and commitments of the Supercivilization may be
                      removed from the community. This process includes clear warnings, opportunities for correction,
                      and transparent evaluation by a council of respected members.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Token Governance</h3>
                    <p className="text-muted-foreground">
                      GEN Tokens serve as both a measure of contribution and a mechanism for governance participation.
                      Token holders can propose and vote on initiatives, allocate community resources, and participate
                      in decision-making processes proportional to their token holdings.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Transparency Commitment</h3>
                    <p className="text-muted-foreground">
                      The Supercivilization commits to transparency in governance. All rules, processes, and decisions
                      are clearly documented and accessible to members. Changes to governance structures require broad
                      community consent.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Legal Framework</h3>
                    <p className="text-muted-foreground">
                      While the Supercivilization operates with its own internal governance, members acknowledge that
                      they remain subject to the laws of their physical jurisdictions. The Supercivilization does not
                      claim exemption from applicable laws but works to create conditions where members can flourish
                      within existing legal frameworks while advocating for beneficial reforms.
                    </p>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("societal")}>
                  Back to Societal Impact
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
