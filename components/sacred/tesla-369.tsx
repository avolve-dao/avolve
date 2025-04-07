"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { AVOLVE_SACRED_PATTERNS } from "@/lib/sacred-geometry"

interface Tesla369Props extends React.HTMLAttributes<HTMLDivElement> {
  section?: keyof typeof AVOLVE_SACRED_PATTERNS
  variant?: "trinity" | "hexad" | "nonagon" | "vortex"
  size?: "sm" | "md" | "lg"
  animated?: boolean
  children?: React.ReactNode
}

/**
 * Tesla369 component based on Nikola Tesla's principle that
 * "If you only knew the magnificence of the 3, 6 and 9, then you would
 * have a key to the universe."
 * 
 * This component implements sacred geometry patterns based on these numbers,
 * which appear throughout nature, mathematics, and universal energy patterns.
 */
export function Tesla369({
  section = "superachiever",
  variant = "vortex",
  size = "md",
  animated = true,
  className,
  children,
  ...props
}: Tesla369Props) {
  const pattern = AVOLVE_SACRED_PATTERNS[section]
  const [rotation, setRotation] = useState(0)
  
  // Apply Tesla 3-6-9 based sizing
  const sizeMap = {
    sm: "w-36 h-36", // 3×12
    md: "w-54 h-54", // 6×9
    lg: "w-81 h-81", // 9×9
  }
  
  // Animation effect based on 3-6-9 timing
  useEffect(() => {
    if (!animated) return
    
    let animationFrame: number
    let startTime: number | null = null
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      
      // Complete one full rotation every 9 seconds
      setRotation((elapsed / 9000) * 360 % 360)
      
      animationFrame = requestAnimationFrame(animate)
    }
    
    animationFrame = requestAnimationFrame(animate)
    
    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [animated])
  
  // Get the appropriate pattern class based on variant
  const getPatternClass = () => {
    switch (variant) {
      case "trinity":
        return "trinity-sacred";
      case "hexad":
        return "hexad-sacred";
      case "nonagon":
        return "nonagon-sacred";
      case "vortex":
      default:
        return "tesla-369-pattern";
    }
  }
  
  // Get animation class
  const getAnimationClass = () => {
    return animated ? "tesla-369-rotation" : "";
  }
  
  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        sizeMap[size],
        variant !== "vortex" ? getPatternClass() : "",
        animated && variant !== "vortex" ? getAnimationClass() : "",
        className
      )}
      {...props}
    >
      {/* Vortex pattern background */}
      {variant === "vortex" && (
        <div 
          className="absolute inset-0 tesla-369-pattern"
          style={{
            transform: animated ? `rotate(${rotation}deg)` : "none",
            transition: "transform 0.1s linear",
          }}
        />
      )}
      
      {/* 3-6-9 Recursive layers */}
      <div className="tesla-369-recursion relative z-10 w-full h-full flex items-center justify-center">
        {/* Inner content */}
        <div className="relative z-20 text-center">
          {children || (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-t3 font-bold">3</div>
                <div className="text-t6 font-bold">6</div>
                <div className="text-t9 font-bold">9</div>
              </div>
              
              {/* Create 3 concentric circles */}
              <div className="relative mt-3">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full border-2 border-current opacity-30" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-18 h-18 rounded-full border-2 border-current opacity-20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-27 h-27 rounded-full border-2 border-current opacity-10" />
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* 9 points around the perimeter - representing the 9 digital roots */}
      {variant === "vortex" && (
        <>
          {[...Array(9)].map((_, i) => {
            const angle = (i * 40) * (Math.PI / 180);
            const radius = size === "sm" ? 15 : size === "md" ? 24 : 36;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            return (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-current opacity-60"
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
              />
            );
          })}
        </>
      )}
    </div>
  )
}

/**
 * Tesla369Grid component that creates a grid layout based on the 3-6-9 pattern.
 * This can be used to create layouts that follow Tesla's principles of universal energy.
 */
