import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Initializes default values for database tables
 * This function should be called when the application starts
 * to ensure all records have proper default values
 */
export async function initializeDatabaseDefaults(supabase: SupabaseClient): Promise<void> {
  try {
    console.log('Initializing database default values...');

    // Initialize default values for profiles table
    await supabase.rpc('update_user_profile', {
      p_user_id: null, // This will update all profiles where status is null
      p_bio: null,
      p_status: 'active',
    });

    // Initialize default values for user_settings table
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('id')
      .is('preferences', null);

    if (!settingsError && settings && settings.length > 0) {
      for (const setting of settings) {
        await supabase
          .from('user_settings')
          .update({
            preferences: {},
            notification_preferences: {
              email: true,
              push: true,
              in_app: true,
            },
          })
          .eq('id', setting.id);
      }
    }

    // Initialize default values for tokens table
    const { data: tokens, error: tokensError } = await supabase
      .from('tokens')
      .select('id')
      .is('metadata', null);

    if (!tokensError && tokens && tokens.length > 0) {
      for (const token of tokens) {
        await supabase
          .from('tokens')
          .update({
            metadata: {},
          })
          .eq('id', token.id);
      }
    }

    console.log('Database default values initialized successfully');
  } catch (error) {
    console.error('Error initializing database default values:', error);
    throw error;
  }
}
