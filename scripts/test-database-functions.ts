/**
 * Database Functions Test Script for Avolve
 * 
 * This script tests the database functions to ensure they're working correctly
 * after migrations have been applied.
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const CONFIG = {
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

// Validate configuration
if (!CONFIG.supabaseUrl || !CONFIG.supabaseKey) {
  console.error('Error: Missing environment variables.');
  console.log('Please set the following environment variables:');
  console.log('- SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, {
  auth: {
    persistSession: false,
  },
});

// Test functions
async function testFunctions() {
  try {
    console.log('Testing database functions...');
    
    // Test user creation
    const testUser = await createTestUser();
    console.log(`Created test user with ID: ${testUser.id}`);
    
    // Test token economy functions
    await testTokenEconomy(testUser.id);
    
    // Test Genius ID functions
    await testGeniusID(testUser.id);
    
    // Test meeting system functions
    await testMeetingSystem(testUser.id);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Error testing database functions:', error);
    process.exit(1);
  }
}

// Create a test user
async function createTestUser() {
  const email = `test-${Date.now()}@avolve.test`;
  const password = 'password123';
  
  console.log('Creating test user...');
  
  const { data: user, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  
  if (error) {
    throw error;
  }
  
  return user.user;
}

// Test token economy functions
async function testTokenEconomy(userId: string) {
  console.log('Testing token economy functions...');
  
  // Test reward_user function
  console.log('Testing reward_user function...');
  const { data: rewardData, error: rewardError } = await supabase.rpc('reward_user', {
    p_user_id: userId,
    p_token_symbol: 'SAP',
    p_activity_type: 'content_creation',
    p_custom_amount: 10,
    p_custom_multiplier: 1.5,
  });
  
  if (rewardError) {
    throw rewardError;
  }
  
  console.log(`Rewarded user with ${rewardData} tokens`);
  
  // Test get_user_token_balances function
  console.log('Testing get_user_token_balances function...');
  const { data: balanceData, error: balanceError } = await supabase.rpc('get_user_token_balances', {
    p_user_id: userId,
  });
  
  if (balanceError) {
    throw balanceError;
  }
  
  console.log('User token balances:', balanceData);
  
  // Test release_pending_tokens function
  console.log('Testing release_pending_tokens function...');
  const { error: releaseError } = await supabase.rpc('release_pending_tokens');
  
  if (releaseError) {
    throw releaseError;
  }
  
  console.log('Released pending tokens');
  
  // Check updated balances
  const { data: updatedBalanceData, error: updatedBalanceError } = await supabase.rpc('get_user_token_balances', {
    p_user_id: userId,
  });
  
  if (updatedBalanceError) {
    throw updatedBalanceError;
  }
  
  console.log('Updated user token balances:', updatedBalanceData);
}

// Test Genius ID functions
async function testGeniusID(userId: string) {
  console.log('Testing Genius ID functions...');
  
  // Test create_genius_profile function
  console.log('Testing create_genius_profile function...');
  const geniusId = `genius-${Date.now()}`;
  
  const { data: profileData, error: profileError } = await supabase.rpc('create_genius_profile', {
    p_user_id: userId,
    p_genius_id: geniusId,
    p_avatar_url: 'https://example.com/avatar.png',
    p_bio: 'Test Genius Profile',
  });
  
  if (profileError) {
    throw profileError;
  }
  
  console.log(`Created Genius profile with ID: ${profileData}`);
  
  // Test update_degen_regen_score function
  console.log('Testing update_degen_regen_score function...');
  const { data: scoreData, error: scoreError } = await supabase.rpc('update_degen_regen_score', {
    p_user_id: userId,
    p_score_change: 10,
  });
  
  if (scoreError) {
    throw scoreError;
  }
  
  console.log(`Updated DEGEN-REGEN score to: ${scoreData}`);
  
  // Test award_achievement function
  console.log('Testing award_achievement function...');
  const { data: achievementData, error: achievementError } = await supabase.rpc('award_achievement', {
    p_user_id: userId,
    p_achievement_type: 'token_milestone',
    p_title: 'Token Milestone Test',
    p_description: 'Earned for testing the achievement system',
    p_points: 5,
    p_metadata: { test: true },
  });
  
  if (achievementError) {
    throw achievementError;
  }
  
  console.log(`Awarded achievement with ID: ${achievementData}`);
}

// Test meeting system functions
async function testMeetingSystem(userId: string) {
  console.log('Testing meeting system functions...');
  
  // Get a meeting ID
  const { data: meetingData, error: meetingError } = await supabase
    .from('weekly_meetings')
    .select('id')
    .limit(1)
    .single();
  
  if (meetingError) {
    throw meetingError;
  }
  
  const meetingId = meetingData.id;
  
  // Test register_for_meeting function
  console.log('Testing register_for_meeting function...');
  const { data: registrationData, error: registrationError } = await supabase.rpc('register_for_meeting', {
    p_user_id: userId,
    p_meeting_id: meetingId,
  });
  
  if (registrationError) {
    throw registrationError;
  }
  
  console.log(`Registered for meeting with participant ID: ${registrationData}`);
  
  // Update participant status to present
  await supabase
    .from('meeting_participants')
    .update({ status: 'present', rank: 1 })
    .eq('id', registrationData);
  
  // Test distribute_meeting_respect function
  console.log('Testing distribute_meeting_respect function...');
  const { data: respectData, error: respectError } = await supabase.rpc('distribute_meeting_respect', {
    p_meeting_id: meetingId,
  });
  
  if (respectError) {
    throw respectError;
  }
  
  console.log('Distributed meeting respect:', respectData);
}

// Run the tests
testFunctions();
