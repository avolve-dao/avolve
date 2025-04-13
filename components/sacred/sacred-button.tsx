"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { AVOLVE_SACRED_PATTERNS, PHI, PHI_INVERSE } from "@/lib/sacred-geometry"
import { Button, ButtonProps } from "@/components/ui/button"

interface SacredButtonProps extends ButtonProps {
  section?: keyof typeof AVOLVE_SACRED_PATTERNS
  sacred?: "pentagon" | "hexagon" | "octagon" | "golden" | "none"
}

/**
 * SacredButton component that applies sacred geometry principles
 * to create harmonious and visually balanced buttons.
 */
export function SacredButton({
  section = "superachiever",
  sacred = "none",
  className,
  children,
  ...props
}: SacredButtonProps) {
  const pattern = AVOLVE_SACRED_PATTERNS[section]
  
  // Apply sacred geometry clip path based on the selected shape
  const getClipPath = () => {
    switch (sacred) {
      case "pentagon":
        return `polygon(
          50% 0%,
          100% ${38.2}%,
          ${82}% 100%,
          ${18}% 100%,
          0% ${38.2}%
        )`;
      case "hexagon":
        return `polygon(
          ${25}% 0%,
          ${75}% 0%,
          100% 50%,
          ${75}% 100%,
          ${25}% 100%,
          0% 50%
        )`;
      case "octagon":
        return `polygon(
          ${29.3}% 0%,
          ${70.7}% 0%,
          100% ${29.3}%,
          100% ${70.7}%,
          ${70.7}% 100%,
          ${29.3}% 100%,
          0% ${70.7}%,
          0% ${29.3}%
        )`;
      case "golden":
        return `polygon(
          0% ${PHI_INVERSE * 10}%,
          ${PHI_INVERSE * 10}% 0%,
          ${100 - PHI_INVERSE * 10}% 0%,
          100% ${PHI_INVERSE * 10}%,
          100% ${100 - PHI_INVERSE * 10}%,
          ${100 - PHI_INVERSE * 10}% 100%,
          ${PHI_INVERSE * 10}% 100%,
          0% ${100 - PHI_INVERSE * 10}%
        )`;
      default:
        return "none";
    }
  };

  // Sacred geometry styles
  const sacredStyle = sacred !== "none" 
    ? {
        clipPath: getClipPath(),
        aspectRatio: sacred === "golden" ? `${PHI} / 1` : "auto",
      }
    : {};
  
  // Apply golden ratio to padding
  const goldenPadding = sacred !== "none" 
    ? `px-${Math.round(8 * PHI)}` 
    : "";
  
  // Sacred gradient background
  const sacredGradient = `bg-gradient-to-br ${pattern.gradient}`;
  
  return (
    <Button
      className={cn(
        props.variant === "default" && sacred !== "none" && sacredGradient,
        goldenPadding,
        "relative overflow-hidden transition-all duration-300 ease-in-out",
        className
      )}
      style={sacredStyle}
      {...props}
    >
      {/* Sacred geometry background pattern for default variant */}
      {props.variant === "default" && sacred !== "none" && (
        <div 
          className="absolute inset-0 opacity-10 flower-of-life-bg"
          style={{
            transform: `rotate(${pattern.angle}deg)`,
          }}
        />
      )}
      
      {/* Content with golden ratio spacing */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </Button>
  )
}
