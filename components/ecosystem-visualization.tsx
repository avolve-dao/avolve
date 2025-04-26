"use client"

import React, { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"

interface CircleNode {
  id: string
  name: string
  description: string
  token: string
  gradient: string
  children?: CircleNode[]
  size?: number
  x?: number
  y?: number
}

interface EcosystemVisualizationProps {
  compact?: boolean
}

export default function EcosystemVisualization({ compact = false }: EcosystemVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 1000, height: 800 })
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [isInitialized, setIsInitialized] = useState(false)

  // Define the ecosystem structure
  const ecosystemData: CircleNode = {
    id: "supercivilization",
    name: "Supercivilization",
    description: "Avolve from Degen to Regen",
    token: "GEN",
    gradient: "from-zinc-400 to-zinc-700 dark:from-zinc-600 dark:to-zinc-900",
    children: [
      {
        id: "superachiever",
        name: "Superachiever",
        description: "Create Your Success Puzzle",
        token: "SAP",
        gradient: "from-stone-400 to-stone-700 dark:from-stone-600 dark:to-stone-900",
        children: [
          {
            id: "personal-success-puzzle",
            name: "Personal Success Puzzle",
            description: "Greater Personal Successes",
            token: "PSP",
            gradient: "from-amber-400 to-yellow-600 dark:from-amber-500 dark:to-yellow-700",
            children: compact
              ? undefined
              : [
                  {
                    id: "health-energy",
                    name: "Health & Energy",
                    description: "",
                    token: "",
                    gradient: "from-amber-300 to-amber-500 dark:from-amber-600 dark:to-amber-800",
                  },
                  {
                    id: "wealth-career",
                    name: "Wealth & Career",
                    description: "",
                    token: "",
                    gradient: "from-yellow-300 to-yellow-500 dark:from-yellow-600 dark:to-yellow-800",
                  },
                  {
                    id: "peace-people",
                    name: "Peace & People",
                    description: "",
                    token: "",
                    gradient: "from-amber-400 to-yellow-400 dark:from-amber-700 dark:to-yellow-700",
                  },
                ],
          },
          {
            id: "business-success-puzzle",
            name: "Business Success Puzzle",
            description: "Greater Business Successes",
            token: "BSP",
            gradient: "from-teal-400 to-cyan-600 dark:from-teal-500 dark:to-cyan-700",
            children: compact
              ? undefined
              : [
                  {
                    id: "front-stage-users",
                    name: "Front-Stage Users",
                    description: "",
                    token: "",
                    gradient: "from-teal-300 to-teal-500 dark:from-teal-600 dark:to-teal-800",
                  },
                  {
                    id: "back-stage-admin",
                    name: "Back-Stage Admin",
                    description: "",
                    token: "",
                    gradient: "from-cyan-300 to-cyan-500 dark:from-cyan-600 dark:to-cyan-800",
                  },
                  {
                    id: "bottom-line-profit",
                    name: "Bottom-Line Profit",
                    description: "",
                    token: "",
                    gradient: "from-teal-400 to-cyan-400 dark:from-teal-700 dark:to-cyan-700",
                  },
                ],
          },
          {
            id: "supermind-superpowers",
            name: "Supermind Superpowers",
            description: "Go Further, Faster, & Forever",
            token: "SMS",
            gradient:
              "from-violet-400 via-purple-500 to-fuchsia-500 dark:from-violet-600 dark:via-purple-700 dark:to-fuchsia-700",
            children: compact
              ? undefined
              : [
                  {
                    id: "current-desired",
                    name: "Current → Desired",
                    description: "starting",
                    token: "",
                    gradient: "from-violet-400 to-purple-500 dark:from-violet-600 dark:to-purple-700",
                  },
                  {
                    id: "desired-actions",
                    name: "Desired → Actions",
                    description: "focusing",
                    token: "",
                    gradient: "from-purple-400 to-fuchsia-500 dark:from-purple-600 dark:to-fuchsia-700",
                  },
                  {
                    id: "actions-results",
                    name: "Actions → Results",
                    description: "finishing",
                    token: "",
                    gradient: "from-fuchsia-400 to-pink-500 dark:from-fuchsia-600 dark:to-pink-700",
                  },
                ],
          },
        ],
      },
      {
        id: "superachievers",
        name: "Superachievers",
        description: "Co-Create Your Superpuzzle",
        token: "SCQ",
        gradient: "from-slate-400 to-slate-700 dark:from-slate-600 dark:to-slate-900",
        children: [
          {
            id: "superpuzzle-developments",
            name: "Superpuzzle Developments",
            description: "Conceive, Believe, & Achieve",
            token: "SPD",
            gradient: "from-red-500 via-green-500 to-blue-500 dark:from-red-600 dark:via-green-600 dark:to-blue-600",
            children: compact
              ? undefined
              : [
                  {
                    id: "enhanced-individuals",
                    name: "Enhanced Individuals",
                    description: "Academies, Universities, Institutes",
                    token: "",
                    gradient: "from-red-400 to-red-600 dark:from-red-500 dark:to-red-700",
                  },
                  {
                    id: "advanced-collectives",
                    name: "Advanced Collectives",
                    description: "Companies, Communities, Countries",
                    token: "",
                    gradient: "from-green-400 to-green-600 dark:from-green-500 dark:to-green-700",
                  },
                  {
                    id: "balanced-ecosystems",
                    name: "Balanced Ecosystems",
                    description: "Ventures, Enterprises, Industries",
                    token: "",
                    gradient: "from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700",
                  },
                ],
          },
          {
            id: "superhuman-enhancements",
            name: "Superhuman Enhancements",
            description: "Super Enhanced Individuals",
            token: "SHE",
            gradient: "from-rose-500 via-red-500 to-orange-500 dark:from-rose-600 dark:via-red-600 dark:to-orange-600",
            children: compact
              ? undefined
              : [
                  {
                    id: "superhuman-academy",
                    name: "Superhuman Academy",
                    description: "support child development ages 0 to 12",
                    token: "",
                    gradient: "from-rose-400 to-rose-600 dark:from-rose-500 dark:to-rose-700",
                  },
                  {
                    id: "superhuman-university",
                    name: "Superhuman University",
                    description: "support youth development ages 12 to 25",
                    token: "",
                    gradient: "from-red-400 to-red-600 dark:from-red-500 dark:to-red-700",
                  },
                  {
                    id: "superhuman-institute",
                    name: "Superhuman Institute",
                    description: "support adult development ages 25+",
                    token: "",
                    gradient: "from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700",
                  },
                ],
          },
          {
            id: "supersociety-advancements",
            name: "Supersociety Advancements",
            description: "Super Advanced Collectives",
            token: "SSA",
            gradient:
              "from-lime-500 via-green-500 to-emerald-500 dark:from-lime-600 dark:via-green-600 dark:to-emerald-600",
            children: compact
              ? undefined
              : [
                  {
                    id: "supersociety-company",
                    name: "Supersociety Company",
                    description: "build your personal network",
                    token: "",
                    gradient: "from-lime-400 to-lime-600 dark:from-lime-500 dark:to-lime-700",
                  },
                  {
                    id: "supersociety-community",
                    name: "Supersociety Community",
                    description: "develop our global/digital network",
                    token: "",
                    gradient: "from-green-400 to-green-600 dark:from-green-500 dark:to-green-700",
                  },
                  {
                    id: "supersociety-country",
                    name: "Supersociety Country",
                    description: "develop our local/physical networks",
                    token: "",
                    gradient: "from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-700",
                  },
                ],
          },
          {
            id: "supergenius-breakthroughs",
            name: "Supergenius Breakthroughs",
            description: "Super Balanced Ecosystems",
            token: "SGB",
            gradient: "from-sky-500 via-blue-500 to-indigo-500 dark:from-sky-600 dark:via-blue-600 dark:to-indigo-600",
            children: compact
              ? undefined
              : [
                  {
                    id: "supergenius-ventures",
                    name: "Supergenius Ventures",
                    description: "invent new growth engines",
                    token: "",
                    gradient: "from-sky-400 to-sky-600 dark:from-sky-500 dark:to-sky-700",
                  },
                  {
                    id: "supergenius-enterprises",
                    name: "Supergenius Enterprises",
                    description: "improve existing growth engines",
                    token: "",
                    gradient: "from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700",
                  },
                  {
                    id: "supergenius-industries",
                    name: "Supergenius Industries",
                    description: "manage a portfolio of growth engines",
                    token: "",
                    gradient: "from-indigo-400 to-indigo-600 dark:from-indigo-500 dark:to-indigo-700",
                  },
                ],
          },
        ],
      },
    ],
  }

  // Calculate positions for all nodes
  const calculatePositions = (
    node: CircleNode,
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    level: number,
  ) => {
    // Set position for current node
    node.x = centerX
    node.y = centerY

    // Size decreases with level
    const sizeFactor = compact
      ? Math.max(0.3, 1 - level * 0.3) // More aggressive size reduction for compact mode
      : Math.max(0.2, 1 - level * 0.2)

    node.size = radius * 2 * sizeFactor

    if (!node.children || node.children.length === 0) return

    const angleStep = (endAngle - startAngle) / node.children.length
    const childRadius = radius * (compact ? 0.35 : 0.4)
    const orbitRadius = radius * (compact ? 0.55 : 0.6)

    node.children.forEach((child, i) => {
      const angle = startAngle + angleStep * i + angleStep / 2
      const childX = centerX + Math.cos(angle) * orbitRadius
      const childY = centerY + Math.sin(angle) * orbitRadius

      calculatePositions(child, childX, childY, childRadius, angle - Math.PI / 2, angle + Math.PI / 2, level + 1)
    })
  }

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Calculate positions when dimensions change
  useEffect(() => {
    const minDimension = Math.min(dimensions.width, dimensions.height)
    const centerX = dimensions.width / 2
    const centerY = dimensions.height / 2
    const radius = minDimension * (compact ? 0.25 : 0.4)

    calculatePositions(ecosystemData, centerX, centerY, radius, 0, Math.PI * 2, 0)
    setIsInitialized(true)
  }, [dimensions, compact])

  // Render a single circle node
  const renderCircleNode = (node: CircleNode) => {
    if (!node.x || !node.y || !node.size) return null

    const isHovered = hoveredNode === node.id
    const scale = isHovered ? 1.05 : 1
    const opacity = hoveredNode ? (isHovered ? 1 : 0.7) : 1

    return (
      <g key={node.id}>
        {/* Render connections to children */}
        {node.children?.map((child) => {
          if (!child.x || !child.y) return null
          return (
            <line
              key={`${node.id}-${child.id}`}
              x1={node.x}
              y1={node.y}
              x2={child.x}
              y2={child.y}
              stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
              strokeWidth={2}
            />
          )
        })}

        {/* Render children first so they appear behind */}
        {node.children?.map((child) => renderCircleNode(child))}

        {/* Circle with gradient */}
        <motion.circle
          cx={node.x}
          cy={node.y}
          r={node.size / 2}
          className="cursor-pointer"
          style={{
            fill: `url(#${node.id}-gradient)`,
            stroke: isHovered ? (isDark ? "white" : "black") : isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
            strokeWidth: isHovered ? 2 : 1,
            opacity,
          }}
          initial={{ scale: 0 }}
          animate={{ scale }}
          transition={{ duration: 0.3 }}
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
        />

        {/* Text label - only show for larger circles or when compact mode is off */}
        {(node.size > (compact ? 60 : 40) || node.token) && (
          <foreignObject
            x={node.x - node.size / 2}
            y={node.y - node.size / 4}
            width={node.size}
            height={node.size / 2}
            style={{ pointerEvents: "none" }}
          >
            <div className="flex flex-col items-center justify-center h-full text-center p-2">
              {node.size > (compact ? 80 : 60) && (
                <h3
                  className={`font-bold ${
                    node.size > 150 ? "text-lg" : node.size > 100 ? "text-sm" : "text-xs"
                  } text-white drop-shadow-md`}
                >
                  {node.name}
                </h3>
              )}

              {node.token && (
                <span className="mt-1 px-2 py-0.5 bg-black/20 dark:bg-white/20 rounded-full text-xs text-white">
                  {node.token}
                </span>
              )}
            </div>
          </foreignObject>
        )}
      </g>
    )
  }

  // Define gradients for all nodes
  const renderGradients = (node: CircleNode) => {
    return (
      <React.Fragment key={node.id}>
        <linearGradient id={`${node.id}-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" className={`${node.gradient.split(" ")[0]}`} />
          {node.gradient.includes("via") && <stop offset="50%" className={`${node.gradient.split(" ")[1]}`} />}
          <stop offset="100%" className={`${node.gradient.split(" ").pop()}`} />
        </linearGradient>
        {node.children?.map((child) => renderGradients(child))}
      </React.Fragment>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        {isInitialized && (
          <motion.svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            className="max-w-full max-h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <defs>{renderGradients(ecosystemData)}</defs>
            {renderCircleNode(ecosystemData)}
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  )
}
