"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

type AnimationType = "success" | "error" | "loading" | "pulse" | "bounce" | "fade"

interface FeedbackAnimationProps {
  type: AnimationType
  isActive?: boolean
  duration?: number
  className?: string
  children: React.ReactNode
}

export function FeedbackAnimation({
  type,
  isActive = true,
  duration = 0.5,
  className,
  children,
}: FeedbackAnimationProps) {
  const [shouldRender, setShouldRender] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setShouldRender(true)
  }, [])

  if (!shouldRender) {
    return <div className={className}>{children}</div>
  }

  // Animation variants based on type
  const getAnimationProps = () => {
    switch (type) {
      case "success":
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.8, opacity: 0 },
          transition: { duration, type: "spring", stiffness: 200, damping: 15 },
        }
      case "error":
        return {
          initial: { x: 0 },
          animate: { x: [0, -10, 10, -5, 5, 0] },
          transition: { duration: 0.5 },
        }
      case "loading":
        return {
          animate: { rotate: 360 },
          transition: { duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
        }
      case "pulse":
        return {
          animate: { scale: [1, 1.05, 1] },
          transition: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
        }
      case "bounce":
        return {
          animate: { y: [0, -10, 0] },
          transition: { duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
        }
      case "fade":
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration },
        }
      default:
        return {}
    }
  }

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div className={className} {...getAnimationProps()}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Button with animation feedback
export function AnimatedButton({
  onClick,
  children,
  className,
  animationType = "pulse",
  isLoading = false,
  isSuccess = false,
  isError = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  animationType?: AnimationType
  isLoading?: boolean
  isSuccess?: boolean
  isError?: boolean
}) {
  const [animationState, setAnimationState] = useState<AnimationType | null>(null)

  useEffect(() => {
    if (isLoading) {
      setAnimationState("loading")
    } else if (isSuccess) {
      setAnimationState("success")
      const timer = setTimeout(() => setAnimationState(null), 1000)
      return () => clearTimeout(timer)
    } else if (isError) {
      setAnimationState("error")
      const timer = setTimeout(() => setAnimationState(null), 1000)
      return () => clearTimeout(timer)
    } else {
      setAnimationState(null)
    }
  }, [isLoading, isSuccess, isError])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <FeedbackAnimation
      type={animationState || animationType}
      isActive={!!animationState || props.disabled !== true}
      className={cn("inline-block", className)}
    >
      <button onClick={handleClick} className={className} {...props}>
        {children}
      </button>
    </FeedbackAnimation>
  )
}

// Input with animation feedback
export function AnimatedInput({
  className,
  isError = false,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  isError?: boolean
}) {
  return (
    <FeedbackAnimation type="error" isActive={isError} className={cn("w-full", className)}>
      <input
        className={cn(
          "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all",
          isError ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200",
          className,
        )}
        {...props}
      />
    </FeedbackAnimation>
  )
}

// Card with animation feedback
export function AnimatedCard({
  className,
  children,
  animationType = "fade",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  animationType?: AnimationType
}) {
  return (
    <FeedbackAnimation type={animationType} className={cn("w-full", className)}>
      <div className={cn("bg-background rounded-lg border shadow-sm p-4 transition-all", className)} {...props}>
        {children}
      </div>
    </FeedbackAnimation>
  )
}
