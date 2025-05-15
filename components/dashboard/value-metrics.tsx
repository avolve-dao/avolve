"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/user-context"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Bell, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ValueGoalSetting } from "./value-goal-setting"
import { ValueCreationForm } from "./value-creation-form"
import { getValueMetrics } from "@/app/actions/value-metrics-actions"
import { useSupabaseRealtime } from "@/hooks/use-supabase-realtime"
import type { ValueCreation } from "@/types/supabase"

interface ValueMetric {
  date: string
  value: number
}

export function ValueMetrics() {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [valueCreated, setValueCreated] = useState(0)
  const [valueGoal, setValueGoal] = useState(1000)
  const [weeklyData, setWeeklyData] = useState<ValueMetric[]>([])
  const [monthlyData, setMonthlyData] = useState<ValueMetric[]>([])
  const [recentUpdates, setRecentUpdates] = useState<ValueCreation[]>([])
  const [hasNewData, setHasNewData] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)
  const supabase = createClient()

  // Function to fetch initial value metrics data
  const fetchValueMetrics = async () => {
    setIsLoading(true)
    try {
      if (!user?.id) return

      // Fetch total value created
      const { data: valueData, error: valueError } = await supabase
        .from("value_creation")
        .select("amount")
        .eq("user_id", user.id)

      if (valueError) throw valueError

      // Calculate total value created
      const total = valueData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0
      setValueCreated(total)

      // Fetch user's goal from profiles
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("value_goal")
        .eq("id", user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") throw profileError

      if (profileData?.value_goal) {
        setValueGoal(profileData.value_goal)
      }

      // Fetch weekly data using the database function
      const weeklyResult = await getValueMetrics({ days: 7 })
      if (weeklyResult.success && weeklyResult.data) {
        const formattedData = weeklyResult.data.map((item) => ({
          date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          value: item.total_value,
        }))
        setWeeklyData(formattedData)
      }

      // Fetch monthly data using the database function
      const monthlyResult = await getValueMetrics({ days: 30 })
      if (monthlyResult.success && monthlyResult.data) {
        const formattedData = monthlyResult.data.map((item) => ({
          date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          value: item.total_value,
        }))
        setMonthlyData(formattedData)
      }

      // Fetch recent updates
      const { data: recentData, error: recentError } = await supabase
        .from("value_creation")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (recentError) throw recentError
      setRecentUpdates(recentData || [])
      setLastUpdateTime(new Date())
    } catch (error) {
      console.error("Error fetching value metrics:", error)
      // Fallback to mock data if there's an error
      setMockData()
    } finally {
      setIsLoading(false)
    }
  }

  // Function to set mock data (for development or when real data fails)
  const setMockData = () => {
    setValueCreated(650)
    setValueGoal(1000)

    // Generate mock weekly data
    const mockWeeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: Math.floor(Math.random() * 100) + 50,
      }
    })

    // Generate mock monthly data
    const mockMonthlyData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: Math.floor(Math.random() * 200) + 100,
      }
    })

    setWeeklyData(mockWeeklyData)
    setMonthlyData(mockMonthlyData)

    // Mock recent updates
    const mockRecentUpdates = Array.from({ length: 5 }, (_, i) => {
      const date = new Date()
      date.setMinutes(date.getMinutes() - i * 30)
      return {
        id: `mock-${i}`,
        user_id: user?.id || "user-1",
        amount: Math.floor(Math.random() * 50) + 10,
        created_at: date.toISOString(),
        updated_at: date.toISOString(),
        type: ["challenge", "content", "contribution"][Math.floor(Math.random() * 3)],
        description: `Value creation activity ${i + 1}`,
      } as ValueCreation
    })

    setRecentUpdates(mockRecentUpdates)
    setLastUpdateTime(new Date())
  }

  // Initial data fetch
  useEffect(() => {
    if (user?.id) {
      fetchValueMetrics()
    }
  }, [user])

  // Function to update charts when new data arrives
  const updateCharts = async (newItem: ValueCreation) => {
    const itemDate = new Date(newItem.created_at)
    const dateStr = itemDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })

    // Update weekly data if the new item is within the last 7 days
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 6)
    weekAgo.setHours(0, 0, 0, 0)

    if (itemDate >= weekAgo) {
      setWeeklyData((prev) => {
        const newData = [...prev]
        const existingIndex = newData.findIndex((item) => item.date === dateStr)

        if (existingIndex >= 0) {
          newData[existingIndex] = {
            ...newData[existingIndex],
            value: newData[existingIndex].value + newItem.amount,
          }
        }

        return newData
      })
    }

    // Update monthly data if the new item is within the last 30 days
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 29)
    monthAgo.setHours(0, 0, 0, 0)

    if (itemDate >= monthAgo) {
      setMonthlyData((prev) => {
        const newData = [...prev]
        const existingIndex = newData.findIndex((item) => item.date === dateStr)

        if (existingIndex >= 0) {
          newData[existingIndex] = {
            ...newData[existingIndex],
            value: newData[existingIndex].value + newItem.amount,
          }
        }

        return newData
      })
    }
  }

  // Set up realtime subscription using our custom hook
  const { isConnected } = useSupabaseRealtime<ValueCreation>({
    table: "value_creation",
    event: "INSERT",
    filter: user?.id ? `user_id=eq.${user.id}` : undefined,
    onInsert: (payload) => {
      const newItem = payload.new as ValueCreation

      // Show notification
      setHasNewData(true)

      // Update recent updates list
      setRecentUpdates((prev) => [newItem, ...prev.slice(0, 4)])

      // Update total value
      setValueCreated((prev) => prev + (newItem.amount || 0))

      // Update charts
      updateCharts(newItem)

      setLastUpdateTime(new Date())
    },
  })

  // Function to refresh data manually
  const handleRefresh = () => {
    setHasNewData(false)
    fetchValueMetrics()
  }

  // Function to handle goal updates
  const handleGoalUpdated = (newGoal: number) => {
    setValueGoal(newGoal)
  }

  const progressPercentage = Math.min(Math.round((valueCreated / valueGoal) * 100), 100)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Value Creation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Value Creation</CardTitle>
          <CardDescription>
            {lastUpdateTime ? (
              <span className="text-xs text-muted-foreground">
                Last updated: {lastUpdateTime.toLocaleTimeString()}
                {isConnected && <span className="ml-1 text-green-500">•</span>}
              </span>
            ) : null}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {hasNewData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative"
              >
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 animate-pulse">
                  <Bell className="h-3 w-3 mr-1" /> New data
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
          <ValueGoalSetting currentGoal={valueGoal} onGoalUpdated={handleGoalUpdated} />
          <button
            onClick={handleRefresh}
            className="p-1 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Refresh data"
          >
            <RefreshCw className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress toward goal</span>
              <span className="text-sm font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{valueCreated} tokens</span>
              <span>Goal: {valueGoal} tokens</span>
            </div>
          </div>

          <div className="flex justify-end">
            <ValueCreationForm />
          </div>

          <Tabs defaultValue="weekly">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            <TabsContent value="weekly" className="pt-4">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Value Created"
                      animationDuration={300}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="monthly" className="pt-4">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Value Created"
                      animationDuration={300}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>

          {/* Recent Updates Section */}
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Recent Value Creation</h3>
            <div className="space-y-2">
              <AnimatePresence>
                {recentUpdates.map((update, index) => (
                  <motion.div
                    key={update.id}
                    initial={index === 0 && hasNewData ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between p-2 rounded-md bg-slate-50"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={getBadgeVariant(update.type)}>+{update.amount}</Badge>
                      <span className="text-sm">{update.description}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(new Date(update.created_at))}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to get badge variant based on update type
function getBadgeVariant(type: string): "default" | "secondary" | "outline" {
  switch (type) {
    case "challenge":
      return "default"
    case "content":
      return "secondary"
    case "contribution":
      return "outline"
    case "learning":
      return "secondary"
    default:
      return "default"
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHour = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHour / 24)

  if (diffSec < 60) {
    return `${diffSec} sec ago`
  } else if (diffMin < 60) {
    return `${diffMin} min ago`
  } else if (diffHour < 24) {
    return `${diffHour} hr ago`
  } else {
    return `${diffDay} day ago`
  }
}
