import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Test user credentials
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'testPassword123!';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the signup page
    await page.goto('/signup');
  });

  test('should complete onboarding flow - Variant A', async ({ page }) => {
    // Sign up
    await test.step('Sign up', async () => {
      await page.fill('[data-test="email-input"]', TEST_USER_EMAIL);
      await page.fill('[data-test="password-input"]', TEST_USER_PASSWORD);
      await page.click('[data-test="signup-button"]');
      
      // Wait for email verification notice
      await expect(page.locator('[data-test="verification-notice"]')).toBeVisible();
    });

    // Verify email (simulated)
    await test.step('Verify email', async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      // Simulate email verification
      const { data: { user }, error } = await supabase.auth.admin.updateUser(
        TEST_USER_EMAIL,
        { email_confirmed: true }
      );
      expect(error).toBeNull();
      expect(user?.email_confirmed_at).not.toBeNull();
    });

    // Complete onboarding
    await test.step('Complete onboarding', async () => {
      // Welcome screen
      await expect(page.locator('[data-test="welcome-screen"]')).toBeVisible();
      await page.click('[data-test="welcome-next"]');

      // Profile setup
      await page.fill('[data-test="full-name"]', 'Test User');
      await page.fill('[data-test="username"]', 'testuser');
      await page.click('[data-test="profile-next"]');

      // Focus selection
      await page.click('[data-test="focus-personal"]');
      await page.click('[data-test="focus-next"]');

      // Token introduction
      await expect(page.locator('[data-test="token-intro"]')).toBeVisible();
      await page.click('[data-test="token-next"]');

      // Verify completion
      await expect(page.locator('[data-test="onboarding-complete"]')).toBeVisible();
    });

    // Verify database state
    await test.step('Verify database state', async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Get user's onboarding state
      const { data: onboarding, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', TEST_USER_EMAIL)
        .single();

      expect(error).toBeNull();
      expect(onboarding?.current_stage).toBe('complete');
      expect(onboarding?.completed_stages).toContain('welcome');
      expect(onboarding?.completed_stages).toContain('profile_setup');
      expect(onboarding?.completed_stages).toContain('focus_selection');
      expect(onboarding?.completed_stages).toContain('token_intro');
    });
  });

  test('should handle onboarding interruption and resume', async ({ page }) => {
    // TODO: Test that users can leave during onboarding and resume where they left off
  });

  test('should validate required fields', async ({ page }) => {
    // TODO: Test form validation during onboarding
  });

  test('should respect A/B test variants', async ({ page }) => {
    // TODO: Test both onboarding variants
  });

  test('should handle social auth onboarding', async ({ page }) => {
    // TODO: Test onboarding flow with social auth users
  });
});
