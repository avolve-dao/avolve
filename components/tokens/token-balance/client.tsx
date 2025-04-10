'use client';

/**
 * Token Balance Client Component
 * 
 * Client-side interactive component for displaying token balances with real-time updates
 * Copyright © 2025 Avolve DAO. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, ArrowUpRight, ArrowDownRight, RefreshCw, Plus, ChevronDown } from 'lucide-react';
import Image from 'next/image';

// UI components
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// Types
import type { Database } from '@/types/supabase';

interface Token {
  id: string;
  balance: number;
  name: string;
  symbol: string;
  icon: string;
  description?: string;
  isPrimary: boolean;
}

interface TokenTransaction {
  id: string;
  user_id: string;
  token_id: string;
  amount: number;
  transaction_type: 'earn' | 'spend' | 'transfer_in' | 'transfer_out';
  source: string;
  created_at: string;
  metadata?: Record<string, any>;
}

interface TokenBalanceClientProps {
  tokens: Token[];
  recentTransactions: TokenTransaction[];
  userId: string;
}

export function TokenBalanceClient({
  tokens: initialTokens,
  recentTransactions: initialTransactions,
  userId
}: TokenBalanceClientProps) {
  const [tokens, setTokens] = useState<Token[]>(initialTokens);
  const [recentTransactions, setRecentTransactions] = useState<TokenTransaction[]>(initialTransactions);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const supabase = createClientComponentClient<Database>();
  
  // Subscribe to real-time updates for user tokens
  useEffect(() => {
    const channel = supabase
      .channel('user_tokens_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_tokens',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Update the token balance in the state
          setTokens(prevTokens => 
            prevTokens.map(token => 
              token.id === payload.new.token_id
                ? { ...token, balance: payload.new.balance }
                : token
            )
          );
          
          // Show update animation
          setIsUpdating(true);
          setTimeout(() => setIsUpdating(false), 1000);
        }
      )
      .subscribe();
      
    // Subscribe to real-time updates for token transactions
    const transactionChannel = supabase
      .channel('token_transactions_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'token_transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Add the new transaction to the state
          setRecentTransactions(prev => [payload.new as TokenTransaction, ...prev.slice(0, 4)]);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(transactionChannel);
    };
  }, [supabase, userId]);
  
  // Format token amount with proper decimals
  const formatTokenAmount = (amount: number) => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };
  
  // Format transaction date
  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get transaction icon based on type
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return <Plus className="w-3 h-3 text-green-500" />;
      case 'spend':
        return <Coins className="w-3 h-3 text-amber-500" />;
      case 'transfer_in':
        return <ArrowDownRight className="w-3 h-3 text-green-500" />;
      case 'transfer_out':
        return <ArrowUpRight className="w-3 h-3 text-red-500" />;
      default:
        return <Coins className="w-3 h-3" />;
    }
  };
  
  // Get transaction color based on type
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earn':
      case 'transfer_in':
        return 'text-green-600';
      case 'spend':
      case 'transfer_out':
        return 'text-red-600';
      default:
        return '';
    }
  };
  
  // Format transaction amount with sign
  const formatTransactionAmount = (transaction: TokenTransaction) => {
    const isPositive = ['earn', 'transfer_in'].includes(transaction.transaction_type);
    const sign = isPositive ? '+' : '-';
    return `${sign}${formatTokenAmount(Math.abs(transaction.amount))} ${transaction.token_id}`;
  };
  
  return (
    <div className="w-full">
      {/* Token balances */}
      <div className="flex items-center space-x-2">
        {tokens
          .filter(token => token.isPrimary || token.balance > 0)
          .slice(0, 3)
          .map(token => (
            <div 
              key={token.id}
              className="flex items-center bg-white px-3 py-1.5 rounded-full border shadow-sm"
            >
              <div className="w-5 h-5 mr-1.5 relative">
                {token.icon ? (
                  <Image 
                    src={`/icons/${token.icon}`} 
                    alt={token.symbol}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <Coins className="w-full h-full text-primary" />
                )}
              </div>
              <div className="flex items-baseline">
                <span className="font-medium">
                  {formatTokenAmount(token.balance)}
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  {token.symbol}
                </span>
              </div>
              
              {/* Animation for token updates */}
              <AnimatePresence>
                {isUpdating && token.id === tokens.find(t => t.isPrimary)?.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="ml-1"
                  >
                    <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        
        {/* More tokens dropdown if needed */}
        {tokens.length > 3 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 rounded-full">
                <span className="text-xs">+{tokens.length - 3}</span>
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {tokens
                .filter(token => !token.isPrimary && token.balance > 0)
                .slice(3)
                .map(token => (
                  <DropdownMenuItem key={token.id}>
                    <div className="w-4 h-4 mr-2 relative">
                      {token.icon ? (
                        <Image 
                          src={`/icons/${token.icon}`} 
                          alt={token.symbol}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <Coins className="w-full h-full text-primary" />
                      )}
                    </div>
                    <span>
                      {formatTokenAmount(token.balance)} {token.symbol}
                    </span>
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {/* Transaction history dialog */}
        <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Recent Token Transactions</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto">
              {recentTransactions.length > 0 ? (
                recentTransactions.map(transaction => (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3">
                        {getTransactionIcon(transaction.transaction_type)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {transaction.source}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTransactionDate(transaction.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className={getTransactionColor(transaction.transaction_type)}>
                      {formatTransactionAmount(transaction)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recent transactions</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
