"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Coins, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/contexts/user-context"
import { useVirtualizer } from "@tanstack/react-virtual"
import { PAGINATION } from "@/constants"

interface TokenTransaction {
  id: string
  amount: number
  description: string
  created_at: string
  token_type: string
}

export function TokenTransactionHistory() {
  const { user } = useUser()
  const [transactions, setTransactions] = useState<TokenTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = PAGINATION.DEFAULT_PAGE_SIZE
  const supabase = createClient()
  const parentRef = useRef<HTMLDivElement>(null)

  const fetchTransactions = async (pageNumber: number) => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const { data, error, count } = await supabase
        .from("token_transactions")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(pageNumber * pageSize, (pageNumber + 1) * pageSize - 1)

      if (error) throw error

      if (data) {
        if (pageNumber === 0) {
          setTransactions(data)
        } else {
          setTransactions((prev) => [...prev, ...data])
        }

        // Check if there are more transactions to load
        setHasMore(count ? count > (pageNumber + 1) * pageSize : false)
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchTransactions(page)
    }
  }, [page, user?.id])

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1)
    }
  }

  // Set up virtualization
  const rowVirtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated row height
    overscan: 5,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && page === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found. Complete challenges to earn GEN tokens.
          </div>
        ) : (
          <div className="space-y-4">
            <div
              ref={parentRef}
              className="h-[400px] overflow-auto"
              onScroll={(e) => {
                const target = e.target as HTMLDivElement
                if (target.scrollHeight - target.scrollTop <= target.clientHeight * 1.5 && hasMore && !isLoading) {
                  loadMore()
                }
              }}
            >
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const transaction = transactions[virtualRow.index]
                  return (
                    <div
                      key={transaction.id}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors m-1">
                        <div className="flex flex-col">
                          <span className="font-medium">{transaction.description}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleString()}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`px-2 py-1 ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {transaction.amount} {transaction.token_type}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {hasMore && (
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={loadMore} disabled={isLoading}>
                  {isLoading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  ) : (
                    <ArrowDown className="h-4 w-4 mr-2" />
                  )}
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
