"use client"

import { PageGrid } from "@/components/page-container"
import { RouteLayout } from "@/components/layouts/route-layout"
import { RouteCard } from "@/components/layouts/route-card"
import { TokenStats } from "@/components/token/token-stats"
import { Home, Briefcase, Zap } from "lucide-react"

export default function SuperachieverPage() {
  return (
    <RouteLayout 
      title="Superachiever"
      subtitle="Your personal achievement platform"
      tokenCode="SAP"
      tokenName="Superachiever"
      tokenSymbol="SAP"
      gradientClass="from-stone-500 to-stone-700"
      description="Welcome to the Superachiever platform. This is your central hub for personal achievement, business growth, and mind development. Complete activities in each area to earn tokens and unlock new capabilities."
    >
      {/* Token Stats */}
      <TokenStats 
        tokenCode="SAP"
        tokenName="Superachiever"
        tokenSymbol="SAP"
        gradientClass="from-stone-500 to-stone-700"
        className="mb-8"
      />
      
      <PageGrid columns={3}>
        <RouteCard
          title="Personal Success Puzzle"
          description="Manage your personal goals and achievements across health, wealth, and relationships."
          href="/personal"
          gradientClass="from-amber-500 to-yellow-500"
          tokenCode="PSP"
          tokenName="Personal Success Puzzle"
          tokenSymbol="PSP"
          icon={<Home className="h-5 w-5" />}
          delay={0}
        />
        
        <RouteCard
          title="Business Success Puzzle"
          description="Track your business growth and opportunities with front-stage users, back-stage admin, and bottom-line profit."
          href="/business"
          gradientClass="from-teal-500 to-cyan-500"
          tokenCode="BSP"
          tokenName="Business Success Puzzle"
          tokenSymbol="BSP"
          icon={<Briefcase className="h-5 w-5" />}
          delay={1}
        />
        
        <RouteCard
          title="Supermind Superpowers"
          description="Develop your mental capabilities and knowledge to go further, faster, and forever."
          href="/supermind"
          gradientClass="from-violet-500 via-purple-500 to-fuchsia-500"
          tokenCode="SMS"
          tokenName="Supermind Superpowers"
          tokenSymbol="SMS"
          icon={<Zap className="h-5 w-5" />}
          delay={2}
        />
      </PageGrid>
    </RouteLayout>
  )
}
