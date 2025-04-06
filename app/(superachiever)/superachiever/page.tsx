"use client"

import { PageContainer, PageSection, PageCard, PageGrid } from "@/components/page-container"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function SuperachieverPage() {
  return (
    <PageContainer 
      title="Superachiever" 
      subtitle="Your personal achievement platform"
      className="py-8"
    >
      <PageSection>
        <motion.p 
          className="text-lg text-zinc-700 dark:text-zinc-300 mb-8 max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Welcome to the Superachiever platform. This is your central hub for personal achievement, business growth,
          and mind development.
        </motion.p>
        
        <PageGrid columns={3}>
          <Link href="/personal" className="block">
            <PageCard className="h-full transition-all duration-300 hover:shadow-md group">
              <div className="flex flex-col h-full">
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                  Personal Success Puzzle
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4 flex-grow">
                  Manage your personal goals and achievements across health, wealth, and relationships.
                </p>
                <div className="flex items-center text-amber-500 group-hover:translate-x-1 transition-transform duration-300">
                  <span className="text-sm font-medium">Explore</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </PageCard>
          </Link>
          
          <Link href="/business" className="block">
            <PageCard className="h-full transition-all duration-300 hover:shadow-md group">
              <div className="flex flex-col h-full">
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  Business Success Puzzle
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4 flex-grow">
                  Track your business growth and opportunities with front-stage users, back-stage admin, and bottom-line profit.
                </p>
                <div className="flex items-center text-teal-500 group-hover:translate-x-1 transition-transform duration-300">
                  <span className="text-sm font-medium">Explore</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </PageCard>
          </Link>
          
          <Link href="/supermind" className="block">
            <PageCard className="h-full transition-all duration-300 hover:shadow-md group">
              <div className="flex flex-col h-full">
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
                  Supermind Superpowers
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4 flex-grow">
                  Develop your mental capabilities and knowledge to go further, faster, and forever.
                </p>
                <div className="flex items-center text-violet-500 group-hover:translate-x-1 transition-transform duration-300">
                  <span className="text-sm font-medium">Explore</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </PageCard>
          </Link>
        </PageGrid>
      </PageSection>
    </PageContainer>
  )
}
