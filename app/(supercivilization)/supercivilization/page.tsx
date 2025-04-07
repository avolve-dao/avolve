"use client"

import { PageGrid } from "@/components/page-container"
import { RouteLayout } from "@/components/layouts/route-layout"
import { RouteCard } from "@/components/layouts/route-card"
import { TokenStats } from "@/components/token/token-stats"
import { TrendingUp, Target, Users, Wind } from "lucide-react"

export default function SupercivilizationPage() {
  return (
    <RouteLayout 
      title="Supercivilization"
      subtitle="Avolve from Degen to Regen"
      tokenCode="GEN"
      tokenName="Supercivilization"
      tokenSymbol="GEN"
      gradientClass="from-zinc-500 to-zinc-700"
      description="Welcome to the Supercivilization platform. This is your ecosystem hub for transformation. Evolve from a degen in an anticivilization into a regen in a supercivilization within your lifetime."
    >
      {/* Token Stats */}
      <TokenStats 
        tokenCode="GEN"
        tokenName="Supercivilization"
        tokenSymbol="GEN"
        gradientClass="from-zinc-500 to-zinc-700"
        className="mb-8"
      />
      
      <PageGrid columns={3}>
        <RouteCard
          title="Avolve from Degen to Regen"
          description="Transform from degenerative to regenerative practices through Genius ID, GEN coin, and Genie AI."
          href="/avolve"
          gradientClass="from-zinc-500 to-zinc-700"
          tokenCode="GEN"
          tokenName="Avolve from Degen to Regen"
          tokenSymbol="GEN"
          icon={<TrendingUp className="h-5 w-5" />}
          delay={0}
        />
        
        <RouteCard
          title="Create Your Success Puzzle"
          description="Create your personal and business success puzzles with joy and ease by becoming a greater superachiever."
          href="/create-success"
          gradientClass="from-stone-500 to-stone-700"
          tokenCode="SAP"
          tokenName="Create Your Success Puzzle"
          tokenSymbol="SAP"
          icon={<Target className="h-5 w-5" />}
          delay={1}
        />
        
        <RouteCard
          title="Co-Create Our Superpuzzle"
          description="Evolve from a degen in an anticivilization into a regen in a supercivilization within your lifetime."
          href="/co-create"
          gradientClass="from-slate-500 to-slate-700"
          tokenCode="SCQ"
          tokenName="Co-Create Our Superpuzzle"
          tokenSymbol="SCQ"
          icon={<Users className="h-5 w-5" />}
          delay={2}
        />
      </PageGrid>
    </RouteLayout>
  )
}
