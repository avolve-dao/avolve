'use client';

/**
 * Token Visualization Component
 * 
 * Provides an engaging visual representation of user's token holdings
 * with animations and interactive elements.
 * Copyright 2025 Avolve DAO. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, History, Info, Gift, ArrowRight } from 'lucide-react';

// Types
import type { Database } from '@/types/supabase';
import type { TokenSymbol } from '@/types/supabase';

interface TokenVisualizationProps {
  userId: string;
}

interface TokenData {
  id: string;
  symbol: TokenSymbol;
  name: string;
  description: string;
  token_type: string;
  balance: number;
  flow_rate?: number;
  recent_transactions?: any[];
}

export function TokenVisualization({ userId }: TokenVisualizationProps) {
  const supabase = createClientComponentClient<Database>();
  
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  
  useEffect(() => {
    async function fetchTokenData() {
      setIsLoading(true);
      
      try {
        // Fetch token balances with token metadata
        const { data: balances, error: balancesError } = await supabase
          .from('user_balances')
          .select(`
            token_id,
            balance,
            tokens (
              id,
              symbol,
              name,
              description,
              token_type
            )
          `)
          .eq('user_id', userId);
        
        if (balancesError) {
          console.error('Error fetching token balances:', balancesError);
          return;
        }
        
        // Fetch token flow rates (earnings/spending rate)
        const { data: flowRates, error: flowError } = await supabase
          .rpc('get_user_token_flow_rates', { user_id_param: userId });
        
        if (flowError && flowError.code !== 'PGRST116') { // Not found is okay
          console.error('Error fetching token flow rates:', flowError);
        }
        
        // Fetch recent transactions
        const { data: transactions, error: txError } = await supabase
          .from('transactions')
          .select(`
            id,
            from_user_id,
            to_user_id,
            token_id,
            amount,
            transaction_type,
            description,
            created_at,
            tokens (symbol, name)
          `)
          .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (txError) {
          console.error('Error fetching transactions:', txError);
        } else {
          setRecentTransactions(transactions || []);
        }
        
        // Process and combine data
        const tokenData = balances?.map(balance => {
          const token = balance.tokens as any;
          const flowRate = flowRates?.find((flow: { token_id: string }) => flow.token_id === balance.token_id)?.flow_rate || 0;
          
          return {
            id: token.id,
            symbol: token.symbol as TokenSymbol,
            name: token.name,
            description: token.description,
            token_type: token.token_type,
            balance: balance.balance,
            flow_rate: flowRate,
            recent_transactions: transactions?.filter(tx => tx.token_id === token.id) || []
          };
        }) || [];
        
        setTokens(tokenData);
      } catch (error) {
        console.error('Error in fetchTokenData:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTokenData();
    
    // Set up real-time subscription for token balance updates
    const channel = supabase.channel('token-updates');
    channel
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_balances',
        filter: `user_id=eq.${userId}`
      }, () => {
        fetchTokenData();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
        filter: `to_user_id=eq.${userId}`
      }, () => {
        fetchTokenData();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);
  
  // Filter tokens based on active tab
  const filteredTokens = tokens.filter(token => {
    if (activeTab === 'all') return true;
    if (activeTab === 'primary' && token.token_type === 'primary') return true;
    if (activeTab === 'utility' && token.token_type === 'utility') return true;
    if (activeTab === 'governance' && token.token_type === 'governance') return true;
    return false;
  });
  
  // Get token color based on token type
  const getTokenColor = (tokenType: string) => {
    switch (tokenType) {
      case 'primary': return 'amber';
      case 'utility': return 'blue';
      case 'governance': return 'emerald';
      default: return 'zinc';
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <Card className="border-zinc-800 bg-zinc-950/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center">
            <Sparkles className="w-5 h-5 text-amber-400 mr-2" />
            Token Portfolio
          </CardTitle>
          <Badge variant="outline" className="bg-zinc-900/50">
            {tokens.length} Token Types
          </Badge>
        </div>
        
        <Tabs defaultValue="all" className="mt-2" onValueChange={setActiveTab}>
          <TabsList className="bg-zinc-900/50">
            <TabsTrigger value="all">All Tokens</TabsTrigger>
            <TabsTrigger value="primary">Primary</TabsTrigger>
            <TabsTrigger value="utility">Utility</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-zinc-900/50 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredTokens.length > 0 ? (
                filteredTokens.map((token, index) => (
                  <motion.div
                    key={token.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`border border-${getTokenColor(token.token_type)}-800/50 bg-${getTokenColor(token.token_type)}-950/20 rounded-lg p-4 transition-all duration-300 hover:bg-${getTokenColor(token.token_type)}-950/30`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full bg-${getTokenColor(token.token_type)}-900/50 flex items-center justify-center mr-3`}>
                          <span className={`text-${getTokenColor(token.token_type)}-400 font-bold`}>
                            {token.symbol}
                          </span>
                        </div>
                        
                        <div>
                          <h3 className="font-medium">{token.name}</h3>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-sm text-muted-foreground flex items-center">
                                  {token.token_type.charAt(0).toUpperCase() + token.token_type.slice(1)} Token
                                  <Info className="w-3 h-3 ml-1 inline" />
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{token.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold">{token.balance.toLocaleString()}</div>
                        <div className={`text-sm flex items-center justify-end ${token.flow_rate && token.flow_rate > 0 ? 'text-green-400' : token.flow_rate && token.flow_rate < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {token.flow_rate && token.flow_rate > 0 ? '+' : ''}{(token.flow_rate || 0).toLocaleString()} / day
                        </div>
                      </div>
                    </div>
                    
                    {token.recent_transactions && token.recent_transactions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-zinc-800">
                        <p className="text-xs text-muted-foreground flex items-center mb-2">
                          <History className="w-3 h-3 mr-1" />
                          Recent Activity
                        </p>
                        <div className="text-xs">
                          {token.recent_transactions.slice(0, 1).map(tx => (
                            <div key={tx.id} className="flex justify-between">
                              <span>
                                {tx.to_user_id === userId ? 'Received' : 'Sent'} {tx.amount} {token.symbol}
                              </span>
                              <span className="text-muted-foreground">{formatDate(tx.created_at)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tokens found in this category</p>
                </div>
              )}
            </AnimatePresence>
            
            <div className="mt-6 pt-4 border-t border-zinc-800">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium flex items-center">
                  <History className="w-4 h-4 mr-1 text-blue-400" />
                  Recent Transactions
                </h3>
                <Button variant="ghost" size="sm" className="text-xs">
                  View All <ArrowRight className="ml-1 w-3 h-3" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {recentTransactions.slice(0, 3).map(tx => (
                  <div key={tx.id} className="flex justify-between items-center p-2 rounded-md bg-zinc-900/30 border border-zinc-800">
                    <div className="flex items-center">
                      {tx.to_user_id === userId ? (
                        <Gift className="w-4 h-4 text-green-400 mr-2" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-amber-400 mr-2" />
                      )}
                      <div>
                        <div className="text-sm">
                          {tx.to_user_id === userId ? 'Received' : 'Sent'} {tx.amount} {tx.tokens.symbol}
                        </div>
                        <div className="text-xs text-muted-foreground">{tx.description || tx.transaction_type}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
