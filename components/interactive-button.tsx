"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface InteractiveButtonProps {
  children: React.ReactNode
  icon?: LucideIcon
  variant?: "default" | "outline" | "secondary" | "ghost"
  onClick?: () => void
  className?: string
  iconPosition?: "left" | "right"
  size?: "default" | "sm" | "lg" | "icon"
}

export default function InteractiveButton({
  children,
  icon: Icon,
  variant = "default",
  onClick,
  className = "",
  iconPosition = "right",
  size = "lg",
}: InteractiveButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme === "dark"

  const handleHoverStart = () => {
    setIsHovered(true)
  }

  const handleClick = () => {
    if (onClick) onClick()
  }

  return (
    <Button
      size={size}
      variant={variant}
      className={cn(
        "relative overflow-hidden font-medium group",
        variant === "default" &&
          "bg-gradient-to-r from-stone-200 via-zinc-200 to-slate-200 text-slate-800 hover:text-slate-900 dark:from-stone-800 dark:via-zinc-800 dark:to-slate-800 dark:text-slate-200 dark:hover:text-white",
        variant === "outline" &&
          "border-white/30 bg-gradient-to-r from-stone-900/20 via-zinc-900/20 to-slate-900/20 text-white backdrop-blur-sm hover:bg-white/10 dark:from-stone-300/10 dark:via-zinc-300/10 dark:to-slate-300/10",
        size === "lg" && "px-8 py-6 text-lg",
        className,
      )}
      onMouseEnter={handleHoverStart}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <motion.span
        className="relative z-10 flex items-center gap-2"
        animate={{
          x: isHovered ? (iconPosition === "right" ? 5 : -5) : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {Icon && iconPosition === "left" && <Icon className="h-5 w-5" />}
        {children}
        {Icon && iconPosition === "right" && <Icon className="h-5 w-5" />}
      </motion.span>

      {variant === "default" && (
        <motion.span
          className={cn(
            "absolute inset-0",
            isDarkMode
              ? "bg-gradient-to-r from-stone-700 via-zinc-700 to-slate-700"
              : "bg-gradient-to-r from-stone-300 via-zinc-300 to-slate-300",
          )}
          initial={{ x: "-100%" }}
          animate={{ x: isHovered ? 0 : "-100%" }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      )}

      {variant !== "default" && (
        <motion.span
          className={cn("absolute inset-0", isDarkMode ? "bg-white/15" : "bg-white/25")}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: isHovered ? 1.5 : 0,
            opacity: isHovered ? 0.2 : 0,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          style={{ borderRadius: "50%", transformOrigin: "center" }}
        />
      )}
    </Button>
  )
}
