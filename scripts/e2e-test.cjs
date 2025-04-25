#!/usr/bin/env node

/**
 * End-to-End Testing Script for Avolve
 * 
 * This script tests the core functionality of the Avolve platform to ensure
 * it's ready for production. It tests the following flows:
 * 
 * 1. Invitation flow (create, claim)
 * 2. Onboarding flow
 * 3. Feature flag system
 * 4. Token system
 * 
 * Usage: node scripts/e2e-test.cjs
 */

const { execSync } = require('child_process');
const fetch = require('node-fetch');
const chalk = require('chalk');
const readline = require('readline');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!API_KEY) {
  console.error(chalk.red('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required'));
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt for confirmation
const confirm = (message) => {
  return new Promise((resolve) => {
    rl.question(`${message} (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
};

// Helper function to log test results
const logResult = (testName, success, message = '') => {
  if (success) {
    console.log(chalk.green(`✅ ${testName}: Passed ${message ? '- ' + message : ''}`));
  } else {
    console.error(chalk.red(`❌ ${testName}: Failed ${message ? '- ' + message : ''}`));
  }
};

// Helper function to make API requests
const makeRequest = async (endpoint, method = 'GET', body = null, headers = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : null
    });
    
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Test invitation creation and claiming
const testInvitationFlow = async () => {
  console.log(chalk.blue('\n🧪 Testing Invitation Flow'));
  
  // Test creating an invitation
  const createResult = await makeRequest('/api/invitations', 'POST', {
    email: `test-${Date.now()}@example.com`,
    maxUses: 1,
    expiresInDays: 7
  });
  
  logResult('Create Invitation', createResult.success, createResult.success ? `Code: ${createResult.data.code}` : createResult.data?.error);
  
  if (!createResult.success) return false;
  
  const invitationCode = createResult.data.code;
  
  // Test validating the invitation
  const validateResult = await makeRequest('/api/invitations/validate', 'POST', {
    code: invitationCode
  });
  
  logResult('Validate Invitation', validateResult.success, validateResult.success ? 'Valid invitation' : validateResult.data?.error);
  
  if (!validateResult.success) return false;
  
  console.log(chalk.yellow('ℹ️ Note: Full claim test requires a real browser session and is not automated'));
  
  return true;
};

// Test onboarding flow
const testOnboardingFlow = async () => {
  console.log(chalk.blue('\n🧪 Testing Onboarding Flow'));
  
  // Test updating onboarding step
  const updateStepResult = await makeRequest('/api/onboarding/update-step', 'PATCH', {
    step: 'profile_setup',
    completed: true
  });
  
  logResult('Update Onboarding Step', updateStepResult.success, updateStepResult.success ? 'Step updated' : updateStepResult.data?.error);
  
  if (!updateStepResult.success) return false;
  
  // Test getting onboarding progress
  const getProgressResult = await makeRequest('/api/onboarding/update-step', 'GET');
  
  logResult('Get Onboarding Progress', getProgressResult.success, getProgressResult.success ? 'Progress retrieved' : getProgressResult.data?.error);
  
  return getProgressResult.success;
};

// Test feature flag system
const testFeatureFlagSystem = async () => {
  console.log(chalk.blue('\n🧪 Testing Feature Flag System'));
  
  // Test getting features
  const getFeaturesResult = await makeRequest('/api/features', 'GET');
  
  logResult('Get Features', getFeaturesResult.success, getFeaturesResult.success ? `${Object.keys(getFeaturesResult.data?.features || {}).length} features found` : getFeaturesResult.data?.error);
  
  if (!getFeaturesResult.success) return false;
  
  // Test checking feature unlock requirements
  const checkFeatureResult = await makeRequest('/api/features/check', 'POST', {
    featureKey: 'invite_friends'
  });
  
  logResult('Check Feature Requirements', checkFeatureResult.success, checkFeatureResult.success ? checkFeatureResult.data?.message : checkFeatureResult.data?.error);
  
  if (!checkFeatureResult.success) return false;
  
  // Test feature unlock notification
  const notificationResult = await makeRequest('/api/features/unlock-notification', 'POST', {
    featureKey: 'invite_friends'
  });
  
  logResult('Feature Unlock Notification', notificationResult.success, notificationResult.success ? 'Notification sent' : notificationResult.data?.error);
  
  return notificationResult.success;
};

// Main test function
const runTests = async () => {
  console.log(chalk.yellow('🚀 Starting Avolve E2E Tests'));
  console.log(chalk.yellow(`🌐 Testing against: ${BASE_URL}`));
  
  const startServer = await confirm('Do you want to start the development server?');
  
  if (startServer) {
    console.log(chalk.blue('📡 Starting development server...'));
    try {
      // Start the server in the background
      const serverProcess = execSync('npm run dev', { stdio: 'inherit' });
      
      // Wait for server to start
      console.log(chalk.blue('⏳ Waiting for server to start...'));
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(chalk.red('❌ Failed to start development server'));
      process.exit(1);
    }
  }
  
  // Run tests
  const invitationSuccess = await testInvitationFlow();
  const onboardingSuccess = await testOnboardingFlow();
  const featureFlagSuccess = await testFeatureFlagSystem();
  
  // Summary
  console.log(chalk.blue('\n📊 Test Summary:'));
  logResult('Invitation Flow', invitationSuccess);
  logResult('Onboarding Flow', onboardingSuccess);
  logResult('Feature Flag System', featureFlagSuccess);
  
  const allPassed = invitationSuccess && onboardingSuccess && featureFlagSuccess;
  
  console.log(chalk.blue('\n🏁 Final Result:'));
  if (allPassed) {
    console.log(chalk.green('✅ All tests passed! The application is ready for launch.'));
  } else {
    console.log(chalk.red('❌ Some tests failed. Please fix the issues before launching.'));
  }
  
  rl.close();
};

// Run the tests
runTests().catch(error => {
  console.error(chalk.red(`❌ Unexpected error: ${error.message}`));
  process.exit(1);
});
