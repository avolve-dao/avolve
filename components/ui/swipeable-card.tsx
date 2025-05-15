"use client"

import { useState, useRef, type ReactNode } from "react"
import { motion, type PanInfo, useAnimation } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface SwipeableCardProps {
  children: ReactNode
  className?: string
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  leftAction?: ReactNode
  rightAction?: ReactNode
  swipeThreshold?: number
}

export function SwipeableCard({
  children,
  className,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  swipeThreshold = 100,
}: SwipeableCardProps) {
  const controls = useAnimation()
  const [direction, setDirection] = useState<"left" | "right" | null>(null)
  const constraintsRef = useRef(null)

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info

    // If the card was dragged beyond the threshold or with enough velocity
    if (offset.x < -swipeThreshold || velocity.x < -0.5) {
      if (onSwipeLeft) {
        setDirection("left")
        controls.start({ x: "-100%", opacity: 0 }).then(onSwipeLeft)
      } else {
        controls.start({ x: 0 })
      }
    } else if (offset.x > swipeThreshold || velocity.x > 0.5) {
      if (onSwipeRight) {
        setDirection("right")
        controls.start({ x: "100%", opacity: 0 }).then(onSwipeRight)
      } else {
        controls.start({ x: 0 })
      }
    } else {
      controls.start({ x: 0 })
    }
  }

  return (
    <div className="relative overflow-hidden touch-none" ref={constraintsRef}>
      {/* Action indicators */}
      {leftAction && (
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 opacity-0 transition-opacity duration-200"
          style={{ opacity: direction === "right" ? 1 : 0 }}
        >
          {leftAction}
        </div>
      )}

      {rightAction && (
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 opacity-0 transition-opacity duration-200"
          style={{ opacity: direction === "left" ? 1 : 0 }}
        >
          {rightAction}
        </div>
      )}

      {/* Swipeable card */}
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="touch-none"
        initial={{ x: 0 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className={cn("touch-none", className)}>{children}</Card>
      </motion.div>
    </div>
  )
}
