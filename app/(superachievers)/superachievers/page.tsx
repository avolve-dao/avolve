"use client"

import { PageGrid } from "@/components/page-container"
import { RouteLayout } from "@/components/layouts/route-layout"
import { RouteCard } from "@/components/layouts/route-card"
import { TokenStats } from "@/components/token/token-stats"
import { BookOpen, GraduationCap, Users, Lightbulb } from "lucide-react"

export default function SuperachieversPage() {
  return (
    <RouteLayout 
      title="Superachievers"
      subtitle="Co-Create Your Superpuzzle"
      tokenCode="SCQ"
      tokenName="Superachievers"
      tokenSymbol="SCQ"
      gradientClass="from-slate-500 to-slate-700"
      description="Welcome to the Superachievers platform. This is your collaborative hub for collective transformation. Work together with other superachievers to develop enhanced individuals, advanced collectives, and balanced ecosystems."
    >
      {/* Token Stats */}
      <TokenStats 
        tokenCode="SCQ"
        tokenName="Superachievers"
        tokenSymbol="SCQ"
        gradientClass="from-slate-500 to-slate-700"
        className="mb-8"
      />
      
      <PageGrid columns={2}>
        <RouteCard
          title="Superpuzzle Developments"
          description="Conceive, believe, and achieve through enhanced individuals, advanced collectives, and balanced ecosystems."
          href="/superpuzzle"
          gradientClass="from-red-500 via-green-500 to-blue-500"
          tokenCode="SPD"
          tokenName="Superpuzzle Developments"
          tokenSymbol="SPD"
          icon={<BookOpen className="h-5 w-5" />}
          delay={0}
        />
        
        <RouteCard
          title="Superhuman Enhancements"
          description="Support development across all age groups from children to adults through academies, universities, and institutes."
          href="/superhuman"
          gradientClass="from-rose-500 via-red-500 to-orange-500"
          tokenCode="SHE"
          tokenName="Superhuman Enhancements"
          tokenSymbol="SHE"
          icon={<GraduationCap className="h-5 w-5" />}
          delay={1}
        />
        
        <RouteCard
          title="Supersociety Advancements"
          description="Build and develop networks at personal, global, and local levels through companies, communities, and countries."
          href="/supersociety"
          gradientClass="from-lime-500 via-green-500 to-emerald-500"
          tokenCode="SSA"
          tokenName="Supersociety Advancements"
          tokenSymbol="SSA"
          icon={<Users className="h-5 w-5" />}
          delay={2}
        />
        
        <RouteCard
          title="Supergenius Breakthroughs"
          description="Invent, improve, and manage growth engines through ventures, enterprises, and industries."
          href="/supergenius"
          gradientClass="from-sky-500 via-blue-500 to-indigo-500"
          tokenCode="SGB"
          tokenName="Supergenius Breakthroughs"
          tokenSymbol="SGB"
          icon={<Lightbulb className="h-5 w-5" />}
          delay={3}
        />
      </PageGrid>
    </RouteLayout>
  )
}
