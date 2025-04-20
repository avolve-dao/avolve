"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { FIBONACCI, PHI, PHI_INVERSE } from "@/lib/sacred-geometry"

interface SacredGridProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "golden" | "fibonacci" | "phi" | "vesica"
  columns?: number
  gap?: "none" | "sm" | "md" | "lg"
  children: React.ReactNode
}

/**
 * SacredGrid component that creates grid layouts based on sacred geometry principles,
 * including the golden ratio, Fibonacci sequence, and other sacred proportions.
 */
export function SacredGrid({
  variant = "golden",
  columns = 3,
  gap = "md",
  className,
  children,
  ...props
}: SacredGridProps) {
  // Child elements to distribute according to sacred geometry
  const childrenArray = React.Children.toArray(children);
  const childCount = childrenArray.length;
  
  // Apply golden ratio to gap
  const gapMap = {
    none: "gap-0",
    sm: "gap-3", // Base gap
    md: "gap-5", // ~1.618 * base
    lg: "gap-8", // ~1.618 * medium
  };
  
  // Apply different grid strategies based on variant
  const getGridStyle = () => {
    switch (variant) {
      case "golden":
        // Golden ratio-based grid
        if (columns === 1) return { gridTemplateColumns: "1fr" };
        if (columns === 2) return { gridTemplateColumns: `${PHI_INVERSE * 100}% ${(1 - PHI_INVERSE) * 100}%` };
        if (columns === 3) return { gridTemplateColumns: `${PHI_INVERSE * PHI_INVERSE * 100}% ${PHI_INVERSE * 100}% ${(1 - PHI_INVERSE - PHI_INVERSE * PHI_INVERSE) * 100}%` };
        
        // For more columns, use a more balanced approach
        return { gridTemplateColumns: `repeat(${columns}, 1fr)` };
      
      case "fibonacci":
        // Fibonacci sequence-based grid
        if (childCount <= 1) return { gridTemplateColumns: "1fr" };
        
        // Calculate Fibonacci-based column widths
        const fibTotal = FIBONACCI.slice(0, childCount).reduce((sum, num) => sum + num, 0);
        const fibColumns = FIBONACCI.slice(0, childCount)
          .map(num => `${(num / fibTotal) * 100}%`)
          .join(" ");
        
        return { gridTemplateColumns: fibColumns };
      
      case "phi":
        // Pure phi-based grid with progressive scaling
        if (columns === 1) return { gridTemplateColumns: "1fr" };
        
        // Calculate phi-based column widths
        const phiWidths = Array.from({ length: columns }, (_, i) => 
          Math.pow(PHI_INVERSE, columns - i - 1)
        );
        const phiTotal = phiWidths.reduce((sum, width) => sum + width, 0);
        const phiColumns = phiWidths
          .map(width => `${(width / phiTotal) * 100}%`)
          .join(" ");
        
        return { gridTemplateColumns: phiColumns };
      
      case "vesica":
        // Vesica Piscis proportions (1:√3)
        if (columns === 1) return { gridTemplateColumns: "1fr" };
        if (columns === 2) return { gridTemplateColumns: "36.6% 63.4%" };
        
        // For more columns, use a balanced approach with vesica influence
        return { gridTemplateColumns: `repeat(${columns}, 1fr)` };
      
      default:
        return { gridTemplateColumns: `repeat(${columns}, 1fr)` };
    }
  };
  
  // Apply sacred geometry background pattern
  const getBackgroundPattern = () => {
    switch (variant) {
      case "golden":
        return "bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[length:21px_21px]";
      case "fibonacci":
        return "bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[length:13px_13px]";
      case "phi":
        return "bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[length:34px_34px]";
      case "vesica":
        return "bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[length:21px_12px]";
      default:
        return "";
    }
  };
  
  return (
    <div
      className={cn(
        "grid w-full",
        gapMap[gap],
        getBackgroundPattern(),
        className
      )}
      style={getGridStyle()}
      {...props}
    >
      {/* Apply golden ratio to each child's aspect ratio for certain variants */}
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        // Apply special styling to children based on variant
        const childStyle = variant === "phi" && index === 0
          ? { aspectRatio: `${PHI} / 1` }
          : {};
        
        return React.cloneElement(child, {
          ...(typeof child.props === 'object' && child.props !== null ? (child.props as React.HTMLAttributes<HTMLElement>) : {}),
          // Only add style if supported by the element
          ...(typeof child.props === 'object' && child.props && 'style' in child.props && typeof child.props.style === 'object' && child.props.style !== null ? { style: { ...child.props.style, ...childStyle } } : { style: childStyle }),
        });
      })}
    </div>
  )
}
