'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reward_amount: number;
  reward_token: string;
  completed: boolean;
  progress: number;
  total_required: number;
}

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const supabase = createClient();

  useEffect(() => {
    async function loadChallenges() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load challenges',
          variant: 'destructive',
        });
        return;
      }

      setChallenges(data);
      setLoading(false);

      // Subscribe to challenge updates
      const channel = supabase
        .channel('challenge_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_challenges',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            loadChallenges();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    loadChallenges();
  }, [supabase, toast]);

  const claimReward = async (challengeId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to claim rewards',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase
      .from('user_challenges')
      .update({ claimed: true })
      .eq('id', challengeId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to claim reward',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Challenge reward claimed successfully!',
    });
  };

  return {
    challenges,
    loading,
    claimReward,
  };
}
