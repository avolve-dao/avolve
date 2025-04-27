"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface InteractiveCardProps {
  title: string
  description: string
  content?: string
  badge?: string
  gradient: string
  href?: string
  icon?: React.ReactNode
  className?: string
}

export default function InteractiveCard({
  title,
  description,
  content,
  badge,
  gradient,
  href = "#",
  icon,
  className,
}: InteractiveCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Calculate the glow color based on the gradient
  const glowColor =
    gradient.includes("purple") || gradient.includes("violet")
      ? "rgba(139, 92, 246, 0.3)"
      : gradient.includes("blue") || gradient.includes("sky") || gradient.includes("cyan")
        ? "rgba(14, 165, 233, 0.3)"
        : gradient.includes("green") || gradient.includes("emerald") || gradient.includes("lime")
          ? "rgba(34, 197, 94, 0.3)"
          : gradient.includes("yellow") || gradient.includes("amber")
            ? "rgba(245, 158, 11, 0.3)"
            : gradient.includes("red") || gradient.includes("rose") || gradient.includes("orange")
              ? "rgba(239, 68, 68, 0.3)"
              : "rgba(161, 161, 170, 0.3)"

  const cardContent = (
    <Card
      ref={cardRef}
      className={cn(
        "overflow-hidden border-0 h-full transition-all duration-500",
        `bg-gradient-to-r ${gradient}`,
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle glow effect */}
      <div
        className="absolute inset-0 rounded-xl transition-opacity duration-500 z-0"
        style={{
          background: `radial-gradient(circle at center, ${glowColor}, transparent 70%)`,
          opacity: isHovered ? 0.7 : 0.3,
        }}
      />

      <CardContent className="relative z-10 flex flex-col h-full p-6">
        {/* Badge */}
        {badge && <Badge className="self-start mb-4 bg-white/20 text-white border-0">{badge}</Badge>}

        {/* Icon */}
        {icon && <div className="mb-4">{icon}</div>}

        {/* Title and description */}
        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{title}</h3>
          <p className="text-white/80 text-sm md:text-base">{description}</p>
        </div>

        {/* Content - appears on hover */}
        {content && (
          <motion.div
            className="mt-4 text-white/70 text-sm border-t border-white/20 pt-4"
            initial={{ opacity: 0, height: 0, marginTop: 0, paddingTop: 0, borderTopWidth: 0 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              height: isHovered ? "auto" : 0,
              marginTop: isHovered ? 16 : 0,
              paddingTop: isHovered ? 16 : 0,
              borderTopWidth: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            {content}
          </motion.div>
        )}

        {/* Action indicator */}
        <motion.div
          className="flex items-center gap-2 mt-4"
          initial={{ opacity: 0, x: -10 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            x: isHovered ? 0 : -10,
          }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-sm font-medium text-white">Explore</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </motion.div>
      </CardContent>

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "100%" : "-100%" }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
    </Card>
  )

  return href ? (
    <Link href={href} className="block h-full">
      <motion.div className="h-full" whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}>
        {cardContent}
      </motion.div>
    </Link>
  ) : (
    <motion.div className="h-full" whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}>
      {cardContent}
    </motion.div>
  )
}
