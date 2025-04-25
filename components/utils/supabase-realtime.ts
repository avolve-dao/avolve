// Utility for subscribing to Supabase Realtime Broadcast channels
// Follows: https://supabase.com/blog/realtime-broadcast-from-database
// Usage: import { subscribeToFeedUpdates } from './utils/supabase-realtime';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Subscribe to real-time updates on the Supercivilization Feed table
 * @param {(payload: any) => void} onUpdate
 * @returns {() => void} Unsubscribe function
 */
export function subscribeToFeedUpdates(onUpdate: (payload: any) => void) {
  const channel = supabase
    .channel('public:supercivilization_feed')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'supercivilization_feed' },
      payload => {
        onUpdate(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Example: Subscribe to collective_progress updates
 */
export function subscribeToProgressUpdates(onUpdate: (payload: any) => void) {
  const channel = supabase
    .channel('public:collective_progress')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'collective_progress' },
      payload => {
        onUpdate(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
