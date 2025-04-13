"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { AVOLVE_SACRED_PATTERNS, PHI } from "@/lib/sacred-geometry"

interface SacredIconProps extends React.HTMLAttributes<HTMLDivElement> {
  section?: keyof typeof AVOLVE_SACRED_PATTERNS
  shape?: "pentagon" | "hexagon" | "octagon" | "circle" | "vesica"
  size?: "sm" | "md" | "lg"
  icon: React.ReactNode
  animated?: boolean
}

/**
 * SacredIcon component that applies sacred geometry principles
 * to create harmonious icon containers with sacred proportions.
 */
export function SacredIcon({
  section = "superachiever",
  shape = "circle",
  size = "md",
  icon,
  animated = false,
  className,
  ...props
}: SacredIconProps) {
  const pattern = AVOLVE_SACRED_PATTERNS[section]
  
  // Apply golden ratio to size
  const sizeMap = {
    sm: "w-8 h-8", // Base size
    md: "w-12 h-12", // ~1.5 * base
    lg: "w-20 h-20", // ~1.618 * medium
  }
  
  // Apply sacred geometry clip path based on the selected shape
  const getClipPath = () => {
    switch (shape) {
      case "pentagon":
        return `polygon(
          50% 0%,
          100% 38.2%,
          82% 100%,
          18% 100%,
          0% 38.2%
        )`;
      case "hexagon":
        return `polygon(
          50% 0%,
          100% 25%,
          100% 75%,
          50% 100%,
          0% 75%,
          0% 25%
        )`;
      case "octagon":
        return `polygon(
          29.3% 0%,
          70.7% 0%,
          100% 29.3%,
          100% 70.7%,
          70.7% 100%,
          29.3% 100%,
          0% 70.7%,
          0% 29.3%
        )`;
      case "vesica":
        return "none"; // Handled with border-radius
      case "circle":
      default:
        return "none"; // Handled with border-radius
    }
  };

  // Sacred geometry styles
  const sacredStyle = {
    clipPath: getClipPath(),
    borderRadius: shape === "circle" 
      ? "50%" 
      : shape === "vesica" 
        ? "50% / 100%" 
        : "0",
    aspectRatio: shape === "vesica" ? `${PHI} / 1` : "1 / 1",
  };
  
  // Sacred gradient background
  const sacredGradient = `bg-gradient-to-br ${pattern.gradient}`;
  
  // Animation classes
  const animationClasses = animated 
    ? "transition-all duration-700 hover:scale-105 hover:rotate-[360deg]" 
    : "";
  
  return (
    <div
      className={cn(
        "relative flex items-center justify-center text-white",
        sizeMap[size],
        sacredGradient,
        animationClasses,
        className
      )}
      style={sacredStyle}
      {...props}
    >
      {/* Sacred geometry background pattern */}
      <div 
        className="absolute inset-0 opacity-10 flower-of-life-bg"
        style={{
          transform: `rotate(${pattern.angle}deg)`,
        }}
      />
      
      {/* Icon with golden ratio sizing */}
      <div className="relative z-10 transform scale-75">
        {icon}
      </div>
    </div>
  )
}
