import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

/**
 * AnalyticsService provides methods for interacting with the Avolve platform's
 * advanced analytics and real-time engagement features.
 */
export class AnalyticsService {
  private supabase = createClientComponentClient<Database>()

  /**
   * Logs a user activity with the specified parameters.
   * For high-volume activities, this uses the queue_activity_log function
   * to process the activity asynchronously.
   */
  async logActivity(
    actionType: string,
    details: Record<string, any> = {},
    immersionLevel: number = 1,
    useQueue: boolean = true
  ) {
    try {
      const { data: userData } = await this.supabase.auth.getUser()
      if (!userData.user) return null

      // Get client information
      const ipAddress = '0.0.0.0' // This will be replaced by the server
      const userAgent = navigator.userAgent

      if (useQueue) {
        // Use the queue for high-volume activities
        const { data, error } = await this.supabase.rpc('queue_activity_log', {
          p_user_id: userData.user.id,
          p_action_type: actionType,
          p_details: details,
          p_ip_address: ipAddress,
          p_user_agent: userAgent,
          p_immersion_level: immersionLevel
        })

        if (error) throw error
        return data
      } else {
        // Direct insert for low-volume, high-priority activities
        const { data, error } = await this.supabase.from('user_activity_log').insert({
          user_id: userData.user.id,
          action_type: actionType,
          details,
          ip_address: ipAddress,
          user_agent: userAgent,
          immersion_level: immersionLevel,
          timestamp: new Date().toISOString()
        })

        if (error) throw error
        return data
      }
    } catch (error) {
      console.error('Error logging activity:', error)
      return null
    }
  }

  /**
   * Subscribes to real-time updates for event completions.
   * This can be used to update leaderboards and activity feeds in real-time.
   */
  subscribeToEventUpdates(callback: (payload: any) => void) {
    return this.supabase
      .channel('event-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_completions'
        },
        callback
      )
      .subscribe()
  }

  /**
   * Gets the journey analytics data for the specified journey type and token type.
   */
  async getJourneyAnalytics(journeyType?: string, tokenType?: string) {
    try {
      let query = this.supabase.from('journey_analytics').select('*')

      if (journeyType) {
        query = query.eq('primary_journey', journeyType)
      }

      if (tokenType) {
        query = query.eq('token_type', tokenType)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching journey analytics:', error)
      return null
    }
  }

  /**
   * Gets the community insights data for the specified token type.
   */
  async getCommunityInsights(tokenType?: string) {
    try {
      let query = this.supabase.from('community_insights').select('*')

      if (tokenType) {
        query = query.eq('token_type', tokenType)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching community insights:', error)
      return null
    }
  }

  /**
   * Gets the leaderboard data for the specified journey type, token type, and time period.
   */
  async getLeaderboard(
    journeyType?: string,
    tokenType?: string,
    timePeriod: '7days' | '30days' | '90days' | 'alltime' = '30days',
    limit: number = 10
  ) {
    try {
      const { data, error } = await this.supabase.rpc('get_journey_leaderboard', {
        p_journey_type: journeyType,
        p_token_type: tokenType,
        p_time_period: timePeriod,
        p_limit: limit
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      return null
    }
  }

  /**
   * Gets the current user's position on the leaderboard.
   */
  async getUserLeaderboardPosition(
    journeyType?: string,
    tokenType?: string,
    timePeriod: '7days' | '30days' | '90days' | 'alltime' = '30days'
  ) {
    try {
      const { data: userData } = await this.supabase.auth.getUser()
      if (!userData.user) return null

      const { data, error } = await this.supabase.rpc('get_user_leaderboard_position', {
        p_user_id: userData.user.id,
        p_journey_type: journeyType,
        p_token_type: tokenType,
        p_time_period: timePeriod
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user leaderboard position:', error)
      return null
    }
  }

  /**
   * Gets the Tesla 3-6-9 streak data for the current user.
   */
  async getTesla369Streak() {
    try {
      const { data: userData } = await this.supabase.auth.getUser()
      if (!userData.user) return null

      const { data, error } = await this.supabase.rpc('calculate_tesla_369_streak', {
        p_user_id: userData.user.id
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching Tesla 3-6-9 streak:', error)
      return null
    }
  }

  /**
   * Gets the immersion insights for the current user.
   */
  async getImmersionInsights() {
    try {
      const { data: userData } = await this.supabase.auth.getUser()
      if (!userData.user) return null

      const { data, error } = await this.supabase
        .from('immersion_insights')
        .select('*')
        .eq('user_id', userData.user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 is "No rows returned"
      return data
    } catch (error) {
      console.error('Error fetching immersion insights:', error)
      return null
    }
  }
}

// Export a singleton instance
export const analyticsService = new AnalyticsService()
