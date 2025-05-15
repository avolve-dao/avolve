"use client"

import { motion } from "framer-motion"
import { SupercivilizationBrandScript } from "@/lib/branding/supercivilization-brandscript"

interface OnboardingHeroProps {
  step: number
}

export function OnboardingHero({ step }: OnboardingHeroProps) {
  // StoryBrand-focused headlines
  const headlines = {
    1: {
      title: "Commit to the Supercivilization",
      subtitle: "Begin your journey from Degen to Regen",
    },
    2: {
      title: "Create Your Genius ID",
      subtitle: "Establish your unique identity as a value creator",
    },
    3: {
      title: "Unlock GEN Tokens",
      subtitle: "Gain the currency of value creation",
    },
    4: {
      title: "Access Genie AI",
      subtitle: "Get personalized guidance on your transformation journey",
    },
    5: {
      title: "Welcome to the Supercivilization",
      subtitle: SupercivilizationBrandScript.oneLiner,
    },
  }

  const currentHeadline = headlines[step as keyof typeof headlines]

  return (
    <div className="text-center mb-10">
      <motion.h1
        className="text-4xl md:text-5xl font-bold mb-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        key={`title-${step}`}
      >
        {currentHeadline.title}
      </motion.h1>
      <motion.p
        className="text-xl text-muted-foreground max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        key={`subtitle-${step}`}
      >
        {currentHeadline.subtitle}
      </motion.p>
    </div>
  )
}
