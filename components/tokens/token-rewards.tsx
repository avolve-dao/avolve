'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TokenIcon } from '@/components/tokens/token-icon';

interface TokenReward {
  token_type: string;
  amount: number;
  progress: number;
  total_required: number;
  description: string;
}

export function TokenRewards() {
  const [rewards, setRewards] = useState<TokenReward[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadTokenRewards() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_token_rewards')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load token rewards",
          variant: "destructive"
        });
        return;
      }

      setRewards(data);
      setLoading(false);

      // Subscribe to reward updates
      const channel = supabase
        .channel('reward_updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'user_token_rewards',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            loadTokenRewards();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    loadTokenRewards();
  }, [supabase, toast]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-full"></div>
      </div>
    );
  }

  if (!rewards.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">No rewards available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {rewards.map((reward) => (
        <Card key={`${reward.token_type}-${reward.description}`}>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <TokenIcon type={reward.token_type} />
                <div>
                  <p className="font-medium">{reward.token_type}</p>
                  <p className="text-2xl font-bold">+{reward.amount}</p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm text-gray-600">{reward.description}</p>
                  <span className="text-sm text-gray-500">
                    {reward.progress} / {reward.total_required}
                  </span>
                </div>
                <Progress 
                  value={(reward.progress / reward.total_required) * 100} 
                  className="h-2" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
