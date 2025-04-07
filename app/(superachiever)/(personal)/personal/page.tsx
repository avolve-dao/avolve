"use client"

import { PageGrid } from "@/components/page-container"
import { RouteLayout } from "@/components/layouts/route-layout"
import { RouteCard } from "@/components/layouts/route-card"
import { TokenStats } from "@/components/token/token-stats"
import { Heart, DollarSign, Users, CheckCircle, MessageSquare } from "lucide-react"

export default function PersonalPage() {
  return (
    <RouteLayout 
      title="Personal Development"
      subtitle="Track and enhance your personal growth journey"
      tokenCode="PSP"
      tokenName="Personal Success Puzzle"
      tokenSymbol="PSP"
      gradientClass="from-amber-500 to-yellow-500"
      description="Manage your personal goals and achievements across health, wealth, and relationships. Complete activities in each area to earn PSP tokens and unlock new capabilities."
    >
      {/* Token Stats */}
      <TokenStats 
        tokenCode="PSP"
        tokenName="Personal Success Puzzle"
        tokenSymbol="PSP"
        gradientClass="from-amber-500 to-yellow-500"
        className="mb-8"
      />
      
      <PageGrid columns={3}>
        <RouteCard
          title="Dashboard"
          description="View your active goal, track progress, and complete weekly check-ins."
          href="/personal/dashboard"
          gradientClass="from-amber-500 to-yellow-500"
          tokenCode="PSP"
          tokenName="Personal Success Dashboard"
          tokenSymbol="PSP"
          icon={<CheckCircle className="h-5 w-5" />}
          delay={0}
          featured={true}
        />
        
        <RouteCard
          title="Community Feed"
          description="Share your journey and connect with other Superachievers."
          href="/personal/feed"
          gradientClass="from-amber-500 to-yellow-500"
          tokenCode="PSP"
          tokenName="Personal Success Feed"
          tokenSymbol="PSP"
          icon={<MessageSquare className="h-5 w-5" />}
          delay={1}
        />
        
        <RouteCard
          title="Health & Energy"
          description="Track and improve your physical health, mental wellbeing, and energy levels."
          href="/personal/health"
          gradientClass="from-amber-500 to-yellow-500"
          tokenCode="PSP"
          tokenName="Health & Energy"
          tokenSymbol="PSP"
          icon={<Heart className="h-5 w-5" />}
          delay={2}
        />
        
        <RouteCard
          title="Wealth & Career"
          description="Manage your financial goals, career development, and income streams."
          href="/personal/wealth"
          gradientClass="from-amber-500 to-yellow-500"
          tokenCode="PSP"
          tokenName="Wealth & Career"
          tokenSymbol="PSP"
          icon={<DollarSign className="h-5 w-5" />}
          delay={3}
        />
        
        <RouteCard
          title="Peace & People"
          description="Nurture your relationships, find inner peace, and build meaningful connections."
          href="/personal/peace"
          gradientClass="from-amber-500 to-yellow-500"
          tokenCode="PSP"
          tokenName="Peace & People"
          tokenSymbol="PSP"
          icon={<Users className="h-5 w-5" />}
          delay={4}
        />
      </PageGrid>
    </RouteLayout>
  )
}
