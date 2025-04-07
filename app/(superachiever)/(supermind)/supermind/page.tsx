"use client"

import { PageGrid } from "@/components/page-container"
import { RouteLayout } from "@/components/layouts/route-layout"
import { RouteCard } from "@/components/layouts/route-card"
import { TokenStats } from "@/components/token/token-stats"
import { Target, Focus, CheckCircle } from "lucide-react"

export default function SupermindPage() {
  return (
    <RouteLayout 
      title="Supermind Superpowers"
      subtitle="Go Further, Faster, & Forever"
      tokenCode="SMS"
      tokenName="Supermind Superpowers"
      tokenSymbol="SMS"
      gradientClass="from-violet-500 via-purple-500 to-fuchsia-500"
      description="Develop your mental capabilities and knowledge to go further, faster, and forever. Complete activities in each area to earn SMS tokens and unlock new capabilities."
    >
      {/* Token Stats */}
      <TokenStats 
        tokenCode="SMS"
        tokenName="Supermind Superpowers"
        tokenSymbol="SMS"
        gradientClass="from-violet-500 via-purple-500 to-fuchsia-500"
        className="mb-8"
      />
      
      <PageGrid columns={3}>
        <RouteCard
          title="Current → Desired"
          description="Define your starting point and clarify your vision for where you want to go."
          href="/supermind/starting"
          gradientClass="from-violet-500 via-purple-500 to-fuchsia-500"
          tokenCode="SMS"
          tokenName="Current → Desired"
          tokenSymbol="SMS"
          icon={<Target className="h-5 w-5" />}
          delay={0}
        />
        
        <RouteCard
          title="Desired → Actions"
          description="Develop your focus and create actionable plans to achieve your goals."
          href="/supermind/focusing"
          gradientClass="from-violet-500 via-purple-500 to-fuchsia-500"
          tokenCode="SMS"
          tokenName="Desired → Actions"
          tokenSymbol="SMS"
          icon={<Focus className="h-5 w-5" />}
          delay={1}
        />
        
        <RouteCard
          title="Actions → Results"
          description="Execute your plans effectively and track your progress toward results."
          href="/supermind/finishing"
          gradientClass="from-violet-500 via-purple-500 to-fuchsia-500"
          tokenCode="SMS"
          tokenName="Actions → Results"
          tokenSymbol="SMS"
          icon={<CheckCircle className="h-5 w-5" />}
          delay={2}
        />
      </PageGrid>
    </RouteLayout>
  )
}
