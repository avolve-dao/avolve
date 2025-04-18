import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

/**
 * OnboardingService - Manages user onboarding process
 * Handles tutorial steps for subscribing (GEN), participating (SAP, daily claims), contributing (SCQ)
 */
export class OnboardingService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '', supabaseKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '') {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  /**
   * Start or continue the onboarding process for a user
   * 
   * @param userId User ID to start onboarding for
   * @returns Current onboarding step and status
   */
  async startOnboarding(userId: string): Promise<{
    success: boolean;
    data?: {
      onboardingId: string;
      currentStep: number;
      isNew: boolean;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.rpc('start_onboarding', {
        p_user_id: userId
      });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Start onboarding error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error starting onboarding'
      };
    }
  }

  /**
   * Update the user's onboarding step
   * Boosts Retention in metrics on completion
   * 
   * @param userId User ID to update onboarding for
   * @param step New onboarding step
   * @returns Updated onboarding status
   */
  async updateOnboardingStep(userId: string, step: number): Promise<{
    success: boolean;
    data?: {
      onboardingId: string;
      currentStep: number;
      isCompleted: boolean;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.rpc('update_onboarding_step', {
        p_user_id: userId,
        p_step: step
      });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Update onboarding step error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error updating onboarding step'
      };
    }
  }

  /**
   * Get the current onboarding status for a user
   * 
   * @param userId User ID to get onboarding status for
   * @returns Current onboarding status
   */
  async getOnboardingStatus(userId: string): Promise<{
    success: boolean;
    data?: {
      step: number;
      startedAt: string;
      updatedAt: string;
      completedAt: string | null;
      isCompleted: boolean;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw error;
      }

      if (!data) {
        return {
          success: true,
          data: {
            step: 0,
            startedAt: '',
            updatedAt: '',
            completedAt: null,
            isCompleted: false
          }
        };
      }

      return {
        success: true,
        data: {
          step: data.step,
          startedAt: data.started_at,
          updatedAt: data.updated_at,
          completedAt: data.completed_at,
          isCompleted: !!data.completed_at
        }
      };
    } catch (error) {
      console.error('Get onboarding status error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting onboarding status'
      };
    }
  }

  /**
   * Get onboarding content for a specific step
   * 
   * @param step Onboarding step to get content for
   * @returns Content for the specified step
   */
  getOnboardingContent(step: number): {
    title: string;
    description: string;
    instructions: string[];
    image?: string;
  } {
    // Define onboarding steps content
    const steps = [
      {
        title: 'Welcome to Avolve',
        description: 'Let\'s get you started on your journey to becoming a Superachiever!',
        instructions: [
          'Create your account and set up your profile',
          'Explore the platform and learn about the different tokens',
          'Click "Next" to continue to the next step'
        ],
        image: '/images/onboarding/welcome.png'
      },
      {
        title: 'Subscribing with GEN',
        description: 'GEN is the top-level token representing the entire Supercivilization ecosystem.',
        instructions: [
          'Subscribe to unlock premium features',
          'Earn GEN by completing challenges and contributing to superpuzzles',
          'Use GEN for governance voting and marketplace purchases'
        ],
        image: '/images/onboarding/gen.png'
      },
      {
        title: 'Daily Participation with SAP',
        description: 'SAP tokens represent your individual journey of transformation.',
        instructions: [
          'Claim your daily tokens based on the day of the week',
          'Complete daily challenges to earn more tokens',
          'Build your streak for bonus rewards'
        ],
        image: '/images/onboarding/sap.png'
      },
      {
        title: 'Contributing with SCQ',
        description: 'SCQ tokens represent the collective journey of transformation.',
        instructions: [
          'Join or create a team after completing 10 challenges',
          'Contribute to superpuzzles with your team',
          'Earn SCQ tokens when your team completes superpuzzles'
        ],
        image: '/images/onboarding/scq.png'
      },
      {
        title: 'You\'re Ready!',
        description: 'You\'ve completed the onboarding process and are ready to start your journey!',
        instructions: [
          'Visit the Participation page to claim your daily tokens',
          'Check out the Challenges page to start earning rewards',
          'Join a team and contribute to superpuzzles'
        ],
        image: '/images/onboarding/complete.png'
      }
    ];

    // Return content for the requested step (0-indexed)
    return steps[Math.max(0, Math.min(step - 1, steps.length - 1))];
  }
}

// Export a singleton instance
export const onboardingService = new OnboardingService();

// Export default for direct imports
export default onboardingService;
