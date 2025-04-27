"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import ThemeToggle from "@/components/theme-toggle"

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
      {/* Theme toggle button - fixed position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
              >
                <Badge
                  className={cn(
                    "px-4 py-2 mb-8 text-sm font-medium text-white shadow-sm",
                    currentTextIndex === 0
                      ? "bg-gradient-to-r from-zinc-400 to-zinc-600 dark:from-zinc-600 dark:to-zinc-800"
                      : currentTextIndex === 1
                        ? "bg-gradient-to-r from-stone-400 to-stone-600 dark:from-stone-600 dark:to-stone-800"
                        : "bg-gradient-to-r from-slate-400 to-slate-600 dark:from-slate-600 dark:to-slate-800",
                  )}
                >
                  {currentTextIndex === 0 ? "GEN" : currentTextIndex === 1 ? "SAP" : "SCQ"}
                </Badge>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-zinc-800 dark:text-white tracking-tight mb-4 text-center text-shadow-sm">
                <span className="inline-block">{heroTexts[currentTextIndex].title}</span>
              </h1>
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-zinc-700/90 dark:text-white/80 font-medium max-w-2xl text-center">
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
            <Link href="/get-started">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-stone-100 via-zinc-100 to-slate-100 dark:from-stone-800 dark:via-zinc-800 dark:to-slate-800 text-slate-800 dark:text-slate-200 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <span>Get Started</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>

            <Link href="/learn-more">
              <Button
                size="lg"
                variant="outline"
                className="group border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
              >
                <span>Learn More</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
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
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full bg-white/5 dark:bg-white/5 backdrop-blur-md border border-white/10 shadow-sm"
          >
            <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </Button>
        </motion.div>
      </div>

      {/* Ecosystem Section */}
      <section ref={cardsRef} className="py-20 sm:py-24 md:py-32 relative">
        <div className="absolute inset-0 pointer-events-none luxury-gradient-overlay"></div>
        <div className="sacred-container relative">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 md:mb-24 fibonacci-spacing">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            >
              <Badge
                className="px-4 py-2 mb-8 inline-flex items-center gap-2"
                style={{
                  backgroundImage: isDark
                    ? "linear-gradient(to right, #9d174d, #be185d, #dc2626, #b45309, #a16207, #65a30d, #15803d, #0f766e, #0e7490, #0369a1, #1e40af, #4338ca, #6d28d9, #7e22ce)"
                    : "linear-gradient(to right, #db2777, #e11d48, #dc2626, #ea580c, #d97706, #65a30d, #16a34a, #0d9488, #0891b2, #0284c7, #1d4ed8, #4f46e5, #7c3aed, #9333ea)",
                  backgroundSize: "300% 100%",
                  animation: "gradient-shift 20s ease-in-out infinite",
                }}
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">Go Further, Faster, Forever</span>
              </Badge>
            </motion.div>

            <motion.h2
              className="text-3xl md:text-4xl font-bold text-zinc-800 dark:text-white mb-4"
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
              gradient="from-zinc-500 to-zinc-700 dark:from-zinc-700 dark:to-zinc-900"
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
                gradient="from-stone-500 to-stone-700 dark:from-stone-700 dark:to-stone-900"
                glowColor="rgba(168, 162, 158, 0.2)"
                delay={0.2}
                token="SAP"
                content="Create Your Personal & Business Success Puzzles with Joy & Ease by Becoming a Greater Superachiever!"
              />

              <EcosystemCard
                id="scq"
                title="Superachievers"
                description="Co-Create Your Superpuzzle"
                gradient="from-slate-500 to-slate-700 dark:from-slate-700 dark:to-slate-900"
                glowColor="rgba(148, 163, 184, 0.2)"
                delay={0.3}
                token="SCQ"
                content="Evolve From a Degen in an Anticivilization Into a Regen in a Supercivilization Within Your Lifetime!"
              />
            </div>

            {/* Superachiever branch */}
            <div>
              <h3 className="text-2xl font-bold text-zinc-800 dark:text-white mb-8 text-center">
                Superachiever Playbook
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 card-grid">
                <EcosystemCard
                  id="psp"
                  title="Personal Success Puzzle"
                  description="Greater Personal Successes"
                  gradient="from-amber-500 to-yellow-600 dark:from-amber-700 dark:to-yellow-900"
                  glowColor="rgba(245, 158, 11, 0.2)"
                  delay={0.4}
                  token="PSP"
                  content="Enjoy Greater Personal Successes Faster via Boosting Your Overall Health, Wealth, and Peace in Life!"
                />

                <EcosystemCard
                  id="bsp"
                  title="Business Success Puzzle"
                  description="Greater Business Successes"
                  gradient="from-teal-500 to-cyan-600 dark:from-teal-700 dark:to-cyan-900"
                  glowColor="rgba(20, 184, 166, 0.2)"
                  delay={0.5}
                  token="BSP"
                  content="Enjoy Greater Business Successes Faster by Enhancing Your Network and also Advancing Your Net Worth!"
                />

                <EcosystemCard
                  id="sms"
                  title="Supermind Superpowers"
                  description="Go Further, Faster, & Forever"
                  gradient="from-violet-500 via-purple-500 to-fuchsia-500 dark:from-violet-700 dark:via-purple-700 dark:to-fuchsia-700"
                  glowColor="rgba(139, 92, 246, 0.2)"
                  delay={0.6}
                  token="SMS"
                  content="Improve Your Ability to Solve a Conflict, Create a Plan for the Future & Implement Your Action Plan!"
                />
              </div>
            </div>

            {/* Superachievers branch */}
            <div>
              <h3 className="text-2xl font-bold text-zinc-800 dark:text-white mb-8 text-center">
                Supercivilization Quests
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 card-grid">
                <EcosystemCard
                  id="spd"
                  title="Superpuzzle Developments"
                  description="Conceive, Believe, & Achieve"
                  gradient="from-red-500 via-green-500 to-blue-500 dark:from-red-700 dark:via-green-700 dark:to-blue-700"
                  glowColor="rgba(34, 197, 94, 0.2)"
                  delay={0.7}
                  token="SPD"
                  content="Progress Our Grand Superpuzzle & Worldwide Drive to Ensure Wealth, Health, & Peace in Your Lifetime!"
                />

                <EcosystemCard
                  id="she"
                  title="Superhuman Enhancements"
                  description="Super Enhanced Individuals"
                  gradient="from-rose-500 via-red-500 to-orange-500 dark:from-rose-700 dark:via-red-700 dark:to-orange-700"
                  glowColor="rgba(239, 68, 68, 0.2)"
                  delay={0.8}
                  token="SHE"
                  content="Free Yourself & Loved Ones via Superhuman Enhancements That Support Everyone: Child, Youth, & Adult!"
                />

                <EcosystemCard
                  id="ssa"
                  title="Supersociety Advancements"
                  description="Super Advanced Collectives"
                  gradient="from-lime-500 via-green-500 to-emerald-500 dark:from-lime-700 dark:via-green-700 dark:to-emerald-700"
                  glowColor="rgba(132, 204, 22, 0.2)"
                  delay={0.9}
                  token="SSA"
                  content="Free Others & Everybody via Supersociety Advancements That Help Companies, Communities, & Countries!"
                />

                <EcosystemCard
                  id="sgb"
                  title="Supergenius Breakthroughs"
                  description="Super Balanced Ecosystems"
                  gradient="from-sky-500 via-blue-500 to-indigo-500 dark:from-sky-700 dark:via-blue-700 dark:to-indigo-700"
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
            <Badge
              className={`px-4 py-1.5 bg-gradient-to-r ${gradient} text-white font-medium tracking-wide shadow-md border-white/10`}
            >
              {token ? token : id.toUpperCase()}
            </Badge>
          </div>

          <Card
            className={cn(
              "overflow-hidden shadow-lg group-hover:-translate-y-2 transition-all duration-500 ease-out card-with-top-badge border-0",
              `bg-gradient-to-r ${gradient}`,
            )}
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
            <CardContent
              className={cn(
                "relative z-10 flex flex-col items-center justify-center text-center",
                isLarge ? "p-8 md:p-12" : "p-6 md:p-8",
              )}
            >
              <h2
                className={cn(
                  "font-bold mb-3 tracking-tight text-center text-white",
                  isLarge ? "text-3xl sm:text-4xl md:text-5xl lg:text-6xl" : "text-xl sm:text-2xl md:text-3xl",
                )}
              >
                {title}
              </h2>

              <p
                className={cn(
                  "text-white/80 max-w-2xl mx-auto mb-2 text-center",
                  isLarge ? "text-lg sm:text-xl md:text-2xl" : "text-base sm:text-lg",
                )}
              >
                {description}
              </p>

              {/* Divider line */}
              <motion.div
                className="w-16 h-px bg-white/30 my-4"
                initial={{ width: 0 }}
                animate={{ width: isHovered ? 64 : 0 }}
                transition={{ duration: 0.4 }}
              />

              {/* Content with fade in effect */}
              {content && (
                <motion.p
                  className="text-white/70 text-sm md:text-base max-w-2xl mx-auto text-center"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: isHovered ? 1 : 0,
                    height: isHovered ? "auto" : 0,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {content}
                </motion.p>
              )}

              {/* Centered action indicator */}
              <motion.div
                className="mt-4 flex items-center justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  y: isHovered ? 0 : 10,
                }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
                  <span className="text-sm font-medium text-white">Learn more</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </motion.div>
            </CardContent>

            {/* Subtle shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: isHovered ? "100%" : "-100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              style={{ transformOrigin: "left" }}
            />
          </Card>
        </div>
      </Link>
    </motion.div>
  )
}
