"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Calendar, Clock, Sparkles } from "lucide-react"
import Link from "next/link"

interface TokenInfo {
  id: string
  name: string
  description: string
  color: string
  fullName: string
  cta: string
  ctaLink: string
}

const tokenSchedule: { [key: number]: TokenInfo } = {
  0: {
    // Sunday
    id: "SPD",
    name: "Superpuzzle Developments",
    description: "Progress Our Grand Superpuzzle & Worldwide Drive to Ensure Wealth, Health, & Peace in Your Lifetime!",
    color: "from-red-500 via-green-500 to-blue-500",
    fullName: "Superpuzzle Developments Token",
    cta: "Explore Developments",
    ctaLink: "/superpuzzle-developments",
  },
  1: {
    // Monday
    id: "SHE",
    name: "Superhuman Enhancements",
    description: "Free Yourself & Loved Ones via Superhuman Enhancements That Support Everyone: Child, Youth, & Adult!",
    color: "from-rose-500 via-red-500 to-orange-500",
    fullName: "Superhuman Enhancements Token",
    cta: "Enhance Yourself",
    ctaLink: "/superhuman-enhancements",
  },
  2: {
    // Tuesday
    id: "PSP",
    name: "Personal Success Puzzle",
    description: "Enjoy Greater Personal Successes Faster via Boosting Your Overall Health, Wealth, and Peace in Life!",
    color: "from-amber-300 to-yellow-500",
    fullName: "Personal Success Puzzle Token",
    cta: "Build Your Puzzle",
    ctaLink: "/personal-success",
  },
  3: {
    // Wednesday
    id: "SSA",
    name: "Supersociety Advancements",
    description: "Free Others & Everybody via Supersociety Advancements That Help Companies, Communities, & Countries!",
    color: "from-lime-500 via-green-500 to-emerald-500",
    fullName: "Supersociety Advancements Token",
    cta: "Advance Society",
    ctaLink: "/supersociety",
  },
  4: {
    // Thursday
    id: "BSP",
    name: "Business Success Puzzle",
    description: "Enjoy Greater Business Successes Faster by Enhancing Your Network and also Advancing Your Net Worth!",
    color: "from-teal-400 to-cyan-500",
    fullName: "Business Success Puzzle Token",
    cta: "Grow Your Business",
    ctaLink: "/business-success",
  },
  5: {
    // Friday
    id: "SGB",
    name: "Supergenius Breakthroughs",
    description: "Solve Superpuzzles via Supergenius Breakthroughs That Help Grow Ventures, Enterprises, & Industries!",
    color: "from-sky-500 via-blue-500 to-indigo-500",
    fullName: "Supergenius Breakthroughs Token",
    cta: "Make Breakthroughs",
    ctaLink: "/supergenius",
  },
  6: {
    // Saturday
    id: "SMS",
    name: "Supermind Superpowers",
    description: "Improve Your Ability to Solve a Conflict, Create a Plan for the Future & Implement Your Action Plan!",
    color: "from-violet-400 via-purple-500 to-fuchsia-500",
    fullName: "Supermind Superpowers Token",
    cta: "Unlock Superpowers",
    ctaLink: "/supermind",
  },
}

export function DailyFocus() {
  const [currentDay, setCurrentDay] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<string>("")

  useEffect(() => {
    // Set initial day and time
    const updateDateTime = () => {
      const now = new Date()
      setCurrentDay(now.getDay())

      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      setCurrentTime(`${hours}:${minutes}`)
    }

    updateDateTime()

    // Update time every minute
    const interval = setInterval(updateDateTime, 60000)

    return () => clearInterval(interval)
  }, [])

  const todayToken = tokenSchedule[currentDay]

  return (
    <Card className="overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${todayToken.color}`} />
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Today's Focus
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
            <Clock className="h-4 w-4 ml-2" />
            <span>{currentTime}</span>
          </div>
        </div>
        <CardDescription>Focus on {todayToken.name} today to maximize your transformation journey</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <motion.div
              className={`h-16 w-16 rounded-full bg-gradient-to-r ${todayToken.color} flex items-center justify-center text-white font-bold text-lg`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                duration: 2,
              }}
            >
              {todayToken.id}
            </motion.div>
          </div>
          <div>
            <h3 className="font-medium text-lg">{todayToken.name}</h3>
            <p className="text-muted-foreground mb-4">{todayToken.description}</p>
            <div className="flex items-center gap-2">
              <Button asChild>
                <Link href={todayToken.ctaLink}>{todayToken.cta}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/token-info">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
