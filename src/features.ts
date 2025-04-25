import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * FeaturesService - Manages feature unlocks based on user progress and metrics
 * Handles unlocking teams, governance, marketplace, and day-specific tokens
 */
export class FeaturesService {
  private supabase: SupabaseClient<unknown>;

  constructor(
    supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Check if a specific feature is unlocked for the current user
   * @param featureName The name of the feature to check (e.g., 'teams', 'governance', 'marketplace')
   * @returns A promise resolving to the feature status
   */
  async checkFeatureUnlock(featureName: string): Promise<{
    isUnlocked: boolean;
    unlockReason: string;
    criteria?: {
      completedChallenges?: number;
      requiredGEN?: number;
      requiredDAUMAU?: number;
      requiredDayTokens?: number;
    };
    progress?: {
      completedChallenges: number;
      genBalance: number;
      dauMau: number;
      dayTokensClaimed: number;
    };
  }> {
    const { data, error } = await this.supabase.rpc('check_feature_unlock');

    if (error) {
      console.error('Error checking feature unlock:', error);
      return {
        isUnlocked: false,
        unlockReason: `Error checking feature: ${error.message}`,
      };
    }

    return data;
  }

  /**
   * Check if a day token is unlocked for the current user
   * @param dayName The name of the day to check (e.g., 'sunday', 'monday')
   * @returns A promise resolving to the day token status
   */
  async checkDayTokenUnlock(dayName: string): Promise<{
    isUnlocked: boolean;
    unlockReason: string;
    tokenInfo: {
      symbol: string;
      name: string;
      description: string;
      day: string;
      dayOfWeek: number;
      gradient: string;
    };
  }> {
    const { data, error } = await this.supabase.rpc('check_day_token_unlock');

    if (error) {
      console.error('Error checking day token unlock:', error);
      return {
        isUnlocked: false,
        unlockReason: `Error checking day token: ${error.message}`,
        tokenInfo: {
          symbol: '',
          name: '',
          description: '',
          day: dayName,
          dayOfWeek: -1,
          gradient: '',
        },
      };
    }

    return data;
  }

  /**
   * Get all feature and day token statuses for the current user
   * @returns A promise resolving to all user feature statuses
   */
  async getUserFeatureStatuses(): Promise<{
    features: {
      [featureName: string]: {
        isUnlocked: boolean;
        unlockReason: string;
        criteria?: {
          completedChallenges?: number;
          requiredGEN?: number;
          requiredDAUMAU?: number;
          requiredDayTokens?: number;
        };
        progress?: {
          completedChallenges: number;
          genBalance: number;
          dauMau: number;
          dayTokensClaimed: number;
        };
      };
    };
    dayTokens: {
      [dayName: string]: {
        isUnlocked: boolean;
        unlockReason: string;
        tokenInfo: {
          symbol: string;
          name: string;
          description: string;
          day: string;
          dayOfWeek: number;
          gradient: string;
        };
      };
    };
  }> {
    const { data, error } = await this.supabase.rpc('get_user_feature_statuses');

    if (error) {
      console.error('Error getting user feature statuses:', error);
      return {
        features: {},
        dayTokens: {},
      };
    }

    return data;
  }

  /**
   * Claim a day token for the current user
   * @param tokenSymbol The symbol of the token to claim (e.g., 'PSP', 'BSP')
   * @returns A promise resolving to the claim result
   */
  async claimDayToken(tokenSymbol: string): Promise<{
    success: boolean;
    message: string;
    amount?: number;
  }> {
    const { data, error } = await this.supabase.rpc('claim_day_token');

    if (error) {
      console.error('Error claiming day token:', error);
      return {
        success: false,
        message: `Error claiming token: ${error.message}`,
      };
    }

    return data;
  }

  /**
   * Get information about a token for a specific day
   * @param dayOfWeek The day of the week (0 = Sunday, 1 = Monday, etc.)
   * @returns A promise resolving to the token information
   */
  async getDayTokenInfo(dayOfWeek: number): Promise<{
    symbol: string;
    name: string;
    description: string;
    day: string;
    dayOfWeek: number;
    gradient: string;
  }> {
    const { data, error } = await this.supabase.rpc('get_day_token_info');

    if (error) {
      console.error('Error getting day token info:', error);
      return {
        symbol: '',
        name: '',
        description: '',
        day: 'Unknown',
        dayOfWeek: -1,
        gradient: '',
      };
    }

    return data;
  }
}

// Export a singleton instance
export const featuresService = new FeaturesService();

// Export default for direct imports
export default featuresService;
