"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { PHI, PHI_INVERSE } from "@/lib/sacred-geometry"

interface SacredLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "golden" | "fibonacci" | "vesica" | "pentagonal" | "hexagonal"
  direction?: "horizontal" | "vertical"
  children: React.ReactNode
}

/**
 * SacredLayout component that applies sacred geometry principles
 * to create harmonious layouts based on the golden ratio and other
 * sacred proportions.
 */
export function SacredLayout({
  variant = "golden",
  direction = "horizontal",
  className,
  children,
  ...props
}: SacredLayoutProps) {
  // Child elements to distribute according to sacred geometry
  const childrenArray = React.Children.toArray(children);
  
  // Apply different layout strategies based on variant
  const getLayoutStyle = () => {
    switch (variant) {
      case "golden":
        // Golden ratio layout (1:1.618)
        return direction === "horizontal"
          ? {
              display: "grid",
              gridTemplateColumns: childrenArray.length > 1 
                ? `${PHI_INVERSE * 100}% ${(1 - PHI_INVERSE) * 100}%` 
                : "1fr",
            }
          : {
              display: "grid",
              gridTemplateRows: childrenArray.length > 1 
                ? `${PHI_INVERSE * 100}% ${(1 - PHI_INVERSE) * 100}%` 
                : "1fr",
            };
      
      case "fibonacci":
        // Fibonacci sequence-based layout
        return direction === "horizontal"
          ? {
              display: "grid",
              gridTemplateColumns: childrenArray.length <= 1 
                ? "1fr" 
                : childrenArray.length === 2 
                  ? "38.2% 61.8%" 
                  : childrenArray.length === 3 
                    ? "23.6% 38.2% 38.2%" 
                    : "14.6% 23.6% 38.2% 23.6%",
            }
          : {
              display: "grid",
              gridTemplateRows: childrenArray.length <= 1 
                ? "1fr" 
                : childrenArray.length === 2 
                  ? "38.2% 61.8%" 
                  : childrenArray.length === 3 
                    ? "23.6% 38.2% 38.2%" 
                    : "14.6% 23.6% 38.2% 23.6%",
            };
      
      case "vesica":
        // Vesica Piscis proportions (1:√3)
        return direction === "horizontal"
          ? {
              display: "grid",
              gridTemplateColumns: childrenArray.length > 1 
                ? "36.6% 63.4%" 
                : "1fr",
            }
          : {
              display: "grid",
              gridTemplateRows: childrenArray.length > 1 
                ? "36.6% 63.4%" 
                : "1fr",
            };
      
      case "pentagonal":
        // Pentagonal proportions (based on golden ratio)
        return direction === "horizontal"
          ? {
              display: "grid",
              gridTemplateColumns: childrenArray.length <= 1 
                ? "1fr" 
                : childrenArray.length === 2 
                  ? "38.2% 61.8%" 
                  : childrenArray.length === 3 
                    ? "23.6% 38.2% 38.2%" 
                  : childrenArray.length === 4 
                    ? "14.6% 23.6% 23.6% 38.2%" 
                    : "9% 14.6% 23.6% 23.6% 29.2%",
            }
          : {
              display: "grid",
              gridTemplateRows: childrenArray.length <= 1 
                ? "1fr" 
                : childrenArray.length === 2 
                  ? "38.2% 61.8%" 
                  : childrenArray.length === 3 
                    ? "23.6% 38.2% 38.2%" 
                  : childrenArray.length === 4 
                    ? "14.6% 23.6% 23.6% 38.2%" 
                    : "9% 14.6% 23.6% 23.6% 29.2%",
            };
      
      case "hexagonal":
        // Hexagonal proportions (based on √3)
        return direction === "horizontal"
          ? {
              display: "grid",
              gridTemplateColumns: childrenArray.length <= 1 
                ? "1fr" 
                : childrenArray.length === 2 
                  ? "33.3% 66.7%" 
                  : childrenArray.length === 3 
                    ? "16.7% 33.3% 50%" 
                    : childrenArray.length === 6 
                      ? "16.7% 16.7% 16.7% 16.7% 16.7% 16.7%" 
                      : "repeat(auto-fit, minmax(0, 1fr))",
            }
          : {
              display: "grid",
              gridTemplateRows: childrenArray.length <= 1 
                ? "1fr" 
                : childrenArray.length === 2 
                  ? "33.3% 66.7%" 
                  : childrenArray.length === 3 
                    ? "16.7% 33.3% 50%" 
                    : childrenArray.length === 6 
                      ? "16.7% 16.7% 16.7% 16.7% 16.7% 16.7%" 
                      : "repeat(auto-fit, minmax(0, 1fr))",
            };
      
      default:
        return {};
    }
  };

  // Apply sacred geometry background pattern
  const getBackgroundPattern = () => {
    switch (variant) {
      case "golden":
        return "bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[length:21px_21px]";
      case "fibonacci":
        return "bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[length:13px_13px]";
      case "vesica":
        return "bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[length:21px_12px]";
      case "pentagonal":
        return "bg-[conic-gradient(from_0deg_at_20%_20%,rgba(0,0,0,0.03)_0deg,rgba(0,0,0,0.01)_72deg,rgba(0,0,0,0.03)_144deg,rgba(0,0,0,0.01)_216deg,rgba(0,0,0,0.03)_288deg,rgba(0,0,0,0.01)_360deg)]";
      case "hexagonal":
        return "bg-[conic-gradient(from_0deg_at_20%_20%,rgba(0,0,0,0.03)_0deg,rgba(0,0,0,0.01)_60deg,rgba(0,0,0,0.03)_120deg,rgba(0,0,0,0.01)_180deg,rgba(0,0,0,0.03)_240deg,rgba(0,0,0,0.01)_300deg,rgba(0,0,0,0.03)_360deg)]";
      default:
        return "";
    }
  };

  return (
    <div
      className={cn(
        "relative w-full h-full",
        getBackgroundPattern(),
        className
      )}
      style={getLayoutStyle()}
      {...props}
    >
      {children}
    </div>
  )
}
