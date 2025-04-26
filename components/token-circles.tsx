"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"

interface TokenCircle {
  id: string
  token: string
  name: string
  size: number
  color: string
  gradient: string
  parent?: string
  x?: number
  y?: number
}

export default function TokenCircles() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [circles, setCircles] = useState<TokenCircle[]>([])
  const [hoveredToken, setHoveredToken] = useState<string | null>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Define the token structure with proper colors
    const tokenData: TokenCircle[] = [
      {
        id: "gen",
        token: "GEN",
        name: "Supercivilization",
        size: 120,
        color: "#71717a", // zinc-500
        gradient: "from-zinc-500 to-zinc-700 dark:from-zinc-600 dark:to-zinc-900",
        parent: "",
      },
      {
        id: "sap",
        token: "SAP",
        name: "Superachiever",
        size: 90,
        color: "#78716c", // stone-500
        gradient: "from-stone-500 to-stone-700 dark:from-stone-600 dark:to-stone-900",
        parent: "gen",
      },
      {
        id: "scq",
        token: "SCQ",
        name: "Superachievers",
        size: 90,
        color: "#64748b", // slate-500
        gradient: "from-slate-500 to-slate-700 dark:from-slate-600 dark:to-slate-900",
        parent: "gen",
      },
      {
        id: "psp",
        token: "PSP",
        name: "Personal Success Puzzle",
        size: 70,
        color: "#f59e0b", // amber-500
        gradient: "from-amber-500 to-yellow-500 dark:from-amber-600 dark:to-yellow-600",
        parent: "sap",
      },
      {
        id: "bsp",
        token: "BSP",
        name: "Business Success Puzzle",
        size: 70,
        color: "#14b8a6", // teal-500
        gradient: "from-teal-500 to-cyan-500 dark:from-teal-600 dark:to-cyan-600",
        parent: "sap",
      },
      {
        id: "sms",
        token: "SMS",
        name: "Supermind Superpowers",
        size: 70,
        color: "#8b5cf6", // violet-500
        gradient:
          "from-violet-500 via-purple-500 to-fuchsia-500 dark:from-violet-600 dark:via-purple-600 dark:to-fuchsia-600",
        parent: "sap",
      },
      {
        id: "spd",
        token: "SPD",
        name: "Superpuzzle Developments",
        size: 70,
        color: "#22c55e", // green-500
        gradient: "from-red-500 via-green-500 to-blue-500 dark:from-red-600 dark:via-green-600 dark:to-blue-600",
        parent: "scq",
      },
      {
        id: "she",
        token: "SHE",
        name: "Superhuman Enhancements",
        size: 70,
        color: "#ef4444", // red-500
        gradient: "from-rose-500 via-red-500 to-orange-500 dark:from-rose-600 dark:via-red-600 dark:to-orange-600",
        parent: "scq",
      },
      {
        id: "ssa",
        token: "SSA",
        name: "Supersociety Advancements",
        size: 70,
        color: "#84cc16", // lime-500
        gradient:
          "from-lime-500 via-green-500 to-emerald-500 dark:from-lime-600 dark:via-green-600 dark:to-emerald-600",
        parent: "scq",
      },
      {
        id: "sgb",
        token: "SGB",
        name: "Supergenius Breakthroughs",
        size: 70,
        color: "#0ea5e9", // sky-500
        gradient: "from-sky-500 via-blue-500 to-indigo-500 dark:from-sky-600 dark:via-blue-600 dark:to-indigo-600",
        parent: "scq",
      },
    ]

    // Calculate positions based on viewport
    const calculatePositions = () => {
      if (!containerRef.current) return tokenData

      const containerWidth = containerRef.current.offsetWidth
      const containerHeight = containerRef.current.offsetHeight

      // Position GEN in the center
      const genToken = tokenData.find((t) => t.id === "gen")!
      genToken.x = containerWidth / 2
      genToken.y = containerHeight / 2

      // Position SAP and SCQ on either side of GEN
      const sapToken = tokenData.find((t) => t.id === "sap")!
      sapToken.x = genToken.x - genToken.size * 1.2
      sapToken.y = genToken.y

      const scqToken = tokenData.find((t) => t.id === "scq")!
      scqToken.x = genToken.x + genToken.size * 1.2
      scqToken.y = genToken.y

      // Position PSP above SAP
      const pspToken = tokenData.find((t) => t.id === "psp")!
      pspToken.x = sapToken.x - sapToken.size * 0.8
      pspToken.y = sapToken.y - sapToken.size * 0.8

      // Position BSP below SAP
      const bspToken = tokenData.find((t) => t.id === "bsp")!
      bspToken.x = sapToken.x - sapToken.size * 0.8
      bspToken.y = sapToken.y + sapToken.size * 0.8

      // Position SMS horizontally from SAP
      const smsToken = tokenData.find((t) => t.id === "sms")!
      smsToken.x = sapToken.x - sapToken.size * 1.5
      smsToken.y = sapToken.y

      // Position SCQ children in an arc
      const scqChildren = tokenData.filter((t) => t.parent === "scq")
      scqChildren.forEach((child, index) => {
        const angle = -Math.PI / 2 + Math.PI * (index / (scqChildren.length - 1))
        const radius = scqToken.size * 1.5
        child.x = scqToken.x + Math.cos(angle) * radius
        child.y = scqToken.y + Math.sin(angle) * radius
      })

      return tokenData
    }

    // Set initial positions and handle window resize
    const handleResize = () => {
      setCircles(calculatePositions())
      setIsInitialized(true)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      {/* Connections between tokens */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {circles.map((circle) => {
          if (!circle.parent) return null
          const parent = circles.find((c) => c.id === circle.parent)
          if (!parent || !circle.x || !circle.y || !parent.x || !parent.y) return null

          return (
            <motion.line
              key={`${parent.id}-${circle.id}`}
              x1={parent.x}
              y1={parent.y}
              x2={circle.x}
              y2={circle.y}
              stroke={isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}
              strokeWidth={2}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          )
        })}
      </svg>

      {/* Token circles */}
      {isInitialized &&
        circles.map((circle) => (
          <motion.div
            key={circle.id}
            className={`absolute rounded-full flex items-center justify-center cursor-pointer bg-gradient-to-br ${circle.gradient}`}
            style={{
              width: circle.size,
              height: circle.size,
              left: circle.x ? circle.x - circle.size / 2 : 0,
              top: circle.y ? circle.y - circle.size / 2 : 0,
              boxShadow:
                hoveredToken === circle.id
                  ? isDark
                    ? "0 0 30px rgba(255,255,255,0.4)"
                    : "0 0 30px rgba(0,0,0,0.3)"
                  : isDark
                    ? "0 0 15px rgba(255,255,255,0.1)"
                    : "0 0 15px rgba(0,0,0,0.1)",
              zIndex: hoveredToken === circle.id ? 10 : circle.id === "gen" ? 5 : 1,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: 0.5,
              delay: circles.indexOf(circle) * 0.1,
            }}
            whileHover={{
              scale: 1.1,
              boxShadow: isDark ? "0 0 40px rgba(255,255,255,0.5)" : "0 0 40px rgba(0,0,0,0.4)",
            }}
            onMouseEnter={() => setHoveredToken(circle.id)}
            onMouseLeave={() => setHoveredToken(null)}
          >
            <div className="flex flex-col items-center justify-center text-white">
              <span className="font-bold text-lg">{circle.token}</span>
              <AnimatePresence>
                {hoveredToken === circle.id && (
                  <motion.div
                    className="absolute -bottom-10 whitespace-nowrap bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-white/90 font-medium shadow-lg border border-white/10"
                    initial={{ opacity: 0, y: -5, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    {circle.name}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
    </div>
  )
}
