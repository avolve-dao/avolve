'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Database } from '@/lib/database.types';

type TokenWithBalance = {
  token_symbol: string;
  token_name: string;
  balance: number;
  staked_balance: number;
  icon_url: string | null;
  gradient_class: string | null;
};

interface TokenBalanceCardProps {
  token: TokenWithBalance;
  isLoading?: boolean;
}

export function TokenBalanceCard({ token, isLoading = false }: TokenBalanceCardProps) {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-8 w-24" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <div
        className={`h-2 w-full ${token.gradient_class || 'bg-gradient-to-r from-primary to-secondary'}`}
      />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">{token.token_name}</CardTitle>
          {token.icon_url && (
            <div className="h-8 w-8 rounded-full overflow-hidden">
              <img
                src={token.icon_url}
                alt={`${token.token_name} icon`}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
        <CardDescription>{token.token_symbol}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-1">{token.balance.toLocaleString()}</div>
        {token.staked_balance > 0 && (
          <p className="text-sm text-muted-foreground">
            {token.staked_balance.toLocaleString()} staked
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Badge variant="outline" className="text-xs">
          {token.token_symbol}
        </Badge>
      </CardFooter>
    </Card>
  );
}
