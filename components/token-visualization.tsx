"use client"

import { useEffect, useState, useRef, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import React from "react"

interface TokenNode {
  id: string
  token: string
  name: string
  size: number
  color: string
  gradient: string
  parent?: string
  x?: number
  y?: number
  angle?: number
  orbitRadius?: number
  orbitSpeed?: number
  orbitOffset?: number
  children?: TokenNode[]
}

const TokenVisualization = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tokens, setTokens] = useState<TokenNode[]>([])
  const [hoveredToken, setHoveredToken] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [isInitialized, setIsInitialized] = useState(false)
  const animationRef = useRef<number>()

  // Define the token structure
  useEffect(() => {
    const tokenData: TokenNode[] = [
      {
        id: "gen",
        token: "GEN",
        name: "Supercivilization",
        size: 120,
        color: "#71717a", // zinc-500
        gradient: "from-zinc-500 to-zinc-700 dark:from-zinc-600 dark:to-zinc-900",
        parent: "",
        orbitSpeed: 0,
        orbitOffset: 0,
        children: [],
      },
      {
        id: "sap",
        token: "SAP",
        name: "Superachiever",
        size: 90,
        color: "#78716c", // stone-500
        gradient: "from-stone-500 to-stone-700 dark:from-stone-600 dark:to-stone-900", // stone-500
        gradient: "from-stone-500 to-stone-700 dark:from-stone-600 dark:to-stone-900",
        parent: "gen",
        orbitSpeed: 0.0003,
        orbitOffset: 0,
      },
      {
        id: "scq",
        token: "SCQ",
        name: "Superachievers",
        size: 90,
        color: "#64748b", // slate-500
        gradient: "from-slate-500 to-slate-700 dark:from-slate-600 dark:to-slate-900",
        parent: "gen",
        orbitSpeed: 0.0003,
        orbitOffset: Math.PI,
      },
      {
        id: "psp",
        token: "PSP",
        name: "Personal Success Puzzle",
        size: 70,
        color: "#f59e0b", // amber-500
        gradient: "from-amber-500 to-yellow-500 dark:from-amber-600 dark:to-yellow-600",
        parent: "sap",
        orbitSpeed: 0.0005,
        orbitOffset: Math.PI * 0.5,
      },
      {
        id: "bsp",
        token: "BSP",
        name: "Business Success Puzzle",
        size: 70,
        color: "#14b8a6", // teal-500
        gradient: "from-teal-500 to-cyan-500 dark:from-teal-600 dark:to-cyan-600",
        parent: "sap",
        orbitSpeed: 0.0005,
        orbitOffset: Math.PI * 1.5,
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
        orbitSpeed: 0.0005,
        orbitOffset: Math.PI,
      },
      {
        id: "spd",
        token: "SPD",
        name: "Superpuzzle Developments",
        size: 70,
        color: "#22c55e", // green-500
        gradient: "from-red-500 via-green-500 to-blue-500 dark:from-red-600 dark:via-green-600 dark:to-blue-600",
        parent: "scq",
        orbitSpeed: 0.0005,
        orbitOffset: Math.PI * 0.5,
      },
      {
        id: "she",
        token: "SHE",
        name: "Superhuman Enhancements",
        size: 70,
        color: "#ef4444", // red-500
        gradient: "from-rose-500 via-red-500 to-orange-500 dark:from-rose-600 dark:via-red-600 dark:to-orange-600",
        parent: "scq",
        orbitSpeed: 0.0005,
        orbitOffset: Math.PI * 1.1,
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
        orbitSpeed: 0.0005,
        orbitOffset: Math.PI * 1.5,
      },
      {
        id: "sgb",
        token: "SGB",
        name: "Supergenius Breakthroughs",
        size: 70,
        color: "#0ea5e9", // sky-500
        gradient: "from-sky-500 via-blue-500 to-indigo-500 dark:from-sky-600 dark:via-blue-600 dark:to-indigo-600",
        parent: "scq",
        orbitSpeed: 0.0005,
        orbitOffset: Math.PI * 1.9,
      },
    ]

    // Set initial tokens
    setTokens(tokenData)
  }, [])

  // Handle window resize and initialize dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => {
      window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  // Calculate and update token positions
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return

    let animationId: number
    let lastTime = 0
    const fps = 30 // Limit to 30 FPS for better performance
    const fpsInterval = 1000 / fps

    // Find center position
    const centerX = dimensions.width / 2
    const centerY = dimensions.height / 2

    // Update token positions with frame limiting
    const updateTokenPositions = (time: number) => {
      animationId = requestAnimationFrame(updateTokenPositions)

      // Calculate elapsed time
      const elapsed = time - lastTime

      // Only update if enough time has passed (frame limiting)
      if (elapsed > fpsInterval) {
        lastTime = time - (elapsed % fpsInterval)

        setTokens((prevTokens) => {
          // Create a new array to avoid mutating state directly
          const updatedTokens = [...prevTokens]

          // First, position the center token (GEN)
          const genToken = updatedTokens.find((t) => t.id === "gen")
          if (genToken) {
            genToken.x = centerX
            genToken.y = centerY
          }

          // Then position all other tokens based on their parent
          updatedTokens.forEach((token) => {
            if (token.id === "gen") return // Skip the center token

            const parent = updatedTokens.find((t) => t.id === token.parent)
            if (!parent || !parent.x || !parent.y) return

            // Calculate orbit radius based on parent size and token size
            // Use a larger multiplier to spread tokens out more
            const orbitRadius = parent.size * 3.2
            token.orbitRadius = orbitRadius

            // Calculate angle based on time and orbit speed
            const angle = (token.orbitOffset || 0) + (token.orbitSpeed || 0) * time
            token.angle = angle

            // Calculate position based on angle and orbit radius
            token.x = parent.x + Math.cos(angle) * orbitRadius
            token.y = parent.y + Math.sin(angle) * orbitRadius
          })

          return updatedTokens
        })
      }
    }

    // Start animation
    animationId = requestAnimationFrame(updateTokenPositions)
    setIsInitialized(true)

    // Clean up animation on unmount
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [dimensions])

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      {/* Connections between tokens */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {tokens.map((token) => {
          if (!token.parent) return null
          const parent = tokens.find((t) => t.id === token.parent)
          if (!parent || !token.x || !token.y || !parent.x || !parent.y) return null

          return (
            <React.Fragment key={`connection-${parent.id}-${token.id}`}>
              {/* Base connection line */}
              <motion.line
                key={`${parent.id}-${token.id}`}
                x1={parent.x}
                y1={parent.y}
                x2={token.x}
                y2={token.y}
                stroke={isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}
                strokeWidth={2}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />

              {/* Animated pulse effect along the line - multiple pulses */}
              {[...Array(2)].map((_, i) => (
                <motion.circle
                  key={`pulse-${parent.id}-${token.id}-${i}`}
                  cx={parent.x}
                  cy={parent.y}
                  r={4}
                  fill={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)"}
                  animate={{
                    cx: [parent.x, token.x, parent.x],
                    cy: [parent.y, token.y, parent.y],
                    opacity: [0.8, 0.2, 0.8],
                    r: [3, 5, 3],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                    delay: i * 1.5 + Math.random(),
                  }}
                />
              ))}
            </React.Fragment>
          )
        })}
      </svg>

      {/* Token circles */}
      {isInitialized &&
        tokens.map((token) => (
          <motion.div
            key={token.id}
            className={`absolute rounded-full flex items-center justify-center cursor-pointer bg-gradient-to-br ${token.gradient}`}
            style={{
              width: token.size,
              height: token.size,
              left: token.x ? token.x - token.size / 2 : 0,
              top: token.y ? token.y - token.size / 2 : 0,
              boxShadow:
                hoveredToken === token.id
                  ? isDark
                    ? "0 0 40px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3)"
                    : "0 0 40px rgba(0,0,0,0.4), 0 0 20px rgba(0,0,0,0.2)"
                  : isDark
                    ? "0 0 20px rgba(255,255,255,0.15)"
                    : "0 0 20px rgba(0,0,0,0.15)",
              zIndex: hoveredToken === token.id ? 10 : token.id === "gen" ? 5 : 1,
            }}
            initial={{ scale: 0, opacity: 0, rotate: -10 }}
            animate={{
              scale: 1,
              opacity: 1,
              rotate: 0,
              // Add a subtle rotation animation
              rotateZ: [0, token.id === "gen" ? 0 : Math.random() > 0.5 ? 5 : -5, 0],
            }}
            transition={{
              duration: 0.5,
              delay: tokens.indexOf(token) * 0.1,
              rotateZ: {
                repeat: Number.POSITIVE_INFINITY,
                duration: 8 + Math.random() * 4,
                ease: "easeInOut",
              },
            }}
            whileHover={{
              scale: 1.15,
              rotate: 0,
              boxShadow: isDark
                ? "0 0 50px rgba(255,255,255,0.6), 0 0 25px rgba(255,255,255,0.4)"
                : "0 0 50px rgba(0,0,0,0.5), 0 0 25px rgba(0,0,0,0.3)",
            }}
            onMouseEnter={() => setHoveredToken(token.id)}
            onMouseLeave={() => setHoveredToken(null)}
          >
            {/* Inner glow effect */}
            <motion.div
              className="absolute inset-2 rounded-full opacity-60 blur-md"
              style={{
                background: `radial-gradient(circle at center, white, transparent 70%)`,
              }}
              animate={{
                opacity: [0.4, 0.6, 0.4],
                scale: [0.8, 1, 0.8],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 3 + Math.random() * 2,
                ease: "easeInOut",
              }}
            />

            <div className="flex flex-col items-center justify-center text-white relative z-10">
              <span className="font-bold text-lg">{token.token}</span>
              <AnimatePresence>
                {hoveredToken === token.id && (
                  <motion.div
                    className="absolute -bottom-10 whitespace-nowrap glass px-3 py-1.5 rounded-full text-sm text-white/90 font-medium shadow-lg border border-white/10"
                    initial={{ opacity: 0, y: -5, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    {token.name}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
    </div>
  )
}

export default memo(TokenVisualization)
