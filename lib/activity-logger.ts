import { createClient } from '@/lib/supabase/client';

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
 * Logs a user activity to the database
 */
export async function logActivity({
  userId,
  action,
  entityType,
  entityId,
  metadata = {},
}: LogActivityParams) {
  try {
    const supabase = createClient();

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
    console.error('Error in logActivity:', error);
  }
}

/**
 * Gets activity logs for a specific user
 */
export async function getUserActivity(userId: string, limit = 20, page = 0) {
  try {
    const supabase = createClient();

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
    console.error('Error in getUserActivity:', error);
    return [];
  }
}

/**
 * Gets activity feed for a user (includes activities from followed users)
 */
export async function getActivityFeed(userId: string, limit = 20, page = 0) {
  try {
    const supabase = createClient();

    // First get the list of users this user follows
    const { data: followingData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    const followingIds = Array.isArray(followingData)
      ? followingData.map((f: { following_id: string }) => f.following_id)
      : [];

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
    console.error('Error in getActivityFeed:', error);
    return [];
  }
}

/**
 * Gets global activity feed (all users)
 */
export async function getGlobalActivityFeed(limit = 20, page = 0) {
  try {
    const supabase = createClient();

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
    console.error('Error in getGlobalActivityFeed:', error);
    return [];
  }
}
