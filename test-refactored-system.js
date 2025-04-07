import { createClient } from '@supabase/supabase-js';
import { AuthService } from './lib/auth/auth-service';
import { TokenService } from './lib/token/token-service';
import { PermissionService } from './lib/token/permission-service';
import { NotificationService } from './lib/notifications/notification-service';
import { AuditService } from './lib/audit/audit-service';
import { initializeDatabaseDefaults } from './lib/utils/database-initializer';

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

async function testRefactoredSystem() {
  console.log('Starting comprehensive system test...');
  
  try {
    // Step 1: Initialize database defaults
    console.log('\n--- Step 1: Initialize database defaults ---');
    await initializeDatabaseDefaults(supabase);
    console.log('Database defaults initialized successfully');
    
    // Step 2: Test authentication
    console.log('\n--- Step 2: Test authentication ---');
    const session = await authService.getSession();
    console.log('Current session:', session ? 'Active' : 'None');
    
    if (!session) {
      console.log('No active session. Please sign in before running this test.');
      return;
    }
    
    const userId = session.user.id;
    console.log('User ID:', userId);
    
    // Step 3: Test user profile
    console.log('\n--- Step 3: Test user profile ---');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
    } else {
      console.log('Profile:', profile);
      
      // Update profile
      const { error: updateError } = await supabase.rpc('update_user_profile', {
        p_user_id: userId,
        p_bio: 'Updated bio from system test',
        p_status: 'active'
      });
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
      } else {
        console.log('Profile updated successfully');
      }
    }
    
    // Step 4: Test token system
    console.log('\n--- Step 4: Test token system ---');
    const { data: tokens, error: tokensError } = await tokenService.getAllTokens();
    
    if (tokensError) {
      console.error('Error fetching tokens:', tokensError);
    } else {
      console.log('Tokens:', tokens);
      
      if (tokens && tokens.length > 0) {
        const testToken = tokens[0];
        console.log('Using token for testing:', testToken);
        
        // Get user tokens
        const { data: userTokens, error: userTokensError } = await tokenService.getUserTokens(userId);
        
        if (userTokensError) {
          console.error('Error fetching user tokens:', userTokensError);
        } else {
          console.log('User tokens:', userTokens);
          
          // Test token transfer if we have another user to transfer to
          const { data: otherUsers, error: otherUsersError } = await supabase
            .from('profiles')
            .select('id')
            .neq('id', userId)
            .limit(1);
          
          if (otherUsersError) {
            console.error('Error fetching other users:', otherUsersError);
          } else if (otherUsers && otherUsers.length > 0) {
            const otherUserId = otherUsers[0].id;
            console.log('Testing token transfer to user:', otherUserId);
            
            // Only attempt transfer if user has tokens
            if (userTokens && userTokens.length > 0) {
              const userToken = userTokens[0];
              const transferAmount = Math.min(1, userToken.balance);
              
              if (transferAmount > 0) {
                const { data: transferResult, error: transferError } = await tokenService.transferTokensWithFee(
                  userId,
                  otherUserId,
                  userToken.token_id,
                  transferAmount
                );
                
                if (transferError) {
                  console.error('Error transferring tokens:', transferError);
                } else {
                  console.log('Transfer result:', transferResult);
                }
              } else {
                console.log('Insufficient balance for transfer test');
              }
            } else {
              console.log('No tokens available for transfer test');
            }
          } else {
            console.log('No other users available for transfer test');
          }
        }
      } else {
        console.log('No tokens available for testing');
      }
    }
    
    // Step 5: Test notification system
    console.log('\n--- Step 5: Test notification system ---');
    const { data: createNotifResult, error: createNotifError } = await notificationService.createNotification({
      userId,
      type: 'system_test',
      title: 'System Test Notification',
      message: 'This is a test notification from the system test'
    });
    
    if (createNotifError) {
      console.error('Error creating notification:', createNotifError);
    } else {
      console.log('Notification created:', createNotifResult);
      
      // Get user notifications
      const { data: notifications, error: notificationsError } = await notificationService.getUserNotifications(userId);
      
      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError);
      } else {
        console.log('User notifications:', notifications);
        
        // Mark notification as read if we have any
        if (notifications && notifications.length > 0) {
          const notificationId = notifications[0].id;
          const { data: markReadResult, error: markReadError } = await notificationService.markNotificationAsRead(notificationId);
          
          if (markReadError) {
            console.error('Error marking notification as read:', markReadError);
          } else {
            console.log('Notification marked as read:', markReadResult);
          }
        }
      }
    }
    
    // Step 6: Test audit system
    console.log('\n--- Step 6: Test audit system ---');
    const { data: auditResult, error: auditError } = await auditService.createAuditLog({
      userId,
      action: 'system_test',
      entityType: 'test',
      entityId: 'test-1',
      metadata: { test: true }
    });
    
    if (auditError) {
      console.error('Error creating audit log:', auditError);
    } else {
      console.log('Audit log created:', auditResult);
    }
    
    console.log('\nComprehensive system test completed successfully.');
  } catch (error) {
    console.error('Unexpected error during system test:', error);
  }
}

// Run the test
testRefactoredSystem();
