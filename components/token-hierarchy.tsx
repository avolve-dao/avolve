"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface TokenNode {
  id: string
  name: string
  description: string
  color: string
  children?: TokenNode[]
  dayOfWeek?: number // 0 = Sunday, 1 = Monday, etc.
}

const tokenHierarchy: TokenNode = {
  id: "GEN",
  name: "GEN Token",
  description: "Supercivilization - Avolve from Degen to Regen",
  color: "from-zinc-400 to-zinc-600",
  children: [
    {
      id: "SAP",
      name: "SAP Token",
      description: "Superachiever - Create Your Success Puzzle",
      color: "from-stone-400 to-stone-600",
      children: [
        {
          id: "PSP",
          name: "PSP Token",
          description: "Personal Success Puzzle - Greater Personal Successes",
          color: "from-amber-300 to-yellow-500",
          dayOfWeek: 2, // Tuesday
        },
        {
          id: "BSP",
          name: "BSP Token",
          description: "Business Success Puzzle - Greater Business Successes",
          color: "from-teal-400 to-cyan-500",
          dayOfWeek: 4, // Thursday
        },
        {
          id: "SMS",
          name: "SMS Token",
          description: "Supermind Superpowers - Go Further, Faster, & Forever",
          color: "from-violet-400 via-purple-500 to-fuchsia-500",
          dayOfWeek: 6, // Saturday
        },
      ],
    },
    {
      id: "SCQ",
      name: "SCQ Token",
      description: "Superachievers - Co-Create Your Superpuzzle",
      color: "from-slate-400 to-slate-600",
      children: [
        {
          id: "SPD",
          name: "SPD Token",
          description: "Superpuzzle Developments - Conceive, Believe, & Achieve",
          color: "from-red-500 via-green-500 to-blue-500",
          dayOfWeek: 0, // Sunday
        },
        {
          id: "SHE",
          name: "SHE Token",
          description: "Superhuman Enhancements - Super Enhanced Individuals",
          color: "from-rose-500 via-red-500 to-orange-500",
          dayOfWeek: 1, // Monday
        },
        {
          id: "SSA",
          name: "SSA Token",
          description: "Supersociety Advancements - Super Advanced Collectives",
          color: "from-lime-500 via-green-500 to-emerald-500",
          dayOfWeek: 3, // Wednesday
        },
        {
          id: "SGB",
          name: "SGB Token",
          description: "Supergenius Breakthroughs - Super Balanced Ecosystems",
          color: "from-sky-500 via-blue-500 to-indigo-500",
          dayOfWeek: 5, // Friday
        },
      ],
    },
  ],
}

const getDayName = (dayOfWeek?: number) => {
  if (dayOfWeek === undefined) return null
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return days[dayOfWeek]
}

const TokenCard = ({
  token,
  level = 0,
  isExpanded = true,
  onToggle,
}: {
  token: TokenNode
  level?: number
  isExpanded?: boolean
  onToggle?: () => void
}) => {
  const hasChildren = token.children && token.children.length > 0
  const dayName = getDayName(token.dayOfWeek)

  return (
    <div className={cn("mb-2", level > 0 && "ml-6")}>
      <Card className={cn("overflow-hidden border-l-4", `border-l-${token.id.toLowerCase()}`)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasChildren && (
                <button
                  onClick={onToggle}
                  className="p-1 rounded-full hover:bg-muted"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-6 w-6 rounded-full bg-gradient-to-r ${token.color} text-white text-xs font-bold flex items-center justify-center`}
                  >
                    {token.id}
                  </span>
                  <h3 className="font-medium">{token.name}</h3>
                  {dayName && <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{dayName}</span>}
                </div>
                <p className="text-sm text-muted-foreground">{token.description}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasChildren && isExpanded && (
        <div className="mt-2">
          {token.children!.map((child) => (
            <TokenNodeComponent key={child.id} token={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

const TokenNodeComponent = ({ token, level = 0 }: { token: TokenNode; level?: number }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  return <TokenCard token={token} level={level} isExpanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)} />
}

export function TokenHierarchy() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Token Hierarchy</h2>
      <p className="text-muted-foreground">
        Explore the Avolve token ecosystem and understand how each token contributes to your journey from Degen to
        Regen.
      </p>
      <div className="mt-4">
        <TokenNodeComponent token={tokenHierarchy} />
      </div>
    </div>
  )
}
