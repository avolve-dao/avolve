"use client"

import { PageGrid } from "@/components/page-container"
import { RouteLayout } from "@/components/layouts/route-layout"
import { RouteCard } from "@/components/layouts/route-card"
import { TokenStats } from "@/components/token/token-stats"
import { Users, Settings, LineChart } from "lucide-react"

export default function BusinessSuccessPuzzlePage() {
  return (
    <RouteLayout 
      title="Business Success Puzzle"
      subtitle="Greater Business Successes"
      tokenCode="BSP"
      tokenName="Business Success Puzzle"
      tokenSymbol="BSP"
      gradientClass="from-teal-500 to-cyan-500"
      description="Track your business growth and opportunities with front-stage users, back-stage admin, and bottom-line profit. Complete activities in each area to earn BSP tokens and unlock new capabilities."
    >
      {/* Token Stats */}
      <TokenStats 
        tokenCode="BSP"
        tokenName="Business Success Puzzle"
        tokenSymbol="BSP"
        gradientClass="from-teal-500 to-cyan-500"
        className="mb-8"
      />
      
      <PageGrid columns={3}>
        <RouteCard
          title="Front-Stage Users"
          description="Manage your customer relationships, marketing strategies, and user experience."
          href="/business/users"
          gradientClass="from-teal-500 to-cyan-500"
          tokenCode="BSP"
          tokenName="Front-Stage Users"
          tokenSymbol="BSP"
          icon={<Users className="h-5 w-5" />}
          delay={0}
        />
        
        <RouteCard
          title="Back-Stage Admin"
          description="Optimize your operations, team management, and internal processes."
          href="/business/admin"
          gradientClass="from-teal-500 to-cyan-500"
          tokenCode="BSP"
          tokenName="Back-Stage Admin"
          tokenSymbol="BSP"
          icon={<Settings className="h-5 w-5" />}
          delay={1}
        />
        
        <RouteCard
          title="Bottom-Line Profit"
          description="Track your financial performance, revenue streams, and profitability metrics."
          href="/business/profit"
          gradientClass="from-teal-500 to-cyan-500"
          tokenCode="BSP"
          tokenName="Bottom-Line Profit"
          tokenSymbol="BSP"
          icon={<LineChart className="h-5 w-5" />}
          delay={2}
        />
      </PageGrid>
    </RouteLayout>
  )
}
