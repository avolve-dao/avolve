"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Lightbulb, Coins, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

interface CelebrationModalProps {
  isOpen: boolean
  onClose: () => void
  step: number | null
}

export function CelebrationModal({ isOpen, onClose, step }: CelebrationModalProps) {
  const celebrations = {
    1: {
      title: "You've Committed to the Supercivilization!",
      description: "You've taken the first step on your journey from Degen to Regen.",
      icon: <CheckCircle className="h-12 w-12 text-green-500" />,
      message:
        "By committing to the principles of value creation, you've aligned yourself with the Supercivilization. This is the foundation of your transformation journey.",
    },
    2: {
      title: "Genius ID Created!",
      description: "You've established your unique identity as a value creator.",
      icon: <Lightbulb className="h-12 w-12 text-amber-500" />,
      message:
        "Your Genius ID defines who you are in the Supercivilization. It will help you focus your value creation efforts and track your transformation progress.",
    },
    3: {
      title: "GEN Tokens Unlocked!",
      description: "You've gained the currency of value creation.",
      icon: <Coins className="h-12 w-12 text-blue-500" />,
      message:
        "GEN tokens represent your capacity to create value. You can earn more by creating value for yourself and others in the Supercivilization.",
    },
    4: {
      title: "Genie AI Activated!",
      description: "You now have a personal guide on your transformation journey.",
      icon: <Sparkles className="h-12 w-12 text-purple-500" />,
      message:
        "Genie AI will provide personalized guidance to accelerate your transformation from Degen to Regen. Ask questions, overcome obstacles, and deepen your understanding of the Supercivilization.",
    },
  }

  if (!step || !celebrations[step as keyof typeof celebrations]) {
    return null
  }

  const celebration = celebrations[step as keyof typeof celebrations]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {celebration.icon}
            </motion.div>
          </div>
          <DialogTitle className="text-center text-2xl">{celebration.title}</DialogTitle>
          <DialogDescription className="text-center">{celebration.description}</DialogDescription>
        </DialogHeader>
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <p>{celebration.message}</p>
        </div>
        <div className="flex justify-center mt-4">
          <Button onClick={onClose}>Continue My Transformation</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
