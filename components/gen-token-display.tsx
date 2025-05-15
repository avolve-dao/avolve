"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Coins, TrendingUp, History } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { useUser } from "@/contexts/user-context"

interface TokenTransaction {
  id: string
  amount: number
  description: string
  created_at: string
}

export function GenTokenDisplay() {
  const { tokenBalance, refreshTokenBalance } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<TokenTransaction[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchTokenData = async () => {
      setIsLoading(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Fetch recent token transactions
          const { data: transactionData } = await supabase
            .from("token_transactions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5)

          if (transactionData) {
            setTransactions(transactionData)
          }

          // Refresh token balance
          await refreshTokenBalance()
        }
      } catch (error) {
        console.error("Error fetching token data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTokenData()
  }, [supabase, refreshTokenBalance])

  // Calculate level based on token balance
  const level = Math.floor(tokenBalance / 100) + 1
  const progressToNextLevel = ((tokenBalance % 100) / 100) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">GEN Tokens</CardTitle>
            <CardDescription>The currency of the Supercivilization</CardDescription>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-zinc-400 to-zinc-600 p-2 rounded-full"
          >
            <Coins className="h-6 w-6 text-white" />
          </motion.div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="h-20 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading token data...</div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{tokenBalance}</p>
                <p className="text-sm text-muted-foreground">GEN Tokens</p>
              </div>
              <Badge variant="outline" className="px-3 py-1 text-sm">
                Level {level}
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Progress to Level {level + 1}</span>
                <span>{Math.round(progressToNextLevel)}%</span>
              </div>
              <Progress value={progressToNextLevel} className="h-2" />
            </div>

            {transactions.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Recent Activity</h3>
                </div>
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between text-sm border-b pb-2">
                      <span className="text-muted-foreground">{transaction.description}</span>
                      <Badge variant="outline" className={transaction.amount > 0 ? "text-green-600" : "text-red-600"}>
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Earn more GEN tokens by completing challenges and creating value in the Supercivilization
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
