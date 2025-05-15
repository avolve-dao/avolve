"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useUser } from "@/contexts/user-context"

interface PricingTier {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  tokenBonus: number
  recommended?: boolean
  forDegens?: boolean
}

export function ValueTiers() {
  const router = useRouter()
  const { transformationProgress } = useUser()
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  // Define pricing tiers with clear Regen vs Degen positioning
  const pricingTiers: PricingTier[] = [
    {
      id: "regen-creator",
      name: "Regen Creator",
      description: "For value creators ready to maximize their positive impact",
      price: 97,
      tokenBonus: 500,
      features: [
        "Full access to Supercivilization principles",
        "Enhanced Genius ID with trust verification",
        "500 GEN tokens to accelerate your journey",
        "Unlimited Genie AI guidance",
        "Access to Regen Creator community",
        "Monthly value creation workshops",
        "Priority support from Regen mentors",
      ],
      recommended: true,
    },
    {
      id: "regen-builder",
      name: "Regen Builder",
      description: "For emerging value creators building their foundation",
      price: 47,
      tokenBonus: 200,
      features: [
        "Full access to Supercivilization principles",
        "Standard Genius ID",
        "200 GEN tokens to start your journey",
        "Limited Genie AI guidance (20 questions/month)",
        "Access to Regen Builder community",
        "Quarterly value creation workshops",
      ],
    },
    {
      id: "degen-explorer",
      name: "Degen Explorer",
      description: "For those still trapped in zero-sum thinking",
      price: 19,
      tokenBonus: 50,
      features: [
        "Basic access to Supercivilization principles",
        "Basic Genius ID",
        "50 GEN tokens",
        "Limited Genie AI guidance (5 questions/month)",
        "No community access",
        "Upgrade required for workshops",
      ],
      forDegens: true,
    },
  ]

  const handleSelectTier = (tierId: string) => {
    setSelectedTier(tierId)
  }

  const handleContinue = () => {
    if (selectedTier) {
      router.push(`/checkout?tier=${selectedTier}`)
    }
  }

  // Check if user has completed the transformation journey
  const hasCompletedJourney =
    transformationProgress.hasAgreedToTerms &&
    transformationProgress.hasGeniusId &&
    transformationProgress.hasGenTokens &&
    transformationProgress.hasGenieAi

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Choose Your Value Creation Path</CardTitle>
        <CardDescription>Select the tier that aligns with your commitment to creating value</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Polarizing message */}
        <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <p className="text-sm">
            <strong>For Regens Only:</strong> This platform is designed for self-leaders and value creators committed to
            positive-sum thinking. If you're still trapped in zero-sum, extractive thinking, you'll need to transform or
            find another platform.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {pricingTiers.map((tier) => (
            <motion.div key={tier.id} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card
                className={`h-full flex flex-col ${
                  tier.recommended
                    ? "border-green-500 dark:border-green-700"
                    : tier.forDegens
                      ? "border-red-200 dark:border-red-900"
                      : ""
                } ${selectedTier === tier.id ? "ring-2 ring-primary" : ""}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{tier.name}</CardTitle>
                    {tier.recommended && <Badge className="bg-green-500 hover:bg-green-600">Recommended</Badge>}
                    {tier.forDegens && (
                      <Badge variant="outline" className="border-red-500 text-red-500">
                        For Degens
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-4">
                    <span className="text-3xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">+{tier.tokenBonus} GEN Tokens Bonus</span>
                  </div>

                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle
                          className={`h-4 w-4 mt-1 ${tier.forDegens ? "text-zinc-400" : "text-green-500"}`}
                        />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={tier.forDegens ? "outline" : "default"}
                    className={`w-full ${tier.recommended ? "bg-green-500 hover:bg-green-600" : ""}`}
                    onClick={() => handleSelectTier(tier.id)}
                  >
                    {tier.forDegens ? "Start Basic" : "Select Plan"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {selectedTier && (
          <div className="flex justify-end">
            <Button onClick={handleContinue} className="flex items-center gap-2">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Value creation message */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800/30">
          <p className="text-sm text-green-800 dark:text-green-400">
            <strong>Value Creation Guarantee:</strong> If you don't create at least 10x the value of your subscription
            within 90 days, we'll refund your investment and give you 100 GEN tokens as an apology.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
