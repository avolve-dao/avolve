'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useFeatureFlagContext } from '@/components/providers/FeatureFlagProvider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database-extensions';
import { Loader2, Lock, CheckCircle, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface TokenBalance {
  token_type: string;
  balance: number;
}

interface FeatureWithTokenRequirement {
  key: string;
  description: string;
  amount: number;
  enabled: boolean;
}

/**
 * FeatureUnlockProgress component
 *
 * Shows users which features they have unlocked and what they need to unlock additional features.
 * This component is part of the onboarding experience, providing clear progression visibility.
 */
export function FeatureUnlockProgress() {
  const { features, loading: featuresLoading } = useFeatureFlagContext();
  const supabase = createClientComponentClient<Database>();
  const [tokenBalances, setTokenBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Fetch user token balances
  useEffect(() => {
    const fetchTokenBalances = async () => {
      try {
        // Use type assertion since get_user_token_balances is not in the Database type yet
        const { data, error } = (await supabase.rpc('get_user_token_balances')) as {
          data: TokenBalance[] | null;
          error: any;
        };

        if (error) throw error;

        // Convert array to record for easier lookup
        const balances: Record<string, number> = {};
        if (data) {
          data.forEach(item => {
            balances[item.token_type] = item.balance;
          });
        }

        setTokenBalances(balances);
      } catch (error) {
        console.error('Error fetching token balances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenBalances();
  }, [supabase]);

  // Get all features with token requirements
  const getFeaturesByTokenRequirements = () => {
    const result: Record<string, FeatureWithTokenRequirement[]> = {};

    Object.entries(features).forEach(([key, feature]) => {
      if (feature.tokenRequirements && Object.keys(feature.tokenRequirements).length > 0) {
        Object.entries(feature.tokenRequirements).forEach(([token, amount]) => {
          if (!result[token]) {
            result[token] = [];
          }

          result[token].push({
            key,
            description: feature.description || key,
            amount: Number(amount),
            enabled: feature.enabled,
          });
        });
      }
    });

    // Sort features by token amount
    Object.keys(result).forEach(token => {
      result[token].sort((a, b) => a.amount - b.amount);
    });

    return result;
  };

  const tokenFeatures = getFeaturesByTokenRequirements();

  if (loading || featuresLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>Loading your feature unlock progress...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (Object.keys(tokenFeatures).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>Track your progress and unlock new features</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            No unlockable features available at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Progress</CardTitle>
        <CardDescription>Track your progress and unlock new features</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(tokenFeatures).map(([token, features]) => (
          <div key={token} className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium flex items-center">
                <Coins className="h-4 w-4 mr-2" />
                {token} Tokens
              </h3>
              <Badge variant="outline">Balance: {tokenBalances[token] || 0}</Badge>
            </div>

            <div className="space-y-4">
              {features.map(feature => {
                const progress = Math.min(
                  100,
                  ((tokenBalances[token] || 0) / feature.amount) * 100
                );
                const isUnlocked = feature.enabled;

                return (
                  <div key={feature.key} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center">
                        {isUnlocked ? (
                          <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 mr-1 text-muted-foreground" />
                        )}
                        {feature.description}
                      </span>
                      <span className="text-sm font-medium">
                        {tokenBalances[token] || 0}/{feature.amount}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="pt-4 flex justify-center">
          <Link href="/tokens">
            <Button>Earn More Tokens</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
