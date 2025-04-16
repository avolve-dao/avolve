/**
 * Activity Feed Server Component
 * 
 * Displays user's recent activities and platform events
 * Copyright 2025 Avolve DAO. All rights reserved.
 */

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ActivityFeedClient, ActivityItem } from './client';

// Types
import type { Database } from '@/types/supabase';

export async function ActivityFeedServer({ userId, limit = 10 }: { userId: string, limit?: number }) {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  // Fetch user's recent activities
  const { data: activities } = await (supabase as any)
    .from('user_activity_log')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit);
  
  // Fetch user's notifications
  const { data: notifications } = await (supabase as any)
    .from('user_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  // Fetch user's event completions (type assertion for missing generated type)
  const { data: eventCompletions } = await (supabase as any)
    .from('event_completions')
    .select('*, events:event_id(*)')
    .eq('user_id', userId)
    .order('completion_date', { ascending: false })
    .limit(limit);
  
  // Fetch user's token transactions (type assertion for missing generated type)
  const { data: tokenTransactions } = await (supabase as any)
    .from('transactions')
    .select('*, token:token_id(*)')
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  // Combine all activities and sort by date
  const allActivities: ActivityItem[] = [
    ...((activities as any[] || []).map((activity: any) => ({
      type: 'activity' as const,
      id: activity.id,
      timestamp: activity.timestamp,
      data: activity
    }))),
    ...((notifications as any[] || []).map((notification: any) => ({
      type: 'notification' as const,
      id: notification.id,
      timestamp: notification.created_at,
      data: notification
    }))),
    ...((eventCompletions as any[] || []).map((completion: any) => ({
      type: 'event_completion' as const,
      id: completion.id,
      timestamp: completion.completion_date,
      data: completion
    }))),
    ...((tokenTransactions as any[] || []).map((transaction: any) => ({
      type: 'token_transaction' as const,
      id: transaction.id,
      timestamp: transaction.created_at,
      data: transaction
    }))),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
   .slice(0, limit);
  
  return (
    <ActivityFeedClient 
      activities={allActivities}
      userId={userId}
    />
  );
}
