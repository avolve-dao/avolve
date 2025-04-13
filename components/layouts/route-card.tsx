"use client"

import React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { PageCard } from "@/components/page-container"
import { TokenBadge } from "@/components/token/token-badge"
import { cn } from "@/lib/utils"

interface RouteCardProps {
  title: string
  description: string
  href: string
  gradientClass: string
  tokenCode: string
  tokenName: string
  tokenSymbol: string
  icon?: React.ReactNode
  className?: string
  delay?: number
  featured?: boolean
}

/**
 * RouteCard provides a consistent card component for navigation
 * with token visualization and consistent styling
 */
export function RouteCard({
  title,
  description,
  href,
  gradientClass,
  tokenCode,
  tokenName,
  tokenSymbol,
  icon,
  className,
  delay = 0,
  featured = false
}: RouteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + (delay * 0.1) }}
    >
      <Link href={href} className="block">
        <PageCard className={cn(
          "h-full transition-all duration-300 hover:shadow-md group border-l-4",
          `border-l-${gradientClass.split(" ")[0].replace("from-", "")}`,
          featured && "bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20",
          className
        )}>
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
              <h3 className={cn(
                "text-xl font-semibold bg-gradient-to-r bg-clip-text text-transparent",
                gradientClass
              )}>
                {title}
                {featured && (
                  <span className="ml-2 text-xs font-normal bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 py-0.5 px-2 rounded-full inline-block align-middle">
                    Featured
                  </span>
                )}
              </h3>
              <TokenBadge 
                tokenCode={tokenCode}
                tokenName={tokenName}
                tokenSymbol={tokenSymbol}
                size="sm"
              />
            </div>
            
            <p className="text-zinc-600 dark:text-zinc-400 mb-4 flex-grow">
              {description}
            </p>
            
            <div className={cn(
              "flex items-center group-hover:translate-x-1 transition-transform duration-300",
              `text-${gradientClass.split(" ")[0].replace("from-", "")}`
            )}>
              <span className="text-sm font-medium">Explore</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </div>
        </PageCard>
      </Link>
    </motion.div>
  )
}
