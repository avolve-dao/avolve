"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, Sparkles, Shield, Lightbulb } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function UserAgreementForm() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [agreements, setAgreements] = useState({
    valueCreation: false,
    positiveSumThinking: false,
    continuousLearning: false,
    communityContribution: false,
    personalResponsibility: false,
  })
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
    <Card className="w-full max-w-3xl mx-auto border-zinc-300 dark:border-zinc-700">
      <CardHeader className="bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <CardTitle className="text-2xl">The Regen Commitment</CardTitle>
        <CardDescription>Your journey from Degen to Regen begins with a commitment to transformation</CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-600 dark:text-amber-400">Why This Matters</h3>
                  <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                    This agreement is more than legal terms—it's your commitment to the principles that will guide your
                    transformation from Degen to Regen thinking.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">The Regen Principles</h3>
              <p className="text-muted-foreground">
                The Supercivilization is built on principles that transform extractive, zero-sum systems into
                regenerative, positive-sum outcomes. By joining, you're committing to:
              </p>

              <div className="space-y-3 mt-4">
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
                      Value Creation
                    </label>
                    <p className="text-sm text-muted-foreground">
                      I commit to creating genuine value for myself and others, rather than extracting value from
                      existing systems.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="positiveSumThinking"
                    checked={agreements.positiveSumThinking}
                    onCheckedChange={() => handleAgreementChange("positiveSumThinking")}
                  />
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="positiveSumThinking"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Positive-Sum Thinking
                    </label>
                    <p className="text-sm text-muted-foreground">
                      I commit to seeking solutions where multiple parties can benefit, rather than assuming that for me
                      to win, someone else must lose.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="continuousLearning"
                    checked={agreements.continuousLearning}
                    onCheckedChange={() => handleAgreementChange("continuousLearning")}
                  />
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="continuousLearning"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Continuous Learning
                    </label>
                    <p className="text-sm text-muted-foreground">
                      I commit to ongoing growth and development, recognizing that transformation is a journey rather
                      than a destination.
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
                      Community Contribution
                    </label>
                    <p className="text-sm text-muted-foreground">
                      I commit to contributing to the Supercivilization community, sharing insights and supporting
                      others on their transformation journey.
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
                      Personal Responsibility
                    </label>
                    <p className="text-sm text-muted-foreground">
                      I commit to taking responsibility for my own transformation, recognizing that change begins with
                      my own thoughts and actions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!allAgreed} className="flex items-center gap-2">
                Continue to Legal Terms <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-600 dark:text-blue-400">Legal Protection</h3>
                  <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                    These terms protect both you and the Supercivilization community. They establish the legal framework
                    for your participation.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Terms of Service</h3>

              <div className="h-64 overflow-y-auto border rounded-lg p-4 text-sm text-muted-foreground">
                <h4 className="font-medium text-foreground mb-2">1. Introduction</h4>
                <p className="mb-4">
                  Welcome to the Supercivilization platform. By using our services, you agree to these Terms of Service.
                  The platform is designed to facilitate your transformation from extractive ("Degen") to regenerative
                  ("Regen") thinking and practices.
                </p>

                <h4 className="font-medium text-foreground mb-2">2. Account Registration</h4>
                <p className="mb-4">
                  To access certain features, you must create an account. You are responsible for maintaining the
                  confidentiality of your account information and for all activities that occur under your account.
                </p>

                <h4 className="font-medium text-foreground mb-2">3. GEN Tokens</h4>
                <p className="mb-4">
                  GEN Tokens are a digital representation of value within the platform. They have no monetary value
                  outside the platform and cannot be exchanged for currency. GEN Tokens are earned through participation
                  and contribution to the community.
                </p>

                <h4 className="font-medium text-foreground mb-2">4. Acceptable Use</h4>
                <p className="mb-4">
                  You agree not to use the platform for any illegal or unauthorized purpose. You must not attempt to
                  disrupt the platform's functionality or compromise its security.
                </p>

                <h4 className="font-medium text-foreground mb-2">5. Content Ownership</h4>
                <p className="mb-4">
                  You retain ownership of any content you create on the platform. By posting content, you grant us a
                  non-exclusive license to use, modify, and display that content in connection with the platform's
                  services.
                </p>

                <h4 className="font-medium text-foreground mb-2">6. Privacy</h4>
                <p className="mb-4">
                  Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your
                  personal information.
                </p>

                <h4 className="font-medium text-foreground mb-2">7. Termination</h4>
                <p className="mb-4">
                  We reserve the right to terminate or suspend your account if you violate these terms or engage in
                  behavior that contradicts the principles of the Supercivilization.
                </p>

                <h4 className="font-medium text-foreground mb-2">8. Changes to Terms</h4>
                <p className="mb-4">
                  We may update these terms from time to time. We will notify you of significant changes and provide an
                  opportunity to review and accept the updated terms.
                </p>

                <h4 className="font-medium text-foreground mb-2">9. Limitation of Liability</h4>
                <p className="mb-4">
                  The platform is provided "as is" without warranties of any kind. We are not liable for any damages
                  arising from your use of the platform.
                </p>

                <h4 className="font-medium text-foreground mb-2">10. Governing Law</h4>
                <p>
                  These terms are governed by the laws of the jurisdiction in which the platform operates, without
                  regard to its conflict of law provisions.
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back to Principles
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2">
                {isLoading ? (
                  <>Processing...</>
                ) : (
                  <>
                    Accept & Begin Transformation <Sparkles className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
