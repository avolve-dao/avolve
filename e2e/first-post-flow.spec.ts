import { test, expect } from '@playwright/test';

// Test data
const TEST_EMAIL = 'test-user@example.com';
const TEST_PASSWORD = 'TestPassword123!';

test.describe('First Post and Feed Interaction', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the login page and sign in
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Log In")');

    // Ensure we're on the dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should show prompted post suggestions for new users', async ({ page }) => {
    // Navigate to create post page
    await page.click('a:has-text("Create Post")');

    // Check for prompted post suggestions
    await expect(page.locator('[data-testid="post-prompts"]')).toBeVisible();
    await expect(page.locator('text=Share your first insight')).toBeVisible();

    // Select a prompt
    await page.click("text=What's one thing you've learned recently?");

    // Verify prompt is added to post editor
    await expect(page.locator('[data-testid="post-editor"]')).toContainText(
      "What's one thing you've learned recently?"
    );
  });

  test('should create first post and show micro-rewards', async ({ page }) => {
    // Navigate to create post page
    await page.click('a:has-text("Create Post")');

    // Create a post
    await page.fill(
      '[data-testid="post-editor"]',
      "This is my first post on Avolve! I'm excited to join the Supercivilization community."
    );
    await page.click('button:has-text("Post")');

    // Check for success message
    await expect(page.locator('text=Post created successfully')).toBeVisible();

    // Check for micro-rewards animation
    await expect(page.locator('[data-testid="micro-reward-animation"]')).toBeVisible();
    await expect(page.locator('text=You earned 5 community tokens')).toBeVisible();

    // Check personal progress update
    await expect(page.locator('[data-testid="progress-update"]')).toBeVisible();
    await expect(page.locator('text=First post milestone achieved')).toBeVisible();
  });

  test('should show post in Supercivilization feed', async ({ page }) => {
    // Navigate to feed
    await page.click('a:has-text("Feed")');

    // Check that our post is visible in the feed
    await expect(page.locator('text=This is my first post on Avolve!')).toBeVisible();

    // Check for engagement options
    await expect(page.locator('[data-testid="post-engagement-options"]')).toBeVisible();

    // Like the post
    await page.click('[data-testid="like-button"]');

    // Check that like count increases
    await expect(page.locator('[data-testid="like-count"]')).toContainText('1');
  });

  test('should update collective progress bar after post', async ({ page }) => {
    // Check for collective progress bar
    await expect(page.locator('[data-testid="collective-progress-bar"]')).toBeVisible();

    // Check that progress has increased
    const progressText = await page
      .locator('[data-testid="collective-progress-text"]')
      .textContent();
    expect(progressText).toContain('Community milestone:');
  });

  test('should show community activity in sidebar', async ({ page }) => {
    // Open sidebar if not already open
    const sidebarToggle = page.locator('button[aria-label="Toggle sidebar"]');
    if (await sidebarToggle.isVisible()) {
      await sidebarToggle.click();
    }

    // Check for community activity section
    await expect(page.locator('[data-testid="community-activity"]')).toBeVisible();

    // Check for recent activity items
    const activityItems = page.locator('[data-testid="activity-item"]');
    expect(await activityItems.count()).toBeGreaterThan(0);
  });
});
