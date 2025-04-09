/**
 * Avolve Platform Concurrency Test Script
 * 
 * This script simulates 1000 users claiming tokens simultaneously to test
 * for bottlenecks, race conditions, and deadlocks in the database.
 * 
 * Usage:
 * node concurrency_test.js
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config();

// Configure Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Test configuration
const NUM_USERS = 1000;
const CONCURRENT_REQUESTS = 100;
const TOKEN_TYPES = ['GEN', 'SAP', 'SCQ', 'PSP', 'BSP', 'SMS', 'SPD', 'SHE', 'SSA', 'SGB'];
const DAILY_REWARD_IDS = {
  0: 'spd-reward-id', // Sunday
  1: 'she-reward-id', // Monday
  2: 'psp-reward-id', // Tuesday
  3: 'ssa-reward-id', // Wednesday
  4: 'bsp-reward-id', // Thursday
  5: 'sgb-reward-id', // Friday
  6: 'sms-reward-id'  // Saturday
};

// Get today's day of week (0-6, Sunday-Saturday)
const today = new Date();
const dayOfWeek = today.getDay();
const todayRewardId = DAILY_REWARD_IDS[dayOfWeek];

// Mock user data
const users = Array.from({ length: NUM_USERS }, () => ({
  id: uuidv4(),
  email: `test-${uuidv4()}@example.com`,
  password: 'password123'
}));

// Utility functions
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createTestUsers() {
  console.log(`Creating ${NUM_USERS} test users...`);
  
  const batchSize = 10;
  const batches = Math.ceil(NUM_USERS / batchSize);
  
  for (let i = 0; i < batches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, NUM_USERS);
    const batch = users.slice(start, end);
    
    const promises = batch.map(async (user) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              user_id: user.id
            }
          }
        });
        
        if (error) {
          console.error(`Error creating user ${user.email}:`, error);
          return null;
        }
        
        return data.user;
      } catch (err) {
        console.error(`Exception creating user ${user.email}:`, err);
        return null;
      }
    });
    
    await Promise.all(promises);
    console.log(`Created users ${start + 1} to ${end}`);
    
    // Avoid rate limiting
    await sleep(1000);
  }
  
  console.log('All test users created successfully');
}

async function simulateTokenClaims() {
  console.log(`Simulating ${NUM_USERS} users claiming tokens concurrently...`);
  
  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;
  let raceConditionCount = 0;
  let deadlockCount = 0;
  
  // Process users in batches to control concurrency
  const batchSize = CONCURRENT_REQUESTS;
  const batches = Math.ceil(NUM_USERS / batchSize);
  
  for (let i = 0; i < batches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, NUM_USERS);
    const batch = users.slice(start, end);
    
    console.log(`Processing batch ${i + 1}/${batches} (users ${start + 1} to ${end})...`);
    
    const promises = batch.map(async (user, index) => {
      try {
        // Sign in as the user
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: user.password
        });
        
        if (authError) {
          console.error(`Error signing in as user ${user.email}:`, authError);
          errorCount++;
          return;
        }
        
        // Claim daily token
        const { data, error } = await supabase.rpc('mint_tokens_safely', {
          p_to_user_id: user.id,
          p_token_symbol: TOKEN_TYPES[index % TOKEN_TYPES.length],
          p_amount: 10,
          p_reason: 'Concurrency test'
        });
        
        if (error) {
          console.error(`Error claiming token for user ${user.email}:`, error);
          
          if (error.message.includes('lock') || error.message.includes('concurrent')) {
            raceConditionCount++;
          } else if (error.message.includes('deadlock')) {
            deadlockCount++;
          }
          
          errorCount++;
          return;
        }
        
        successCount++;
      } catch (err) {
        console.error(`Exception claiming token for user ${user.email}:`, err);
        errorCount++;
      }
    });
    
    await Promise.all(promises);
    
    // Brief pause between batches to avoid overwhelming the server
    await sleep(500);
  }
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n=== Concurrency Test Results ===');
  console.log(`Total users: ${NUM_USERS}`);
  console.log(`Concurrent requests: ${CONCURRENT_REQUESTS}`);
  console.log(`Duration: ${duration.toFixed(2)} seconds`);
  console.log(`Throughput: ${(successCount / duration).toFixed(2)} requests/second`);
  console.log(`Success rate: ${((successCount / NUM_USERS) * 100).toFixed(2)}%`);
  console.log(`Success count: ${successCount}`);
  console.log(`Error count: ${errorCount}`);
  console.log(`Race condition count: ${raceConditionCount}`);
  console.log(`Deadlock count: ${deadlockCount}`);
}

async function cleanupTestUsers() {
  console.log('Cleaning up test users...');
  
  // In a real implementation, you would delete the test users
  // However, this requires admin privileges which this script doesn't have
  console.log('Note: In a production environment, you would need to clean up the test users');
}

async function runTest() {
  try {
    // Uncomment to create test users (requires admin privileges)
    // await createTestUsers();
    
    await simulateTokenClaims();
    
    // Uncomment to clean up test users (requires admin privileges)
    // await cleanupTestUsers();
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
runTest();
