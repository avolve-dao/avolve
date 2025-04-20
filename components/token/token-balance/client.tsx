'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@/components/ui/use-toast';
import { TokenIcon } from '@/components/token/token-icon';
import { Card, CardContent } from '@/components/ui/card';

interface TokenBalance {
  token_type: string;
  balance: number;
  last_updated: string;
}

export function TokenBalanceClient() {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadTokenBalances() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_token_balances')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load token balances",
          variant: "destructive"
        });
        return;
      }

      setBalances(data);
      setLoading(false);

      // Subscribe to balance updates
      const channel = supabase
        .channel('balance_updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'user_token_balances',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            loadTokenBalances();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    loadTokenBalances();
  }, [supabase, toast]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-full"></div>
      </div>
    );
  }

  if (!balances.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">No token balances available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {balances.map((balance) => (
        <Card key={balance.token_type}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TokenIcon type={balance.token_type} />
                <div>
                  <p className="font-medium">{balance.token_type}</p>
                  <p className="text-2xl font-bold">{balance.balance}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
