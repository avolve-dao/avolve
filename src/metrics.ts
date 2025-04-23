import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types/database';
import { MetricTypes, type MetricType } from '@/types/platform';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// const supabase = createClient<Database>(supabaseUrl || '', supabaseKey || '');

/**
 * MetricsService - Tracks and analyzes platform metrics
 * Handles DAU, MAU, retention, interaction, NPS, growth, ARPU, health, time spent
 */
export class MetricsService {
  private client: SupabaseClient<Database>;

  constructor(url: string = supabaseUrl || '', key: string = supabaseKey || '') {
    this.client = createClient<Database>(url, key);
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
    data?: Database['public']['Tables']['metrics']['Row'];
    error?: string;
  }> {
    try {
      // The 'update_user_metrics' RPC function does not exist in the current Supabase schema. Please implement this logic in-app or create the function in your database.
      throw new Error("The 'update_user_metrics' RPC function does not exist in the current Supabase schema. Please implement this logic in-app or create the function in your database.");
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
    metadata?: Record<string, unknown>
  ): Promise<{
    success: boolean;
    data?: Database['public']['Tables']['metrics']['Row'];
    error?: string;
  }> {
    try {
      // The 'record_metric' RPC function does not exist in the current Supabase schema. Please implement this logic in-app or create the function in your database.
      throw new Error("The 'record_metric' RPC function does not exist in the current Supabase schema. Please implement this logic in-app or create the function in your database.");
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
    data?: Database['public']['Tables']['metrics']['Row'];
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
      MetricTypes.NPS,
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
    data?: Database['public']['Tables']['metrics']['Row'];
    error?: string;
  }> {
    return this.recordMetric(
      MetricTypes.TIME_SPENT,
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
    data?: Database['public']['Tables']['metrics']['Row'];
    error?: string;
  }> {
    return this.recordMetric(
      MetricTypes.INTERACTION,
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
    data?: MetricsSummary;
    error?: string;
  }> {
    try {
      // The 'metrics' table does not exist in the current Supabase schema. Please implement this logic in-app or create the table in your database.
      throw new Error("The 'metrics' table does not exist in the current Supabase schema. Please implement this logic in-app or create the table in your database.");
    } catch (error) {
      console.error('Get metrics summary error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting metrics summary'
      };
    }
  }

  async trackActivity(userId: string, type: MetricType, value: number): Promise<void> {
    // The 'user_metrics' table does not exist in the current Supabase schema. Please implement this logic in-app or create the table in your database.
    throw new Error("The 'user_metrics' table does not exist in the current Supabase schema. Please implement this logic in-app or create the table in your database.");
  }

  async getActivityMetrics(userId: string): Promise<{
    [key in MetricType]: number;
  }> {
    // The 'user_metrics' table does not exist in the current Supabase schema. Please implement this logic in-app or create the table in your database.
    throw new Error("The 'user_metrics' table does not exist in the current Supabase schema. Please implement this logic in-app or create the table in your database.");
  }
}

interface MetricsSummary {
  dau: number;
  mau: number;
  dauMauRatio: number;
  retention: number;
  arpu: number;
  nps: number;
  boostEligible: boolean;
  [key: string]: unknown;
}

// Export a singleton instance
export const metricsService = new MetricsService();

// Export default for direct imports
export default metricsService;
