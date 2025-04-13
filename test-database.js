import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseFunctions() {
  console.log('Testing database functions...');

  try {
    // Test 1: Get user profile
    console.log('\n--- Test 1: Get user profile ---');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
    } else {
      console.log('Profile:', profile[0]);
    }

    // Test 2: Get user settings
    console.log('\n--- Test 2: Get user settings ---');
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .limit(1);
    
    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
    } else {
      console.log('Settings:', settings[0] || 'No settings found');
    }

    // Test 3: Get tokens
    console.log('\n--- Test 3: Get tokens ---');
    const { data: tokens, error: tokensError } = await supabase
      .from('tokens')
      .select('*')
      .limit(3);
    
    if (tokensError) {
      console.error('Error fetching tokens:', tokensError);
    } else {
      console.log('Tokens:', tokens);
    }

    // Test 4: Get user token balances
    console.log('\n--- Test 4: Get user token balances ---');
    const { data: userTokens, error: userTokensError } = await supabase
      .from('user_tokens')
      .select('*')
      .limit(3);
    
    if (userTokensError) {
      console.error('Error fetching user tokens:', userTokensError);
    } else {
      console.log('User Tokens:', userTokens);
    }

    // Test 5: Call get_user_token_balance function
    console.log('\n--- Test 5: Call get_user_token_balance function ---');
    if (profile && profile.length > 0 && tokens && tokens.length > 0) {
      const userId = profile[0].id;
      const tokenId = tokens[0].id;
      
      const { data: balance, error: balanceError } = await supabase
        .rpc('get_user_token_balance', {
          p_user_id: userId,
          p_token_id: tokenId
        });
      
      if (balanceError) {
        console.error('Error calling get_user_token_balance:', balanceError);
      } else {
        console.log(`Balance for user ${userId} and token ${tokenId}:`, balance);
      }
    } else {
      console.log('Skipping test 5 due to missing profile or token data');
    }

    // Test 6: Call update_user_profile function
    console.log('\n--- Test 6: Call update_user_profile function ---');
    if (profile && profile.length > 0) {
      const userId = profile[0].id;
      
      const { data: updateResult, error: updateError } = await supabase
        .rpc('update_user_profile', {
          p_user_id: userId,
          p_bio: 'Updated bio for testing purposes',
          p_status: 'active'
        });
      
      if (updateError) {
        console.error('Error calling update_user_profile:', updateError);
      } else {
        console.log('Update result:', updateResult);
        
        // Verify the update
        const { data: updatedProfile, error: verifyError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (verifyError) {
          console.error('Error verifying profile update:', verifyError);
        } else {
          console.log('Updated profile:', updatedProfile);
        }
      }
    } else {
      console.log('Skipping test 6 due to missing profile data');
    }

    console.log('\nDatabase function tests completed.');
  } catch (error) {
    console.error('Unexpected error during testing:', error);
  }
}

// Run the tests
testDatabaseFunctions();
