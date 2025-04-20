import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types/supabase';

/**
 * Utility for testing role-based and token-based access control
 */
export class AccessControlTester {
  private supabase: SupabaseClient<Database>;
  private adminSupabase: SupabaseClient<Database>;
  private testUsers: Record<string, { id: string; email: string; password: string }> = {};
  
  constructor(
    supabaseUrl: string,
    supabaseAnonKey: string,
    adminServiceRoleKey: string
  ) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    this.adminSupabase = createClient<Database>(supabaseUrl, adminServiceRoleKey);
  }
  
  /**
   * Create test users for different roles
   */
  async createTestUsers() {
    try {
      // Create test users for each role type
      const roles = [
        'subscriber',
        'participant',
        'contributor',
        'associate',
        'builder',
        'partner'
      ];
      
      for (const role of roles) {
        const email = `test-${role}@avolve.test`;
        const password = `password-${role}-${Date.now()}`;
        
        // Create user
        const { data: userData, error: userError } = await this.adminSupabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true
        });
        
        if (userError) throw userError;
        
        const userId = userData.user.id;
        
        // Assign role
        const { data: roleData, error: roleError } = await this.adminSupabase
          .rpc('assign_role', {
            p_user_id: userId,
            p_role_name: role
          });
        
        if (roleError) throw roleError;
        
        // Store test user
        this.testUsers[role] = {
          id: userId,
          email,
          password
        };
        
        console.log(`Created test user for role: ${role}`);
      }
      
      return this.testUsers;
    } catch (error) {
      console.error('Error creating test users:', error);
      throw error;
    }
  }
  
  /**
   * Clean up test users
   */
  async cleanupTestUsers() {
    try {
      for (const role in this.testUsers) {
        const userId = this.testUsers[role].id;
        
        // Delete user
        const { error } = await this.adminSupabase.auth.admin.deleteUser(userId);
        
        if (error) throw error;
        
        console.log(`Deleted test user for role: ${role}`);
      }
      
      this.testUsers = {};
    } catch (error) {
      console.error('Error cleaning up test users:', error);
      throw error;
    }
  }
  
  /**
   * Test role-based access control
   */
  async testRoleBasedAccess() {
    const results: Record<string, any> = {};
    
    try {
      for (const role in this.testUsers) {
        const { email, password } = this.testUsers[role];
        
        // Sign in as test user
        const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (authError) throw authError;
        
        // Get session data
        const { data: sessionData } = await this.supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token || '';
        const refreshToken = sessionData.session?.refresh_token || '';
        
        // Create client with user session
        const userClient = createClient<Database>(accessToken, refreshToken);
        
        // Test has_role function
        const { data: hasRoleData, error: hasRoleError } = await userClient
          .rpc('has_role', { p_role_name: role });
        
        if (hasRoleError) throw hasRoleError;
        
        // Test is_admin function
        const { data: isAdminData, error: isAdminError } = await userClient
          .rpc('is_admin');
        
        if (isAdminError) throw isAdminError;
        
        // Store results
        results[role] = {
          hasRole: !!hasRoleData,
          isAdmin: !!isAdminData,
          userId: this.testUsers[role].id
        };
        
        // Sign out
        await userClient.auth.signOut();
      }
      
      return results;
    } catch (error) {
      console.error('Error testing role-based access:', error);
      throw error;
    }
  }
  
  /**
   * Test token-based access control
   */
  async testTokenBasedAccess() {
    const results: Record<string, any> = {};
    
    try {
      // Get all token types
      const { data: tokens, error: tokensError } = await this.adminSupabase
        .from('tokens')
        .select('*');
      
      if (tokensError) throw tokensError;
      
      // Test access for each user and token
      for (const role in this.testUsers) {
        const { email, password } = this.testUsers[role];
        const userId = this.testUsers[role].id;
        
        // Sign in as test user
        const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (authError) throw authError;
        
        // Get session data
        const { data: sessionData } = await this.supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token || '';
        const refreshToken = sessionData.session?.refresh_token || '';
        
        // Create client with user session
        const userClient = createClient<Database>(accessToken, refreshToken);
        
        // Test token access for each token
        const tokenAccess: Record<string, boolean> = {};
        
        for (const token of tokens) {
          const { data: accessData, error: accessError } = await userClient
            .rpc('has_token_access', {
              content_token_symbol: token.symbol,
              user_id: userId
            });
          
          if (accessError) throw accessError;
          
          tokenAccess[token.symbol] = !!accessData;
        }
        
        // Store results
        results[role] = {
          tokenAccess,
          userId
        };
        
        // Sign out
        await userClient.auth.signOut();
      }
      
      return results;
    } catch (error) {
      console.error('Error testing token-based access:', error);
      throw error;
    }
  }
  
  /**
   * Test user progress tracking
   */
  async testUserProgressTracking() {
    try {
      // Use participant role for testing
      const { email, password, id: userId } = this.testUsers['participant'] || this.testUsers['subscriber'];
      
      // Sign in as test user
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) throw authError;
      
      // Get session data
      const { data: sessionData } = await this.supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token || '';
      const refreshToken = sessionData.session?.refresh_token || '';
      
      // Create client with user session
      const userClient = createClient<Database>(accessToken, refreshToken);
      
      // Get content items
      const { data: content, error: contentError } = await this.adminSupabase
        .from('components')
        .select('id')
        .limit(3);
      
      if (contentError) throw contentError;
      
      // Complete content items
      const completionResults = [];
      
      for (const item of content) {
        const { data: completeData, error: completeError } = await userClient
          .rpc('complete_content', { p_content_id: item.id });
        
        if (completeError) throw completeError;
        
        completionResults.push({
          contentId: item.id,
          success: !!completeData
        });
      }
      
      // Check user progress
      const { data: progress, error: progressError } = await userClient
        .rpc('get_all_pillars_progress');
      
      if (progressError) throw progressError;
      
      // Check user experience phase
      const { data: phase, error: phaseError } = await userClient
        .rpc('get_user_experience_phase');
      
      if (phaseError) throw phaseError;
      
      // Sign out
      await userClient.auth.signOut();
      
      return {
        userId,
        completionResults,
        progress,
        experiencePhase: phase
      };
    } catch (error) {
      console.error('Error testing user progress tracking:', error);
      throw error;
    }
  }
  
  /**
   * Run all tests
   */
  async runAllTests() {
    try {
      console.log('Creating test users...');
      await this.createTestUsers();
      
      console.log('Testing role-based access...');
      const roleResults = await this.testRoleBasedAccess();
      
      console.log('Testing token-based access...');
      const tokenResults = await this.testTokenBasedAccess();
      
      console.log('Testing user progress tracking...');
      const progressResults = await this.testUserProgressTracking();
      
      console.log('Cleaning up test users...');
      await this.cleanupTestUsers();
      
      return {
        roleBasedAccess: roleResults,
        tokenBasedAccess: tokenResults,
        userProgressTracking: progressResults
      };
    } catch (error) {
      console.error('Error running tests:', error);
      
      // Clean up test users even if tests fail
      try {
        await this.cleanupTestUsers();
      } catch (cleanupError) {
        console.error('Error cleaning up test users:', cleanupError);
      }
      
      throw error;
    }
  }
}
