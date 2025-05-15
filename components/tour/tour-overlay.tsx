"use client"

import { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useTour } from "@/contexts/tour-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TourOverlayProps {
  className?: string
}

export function TourOverlay({ className }: TourOverlayProps) {
  const { isOpen, currentStep, totalSteps, currentStepIndex, nextStep, prevStep, skipTour } = useTour()
  const [targetElement, setTargetElement] = useState<Element | null>(null)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  // Handle mounting for SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  // Find the target element when the current step changes
  useEffect(() => {
    if (!isOpen || !currentStep) return

    const findTargetElement = () => {
      if (currentStep.target === "body") {
        setTargetElement(document.body)
        setTargetRect(document.body.getBoundingClientRect())
        return
      }

      const element = document.querySelector(currentStep.target)
      if (element) {
        setTargetElement(element)
        setTargetRect(element.getBoundingClientRect())
      } else {
        console.warn(`Target element not found: ${currentStep.target}`)
        setTargetElement(null)
        setTargetRect(null)
      }
    }

    // Small delay to ensure the DOM is ready, especially after navigation
    const timeoutId = setTimeout(() => {
      findTargetElement()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [isOpen, currentStep])

  // Calculate tooltip position when target or window size changes
  useEffect(() => {
    if (!isOpen || !currentStep || !targetRect || !tooltipRef.current) return

    const calculateTooltipPosition = () => {
      const tooltipRect = tooltipRef.current?.getBoundingClientRect()
      if (!tooltipRect) return

      const position = currentStep.position || "bottom"
      const padding = currentStep.spotlightPadding || 10
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

      let top = 0
      let left = 0

      // Center position is special case
      if (position === "center") {
        top = (windowHeight - tooltipRect.height) / 2
        left = (windowWidth - tooltipRect.width) / 2
        setTooltipPosition({ top, left })
        return
      }

      // Calculate position based on target element
      switch (position) {
        case "top":
          top = targetRect.top - tooltipRect.height - padding
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2
          break
        case "right":
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2
          left = targetRect.right + padding
          break
        case "bottom":
          top = targetRect.bottom + padding
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2
          break
        case "left":
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2
          left = targetRect.left - tooltipRect.width - padding
          break
      }

      // Adjust if tooltip goes outside viewport
      if (left < 20) left = 20
      if (left + tooltipRect.width > windowWidth - 20) left = windowWidth - tooltipRect.width - 20
      if (top < 20) top = 20
      if (top + tooltipRect.height > windowHeight - 20) top = windowHeight - tooltipRect.height - 20

      setTooltipPosition({ top, left })
    }

    calculateTooltipPosition()

    // Recalculate on window resize
    window.addEventListener("resize", calculateTooltipPosition)
    return () => window.removeEventListener("resize", calculateTooltipPosition)
  }, [isOpen, currentStep, targetRect])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        skipTour()
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        nextStep()
      } else if (e.key === "ArrowLeft") {
        prevStep()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, nextStep, prevStep, skipTour])

  if (!mounted || !isOpen || !currentStep) return null

  // Create spotlight mask path
  const createMaskPath = () => {
    if (!targetRect || currentStep.disableOverlay) {
      return "M0,0 L0,100% L100%,100% L100%,0 Z"
    }

    const padding = currentStep.spotlightPadding || 10
    const x = targetRect.left - padding
    const y = targetRect.top - padding
    const width = targetRect.width + padding * 2
    const height = targetRect.height + padding * 2

    // Create a path that covers the entire screen except for the target element
    return `
      M0,0 L0,100% L100%,100% L100%,0 Z
      M${x},${y} L${x + width},${y} L${x + width},${y + height} L${x},${y + height} Z
    `
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {/* Overlay mask */}
          {!currentStep.disableOverlay && (
            <motion.svg
              className="absolute inset-0 w-full h-full pointer-events-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <defs>
                <mask id="tour-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  {targetRect && (
                    <rect
                      x={targetRect.left - (currentStep.spotlightPadding || 10)}
                      y={targetRect.top - (currentStep.spotlightPadding || 10)}
                      width={targetRect.width + (currentStep.spotlightPadding || 10) * 2}
                      height={targetRect.height + (currentStep.spotlightPadding || 10) * 2}
                      fill="black"
                      rx="4"
                      ry="4"
                    />
                  )}
                </mask>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.5)"
                mask="url(#tour-mask)"
                onClick={(e) => {
                  e.stopPropagation()
                  skipTour()
                }}
              />
            </motion.svg>
          )}

          {/* Tooltip */}
          <motion.div
            ref={tooltipRef}
            className={cn(
              "absolute pointer-events-auto bg-background border rounded-lg shadow-lg p-4 max-w-[90%] w-[350px]",
              className,
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
            }}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">{currentStep.title}</h3>
              <p className="text-muted-foreground">{currentStep.content}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {totalSteps}
              </div>
              <div className="flex gap-2">
                {currentStepIndex > 0 && (
                  <Button variant="outline" size="sm" onClick={prevStep}>
                    Back
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={skipTour}>
                  Skip
                </Button>
                <Button size="sm" onClick={nextStep}>
                  {currentStepIndex === totalSteps - 1 ? "Finish" : "Next"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
