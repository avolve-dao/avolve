import { useState, useEffect } from 'react';
import { createClient } from '../supabase/client';
import { useUser } from './use-user';

export interface TokenBalance {
  token_type_id: string;
  balance: number;
  staked_amount: number;
  token_type: {
    id: string;
    name: string;
    description: string;
    category: 'primary' | 'personal' | 'collective';
    frequency: string;
  };
}

export interface StakingRule {
  id: string;
  token_type_id: string;
  min_stake_amount: number;
  lock_period_days: number;
  apy_percentage: number;
  voting_weight_multiplier: number;
  focus_areas: string[];
  bonus_features: {
    features: string[];
    personal_boost?: number;
    collective_boost?: number;
    ecosystem_boost?: number;
  };
}

export interface UserStake {
  id: string;
  token_type_id: string;
  amount: number;
  locked_until: string;
  staking_rule: StakingRule;
  token_type: TokenBalance['token_type'];
}

export function useTokens() {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [stakes, setStakes] = useState<UserStake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const { user } = useUser();

  useEffect(() => {
    if (!user?.id) return;

    const fetchTokenData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch balances
        const { data: balances, error: balancesError } = await supabase
          .from('token_balances')
          .select(
            `
            *,
            token_type:token_types(*)
          `
          )
          .eq('user_id', user.id);

        if (balancesError) throw balancesError;

        // Fetch active stakes
        const { data: stakes, error: stakesError } = await supabase
          .from('user_stakes')
          .select(
            `
            *,
            token_type:token_types(*),
            staking_rule:token_staking_rules(*)
          `
          )
          .eq('user_id', user.id)
          .gt('locked_until', new Date().toISOString());

        if (stakesError) throw stakesError;

        setBalances(balances || []);
        setStakes(stakes || []);
      } catch (err) {
        console.error('Error fetching token data:', err);
        setError('Failed to fetch token data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenData();

    // Subscribe to balance changes
    const balanceSubscription = supabase
      .channel('token_balances')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'token_balances',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchTokenData();
        }
      )
      .subscribe();

    // Subscribe to stake changes
    const stakeSubscription = supabase
      .channel('user_stakes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stakes',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchTokenData();
        }
      )
      .subscribe();

    return () => {
      balanceSubscription.unsubscribe();
      stakeSubscription.unsubscribe();
    };
  }, [user?.id]);

  const convertTokens = async (fromToken: string, toToken: string, amount: number) => {
    try {
      const response = await fetch('/api/tokens/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromToken, toToken, amount }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return await response.json();
    } catch (err) {
      console.error('Error converting tokens:', err);
      throw err;
    }
  };

  const stakeTokens = async (tokenTypeId: string, amount: number, stakingRuleId: string) => {
    try {
      const response = await fetch('/api/tokens/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenTypeId, amount, stakingRuleId }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return await response.json();
    } catch (err) {
      console.error('Error staking tokens:', err);
      throw err;
    }
  };

  return {
    balances,
    stakes,
    isLoading,
    error,
    convertTokens,
    stakeTokens,
  };
}
