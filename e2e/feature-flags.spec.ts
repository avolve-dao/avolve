import { test, expect } from '@playwright/test';

// Test data
const TEST_EMAIL = 'test-user@example.com';
const TEST_PASSWORD = 'TestPassword123!';
const ADMIN_EMAIL = 'admin@avolve.io';
const ADMIN_PASSWORD = 'AdminPassword123!';

test.describe('Feature Flags System', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the login page
    await page.goto('/login');
  });

  test('should show locked features in the sidebar', async ({ page }) => {
    // Login as a regular user
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Log In")');

    // Navigate to dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Open sidebar if not already open
    const sidebarToggle = page.locator('button[aria-label="Toggle sidebar"]');
    if (await sidebarToggle.isVisible()) {
      await sidebarToggle.click();
    }

    // Check for locked features in the sidebar
    const lockedFeatures = page.locator('[data-testid="locked-feature"]');
    // Expect at least one locked feature
    expect(await lockedFeatures.count()).toBeGreaterThan(0);

    // Check that locked features have a lock icon
    await expect(page.locator('[data-testid="lock-icon"]')).toBeVisible();
  });

  test('should display feature unlock animation when feature is unlocked', async ({ page }) => {
    // This test requires admin to unlock a feature for a user

    // First login as admin
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button:has-text("Log In")');

    // Navigate to user management
    await page.goto('/admin/users');

    // Find test user
    await page.fill('input[placeholder*="Search"]', TEST_EMAIL);
    await page.click(`tr:has-text("${TEST_EMAIL}") button:has-text("Manage")`);

    // Unlock a feature for the user
    await page.click('button:has-text("Unlock Feature")');
    await page.click('text=community_posts');
    await page.click('button:has-text("Unlock")');

    // Verify success message
    await expect(page.locator('text=Feature unlocked successfully')).toBeVisible();

    // Logout
    await page.click('button[aria-label="User menu"]');
    await page.click('button:has-text("Log Out")');

    // Login as the test user
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Log In")');

    // Check for feature unlock animation
    await expect(page.locator('[data-testid="feature-unlock-animation"]')).toBeVisible();
    await expect(page.locator("text=You've unlocked Community Posts")).toBeVisible();
  });

  test('should allow admin to manage feature flags', async ({ page }) => {
    // Login as admin
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button:has-text("Log In")');

    // Navigate to feature flags management
    await page.goto('/admin/features');

    // Check that feature flags table is visible
    await expect(page.locator('table')).toBeVisible();

    // Create a new feature flag
    await page.click('button:has-text("Create Feature Flag")');
    await page.fill('input[name="key"]', 'test_feature');
    await page.fill('input[name="name"]', 'Test Feature');
    await page.fill('textarea[name="description"]', 'This is a test feature');
    await page.selectOption('select[name="defaultEnabled"]', 'false');
    await page.click('button:has-text("Create")');

    // Verify feature flag was created
    await expect(page.locator('text=Feature flag created successfully')).toBeVisible();
    await expect(page.locator('text=test_feature')).toBeVisible();

    // Edit the feature flag
    await page.click(`tr:has-text("test_feature") button:has-text("Edit")`);
    await page.fill('textarea[name="description"]', 'Updated test feature description');
    await page.click('button:has-text("Update")');

    // Verify feature flag was updated
    await expect(page.locator('text=Feature flag updated successfully')).toBeVisible();
    await expect(page.locator('text=Updated test feature description')).toBeVisible();
  });

  test('should receive in-app notification when feature is unlocked', async ({ page }) => {
    // Login as the test user
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Log In")');

    // Check notifications
    await page.click('button[aria-label="Notifications"]');

    // Verify feature unlock notification exists
    await expect(page.locator('text=New Feature Unlocked')).toBeVisible();
    await expect(page.locator("text=You've unlocked")).toBeVisible();
  });
});
