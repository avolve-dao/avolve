'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TokenIcon } from '@/components/token/token-icon';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

interface TokenBalanceBarProps {
  userId: string;
  focusArea: string;
}

export function TokenBalanceBar({ userId, focusArea }: TokenBalanceBarProps) {
  const { data: tokenData, isLoading } = useQuery({
    queryKey: ['token-balances', userId, focusArea],
    queryFn: async () => {
      const res = await fetch('/api/token/balance');
      if (!res.ok) throw new Error('Failed to fetch token balances');
      const data = await res.json();
      return data.data || {};
    },
  });

  const { data: stakingData } = useQuery({
    queryKey: ['token-stakes', userId],
    queryFn: async () => {
      const res = await fetch('/api/token/stake');
      if (!res.ok) throw new Error('Failed to fetch staking info');
      const data = await res.json();
      return data.data || { stakes: [], availableRules: [] };
    },
  });

  if (isLoading) {
    return (
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="container py-2">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-8 w-32 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tokens = tokenData.token_holdings || [];

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="container py-2">
        <div className="flex items-center gap-4 overflow-x-auto">
          {tokens.map((token: any) => {
            const stake = stakingData?.stakes?.find(
              (s: any) => s.token_type_id === token.token_type_id
            );
            const totalAmount = token.balance + (token.staked_amount || 0);
            const stakingPercentage = token.staked_amount
              ? (token.staked_amount / totalAmount) * 100
              : 0;

            return (
              <TooltipProvider key={token.token_type_id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer',
                        'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700',
                        'transition-colors duration-200'
                      )}
                    >
                      <TokenIcon type={token.category} className="w-4 h-4" />
                      <span className="text-sm font-medium">{totalAmount.toLocaleString()}</span>
                      <span className="text-sm text-zinc-500">{token.token_name}</span>
                      {stakingPercentage > 0 && (
                        <Progress
                          value={stakingPercentage}
                          className="w-12 h-1"
                          indicatorClassName="bg-emerald-500"
                        />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="w-64">
                    <div className="space-y-2">
                      <div className="font-medium">{token.token_name}</div>
                      <div className="text-sm space-y-1">
                        <div>Available: {token.balance.toLocaleString()}</div>
                        {token.staked_amount > 0 && (
                          <div>
                            Staked: {token.staked_amount.toLocaleString()}
                            {stake && (
                              <div className="text-xs text-zinc-500">
                                APY: {stake.token_staking_rules.apy_percentage}%
                                <br />
                                Unlocks: {new Date(stake.locked_until).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    </div>
  );
}
