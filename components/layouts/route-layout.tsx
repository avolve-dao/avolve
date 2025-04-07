"use client"

import React from "react"
import { motion } from "framer-motion"
import { PageContainer, PageSection } from "@/components/page-container"
import { TokenBadge } from "@/components/token/token-badge"
import { cn } from "@/lib/utils"

interface RouteLayoutProps {
  children: React.ReactNode
  title: string | React.ReactNode
  subtitle: string
  tokenCode: string
  tokenName: string
  tokenSymbol: string
  gradientClass: string
  description?: string
  className?: string
}

/**
 * RouteLayout provides a consistent layout for all main routes
 * with token visualization and consistent styling
 */
export function RouteLayout({
  children,
  title,
  subtitle,
  tokenCode,
  tokenName,
  tokenSymbol,
  gradientClass,
  description,
  className
}: RouteLayoutProps) {
  // Create a title element that includes the token badge
  const titleElement = (
    <div className="flex items-center gap-3">
      {typeof title === 'string' ? <span>{title}</span> : title}
      <TokenBadge 
        tokenCode={tokenCode}
        tokenName={tokenName}
        tokenSymbol={tokenSymbol}
        showBalance={true}
        size="lg"
      />
    </div>
  );

  return (
    <PageContainer 
      title={titleElement}
      subtitle={subtitle}
      className={cn("py-8", className)}
    >
      <PageSection>
        {description && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={cn(
              "p-4 rounded-lg border border-l-4 bg-white dark:bg-zinc-900/60 shadow-sm",
              `border-l-${gradientClass.split(" ")[0].replace("from-", "")}`
            )}>
              <p className="text-zinc-700 dark:text-zinc-300">{description}</p>
            </div>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {children}
        </motion.div>
      </PageSection>
    </PageContainer>
  )
}
