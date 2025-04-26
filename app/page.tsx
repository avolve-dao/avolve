"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react"

// Dynamically import components to improve initial load time
const TokenVisualization = dynamic(() => import("@/components/token-visualization"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-2 border-t-transparent border-primary animate-spin opacity-30"></div>
    </div>
  ),
})

export default function HomePage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeSection, setActiveSection] = useState("hero")
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Refs for sections
  const heroRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const isHeroInView = useInView(heroRef, { once: false, amount: 0.3 })

  // For parallax scrolling effect
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 800], [0, -100])
  const opacity = useTransform(scrollY, [0, 300, 600], [1, 0.9, 0.8])

  // Update the hero text to better align with the Avolve ecosystem values
  const heroTexts = [
    {
      title: "Supercivilization",
      subtitle: "Avolve from Degen to Regen",
    },
    {
      title: "Superachiever",
      subtitle: "Create Your Success Puzzle",
    },
    {
      title: "Superachievers",
      subtitle: "Co-Create Your Superpuzzle",
    },
  ]

  const [currentTextIndex, setCurrentTextIndex] = useState(0)

  // Track mouse movement for subtle interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Simulate loading and start text rotation
  useEffect(() => {
    const loadTimer = setTimeout(() => setIsLoaded(true), 500)

    const textRotationTimer = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % heroTexts.length)
    }, 7000) // Slower rotation for more elegance

    return () => {
      clearTimeout(loadTimer)
      clearInterval(textRotationTimer)
    }
  }, [heroTexts.length])

  // Track active section based on scroll position
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY + window.innerHeight / 3

          if (heroRef.current && scrollPosition < heroRef.current.offsetTop + heroRef.current.offsetHeight) {
            setActiveSection("hero")
          } else if (cardsRef.current && scrollPosition >= cardsRef.current.offsetTop) {
            setActiveSection("cards")
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle scroll to cards section
  const scrollToCards = () => {
    if (cardsRef.current) {
      cardsRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-r from-stone-50 via-zinc-50 to-slate-50 dark:from-stone-950 dark:via-zinc-950 dark:to-slate-950 overflow-x-hidden texture-overlay">
      {/* Subtle background elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40 dark:opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern"></div>

        {/* Subtle gradient orbs */}
        <motion.div
          className="absolute w-[50vw] h-[50vw] rounded-full bg-gradient-to-r from-purple-500/5 via-violet-500/5 to-fuchsia-500/5 dark:from-purple-500/10 dark:via-violet-500/10 dark:to-fuchsia-500/10 blur-3xl hardware-accelerated"
          style={{
            top: `calc(${mousePosition.y}px - 40vw)`,
            left: `calc(${mousePosition.x}px - 20vw)`,
          }}
          animate={{
            x: (mousePosition.x - window.innerWidth / 2) * -0.01,
            y: (mousePosition.y - window.innerHeight / 2) * -0.01,
          }}
          transition={{
            type: "spring",
            stiffness: 10,
            damping: 25,
            mass: 1,
          }}
        ></motion.div>

        <motion.div
          className="absolute w-[40vw] h-[40vw] rounded-full bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-sky-500/5 dark:from-teal-500/10 dark:via-cyan-500/10 dark:to-sky-500/10 blur-3xl hardware-accelerated"
          style={{
            bottom: `calc(${window.innerHeight - mousePosition.y}px - 30vw)`,
            right: `calc(${window.innerWidth - mousePosition.x}px - 15vw)`,
          }}
          animate={{
            x: (mousePosition.x - window.innerWidth / 2) * 0.005,
            y: (mousePosition.y - window.innerHeight / 2) * 0.005,
          }}
          transition={{
            type: "spring",
            stiffness: 8,
            damping: 25,
            mass: 1,
          }}
        ></motion.div>
      </div>

      {/* Hero Section */}
      <div ref={heroRef} className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-50/90 via-zinc-50/95 to-slate-50 dark:from-stone-950/90 dark:via-zinc-950/95 dark:to-slate-950 z-0"></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern z-0"></div>

        {/* Token Visualization - positioned behind content with reduced opacity */}
        <motion.div
          className="absolute inset-0 w-full h-full z-0 opacity-20 dark:opacity-15 hardware-accelerated"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 0.2 : 0 }}
          transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
        >
          <TokenVisualization />
        </motion.div>

        {/* Hero Content - centered */}
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTextIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
              className="mb-10 flex flex-col items-center"
            >
              {/* Elegant badge for the token */}
              <motion.div
                className={`inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full ${
                  currentTextIndex === 0
                    ? "bg-gradient-to-r from-zinc-400 to-zinc-600 dark:from-zinc-500 dark:to-zinc-800"
                    : currentTextIndex === 1
                      ? "bg-gradient-to-r from-stone-400 to-stone-600 dark:from-stone-500 dark:to-stone-800"
                      : "bg-gradient-to-r from-slate-400 to-slate-600 dark:from-slate-500 dark:to-slate-800"
                } shadow-sm border border-white/10 z-20 elegant-badge badge-glow hardware-accelerated`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
              >
                <span className="text-sm font-medium text-white drop-shadow-sm">
                  {currentTextIndex === 0 ? "GEN" : currentTextIndex === 1 ? "SAP" : "SCQ"}
                </span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-zinc-800 dark:text-white tracking-tight mb-4 text-center text-shadow-sm responsive-heading">
                <span className="inline-block">{heroTexts[currentTextIndex].title}</span>
              </h1>
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-zinc-700/90 dark:text-white/80 font-medium max-w-2xl text-center responsive-subheading">
                {heroTexts[currentTextIndex].subtitle}
              </h2>

              {/* Elegant divider */}
              <motion.div
                className="w-24 h-px elegant-divider mt-10"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 96, opacity: 1 }}
                transition={{ delay: 0.8, duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Call to action buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 mt-10 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.19, 1, 0.22, 1] }}
          >
            <Link href="/get-started" className="group">
              <motion.div
                className="relative overflow-hidden bg-gradient-to-r from-stone-100 via-zinc-100 to-slate-100 dark:from-stone-800 dark:via-zinc-800 dark:to-slate-800 text-slate-800 dark:text-slate-200 px-6 sm:px-8 py-3 sm:py-4 rounded-lg flex items-center gap-2 font-medium text-base sm:text-lg shadow-md hover:shadow-lg transition-all duration-700 luxury-card hardware-accelerated"
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
              >
                <span className="z-10 relative">Get Started</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-500 z-10 relative" />

                {/* Subtle hover effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-stone-200 via-zinc-200 to-slate-200 dark:from-stone-700 dark:via-zinc-700 dark:to-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
                ></motion.div>
              </motion.div>
            </Link>

            <Link href="/learn-more" className="group">
              <motion.div
                className="relative overflow-hidden bg-transparent border border-zinc-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 px-6 sm:px-8 py-3 sm:py-4 rounded-lg flex items-center gap-2 font-medium text-base sm:text-lg shadow-md hover:shadow-lg transition-all duration-700 backdrop-blur-sm luxury-card hardware-accelerated"
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
              >
                <span className="z-10 relative">Learn More</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-500 z-10 relative" />

                {/* Subtle hover effect */}
                <motion.div
                  className="absolute inset-0 bg-white/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
                ></motion.div>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Elegant scroll indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 cursor-pointer z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8, y: [0, 5, 0] }}
          transition={{
            opacity: { delay: 2, duration: 1 },
            y: { repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut", repeatDelay: 0.5 },
          }}
          onClick={scrollToCards}
          whileHover={{ opacity: 1 }}
        >
          <div className="p-3 rounded-full bg-white/5 dark:bg-white/5 backdrop-blur-md border border-white/10 shadow-sm">
            <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
        </motion.div>
      </div>

      {/* Ecosystem Section */}
      <section ref={cardsRef} className="py-20 sm:py-24 md:py-32 relative">
        <div className="absolute inset-0 pointer-events-none luxury-gradient-overlay"></div>
        <div className="sacred-container relative">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 md:mb-24 fibonacci-spacing">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full shadow-sm border border-white/10 mb-8 z-20 elegant-badge badge-glow hardware-accelerated"
              style={{
                background: isDark
                  ? "linear-gradient(to right, #d946ef, #ec4899, #f43f5e, #ef4444, #f97316, #f59e0b, #eab308, #84cc16, #22c55e, #10b981, #14b8a6, #06b6d4, #0ea5e9, #3b82f6, #6366f1, #8b5cf6, #a855f7)"
                  : "linear-gradient(to right, #c026d3, #db2777, #e11d48, #dc2626, #ea580c, #d97706, #ca8a04, #65a30d, #16a34a, #059669, #0d9488, #0891b2, #0284c7, #2563eb, #4f46e5, #7c3aed, #9333ea)",
                backgroundSize: "300% 100%",
                animation: "gradient-shift 20s ease-in-out infinite",
              }}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Go Further, Faster, Forever</span>
            </motion.div>

            <motion.h2
              className="text-3xl md:text-4xl font-bold text-zinc-800 dark:text-white mb-4 responsive-heading"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
            >
              The Avolve DAO
            </motion.h2>
            <motion.p
              className="text-zinc-600 dark:text-zinc-400 text-lg sm:text-xl"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
            >
              Three pillars of transformation: individual, collective, and ecosystem journeys
            </motion.p>
          </div>

          {/* Main Ecosystem Card */}
          <div className="space-y-20 sm:space-y-24">
            <EcosystemCard
              id="gen"
              title="Supercivilization"
              description="Avolve from Degen to Regen"
              gradient="from-zinc-600 to-zinc-700 dark:from-zinc-600 dark:to-zinc-900"
              glowColor="rgba(161, 161, 170, 0.2)"
              delay={0.1}
              isLarge
              token="GEN"
              content="Genius ID, GEN coin/token, and Genie AI - the foundation of the Avolve ecosystem"
            />

            {/* Two main branches */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 card-grid">
              <EcosystemCard
                id="sap"
                title="Superachiever"
                description="Create Your Success Puzzle"
                gradient="from-stone-600 to-stone-700 dark:from-stone-600 dark:to-stone-900"
                glowColor="rgba(168, 162, 158, 0.2)"
                delay={0.2}
                token="SAP"
                content="Create Your Personal & Business Success Puzzles with Joy & Ease by Becoming a Greater Superachiever!"
              />

              <EcosystemCard
                id="scq"
                title="Superachievers"
                description="Co-Create Your Superpuzzle"
                gradient="from-slate-600 to-slate-700 dark:from-slate-600 dark:to-slate-900"
                glowColor="rgba(148, 163, 184, 0.2)"
                delay={0.3}
                token="SCQ"
                content="Evolve From a Degen in an Anticivilization Into a Regen in a Supercivilization Within Your Lifetime!"
              />
            </div>

            {/* Superachiever branch */}
            <div>
              <h3 className="text-2xl font-bold text-zinc-800 dark:text-white mb-8 text-center responsive-heading">
                Superachiever Playbook
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 card-grid">
                <EcosystemCard
                  id="psp"
                  title="Personal Success Puzzle"
                  description="Greater Personal Successes"
                  gradient="from-amber-600 to-yellow-600 dark:from-amber-600 dark:to-yellow-600"
                  glowColor="rgba(245, 158, 11, 0.2)"
                  delay={0.4}
                  token="PSP"
                  content="Enjoy Greater Personal Successes Faster via Boosting Your Overall Health, Wealth, and Peace in Life!"
                />

                <EcosystemCard
                  id="bsp"
                  title="Business Success Puzzle"
                  description="Greater Business Successes"
                  gradient="from-teal-600 to-cyan-600 dark:from-teal-600 dark:to-cyan-600"
                  glowColor="rgba(20, 184, 166, 0.2)"
                  delay={0.5}
                  token="BSP"
                  content="Enjoy Greater Business Successes Faster by Enhancing Your Network and also Advancing Your Net Worth!"
                />

                <EcosystemCard
                  id="sms"
                  title="Supermind Superpowers"
                  description="Go Further, Faster, & Forever"
                  gradient="from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-600 dark:via-purple-600 dark:to-fuchsia-600"
                  glowColor="rgba(139, 92, 246, 0.2)"
                  delay={0.6}
                  token="SMS"
                  content="Improve Your Ability to Solve a Conflict, Create a Plan for the Future & Implement Your Action Plan!"
                />
              </div>
            </div>

            {/* Superachievers branch */}
            <div>
              <h3 className="text-2xl font-bold text-zinc-800 dark:text-white mb-8 text-center responsive-heading">
                Supercivilization Quests
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 card-grid">
                <EcosystemCard
                  id="spd"
                  title="Superpuzzle Developments"
                  description="Conceive, Believe, & Achieve"
                  gradient="from-red-600 via-green-600 to-blue-600 dark:from-red-600 dark:via-green-600 dark:to-blue-600"
                  glowColor="rgba(34, 197, 94, 0.2)"
                  delay={0.7}
                  token="SPD"
                  content="Progress Our Grand Superpuzzle & Worldwide Drive to Ensure Wealth, Health, & Peace in Your Lifetime!"
                />

                <EcosystemCard
                  id="she"
                  title="Superhuman Enhancements"
                  description="Super Enhanced Individuals"
                  gradient="from-rose-600 via-red-600 to-orange-600 dark:from-rose-600 dark:via-red-600 dark:to-orange-600"
                  glowColor="rgba(239, 68, 68, 0.2)"
                  delay={0.8}
                  token="SHE"
                  content="Free Yourself & Loved Ones via Superhuman Enhancements That Support Everyone: Child, Youth, & Adult!"
                />

                <EcosystemCard
                  id="ssa"
                  title="Supersociety Advancements"
                  description="Super Advanced Collectives"
                  gradient="from-lime-600 via-green-600 to-emerald-600 dark:from-lime-600 dark:via-green-600 dark:to-emerald-600"
                  glowColor="rgba(132, 204, 22, 0.2)"
                  delay={0.9}
                  token="SSA"
                  content="Free Others & Everybody via Supersociety Advancements That Help Companies, Communities, & Countries!"
                />

                <EcosystemCard
                  id="sgb"
                  title="Supergenius Breakthroughs"
                  description="Super Balanced Ecosystems"
                  gradient="from-sky-600 via-blue-600 to-indigo-600 dark:from-sky-600 dark:via-blue-600 dark:to-indigo-600"
                  glowColor="rgba(14, 165, 233, 0.2)"
                  delay={1.0}
                  token="SGB"
                  content="Solve Superpuzzles via Supergenius Breakthroughs That Help Grow Ventures, Enterprises, & Industries!"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

// Ecosystem Card Component
function EcosystemCard({
  id,
  title,
  description,
  gradient,
  glowColor,
  delay = 0,
  isLarge = false,
  content = "",
  token = "",
}: {
  id: string
  title: string
  description: string
  gradient: string
  glowColor: string
  delay?: number
  isLarge?: boolean
  content?: string
  token?: string
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, {
    once: true,
    amount: 0.2,
    margin: "-100px", // Start animation before the card is fully in view
  })
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 1, delay, ease: [0.19, 1, 0.22, 1] }}
      className="relative will-change-transform"
    >
      <Link href={`/${title.toLowerCase().replace(/\s+/g, "-")}`} className="block group">
        <div className="card-with-badge">
          {/* Badge attached to the top of the card */}
          <div className="attached-badge">
            <div
              className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gradient-to-r ${gradient} backdrop-blur-md text-sm font-medium shadow-md border border-white/10 elegant-badge badge-glow`}
            >
              <span className="text-white font-medium tracking-wide drop-shadow-sm">
                {token ? token : id.toUpperCase()}
              </span>
            </div>
          </div>

          <div
            className={`bg-gradient-to-r ${gradient} ${
              isLarge ? "phi-py-3" : "phi-py-2"
            } px-6 sm:px-8 md:px-12 text-center text-white rounded-xl relative overflow-hidden shadow-lg group-hover:-translate-y-2 transition-all duration-500 ease-out card-with-top-badge`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Subtle glow effect */}
            <div
              className="absolute inset-0 rounded-xl transition-opacity duration-500 z-0"
              style={{
                background: `radial-gradient(circle at center, ${glowColor}, transparent 70%)`,
                opacity: isHovered ? 0.5 : 0.2,
              }}
            ></div>

            {/* Content - Centered */}
            <div className="relative z-10 flex flex-col items-center justify-center card-content">
              <h2
                className={`${
                  isLarge ? "text-3xl sm:text-4xl md:text-5xl lg:text-6xl" : "text-xl sm:text-2xl md:text-3xl"
                } font-bold mb-3 tracking-tight text-center responsive-heading`}
              >
                {title}
              </h2>

              <p
                className={`${
                  isLarge ? "text-lg sm:text-xl md:text-2xl" : "text-base sm:text-lg"
                } text-white/80 max-w-2xl mx-auto mb-2 text-center responsive-subheading`}
              >
                {description}
              </p>

              {content && (
                <p
                  className={`text-white/70 text-sm md:text-base mt-4 max-w-2xl mx-auto text-center transition-opacity duration-500 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {content}
                </p>
              )}
            </div>

            {/* Subtle arrow indicator */}
            <div
              className={`absolute bottom-6 right-6 transition-all duration-500 ${
                isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
              }`}
            >
              <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Subtle shine effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transition-opacity duration-700 ${
                isHovered ? "opacity-30 translate-x-full" : "opacity-0 -translate-x-full"
              }`}
            ></div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
