'use client';

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TokenBalanceCard } from './TokenBalanceCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, ArrowDownUp, Award, Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

type TokenWithBalance = {
  token_symbol: string
  token_name: string
  balance: number
  staked_balance: number
  icon_url: string | null
  gradient_class: string | null
}

type TokenTransaction = {
  id: string
  token_symbol: string
  token_name: string
  amount: number
  transaction_type: 'mint' | 'transfer' | 'burn' | 'reward' | 'stake' | 'unstake'
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  created_at: string
  from_user_id: string | null
  to_user_id: string | null
  from_user_name?: string
  to_user_name?: string
}

export function TokensOverview() {
  const [tokens, setTokens] = useState<TokenWithBalance[]>([])
  const [transactions, setTransactions] = useState<TokenTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        setIsLoading(true)
        const supabase = createClient()
        
        // Fetch token balances
        const { data: balanceData, error: balanceError } = await supabase
          .rpc('get_user_token_balances')
        
        if (balanceError) {
          throw new Error(`Error fetching token balances: ${balanceError.message}`)
        }
        
        setTokens(balanceData || [])
        
        // Fetch recent transactions
        const { data: transactionData, error: transactionError } = await supabase
          .from('token_transactions')
          .select(`
            id,
            amount,
            transaction_type,
            status,
            created_at,
            from_user_id,
            to_user_id,
            tokens:token_id(symbol:token_symbol, name:token_name)
          `)
          .order('created_at', { ascending: false })
          .limit(10)
        
        if (transactionError) {
          throw new Error(`Error fetching transactions: ${transactionError.message}`)
        }
        
        // Format transaction data
        const formattedTransactions = transactionData?.map((tx: any) => {
          // Fix the type issue by accessing the nested object correctly
          const tokenInfo = tx.tokens as unknown as { symbol: string; name: string };
          
          return {
            id: tx.id,
            token_symbol: tokenInfo?.symbol || '',
            token_name: tokenInfo?.name || '',
            amount: tx.amount,
            transaction_type: tx.transaction_type,
            status: tx.status,
            created_at: tx.created_at,
            from_user_id: tx.from_user_id,
            to_user_id: tx.to_user_id
          };
        }) || []
        
        setTransactions(formattedTransactions)
      } catch (err) {
        console.error('Error in TokensOverview:', err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTokenData()
  }, [])
  
  // Format date for transaction history
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }
  
  // Get transaction icon based on type
  const getTransactionIcon = (type: TokenTransaction['transaction_type']) => {
    switch (type) {
      case 'transfer':
        return <ArrowDownUp className="h-4 w-4" />
      case 'reward':
        return <Award className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }
  
  // Get transaction description
  const getTransactionDescription = (tx: TokenTransaction) => {
    switch (tx.transaction_type) {
      case 'transfer':
        return tx.from_user_id ? 'Sent to user' : 'Received from user'
      case 'reward':
        return 'Reward earned'
      case 'mint':
        return 'Token minted'
      case 'burn':
        return 'Token burned'
      case 'stake':
        return 'Token staked'
      case 'unstake':
        return 'Token unstaked'
      default:
        return 'Transaction'
    }
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    )
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Token Dashboard</h2>
      
      <Tabs defaultValue="balances" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="balances" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <TokenBalanceCard key={i} token={{} as TokenWithBalance} isLoading={true} />
              ))
            ) : tokens.length > 0 ? (
              // Token balance cards
              tokens.map((token) => (
                <TokenBalanceCard key={token.token_symbol} token={token} />
              ))
            ) : (
              // No tokens message
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle>No Tokens Yet</CardTitle>
                  <CardDescription>
                    You haven't earned any tokens yet. Complete challenges and contribute to earn tokens.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your recent token activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                // Loading skeletons for transactions
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : transactions.length > 0 ? (
                // Transaction list
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className={`p-2 rounded-full ${
                        tx.transaction_type === 'reward' ? 'bg-green-100 text-green-700' :
                        tx.transaction_type === 'transfer' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {getTransactionIcon(tx.transaction_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{getTransactionDescription(tx)}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(tx.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{tx.amount} {tx.token_symbol}</p>
                            <p className="text-xs text-muted-foreground capitalize">{tx.status}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // No transactions message
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No transactions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