export function Tesla369Grid({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  // Count children to determine grid layout
  const childCount = React.Children.count(children);
  
  // Determine the best grid layout based on child count
  const getGridClass = () => {
    if (childCount <= 3) return "tesla-trinity-grid"; // 3 items (1×3)
    if (childCount <= 6) return "tesla-hexad-grid";   // 6 items (2×3)
    return "tesla-nonagon-grid";                      // 9 items (3×3)
  };
  
  return (
    <div
      className={cn(
        getGridClass(),
        "w-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Tesla369Cycle component that creates a cycle visualization based on the 3-6-9 pattern.
 * This represents the cyclical nature of energy as described by Tesla.
 */
export function Tesla369Cycle({
  section = "superachiever",
  size = "md",
  animated = true,
  className,
  ...props
}: Omit<Tesla369Props, 'variant' | 'children'>) {
  const pattern = AVOLVE_SACRED_PATTERNS[section]
  const [phase, setPhase] = useState(0)
  
  // Apply Tesla 3-6-9 based sizing
  const sizeMap = {
    sm: "w-36 h-36", // 3×12
    md: "w-54 h-54", // 6×9
    lg: "w-81 h-81", // 9×9
  }
  
  // Animation effect cycling through 3-6-9
  useEffect(() => {
    if (!animated) return
    
    const interval = setInterval(() => {
      setPhase((prev) => (prev + 1) % 3)
    }, 3000) // Cycle every 3 seconds
    
    return () => clearInterval(interval)
  }, [animated])
  
  // Get the current phase number
  const getCurrentPhase = () => {
    return phase === 0 ? 3 : phase === 1 ? 6 : 9
  }
  
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full",
        sizeMap[size],
        "bg-gradient-to-br",
        pattern.gradient,
        className
      )}
      {...props}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 tesla-369-pattern opacity-20 rounded-full" />
      
      {/* Phase indicator */}
      <div className="relative z-10 text-center text-white">
        <div className={cn(
          "transition-all duration-1000",
          phase === 0 ? "text-t3" : phase === 1 ? "text-t6" : "text-t9",
          "font-bold"
        )}>
          {getCurrentPhase()}
        </div>
        <div className="mt-2 text-sm opacity-80">
          {phase === 0 ? "Creation" : phase === 1 ? "Harmony" : "Completion"}
        </div>
      </div>
      
      {/* Three concentric circles representing the 3-6-9 cycle */}
      <div className="absolute inset-0 rounded-full border-2 border-white/20" />
      <div 
        className={cn(
          "absolute rounded-full border-2 transition-all duration-1000",
          phase === 0 ? "border-white/80" : "border-white/20"
        )}
        style={{
          width: "33.3%",
          height: "33.3%",
          top: "33.3%",
          left: "33.3%",
        }}
      />
      <div 
        className={cn(
          "absolute rounded-full border-2 transition-all duration-1000",
          phase === 1 ? "border-white/80" : "border-white/20"
        )}
        style={{
          width: "66.6%",
          height: "66.6%",
          top: "16.7%",
          left: "16.7%",
        }}
      />
      <div 
        className={cn(
          "absolute inset-0 rounded-full border-2 transition-all duration-1000",
          phase === 2 ? "border-white/80" : "border-white/20"
        )}
      />
    </div>
  )
}

/**
 * Tesla369Triad component that creates a triangular visualization
 * representing the trinity aspect of the 3-6-9 pattern.
 */
export function Tesla369Triad({
  section = "superachiever",
  size = "md",
  className,
  ...props
}: Omit<Tesla369Props, 'variant' | 'animated' | 'children'>) {
  const pattern = AVOLVE_SACRED_PATTERNS[section]
  
  // Apply Tesla 3-6-9 based sizing
  const sizeMap = {
    sm: "w-36 h-36", // 3×12
    md: "w-54 h-54", // 6×9
    lg: "w-81 h-81", // 9×9
  }
  
  return (
    <div
      className={cn(
        "relative",
        sizeMap[size],
        className
      )}
      {...props}
    >
      <div className="trinity-sacred w-full h-full flex items-center justify-center text-white">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-center">
          <div className="text-t3 font-bold">3</div>
          <div className="text-xs mt-1">Creation</div>
        </div>
        <div className="absolute bottom-6 left-1/4 text-center">
          <div className="text-t6 font-bold">6</div>
          <div className="text-xs mt-1">Harmony</div>
        </div>
        <div className="absolute bottom-6 right-1/4 text-center">
          <div className="text-t9 font-bold">9</div>
          <div className="text-xs mt-1">Completion</div>
        </div>
        
        {/* Central vortex */}
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white/40"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
