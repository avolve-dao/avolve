'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@/components/ui/use-toast';

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
}

/**
 * Hook for managing user subscriptions and token interactions
 * Handles subscription creation, token spending, and metrics tracking
 */
export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadSubscription() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Not found is okay
        toast({
          title: 'Error',
          description: 'Failed to load subscription',
          variant: 'destructive',
        });
        return;
      }

      setSubscription(data);
      setLoading(false);

      // Subscribe to subscription updates
      const channel = supabase
        .channel('subscription_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscriptions',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            loadSubscription();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    loadSubscription();
  }, [supabase, toast]);

  const updateSubscription = async (updates: Partial<Subscription>) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update subscription',
        variant: 'destructive',
      });
      return;
    }

    if (!subscription?.id) {
      toast({
        title: 'Error',
        description: 'No active subscription found',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', subscription.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update subscription',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Subscription updated successfully!',
    });
  };

  const cancelSubscription = async () => {
    await updateSubscription({
      status: 'cancelled',
      auto_renew: false,
    });
  };

  return {
    subscription,
    loading,
    updateSubscription,
    cancelSubscription,
  };
}

export default useSubscription;
