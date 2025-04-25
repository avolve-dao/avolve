import { createClient as createClientBrowser } from '@/lib/supabase/client';

// Create a cache for database queries
// import { LRUCache } from 'lru-cache';
// const queryCache = new LRUCache<string, any>({
//   max: 100, // Maximum number of items to store in cache
//   ttl: 1000 * 60 * 5, // 5 minutes TTL
// });

// Replace with in-memory cache (if needed for MVP):
const queryCache = new Map<string, { data: any; expiry: number | null }>();

// Client-side database functions
export const clientDb = {
  // Supabase client instance (lazy initialization)
  _client: null as ReturnType<typeof createClientBrowser> | null,

  // Get Supabase client (singleton pattern)
  getSupabaseClient() {
    if (!this._client) {
      this._client = createClientBrowser();
    }
    return this._client;
  },

  // Cache key generator
  _cacheKey(operation: string, ...args: unknown[]) {
    return `${operation}:${JSON.stringify(args)}`;
  },

  async getSuggestedUsers(currentUserId: string, limit = 5) {
    const cacheKey = this._cacheKey('getSuggestedUsers', currentUserId, limit);

    // Check cache first
    const cached = queryCache.get(cacheKey);
    if (cached) return cached.data;

    const supabase = this.getSupabaseClient();
    // Fixed query syntax
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', currentUserId) // This is correct syntax
      .limit(limit);

    if (error) {
      console.error('Error fetching suggested users:', error);
      return [];
    }

    // Cache the result
    queryCache.set(cacheKey, { data, expiry: null });

    return data;
  },

  async createPost(userId: string, content: string, mediaUrls: string[] = []) {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        content,
        media_urls: mediaUrls,
      })
      .select();

    if (error) {
      console.error('Error creating post:', error);
      throw error;
    }

    // Invalidate relevant caches
    this._invalidateRelatedCaches(['posts', userId]);

    return data[0];
  },

  async likePost(userId: string, postId: string) {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase.from('likes').insert({
      user_id: userId,
      post_id: postId,
    });

    if (error) {
      // If the error is a duplicate key error, the user already liked the post
      if (error.code === '23505') {
        // Unlike the post
        return this.unlikePost(userId, postId);
      }
      console.error('Error liking post:', error);
      throw error;
    }

    // Invalidate relevant caches
    this._invalidateRelatedCaches(['likes', 'posts', userId, postId]);

    return true;
  },

  async unlikePost(userId: string, postId: string) {
    const supabase = this.getSupabaseClient();
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) {
      console.error('Error unliking post:', error);
      throw error;
    }

    // Invalidate relevant caches
    this._invalidateRelatedCaches(['likes', 'posts', userId, postId]);

    return false;
  },

  async isPostLiked(userId: string, postId: string) {
    const cacheKey = this._cacheKey('isPostLiked', userId, postId);

    // Check cache first
    const cached = queryCache.get(cacheKey);
    if (cached !== undefined) return cached.data;

    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();

    if (error) {
      console.error('Error checking if post is liked:', error);
      return false;
    }

    const result = !!data;
    // Cache the result
    queryCache.set(cacheKey, { data: result, expiry: null });

    return result;
  },

  async followUser(followerId: string, followingId: string) {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase.from('follows').insert({
      follower_id: followerId,
      following_id: followingId,
    });

    if (error) {
      // If the error is a duplicate key error, the user already follows this user
      if (error.code === '23505') {
        // Unfollow the user
        return this.unfollowUser(followerId, followingId);
      }
      console.error('Error following user:', error);
      throw error;
    }

    // Invalidate relevant caches
    this._invalidateRelatedCaches(['follows', followerId, followingId]);

    return true;
  },

  async unfollowUser(followerId: string, followingId: string) {
    const supabase = this.getSupabaseClient();
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }

    // Invalidate relevant caches
    this._invalidateRelatedCaches(['follows', followerId, followingId]);

    return false;
  },

  async isFollowing(followerId: string, followingId: string) {
    const cacheKey = this._cacheKey('isFollowing', followerId, followingId);

    // Check cache first
    const cached = queryCache.get(cacheKey);
    if (cached !== undefined) return cached.data;

    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (error) {
      console.error('Error checking if following:', error);
      return false;
    }

    const result = !!data;
    // Cache the result
    queryCache.set(cacheKey, { data: result, expiry: null });

    return result;
  },

  async getFollowCounts(userId: string) {
    const cacheKey = this._cacheKey('getFollowCounts', userId);

    // Check cache first
    const cached = queryCache.get(cacheKey);
    if (cached) return cached.data;

    const supabase = this.getSupabaseClient();

    // Get followers count
    const { count: followersCount, error: followersError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (followersError) {
      console.error('Error getting followers count:', followersError);
    }

    // Get following count
    const { count: followingCount, error: followingError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    if (followingError) {
      console.error('Error getting following count:', followingError);
    }

    const result = {
      followers: followersCount || 0,
      following: followingCount || 0,
    };

    // Cache the result
    queryCache.set(cacheKey, { data: result, expiry: null });

    return result;
  },

  async addComment(userId: string, postId: string, content: string) {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        post_id: postId,
        content,
      })
      .select();

    if (error) {
      console.error('Error adding comment:', error);
      throw error;
    }

    // Invalidate relevant caches
    this._invalidateRelatedCaches(['comments', 'posts', userId, postId]);

    return data[0];
  },

  async getComments(postId: string) {
    const cacheKey = this._cacheKey('getComments', postId);

    // Check cache first
    const cached = queryCache.get(cacheKey);
    if (cached) return cached.data;

    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('comments')
      .select(
        `
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error getting comments:', error);
      return [];
    }

    // Cache the result
    queryCache.set(cacheKey, { data, expiry: null });

    return data;
  },

  async updateProfile(
    userId: string,
    profile: Partial<{
      full_name: string;
      username: string;
      avatar_url: string;
      bio: string;
      website: string;
      location: string;
    }>
  ) {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    // Invalidate relevant caches
    this._invalidateRelatedCaches(['profiles', userId]);

    return data[0];
  },

  // Helper method to invalidate related caches
  _invalidateRelatedCaches(keys: string[]) {
    // Get all cache keys
    const cacheKeys = Array.from(queryCache.keys() as Iterable<string>);

    // Invalidate any cache key that contains any of the provided keys
    for (const cacheKey of cacheKeys) {
      if (keys.some(key => cacheKey.includes(key))) {
        queryCache.delete(cacheKey);
      }
    }
  },

  // Clear the entire cache
  clearCache() {
    queryCache.clear();
  },
};
