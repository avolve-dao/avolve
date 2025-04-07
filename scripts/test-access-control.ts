import dotenv from 'dotenv';
import { AccessControlTester } from '../utils/testing/access-control-tests';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function runTests() {
  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    console.error('Missing required environment variables');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  console.log('Starting access control tests...');
  console.log('-----------------------------------');
  
  const tester = new AccessControlTester(
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey
  );
  
  try {
    // Run all tests
    const results = await tester.runAllTests();
    
    // Print results
    console.log('\n✅ All tests completed successfully!');
    console.log('-----------------------------------');
    
    // Role-based access results
    console.log('\n📊 Role-Based Access Results:');
    console.log('-----------------------------------');
    for (const role in results.roleBasedAccess) {
      const { hasRole, isAdmin } = results.roleBasedAccess[role];
      console.log(`Role: ${role}`);
      console.log(`- Has Role: ${hasRole ? '✅' : '❌'}`);
      console.log(`- Is Admin: ${isAdmin ? '✅' : '❌'}`);
      console.log('-----------------------------------');
    }
    
    // Token-based access results
    console.log('\n📊 Token-Based Access Results:');
    console.log('-----------------------------------');
    for (const role in results.tokenBasedAccess) {
      console.log(`Role: ${role}`);
      
      const { tokenAccess } = results.tokenBasedAccess[role];
      for (const token in tokenAccess) {
        console.log(`- ${token}: ${tokenAccess[token] ? '✅' : '❌'}`);
      }
      console.log('-----------------------------------');
    }
    
    // User progress tracking results
    console.log('\n📊 User Progress Tracking Results:');
    console.log('-----------------------------------');
    console.log(`User ID: ${results.userProgressTracking.userId}`);
    
    console.log('\nContent Completion:');
    for (const completion of results.userProgressTracking.completionResults) {
      console.log(`- Content ${completion.contentId}: ${completion.success ? '✅' : '❌'}`);
    }
    
    console.log('\nPillar Progress:');
    for (const pillar of results.userProgressTracking.progress) {
      console.log(`- ${pillar.pillar_title}: ${Math.round(pillar.progress_percentage)}%`);
      console.log(`  Completed: ${pillar.completed_components}/${pillar.total_components} components`);
    }
    
    console.log(`\nExperience Phase: ${results.userProgressTracking.experiencePhase}`);
    
    console.log('\n-----------------------------------');
    console.log('✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Tests failed:', error);
    process.exit(1);
  }
}

// Run tests
runTests();
