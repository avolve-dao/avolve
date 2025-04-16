import { useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * useAnalyticsEvent - Hook to track real user actions in Supabase analytics_events table.
 * Usage: const track = useAnalyticsEvent(); track('event_type', { key: value });
 */
export function useAnalyticsEvent() {
  return useCallback(async (event_type: string, event_data: Record<string, any> = {}) => {
    await supabase.from('analytics_events').insert([{ event_type, event_data }]);
  }, []);
}
