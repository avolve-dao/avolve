// components/dashboard/UserDashboard.tsx
'use client'

import React, { useState, useEffect } from 'react';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// @ts-ignore: Temporarily ignore missing module for auth helpers
import { useUser } from '@supabase/auth-helpers-react';
import { createClient } from '@supabase/supabase-js'; // Adjust to use direct Supabase client
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { shareContent, formatEngagementShareMessage, formatRewardShareMessage } from '@/lib/utils/socialSharing';

interface TokenBalance {
  token_symbol: string;
  balance: number;
}

interface EngagementData {
  score: number;
}

interface Reward {
  reward_category: string;
  reward_amount: number;
  eligibility_reason: string;
}

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const UserDashboard: React.FC = () => {
  const user = useUser();
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch token balances
        const { data: balancesData, error: balancesError } = await supabase
          .from('user_token_summary')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (balancesError) throw new Error('Failed to fetch token balances');
        if (balancesData) {
          // Transform data into an array for display (adjust based on actual structure)
          const formattedBalances = Object.entries(balancesData)
            .filter(([key, value]) => key.includes('_balance') && typeof value === 'number')
            .map(([key, value]) => ({
              token_symbol: key.replace('_balance', '').toUpperCase(),
              balance: value as number,
            }));
          setTokenBalances(formattedBalances);
        }

        // Fetch engagement score
        const { data: engagementData, error: engagementError } = await supabase
          .rpc('calculate_user_engagement_score', { p_user_id: user.id });

        if (engagementError) throw new Error('Failed to fetch engagement score');
        setEngagement({ score: engagementData });

        // Fetch rewards
        const { data: rewardsData, error: rewardsError } = await supabase
          .rpc('calculate_user_rewards', { p_user_id: user.id });

        if (rewardsError) throw new Error('Failed to fetch rewards');
        setRewards(rewardsData || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Function to handle sharing engagement score
  const handleShareEngagement = (platform: string) => {
    if (engagement) {
      const message = formatEngagementShareMessage(engagement.score);
      shareContent(platform, message);
    }
  };

  // Function to handle sharing a specific reward
  const handleShareReward = (platform: string, reward: Reward) => {
    const message = formatRewardShareMessage(reward.reward_category, reward.reward_amount);
    shareContent(platform, message);
  };

  if (!user) {
    return <div>Please log in to view your dashboard.</div>;
  }

  if (loading) {
    return <div>Loading your dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.email?.split('@')[0] || 'User'}!</h1>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{engagement?.score || 0}</div>
                <p className="text-xs text-muted-foreground">Your activity level over the last 30 days</p>
                <Progress value={Math.min((engagement?.score || 0) / 10, 100)} className="mt-2" />
                <div className="flex space-x-2 mt-2">
                  <Button variant="outline" size="sm" onClick={() => handleShareEngagement('twitter')}>Share on Twitter</Button>
                  <Button variant="outline" size="sm" onClick={() => handleShareEngagement('linkedin')}>Share on LinkedIn</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Token Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tokenBalances.length > 0 ? tokenBalances.length : 'No'} Tokens</div>
                <p className="text-xs text-muted-foreground">Manage your token balances</p>
                <Button variant="link" className="mt-2 p-0" onClick={() => window.location.href = '/tokens'}>
                  View Details
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Potential Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rewards.length > 0 ? rewards.reduce((sum, r) => sum + r.reward_amount, 0).toFixed(2) : '0.00'}</div>
                <p className="text-xs text-muted-foreground">Based on your engagement and activities</p>
                <Button variant="link" className="mt-2 p-0" onClick={() => window.location.href = '/rewards'}>
                  Claim Rewards
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Token Balances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tokenBalances.length > 0 ? (
                <ul className="space-y-2">
                  {tokenBalances.map((balance, index) => (
                    <li key={index} className="flex justify-between items-center p-2 bg-muted rounded-md">
                      <span>{balance.token_symbol}</span>
                      <span className="font-medium">{balance.balance.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No token balances available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Potential Rewards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rewards.length > 0 ? (
                <ul className="space-y-2">
                  {rewards.map((reward, index) => (
                    <li key={index} className="p-2 bg-muted rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{reward.reward_category}</span>
                        <span className="font-bold">{reward.reward_amount.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{reward.eligibility_reason}</p>
                      <div className="flex space-x-2 mt-1">
                        <Button variant="outline" size="sm" onClick={() => handleShareReward('twitter', reward)}>Tweet</Button>
                        <Button variant="outline" size="sm" onClick={() => handleShareReward('linkedin', reward)}>Post on LinkedIn</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No rewards available at this time.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
