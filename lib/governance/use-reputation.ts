import { useCallback, useState } from 'react';
import { Reputation } from './types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/lib/auth/use-auth';

export function useReputation() {
  const supabase = createClientComponentClient();
  const { user } = useAuth();
  const [reputation, setReputation] = useState<Reputation>({
    user_id: '',
    individual_merit: 0,
    collective_merit: 0,
    ecosystem_merit: 0,
    updated_at: ''
  });

  const loadReputation = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await supabase.from('user_reputation').select('*').eq('user_id', user.id).single();
    if (!error && data) setReputation(data);
  }, [supabase, user]);

  return {
    reputation,
    loadReputation
  };
}
