"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTour } from "@/contexts/tour-context"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Sparkles } from "lucide-react"

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const { startTour } = useTour()
  const [hasSeenWelcome, setHasSeenWelcome] = useLocalStorage("avolve-welcome-seen", false)
  const [hasCompletedTour, setHasCompletedTour] = useLocalStorage("avolve-tour-completed", false)

  useEffect(() => {
    // Show welcome modal for new users who haven't seen it yet
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [hasSeenWelcome])

  const handleStartTour = () => {
    setIsOpen(false)
    setHasSeenWelcome(true)
    startTour()
  }

  const handleSkipTour = () => {
    setIsOpen(false)
    setHasSeenWelcome(true)
    setHasCompletedTour(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Welcome to Avolve!</DialogTitle>
          <DialogDescription className="text-center">
            Your journey from Degen to Regen starts here. Would you like a quick tour of the platform?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">What you'll learn:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>How to navigate the platform</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Understanding your Genius ID and GEN tokens</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>How to complete value creation challenges</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Using Genie AI for personalized guidance</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleSkipTour} className="sm:flex-1">
            Skip Tour
          </Button>
          <Button onClick={handleStartTour} className="sm:flex-1">
            Start Tour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
