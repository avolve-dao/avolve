"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FadeIn({ children, delay = 0, duration = 0.5, className = "" }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface SlideInProps {
  children: ReactNode
  direction?: "left" | "right" | "up" | "down"
  delay?: number
  duration?: number
  distance?: number
  className?: string
}

export function SlideIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  distance = 20,
  className = "",
}: SlideInProps) {
  const directionMap = {
    left: { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    up: { x: 0, y: -distance },
    down: { x: 0, y: distance },
  }

  const initial = directionMap[direction]

  return (
    <motion.div
      initial={{ opacity: 0, ...initial }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface ScaleInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function ScaleIn({ children, delay = 0, duration = 0.5, className = "" }: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggeredChildrenProps {
  children: ReactNode
  staggerDelay?: number
  className?: string
}

export function StaggeredChildren({ children, staggerDelay = 0.1, className = "" }: StaggeredChildrenProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggeredChild({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface PulseProps {
  children: ReactNode
  duration?: number
  scale?: number
  className?: string
}

export function Pulse({ children, duration = 2, scale = 1.05, className = "" }: PulseProps) {
  return (
    <motion.div
      animate={{ scale: [1, scale, 1] }}
      transition={{ duration, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
