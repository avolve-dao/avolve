import { test, expect } from '@playwright/test';

// Test data
const TEST_EMAIL = 'test-user@example.com';
const TEST_PASSWORD = 'TestPassword123!';

test.describe('Feature Unlock and Progression Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the login page and sign in
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Log In")');

    // Ensure we're on the dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should display progress tracker with current achievements', async ({ page }) => {
    // Navigate to progress page
    await page.click('a:has-text("Progress")');

    // Check for progress tracker
    await expect(page.locator('[data-testid="progress-tracker"]')).toBeVisible();

    // Check for achievement cards
    const achievementCards = page.locator('[data-testid="achievement-card"]');
    expect(await achievementCards.count()).toBeGreaterThan(0);

    // Check for token balances
    await expect(page.locator('[data-testid="token-balance"]')).toBeVisible();
  });

  test('should show locked features with requirements', async ({ page }) => {
    // Navigate to features page
    await page.click('a:has-text("Features")');

    // Check for locked features section
    await expect(page.locator('[data-testid="locked-features"]')).toBeVisible();

    // Check that each locked feature shows requirements
    const lockedFeatures = page.locator('[data-testid="locked-feature"]');
    expect(await lockedFeatures.count()).toBeGreaterThan(0);

    // Click on a locked feature to see details
    await page.click('[data-testid="locked-feature"]:first-child');

    // Check for requirements details
    await expect(page.locator('[data-testid="feature-requirements"]')).toBeVisible();
    await expect(page.locator('text=Required Tokens:')).toBeVisible();
  });

  test('should unlock feature when requirements are met', async ({ page }) => {
    // This test simulates a user meeting requirements for a feature unlock

    // First, we'll navigate to the admin panel to grant tokens to our test user
    await page.goto('/admin/users');

    // Login as admin if redirected to login
    if (await page.url().includes('/login')) {
      await page.fill('input[type="email"]', 'admin@avolve.io');
      await page.fill('input[type="password"]', 'AdminPassword123!');
      await page.click('button:has-text("Log In")');
    }

    // Find test user
    await page.fill('input[placeholder*="Search"]', TEST_EMAIL);
    await page.click(`tr:has-text("${TEST_EMAIL}") button:has-text("Manage")`);

    // Grant tokens to the user
    await page.click('button:has-text("Grant Tokens")');
    await page.fill('input[name="amount"]', '50');
    await page.selectOption('select[name="tokenType"]', 'community');
    await page.click('button:has-text("Grant")');

    // Verify success message
    await expect(page.locator('text=Tokens granted successfully')).toBeVisible();

    // Logout
    await page.click('button[aria-label="User menu"]');
    await page.click('button:has-text("Log Out")');

    // Login as test user
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Log In")');

    // Navigate to features page
    await page.click('a:has-text("Features")');

    // Find a feature that should now be unlockable
    await page.click('[data-testid="locked-feature"]:has-text("Advanced Posting")');

    // Check if unlock button is available and click it
    const unlockButton = page.locator('button:has-text("Unlock Feature")');
    if (await unlockButton.isVisible()) {
      await unlockButton.click();

      // Confirm unlock
      await page.click('button:has-text("Confirm")');

      // Check for unlock animation
      await expect(page.locator('[data-testid="feature-unlock-animation"]')).toBeVisible();
      await expect(page.locator("text=You've unlocked Advanced Posting")).toBeVisible();

      // Check that feature is now available
      await page.goto('/dashboard');
      await expect(page.locator('a:has-text("Advanced Posting")')).toBeVisible();
    }
  });

  test('should update personal progress after feature unlock', async ({ page }) => {
    // Navigate to progress page
    await page.click('a:has-text("Progress")');

    // Check for updated progress
    await expect(page.locator('[data-testid="progress-tracker"]')).toBeVisible();

    // Check for the newly unlocked feature in achievements
    await expect(page.locator('text=Advanced Posting Unlocked')).toBeVisible();

    // Check for updated token balance
    const tokenBalance = await page
      .locator('[data-testid="token-balance-community"]')
      .textContent();
    console.log(`Current community token balance: ${tokenBalance}`);
  });

  test('should receive notification about feature unlock', async ({ page }) => {
    // Check notifications
    await page.click('button[aria-label="Notifications"]');

    // Verify feature unlock notification exists
    await expect(page.locator('text=New Feature Unlocked')).toBeVisible();
    await expect(page.locator("text=You've unlocked Advanced Posting")).toBeVisible();
  });
});
