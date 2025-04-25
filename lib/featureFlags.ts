import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing. Check your .env.local config.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetches all feature flags enabled for a user from Supabase.
 * @param userId - The UUID of the user (or undefined for current user via auth).
 * @returns Array of enabled feature flag keys.
 */
export async function fetchEnabledFeatureFlags(userId?: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.rpc('get_enabled_features', userId ? { p_user_id: userId } : {});
    if (error) {
      // Improved error logging for debugging
      console.error('[FeatureFlags] Error fetching feature flags:', error, JSON.stringify(error), error?.message, error?.code, error?.details, error?.stack);
      return [];
    }
    if (!data) return [];
    // data is array of { key, description }
    return data.map((flag: { key: string; description: string }) => flag.key);
  } catch (err) {
    console.error('[FeatureFlags] Unexpected error:', err);
    return [];
  }
}

/**
 * Checks if a specific feature is enabled for a user.
 * @param featureKey - The feature flag key.
 * @param userId - The UUID of the user (or undefined for current user via auth).
 * @returns true if enabled, false otherwise.
 */
export async function isFeatureEnabled(featureKey: string, userId?: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_feature_enabled', { p_feature_key: featureKey, ...(userId ? { p_user_id: userId } : {}) });
    if (error) {
      console.error(`[FeatureFlags] Error checking feature '${featureKey}':`, error);
      return false;
    }
    return !!data;
  } catch (err) {
    console.error(`[FeatureFlags] Unexpected error for '${featureKey}':`, err);
    return false;
  }
}
