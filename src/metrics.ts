import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { MetricType } from '../types/supabase';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * MetricsService - Tracks and analyzes platform metrics
 * Handles DAU, MAU, retention, interaction, NPS, growth, ARPU, health, time spent
 */
export class MetricsService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseUrl: string = supabaseUrl, supabaseKey: string = supabaseAnonKey) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  /**
   * Update user metrics when they log in or perform significant actions
   * Records DAU, updates MAU, calculates retention
   * 
   * @param userId User ID to record metrics for
   * @returns Result of the metrics update
   */
  async updateMetrics(userId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      // Call the database function to update user metrics
      const { data, error } = await this.supabase.rpc('update_user_metrics', {
        p_user_id: userId
      });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Update metrics error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown metrics update error'
      };
    }
  }

  /**
   * Record a specific metric value
   * 
   * @param metricType Type of metric to record
   * @param value Numeric value of the metric
   * @param userId Optional user ID if the metric is user-specific
   * @param metadata Optional additional data about the metric
   * @returns Result of the metric recording
   */
  async recordMetric(
    metricType: MetricType,
    value: number,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      // Call the database function to record a metric
      const { data, error } = await this.supabase.rpc('record_metric', {
        p_user_id: userId || null,
        p_metric_type: metricType,
        p_value: value,
        p_metadata: metadata
      });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Record metric error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown metric recording error'
      };
    }
  }

  /**
   * Record Net Promoter Score (NPS) for a user
   * 
   * @param userId User ID providing the score
   * @param score NPS score (0-10)
   * @param feedback Optional feedback text
   * @returns Result of the NPS recording
   */
  async recordNPS(
    userId: string,
    score: number,
    feedback?: string
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    // Validate score range
    if (score < 0 || score > 10) {
      return {
        success: false,
        error: 'NPS score must be between 0 and 10'
      };
    }

    // Record the NPS metric
    return this.recordMetric(
      MetricType.NPS,
      score,
      userId,
      { feedback }
    );
  }

  /**
   * Record time spent on platform for a user
   * 
   * @param userId User ID to record time for
   * @param minutes Minutes spent on platform
   * @param activityType Optional type of activity (e.g., 'content', 'social', 'learning')
   * @returns Result of the time recording
   */
  async recordTimeSpent(
    userId: string,
    minutes: number,
    activityType?: string
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    return this.recordMetric(
      MetricType.TIME_SPENT,
      minutes,
      userId,
      { activity_type: activityType }
    );
  }

  /**
   * Record content interaction
   * 
   * @param userId User ID interacting with content
   * @param contentId ID of the content being interacted with
   * @param interactionType Type of interaction (e.g., 'view', 'like', 'comment', 'share')
   * @returns Result of the interaction recording
   */
  async recordInteraction(
    userId: string,
    contentId: string,
    interactionType: string
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    return this.recordMetric(
      MetricType.INTERACTION,
      1, // Count as 1 interaction
      userId,
      {
        content_id: contentId,
        interaction_type: interactionType
      }
    );
  }

  /**
   * Get current platform metrics summary
   * 
   * @param days Number of days to include in the summary (default: 30)
   * @returns Summary of key platform metrics
   */
  async getMetricsSummary(days: number = 30): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      // Get DAU/MAU ratio (stickiness)
      const { data: dauMauData, error: dauMauError } = await this.supabase
        .from('metrics')
        .select('metric_type, value, recorded_at')
        .in('metric_type', ['dau', 'mau'])
        .order('recorded_at', { ascending: false })
        .limit(2);

      if (dauMauError) throw dauMauError;

      // Get retention rate
      const { data: retentionData, error: retentionError } = await this.supabase
        .from('metrics')
        .select('value, recorded_at')
        .eq('metric_type', 'retention')
        .order('recorded_at', { ascending: false })
        .limit(1);

      if (retentionError) throw retentionError;

      // Get ARPU
      const { data: arpuData, error: arpuError } = await this.supabase
        .from('metrics')
        .select('value, recorded_at')
        .eq('metric_type', 'arpu')
        .order('recorded_at', { ascending: false })
        .limit(1);

      if (arpuError) throw arpuError;

      // Get NPS average
      const { data: npsData, error: npsError } = await this.supabase
        .from('metrics')
        .select('avg(value)')
        .eq('metric_type', 'nps')
        .gte('recorded_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

      if (npsError) throw npsError;

      // Process the data
      const dau = dauMauData?.find(m => m.metric_type === 'dau')?.value || 0;
      const mau = dauMauData?.find(m => m.metric_type === 'mau')?.value || 1; // Avoid division by zero
      const dauMauRatio = dau / mau;
      const retention = retentionData?.[0]?.value || 0;
      const arpu = arpuData?.[0]?.value || 0;
      const nps = npsData?.[0]?.avg || 0;

      return {
        success: true,
        data: {
          dau,
          mau,
          dauMauRatio,
          retention,
          arpu,
          nps,
          boostEligible: dauMauRatio > 0.3
        }
      };
    } catch (error) {
      console.error('Get metrics summary error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting metrics summary'
      };
    }
  }
}

// Export a singleton instance
export const metricsService = new MetricsService();

// Export default for direct imports
export default metricsService;
