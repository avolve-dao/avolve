'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

type TokenReward = {
  id: string;
  token_id: string;
  token_symbol: string;
  token_name: string;
  name: string;
  description: string | null;
  amount: number;
  reward_type: 'achievement' | 'contribution' | 'referral' | 'daily' | 'challenge';
  requirements: Record<string, any>;
  is_active: boolean;
  cooldown_period: string | null;
  is_claimed: boolean;
  can_claim: boolean;
  next_available: string | null;
};

export function TokenRewards() {
  const [rewards, setRewards] = useState<TokenReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      // Get available rewards with claim status
      const { data, error } = await supabase.rpc('get_available_rewards');

      if (error) {
        throw new Error(`Error fetching rewards: ${error.message}`);
      }

      setRewards(data || []);
    } catch (err) {
      console.error('Error in TokenRewards:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    try {
      setClaimingId(rewardId);
      const supabase = createClient();

      const { data, error } = await supabase.rpc('claim_token_reward', {
        p_reward_id: rewardId,
      });

      if (error) {
        throw new Error(`Error claiming reward: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to claim reward');
      }

      toast({
        title: 'Reward claimed!',
        description: `You received ${data.amount} tokens`,
        variant: 'default',
      });

      // Refresh rewards list
      fetchRewards();
    } catch (err) {
      console.error('Error claiming reward:', err);
      toast({
        title: 'Error claiming reward',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setClaimingId(null);
    }
  };

  // Format date for cooldown display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Get reward icon based on type
  const getRewardIcon = (type: TokenReward['reward_type']) => {
    switch (type) {
      case 'achievement':
        return <Award className="h-5 w-5" />;
      case 'daily':
        return <Clock className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  // Get progress percentage based on requirements
  const getProgressPercentage = (reward: TokenReward) => {
    if (!reward.requirements.progress) return 100;

    const { current, required } = reward.requirements.progress;
    return Math.min(100, Math.round((current / required) * 100));
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Token Rewards</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-full mt-4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : rewards.length > 0 ? (
          // Reward cards
          rewards.map(reward => (
            <Card key={reward.id} className="overflow-hidden">
              <div
                className={`h-2 w-full ${
                  reward.reward_type === 'achievement'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                    : reward.reward_type === 'contribution'
                      ? 'bg-gradient-to-r from-teal-400 to-cyan-500'
                      : reward.reward_type === 'referral'
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600'
                        : reward.reward_type === 'daily'
                          ? 'bg-gradient-to-r from-blue-400 to-indigo-500'
                          : 'bg-gradient-to-r from-rose-400 to-red-500'
                }`}
              />

              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-bold">{reward.name}</CardTitle>
                  <div
                    className={`p-1.5 rounded-full ${
                      reward.reward_type === 'achievement'
                        ? 'bg-amber-100 text-amber-700'
                        : reward.reward_type === 'contribution'
                          ? 'bg-teal-100 text-teal-700'
                          : reward.reward_type === 'referral'
                            ? 'bg-violet-100 text-violet-700'
                            : reward.reward_type === 'daily'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {getRewardIcon(reward.reward_type)}
                  </div>
                </div>
                <CardDescription className="capitalize">
                  {reward.reward_type} Reward
                </CardDescription>
              </CardHeader>

              <CardContent>
                {reward.description && (
                  <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                )}

                <div className="flex justify-between items-center mb-1 text-sm">
                  <span>Reward</span>
                  <span className="font-medium">
                    {reward.amount} {reward.token_symbol}
                  </span>
                </div>

                {reward.requirements.progress && (
                  <>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>
                        {reward.requirements.progress.current}/
                        {reward.requirements.progress.required}
                      </span>
                    </div>
                    <Progress value={getProgressPercentage(reward)} className="h-2" />
                  </>
                )}

                {reward.is_claimed && (
                  <div className="flex items-center gap-1 mt-3 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Claimed</span>
                  </div>
                )}

                {!reward.can_claim && reward.next_available && (
                  <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Available {formatDate(reward.next_available)}</span>
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  disabled={!reward.can_claim || claimingId === reward.id}
                  onClick={() => handleClaimReward(reward.id)}
                >
                  {claimingId === reward.id
                    ? 'Claiming...'
                    : reward.is_claimed
                      ? 'Claimed'
                      : !reward.can_claim
                        ? 'Not Available'
                        : 'Claim Reward'}
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          // No rewards message
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>No Rewards Available</CardTitle>
              <CardDescription>
                Complete challenges and contribute to unlock rewards.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
