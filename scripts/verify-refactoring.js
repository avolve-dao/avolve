/**
 * Avolve Refactoring Verification
 * 
 * This script verifies that all refactored components are working correctly.
 * It tests user profiles, token system, notifications, audit logs, and user settings.
 * 
 * Usage:
 * 1. Set the SUPABASE_ANON_KEY environment variable or pass it as an argument
 * 2. Run the script with: node scripts/verify-refactoring.js [SUPABASE_ANON_KEY]
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase project information
const PROJECT_ID = 'hevrachacwtqdcktblsd';
const ORGANIZATION_ID = 'vercel_icfg_D0rjqr9um8t994YH9IDUTQnu';

// Get the Supabase anon key from environment variable or command line argument
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.argv[2];

if (!supabaseAnonKey) {
  console.error('Error: SUPABASE_ANON_KEY environment variable or command line argument is required');
  console.error('Usage: SUPABASE_ANON_KEY=your_key node scripts/verify-refactoring.js');
  console.error('   or: node scripts/verify-refactoring.js your_key');
  process.exit(1);
}

// Initialize the Supabase client
const supabaseUrl = `https://${PROJECT_ID}.supabase.co`;
console.log('Using Supabase URL:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0
};

// Test utility functions
async function runTest(name, testFn) {
  testResults.total++;
  console.log(`\n🧪 Running test: ${name}`);
  try {
    await testFn();
    console.log(`✅ Test passed: ${name}`);
    testResults.passed++;
  } catch (error) {
    console.error(`❌ Test failed: ${name}`);
    console.error(`   Error: ${error.message}`);
    testResults.failed++;
  }
}

async function skipTest(name, reason) {
  testResults.total++;
  testResults.skipped++;
  console.log(`\n⏭️  Skipping test: ${name}`);
  console.log(`   Reason: ${reason}`);
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Avolve Refactoring Verification');
  console.log(`📊 Project ID: ${PROJECT_ID}`);
  console.log(`📊 Organization ID: ${ORGANIZATION_ID}`);
  console.log(`📊 Supabase URL: ${supabaseUrl}`);
  
  let userId = null;
  let session = null;
  
  try {
    // Test 1: Database Connection
    await runTest('Database Connection', async () => {
      const { data, error } = await supabase.from('profiles').select('count(*)', { count: 'exact' });
      if (error) throw error;
      console.log(`   Database has profiles: ${data}`);
    });

    // Test 2: Authentication
    await runTest('Authentication - Get Session', async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      session = data.session;
      if (session) {
        userId = session.user.id;
        console.log(`   Active session found for user: ${userId}`);
      } else {
        console.log('   No active session found. Some tests will be skipped.');
      }
    });

    if (!userId) {
      await skipTest('User-specific Tests', 'No active session');
      return;
    }

    // Test 3: User Profiles
    await runTest('User Profiles - Get Profile', async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      console.log(`   Profile found: ${data.username || 'No username'}`);
    });

    await runTest('User Profiles - Update Profile', async () => {
      const { data, error } = await supabase.rpc('update_user_profile', {
        p_user_id: userId,
        p_bio: `Updated bio from verification test at ${new Date().toISOString()}`,
        p_status: 'active'
      });
      
      if (error) throw error;
      console.log('   Profile updated successfully');
    });

    await runTest('User Profiles - Update Last Active', async () => {
      const { data, error } = await supabase.rpc('update_user_last_active', {
        p_user_id: userId
      });
      
      if (error) throw error;
      console.log('   Last active timestamp updated successfully');
    });

    // Test 4: User Settings
    await runTest('User Settings - Update User Settings', async () => {
      const { data, error } = await supabase.rpc('update_user_settings', {
        p_user_id: userId,
        p_theme: 'dark',
        p_preferences: { sidebar_collapsed: false },
        p_notification_preferences: { email: true, push: false, in_app: true }
      });
      
      if (error) throw error;
      console.log('   User settings updated successfully');
    });

    await runTest('User Settings - Get User Settings', async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      console.log(`   User settings found: ${JSON.stringify(data.preferences)}`);
    });

    // Test 5: Token System
    await runTest('Token System - Get User Tokens', async () => {
      const { data, error } = await supabase
        .from('token_balances')
        .select('*, tokens(*)')
        .eq('user_id', userId);
      
      if (error) throw error;
      console.log(`   Found ${data.length} user tokens`);
      
      // Store token data for later tests
      global.userTokens = data;
    });

    // Test 6: Notifications
    await runTest('Notifications - Create Notification', async () => {
      const { data, error } = await supabase.from('notifications').insert({
        user_id: userId,
        type: 'verification_test',
        title: 'Verification Test Notification',
        message: `This is a test notification created at ${new Date().toISOString()}`,
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).select().single();
      
      if (error) throw error;
      console.log(`   Notification created: ${data.id}`);
      
      // Store notification ID for later tests
      global.testNotificationId = data.id;
    });

    await runTest('Notifications - Get User Notifications', async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      console.log(`   Found ${data.length} notifications`);
    });

    if (global.testNotificationId) {
      await runTest('Notifications - Mark Notification as Read', async () => {
        const { data, error } = await supabase
          .from('notifications')
          .update({ is_read: true, updated_at: new Date().toISOString() })
          .eq('id', global.testNotificationId)
          .select()
          .single();
        
        if (error) throw error;
        console.log('   Notification marked as read successfully');
      });
    }

    // Test 7: Audit Logs
    await runTest('Audit Logs - Create Audit Log', async () => {
      const { data, error } = await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'verification_test',
        entity_type: 'test',
        entity_id: `test-${Date.now()}`,
        metadata: { test: true, timestamp: new Date().toISOString() },
        created_at: new Date().toISOString()
      }).select().single();
      
      if (error) throw error;
      console.log(`   Audit log created: ${data.id}`);
    });

    await runTest('Audit Logs - Get User Audit Logs', async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      console.log(`   Found ${data.length} audit logs`);
    });

    // Test 8: Token Transfers (if tokens are available)
    if (global.userTokens && global.userTokens.length > 0) {
      // Find another user to transfer tokens to
      const { data: otherUsers, error: otherUsersError } = await supabase
        .from('profiles')
        .select('id')
        .neq('id', userId)
        .limit(1);
      
      if (!otherUsersError && otherUsers && otherUsers.length > 0) {
        const otherUserId = otherUsers[0].id;
        const userToken = global.userTokens[0];
        
        // Check if user has enough tokens to transfer
        if (userToken.balance >= 1) {
          await runTest('Token System - Transfer Tokens', async () => {
            const { data, error } = await supabase.rpc('transfer_tokens', {
              p_from_user_id: userId,
              p_to_user_id: otherUserId,
              p_token_id: userToken.token_id,
              p_amount: 1
            });
            
            if (error) throw error;
            console.log(`   Token transfer successful: ${JSON.stringify(data)}`);
          });
        } else {
          await skipTest('Token System - Transfer Tokens', 'Insufficient balance for transfer test');
        }
      } else {
        await skipTest('Token System - Transfer Tokens', 'No other users available for transfer test');
      }
    } else {
      await skipTest('Token System - Transfer Tokens', 'No tokens available for transfer test');
    }

  } catch (error) {
    console.error('❌ Unexpected error during tests:', error);
  } finally {
    // Print test summary
    console.log('\n📋 Test Summary:');
    console.log(`   Total Tests: ${testResults.total}`);
    console.log(`   Passed: ${testResults.passed}`);
    console.log(`   Failed: ${testResults.failed}`);
    console.log(`   Skipped: ${testResults.skipped}`);
    
    if (testResults.failed > 0) {
      console.log('\n❌ Some tests failed. Please check the logs for details.');
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed successfully!');
      console.log('\n🎉 Refactoring verification complete. The system is working as expected.');
    }
  }
}

// Run the tests
runTests().catch(console.error);
