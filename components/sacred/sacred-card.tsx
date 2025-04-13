"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { goldenClipPath, AVOLVE_SACRED_PATTERNS } from "@/lib/sacred-geometry"

interface SacredCardProps extends React.HTMLAttributes<HTMLDivElement> {
  section?: keyof typeof AVOLVE_SACRED_PATTERNS
  variant?: "default" | "subtle" | "outline"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
}

/**
 * SacredCard component that applies golden ratio proportions and sacred geometry
 * principles to create harmonious card layouts.
 */
export function SacredCard({
  section = "superachiever",
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}: SacredCardProps) {
  const pattern = AVOLVE_SACRED_PATTERNS[section]
  
  // Apply golden ratio to padding based on size
  const paddingMap = {
    sm: "p-3", // Base padding
    md: "p-5", // ~1.618 * base
    lg: "p-8", // ~1.618 * medium
  }
  
  // Apply golden ratio to border radius
  const radiusMap = {
    sm: "rounded-md",
    md: "rounded-lg",
    lg: "rounded-xl",
  }
  
  // Variant styles
  const variantStyles = {
    default: `bg-gradient-to-br ${pattern.gradient} text-white`,
    subtle: `bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800`,
    outline: `bg-transparent border border-zinc-200 dark:border-zinc-800`,
  }
  
  // Apply sacred geometry clip path
  const clipPathStyle = {
    clipPath: goldenClipPath("card"),
  }
  
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        paddingMap[size],
        radiusMap[size],
        variantStyles[variant],
        className
      )}
      style={clipPathStyle}
      {...props}
    >
      {/* Sacred geometry background pattern */}
      {variant === "default" && (
        <div 
          className="absolute inset-0 opacity-10 flower-of-life-bg"
          style={{
            transform: `rotate(${pattern.angle}deg)`,
          }}
        />
      )}
      
      {/* Golden ratio inner content container */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
