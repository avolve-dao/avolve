import { createClient } from '@supabase/supabase-js';
import { AuthService } from './lib/auth/auth-service';
import { TokenService } from './lib/token/token-service';
import { PermissionService } from './lib/token/permission-service';
import { NotificationService } from './lib/notifications/notification-service';
import { AuditService } from './lib/audit/audit-service';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize services
const authService = new AuthService(supabase);
const tokenService = new TokenService(supabase);
const permissionService = new PermissionService(supabase);
const notificationService = new NotificationService(supabase);
const auditService = new AuditService(supabase);

async function testIntegration() {
  console.log('Starting integration tests...');

  try {
    // Test 1: Authentication Service
    console.log('\n--- Test 1: Authentication Service ---');
    const session = await authService.getSession();
    console.log('Current session:', session ? 'Active' : 'None');

    // Test 2: Token Service
    console.log('\n--- Test 2: Token Service ---');
    if (session) {
      const userId = session.user.id;
      const tokens = await tokenService.getUserTokens(userId);
      console.log('User tokens:', tokens);
    } else {
      console.log('Skipping token test - no active session');
    }

    // Test 3: Permission Service
    console.log('\n--- Test 3: Permission Service ---');
    if (session) {
      const userId = session.user.id;
      const permissions = await permissionService.getUserPermissions(userId);
      console.log('User permissions:', permissions);
    } else {
      console.log('Skipping permission test - no active session');
    }

    // Test 4: Notification Service
    console.log('\n--- Test 4: Notification Service ---');
    if (session) {
      const userId = session.user.id;
      const notifications = await notificationService.getUserNotifications(userId);
      console.log('User notifications:', notifications);
      
      // Test creating a notification
      const newNotification = await notificationService.createNotification({
        userId,
        type: 'test',
        title: 'Test Notification',
        message: 'This is a test notification from the integration test'
      });
      console.log('Created notification:', newNotification);
    } else {
      console.log('Skipping notification test - no active session');
    }

    // Test 5: Audit Service
    console.log('\n--- Test 5: Audit Service ---');
    if (session) {
      const userId = session.user.id;
      const auditLog = await auditService.createAuditLog({
        userId,
        action: 'integration_test',
        entityType: 'test',
        entityId: 'test-1',
        metadata: { test: true }
      });
      console.log('Created audit log:', auditLog);
    } else {
      console.log('Skipping audit test - no active session');
    }

    // Test 6: Database Functions
    console.log('\n--- Test 6: Database Functions ---');
    if (session) {
      const userId = session.user.id;
      
      // Test update_user_profile function
      const { data: updateResult, error: updateError } = await supabase
        .rpc('update_user_profile', {
          p_user_id: userId,
          p_bio: 'Updated bio from integration test',
          p_status: 'active'
        });
      
      if (updateError) {
        console.error('Error calling update_user_profile:', updateError);
      } else {
        console.log('Profile update result:', updateResult);
      }
      
      // Test get_user_token_balance function
      const { data: tokens } = await supabase
        .from('tokens')
        .select('id')
        .limit(1);
      
      if (tokens && tokens.length > 0) {
        const tokenId = tokens[0].id;
        const { data: balance, error: balanceError } = await supabase
          .rpc('get_user_token_balance', {
            p_user_id: userId,
            p_token_id: tokenId
          });
        
        if (balanceError) {
          console.error('Error calling get_user_token_balance:', balanceError);
        } else {
          console.log(`Token balance for token ${tokenId}:`, balance);
        }
      }
    } else {
      console.log('Skipping database function tests - no active session');
    }

    console.log('\nIntegration tests completed successfully.');
  } catch (error) {
    console.error('Error during integration tests:', error);
  }
}

// Run the tests
testIntegration();
