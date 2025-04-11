"use client";

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@/components/ui/use-toast';

interface DailyClaim {
  id: string;
  token_type: string;
  amount: number;
  claimed: boolean;
  expires_at: string;
}

export function useDailyClaims() {
  const [claims, setClaims] = useState<DailyClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadDailyClaims() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('daily_claims')
        .select('*')
        .eq('user_id', user.id)
        .gte('expires_at', new Date().toISOString());

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load daily claims",
          variant: "destructive"
        });
        return;
      }

      setClaims(data);
      setLoading(false);

      // Subscribe to claim updates
      const channel = supabase
        .channel('claim_updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'daily_claims',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            loadDailyClaims();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    loadDailyClaims();
  }, [supabase, toast]);

  const claimDaily = async (claimId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
      
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to claim rewards",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('daily_claims')
      .update({ claimed: true })
      .eq('id', claimId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to claim daily reward",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Daily reward claimed successfully!",
    });
  };

  return {
    claims,
    loading,
    claimDaily
  };
}
