/**
 * Avolve Supabase Integration Test
 * 
 * This script tests the integration between the refactored Avolve codebase
 * and the Supabase database. It verifies that all services, hooks, and
 * database functions are working correctly.
 * 
 * Usage:
 * 1. Set the SUPABASE_URL and SUPABASE_ANON_KEY environment variables
 * 2. Run the script with: node scripts/test-supabase-integration.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { AuthService } from '../lib/auth/auth-service.js';
import { TokenService } from '../lib/token/token-service.js';
import { NotificationService } from '../lib/notifications/notification-service.js';
import { AuditService } from '../lib/audit/audit-service.js';
import { initializeDatabaseDefaults } from '../lib/utils/database-initializer.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Supabase project information
const PROJECT_ID = 'hevrachacwtqdcktblsd';
const ORGANIZATION_ID = 'vercel_icfg_D0rjqr9um8t994YH9IDUTQnu';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize services
const authService = new AuthService(supabase);
const tokenService = new TokenService(supabase);
const notificationService = new NotificationService(supabase);
const auditService = new AuditService(supabase);

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
  console.log('🚀 Starting Avolve Supabase Integration Tests');
  console.log(`📊 Project ID: ${PROJECT_ID}`);
  console.log(`📊 Organization ID: ${ORGANIZATION_ID}`);
  console.log(`📊 Supabase URL: ${supabaseUrl}`);
  
  try {
    // Test 1: Database Connection
    await runTest('Database Connection', async () => {
      const { data, error } = await supabase.from('profiles').select('count(*)', { count: 'exact' });
      if (error) throw error;
      console.log(`   Database has profiles: ${data}`);
    });

    // Test 2: Initialize Database Defaults
    await runTest('Initialize Database Defaults', async () => {
      await initializeDatabaseDefaults(supabase);
      console.log('   Database defaults initialized successfully');
    });

    // Test 3: Authentication
    let userId = null;
    let session = null;

    await runTest('Authentication - Get Session', async () => {
      session = await authService.getSession();
      if (session) {
        userId = session.user.id;
        console.log(`   Active session found for user: ${userId}`);
      } else {
        console.log('   No active session found. Some tests will be skipped.');
      }
    });

    // Test 4: User Profile
    if (userId) {
      await runTest('User Profile - Get Profile', async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) throw error;
        console.log(`   Profile found: ${data.username || 'No username'}`);
      });

      await runTest('User Profile - Update Profile', async () => {
        const { data, error } = await supabase.rpc('update_user_profile', {
          p_user_id: userId,
          p_bio: `Updated bio from integration test at ${new Date().toISOString()}`,
          p_status: 'active'
        });
        
        if (error) throw error;
        console.log('   Profile updated successfully');
      });

      await runTest('User Profile - Update Last Active', async () => {
        const { data, error } = await supabase.rpc('update_user_last_active', {
          p_user_id: userId
        });
        
        if (error) throw error;
        console.log('   Last active timestamp updated successfully');
      });
    } else {
      await skipTest('User Profile Tests', 'No active session');
    }

    // Test 5: Token System
    await runTest('Token System - Get All Tokens', async () => {
      const { data, error } = await tokenService.getAllTokens();
      if (error) throw error;
      console.log(`   Found ${data.length} tokens`);
      
      // Store token data for later tests
      global.testTokens = data;
    });

    if (userId && global.testTokens && global.testTokens.length > 0) {
      const testToken = global.testTokens[0];
      
      await runTest('Token System - Get User Tokens', async () => {
        const { data, error } = await tokenService.getUserTokens(userId);
        if (error) throw error;
        console.log(`   Found ${data.length} user tokens`);
        
        // Store user token data for later tests
        global.userTokens = data;
      });

      await runTest('Token System - Get Token Balance', async () => {
        const { data, error } = await tokenService.getUserTokenBalance(userId, testToken.id);
        if (error) throw error;
        console.log(`   Balance for token ${testToken.symbol}: ${data}`);
      });

      // Only test token transfer if we have another user to transfer to
      const { data: otherUsers, error: otherUsersError } = await supabase
        .from('profiles')
        .select('id')
        .neq('id', userId)
        .limit(1);
      
      if (!otherUsersError && otherUsers && otherUsers.length > 0) {
        const otherUserId = otherUsers[0].id;
        
        // Check if user has tokens to transfer
        if (global.userTokens && global.userTokens.length > 0) {
          const userToken = global.userTokens[0];
          const transferAmount = Math.min(1, userToken.balance);
          
          if (transferAmount > 0) {
            await runTest('Token System - Transfer Tokens', async () => {
              const { data, error } = await tokenService.transferTokensWithFee(
                userId,
                otherUserId,
                userToken.token_id,
                transferAmount
              );
              
              if (error) throw error;
              console.log(`   Transfer successful: ${JSON.stringify(data)}`);
            });
          } else {
            await skipTest('Token System - Transfer Tokens', 'Insufficient balance for transfer test');
          }
        } else {
          await skipTest('Token System - Transfer Tokens', 'No tokens available for transfer test');
        }
      } else {
        await skipTest('Token System - Transfer Tokens', 'No other users available for transfer test');
      }
    } else {
      await skipTest('Token System - User Token Tests', 'No active session or tokens');
    }

    // Test 6: Notification System
    if (userId) {
      await runTest('Notification System - Create Notification', async () => {
        const { data, error } = await notificationService.createNotification({
          userId,
          type: 'integration_test',
          title: 'Integration Test Notification',
          message: `This is a test notification created at ${new Date().toISOString()}`
        });
        
        if (error) throw error;
        console.log(`   Notification created: ${data.id}`);
        
        // Store notification ID for later tests
        global.testNotificationId = data.id;
      });

      await runTest('Notification System - Get User Notifications', async () => {
        const { data, error } = await notificationService.getUserNotifications(userId);
        if (error) throw error;
        console.log(`   Found ${data.length} notifications`);
      });

      if (global.testNotificationId) {
        await runTest('Notification System - Mark Notification as Read', async () => {
          const { data, error } = await notificationService.markNotificationAsRead(global.testNotificationId);
          if (error) throw error;
          console.log('   Notification marked as read successfully');
        });
      }
    } else {
      await skipTest('Notification System Tests', 'No active session');
    }

    // Test 7: Audit System
    if (userId) {
      await runTest('Audit System - Create Audit Log', async () => {
        const { data, error } = await auditService.createAuditLog({
          userId,
          action: 'integration_test',
          entityType: 'test',
          entityId: `test-${Date.now()}`,
          metadata: { test: true, timestamp: new Date().toISOString() }
        });
        
        if (error) throw error;
        console.log(`   Audit log created: ${data.id}`);
      });
    } else {
      await skipTest('Audit System Tests', 'No active session');
    }

    // Test 8: User Settings
    if (userId) {
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
        console.log(`   User settings found: ${JSON.stringify(data)}`);
      });
    } else {
      await skipTest('User Settings Tests', 'No active session');
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
    }
  }
}

// Run the tests
runTests().catch(console.error);
