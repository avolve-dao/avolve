"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface CardProps {
  title: string
  subtitle: string
  gradient: string
  token?: string
  onClick?: () => void
  className?: string
}

function EcosystemCard({ title, subtitle, gradient, token, onClick, className = "" }: CardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className={`relative rounded-xl p-6 cursor-pointer overflow-hidden shadow-lg ${gradient} ${className}`}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative z-10 text-center">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 drop-shadow-sm">{title}</h3>
        <p className="text-white/90 font-medium text-sm md:text-base">{subtitle}</p>
        {token && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/20 dark:bg-white/20 rounded-full text-xs text-white font-medium">
            {token}
          </span>
        )}
      </div>

      <motion.div
        className="absolute inset-0 bg-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Subtle glow effect */}
      <motion.div
        className="absolute inset-0 blur-xl"
        style={{
          background: gradient.replace("bg-", ""),
          opacity: 0.2,
          zIndex: -1,
        }}
        animate={{
          opacity: isHovered ? 0.4 : 0.2,
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  )
}

export default function EcosystemCards() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Top level */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <EcosystemCard
          title="Supercivilization"
          subtitle="Avolve from Degen to Regen"
          gradient="bg-gradient-to-r from-zinc-500 to-zinc-700 dark:from-zinc-600 dark:to-zinc-900"
          token="GEN"
          className="h-24 md:h-28"
        />
      </div>

      {/* Second level */}
      <div className="col-span-1 md:col-span-1 lg:col-span-1">
        <EcosystemCard
          title="Superachiever"
          subtitle="Create Your Success Puzzle"
          gradient="bg-gradient-to-r from-stone-500 to-stone-700 dark:from-stone-600 dark:to-stone-900"
          token="SAP"
          className="h-24 md:h-28"
        />
      </div>

      <div className="col-span-1 md:col-span-1 lg:col-span-2">
        <EcosystemCard
          title="Superachievers"
          subtitle="Co-Create Our Super Puzzle"
          gradient="bg-gradient-to-r from-slate-500 to-slate-700 dark:from-slate-600 dark:to-slate-900"
          token="SCQ"
          className="h-24 md:h-28"
        />
      </div>

      {/* Third level - Superachiever branch */}
      <div className="col-span-1">
        <EcosystemCard
          title="Supermind Superpowers"
          subtitle="Go Further, Faster, & Forever"
          gradient="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 dark:from-violet-600 dark:via-purple-600 dark:to-fuchsia-600"
          token="SMS"
          className="h-24 md:h-28"
        />
      </div>

      <div className="col-span-1">
        <EcosystemCard
          title="Personal Success Puzzle"
          subtitle="Greater Personal Successes"
          gradient="bg-gradient-to-r from-amber-500 to-yellow-500 dark:from-amber-600 dark:to-yellow-600"
          token="PSP"
          className="h-24 md:h-28"
        />
      </div>

      <div className="col-span-1">
        <EcosystemCard
          title="Business Success Puzzle"
          subtitle="Greater Business Successes"
          gradient="bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-600 dark:to-cyan-600"
          token="BSP"
          className="h-24 md:h-28"
        />
      </div>

      {/* Third level - Superachievers branch */}
      <div className="col-span-1 md:col-span-3">
        <EcosystemCard
          title="Superpuzzle Developments"
          subtitle="Conceive, Believe, & Achieve"
          gradient="bg-gradient-to-r from-red-500 via-green-500 to-blue-500 dark:from-red-600 dark:via-green-600 dark:to-blue-600"
          token="SPD"
          className="h-24 md:h-28"
        />
      </div>

      <div className="col-span-1">
        <EcosystemCard
          title="Superhuman Enhancements"
          subtitle="Super Enhanced Individuals"
          gradient="bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 dark:from-rose-600 dark:via-red-600 dark:to-orange-600"
          token="SHE"
          className="h-24 md:h-28"
        />
      </div>

      <div className="col-span-1">
        <EcosystemCard
          title="Supersociety Advancements"
          subtitle="Super Advanced Collectives"
          gradient="bg-gradient-to-r from-lime-500 via-green-500 to-emerald-500 dark:from-lime-600 dark:via-green-600 dark:to-emerald-600"
          token="SSA"
          className="h-24 md:h-28"
        />
      </div>

      <div className="col-span-1">
        <EcosystemCard
          title="Supergenius Breakthroughs"
          subtitle="Super Balanced Ecosystems"
          gradient="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 dark:from-sky-600 dark:via-blue-600 dark:to-indigo-600"
          token="SGB"
          className="h-24 md:h-28"
        />
      </div>
    </motion.div>
  )
}
