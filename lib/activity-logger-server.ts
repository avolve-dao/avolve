import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ActivityAction =
  | 'post_create'
  | 'post_like'
  | 'post_comment'
  | 'message_send'
  | 'reaction_add'
  | 'user_follow'
  | 'user_join'
  | 'group_join'
  | 'profile_update';

export type EntityType = 'post' | 'comment' | 'message' | 'user' | 'group' | 'reaction';

interface LogActivityParams {
  userId: string;
  action: ActivityAction;
  entityType: EntityType;
  entityId: string;
  metadata?: Record<string, any>;
}

/**
 * Logs a user activity to the database (server-side)
 */
export async function logActivityServer({
  userId,
  action,
  entityType,
  entityId,
  metadata = {},
}: LogActivityParams) {
  try {
    const supabase = createClient() as SupabaseClient<Database>;

    const { error } = await supabase.from('activity_logs').insert({
      user_id: userId,
      action_type: action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    });

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Error in logActivityServer:', error);
  }
}

/**
 * Gets activity logs for a specific user (server-side)
 */
export async function getUserActivityServer(userId: string, limit = 20, page = 0) {
  try {
    const supabase = createClient() as SupabaseClient<Database>;

    const { data, error } = await supabase
      .from('user_activity_feed')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getUserActivityServer:', error);
    return [];
  }
}

/**
 * Gets activity feed for a user (includes activities from followed users) (server-side)
 */
export async function getActivityFeedServer(userId: string, limit = 20, page = 0) {
  try {
    const supabase = createClient() as SupabaseClient<Database>;

    // First get the list of users this user follows
    const { data: followingData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    const followingIds = followingData?.map(f => f.following_id) || [];

    // Include the user's own ID
    const userIds = [userId, ...followingIds];

    // Get activities from these users
    const { data, error } = await supabase
      .from('user_activity_feed')
      .select('*')
      .in('user_id', userIds)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) {
      console.error('Error fetching activity feed:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getActivityFeedServer:', error);
    return [];
  }
}

/**
 * Gets global activity feed (all users) (server-side)
 */
export async function getGlobalActivityFeedServer(limit = 20, page = 0) {
  try {
    const supabase = createClient() as SupabaseClient<Database>;

    const { data, error } = await supabase
      .from('user_activity_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) {
      console.error('Error fetching global activity:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getGlobalActivityFeedServer:', error);
    return [];
  }
}
