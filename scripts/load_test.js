/**
 * Avolve Platform Load Testing Script
 * 
 * This script simulates multiple users performing various actions simultaneously
 * to test the database's ability to handle high concurrency scenarios.
 * 
 * Usage:
 * node load_test.js --users=100 --duration=60 --scenario=daily-claims
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('users', {
    alias: 'u',
    description: 'Number of simulated users',
    type: 'number',
    default: 100
  })
  .option('duration', {
    alias: 'd',
    description: 'Test duration in seconds',
    type: 'number',
    default: 60
  })
  .option('scenario', {
    alias: 's',
    description: 'Test scenario to run',
    type: 'string',
    choices: ['daily-claims', 'invitations', 'streaks', 'all'],
    default: 'all'
  })
  .option('concurrency', {
    alias: 'c',
    description: 'Maximum concurrent requests',
    type: 'number',
    default: 20
  })
  .help()
  .alias('help', 'h')
  .argv;

// Load environment variables
dotenv.config();

// Configure Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Test configuration
const NUM_USERS = argv.users;
const TEST_DURATION_SECONDS = argv.duration;
const CONCURRENT_REQUESTS = argv.concurrency;
const SCENARIO = argv.scenario;

// Token types based on day of week
const TOKEN_TYPES = {
  0: 'SPD', // Sunday
  1: 'SHE', // Monday
  2: 'PSP', // Tuesday
  3: 'SSA', // Wednesday
  4: 'BSP', // Thursday
  5: 'SGB', // Friday
  6: 'SMS'  // Saturday
};

// Get today's token type
const today = new Date();
const dayOfWeek = today.getDay();
const todayTokenType = TOKEN_TYPES[dayOfWeek];

// Test metrics
let totalRequests = 0;
let successfulRequests = 0;
let failedRequests = 0;
let raceConditions = 0;
let deadlocks = 0;
let responseTimeTotal = 0;

// Utility functions
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function runWithConcurrencyLimit(tasks, limit) {
  const results = [];
  const executing = new Set();
  
  for (const task of tasks) {
    const p = Promise.resolve().then(() => task());
    results.push(p);
    executing.add(p);
    
    const clean = () => executing.delete(p);
    p.then(clean).catch(clean);
    
    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }
  
  return Promise.all(results);
}

// Test scenarios
async function simulateDailyClaims(users, rewardId) {
  console.log(`Simulating ${users.length} users claiming daily tokens...`);
  
  const tasks = users.map(user => async () => {
    const startTime = Date.now();
    
    try {
      // Sign in as the user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      if (authError) {
        console.error(`Error signing in as user ${user.email}:`, authError);
        failedRequests++;
        return;
      }
      
      // Claim daily token
      const { data, error } = await supabase.rpc('process_daily_claim', {
        p_reward_id: rewardId
      });
      
      totalRequests++;
      
      if (error) {
        if (error.message.includes('lock') || error.message.includes('concurrent')) {
          raceConditions++;
        } else if (error.message.includes('deadlock')) {
          deadlocks++;
        }
        
        failedRequests++;
      } else {
        successfulRequests++;
      }
      
      responseTimeTotal += (Date.now() - startTime);
    } catch (err) {
      failedRequests++;
    }
  });
  
  await runWithConcurrencyLimit(tasks, CONCURRENT_REQUESTS);
}

async function simulateInvitations(users) {
  console.log(`Simulating ${users.length} users creating and redeeming invitations...`);
  
  // Create invitation codes
  const invitationTasks = users.slice(0, users.length / 2).map(user => async () => {
    const startTime = Date.now();
    
    try {
      // Sign in as the user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      if (authError) {
        failedRequests++;
        return;
      }
      
      // Create invitation
      const { data, error } = await supabase.rpc('create_invitation', {
        p_tier_id: getRandomInt(1, 4)
      });
      
      totalRequests++;
      
      if (error) {
        failedRequests++;
      } else {
        user.invitationCode = data.code;
        successfulRequests++;
      }
      
      responseTimeTotal += (Date.now() - startTime);
    } catch (err) {
      failedRequests++;
    }
  });
  
  await runWithConcurrencyLimit(invitationTasks, CONCURRENT_REQUESTS);
  
  // Redeem invitation codes
  const redeemTasks = users.slice(users.length / 2).map((user, index) => async () => {
    const startTime = Date.now();
    const inviter = users[index];
    
    if (!inviter.invitationCode) {
      return;
    }
    
    try {
      // Sign in as the user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      if (authError) {
        failedRequests++;
        return;
      }
      
      // Redeem invitation
      const { data, error } = await supabase.rpc('redeem_invitation', {
        p_code: inviter.invitationCode
      });
      
      totalRequests++;
      
      if (error) {
        if (error.message.includes('lock') || error.message.includes('concurrent')) {
          raceConditions++;
        } else if (error.message.includes('deadlock')) {
          deadlocks++;
        }
        
        failedRequests++;
      } else {
        successfulRequests++;
      }
      
      responseTimeTotal += (Date.now() - startTime);
    } catch (err) {
      failedRequests++;
    }
  });
  
  await runWithConcurrencyLimit(redeemTasks, CONCURRENT_REQUESTS);
}

async function simulateStreakUpdates(users) {
  console.log(`Simulating ${users.length} users completing challenges and updating streaks...`);
  
  const tasks = users.map(user => async () => {
    const startTime = Date.now();
    
    try {
      // Sign in as the user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      if (authError) {
        failedRequests++;
        return;
      }
      
      // Complete a challenge
      const { data: challenges, error: challengesError } = await supabase
        .from('daily_token_challenges')
        .select('id')
        .eq('day_of_week', dayOfWeek)
        .limit(1);
      
      if (challengesError || !challenges.length) {
        failedRequests++;
        return;
      }
      
      const challengeId = challenges[0].id;
      
      const { data, error } = await supabase.rpc('complete_challenge', {
        p_challenge_id: challengeId
      });
      
      totalRequests++;
      
      if (error) {
        if (error.message.includes('lock') || error.message.includes('concurrent')) {
          raceConditions++;
        } else if (error.message.includes('deadlock')) {
          deadlocks++;
        }
        
        failedRequests++;
      } else {
        successfulRequests++;
      }
      
      responseTimeTotal += (Date.now() - startTime);
    } catch (err) {
      failedRequests++;
    }
  });
  
  await runWithConcurrencyLimit(tasks, CONCURRENT_REQUESTS);
}

// Main test function
async function runLoadTest() {
  console.log(`
=================================================
Avolve Platform Load Test
=================================================
Users: ${NUM_USERS}
Duration: ${TEST_DURATION_SECONDS} seconds
Scenario: ${SCENARIO}
Concurrency: ${CONCURRENT_REQUESTS} requests
Today's token: ${todayTokenType} (${new Date().toLocaleDateString()})
=================================================
  `);
  
  // Generate test users
  const users = Array.from({ length: NUM_USERS }, (_, i) => ({
    id: uuidv4(),
    email: `test-${i}-${uuidv4().substring(0, 8)}@example.com`,
    password: 'password123'
  }));
  
  // Get reward ID for today
  const { data: rewards, error: rewardsError } = await supabase
    .from('daily_token_rewards')
    .select('id')
    .eq('day_of_week', dayOfWeek)
    .eq('token_symbol', todayTokenType)
    .limit(1);
  
  if (rewardsError || !rewards.length) {
    console.error('Error getting reward ID for today:', rewardsError);
    return;
  }
  
  const rewardId = rewards[0].id;
  
  // Start the test
  const startTime = Date.now();
  const endTime = startTime + (TEST_DURATION_SECONDS * 1000);
  
  // Run the selected scenario
  try {
    while (Date.now() < endTime) {
      const remainingTime = Math.max(0, endTime - Date.now());
      console.log(`Test running... ${Math.round(remainingTime / 1000)}s remaining`);
      
      if (SCENARIO === 'daily-claims' || SCENARIO === 'all') {
        await simulateDailyClaims(users, rewardId);
      }
      
      if (SCENARIO === 'invitations' || SCENARIO === 'all') {
        await simulateInvitations(users);
      }
      
      if (SCENARIO === 'streaks' || SCENARIO === 'all') {
        await simulateStreakUpdates(users);
      }
      
      // Short pause between iterations
      await sleep(1000);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
  
  // Calculate results
  const testDuration = (Date.now() - startTime) / 1000;
  const avgResponseTime = totalRequests > 0 ? responseTimeTotal / totalRequests : 0;
  const throughput = totalRequests / testDuration;
  const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
  
  // Print results
  console.log(`
=================================================
Load Test Results
=================================================
Test duration: ${testDuration.toFixed(2)} seconds
Total requests: ${totalRequests}
Successful requests: ${successfulRequests}
Failed requests: ${failedRequests}
Race conditions detected: ${raceConditions}
Deadlocks detected: ${deadlocks}
Average response time: ${(avgResponseTime / 1000).toFixed(2)} seconds
Throughput: ${throughput.toFixed(2)} requests/second
Success rate: ${successRate.toFixed(2)}%
=================================================
  `);
}

// Run the test
runLoadTest().catch(console.error);
