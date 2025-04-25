import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Test data
const TEST_EMAIL = 'test-user@example.com';
const TEST_PASSWORD = 'TestPassword123!';

test.describe('Accessibility Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the home page
    await page.goto('/');
  });

  test('home page should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('login page should be accessible', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Run accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="email"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="password"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('button:has-text("Log In")')).toBeFocused();
  });

  test('dashboard should be accessible after login', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Log In")');

    // Wait for dashboard to load
    await expect(page).toHaveURL(/.*dashboard/);

    // Run accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Test screen reader accessibility
    // Check for appropriate ARIA labels
    await expect(page.locator('[aria-label="Main navigation"]')).toBeVisible();
    await expect(page.locator('[aria-label="User menu"]')).toBeVisible();
    await expect(page.locator('[aria-label="Notifications"]')).toBeVisible();

    // Test color contrast for important elements
    // This is a visual check that would need manual verification
    // but we can check if high-contrast mode is available
    await page.click('button[aria-label="User menu"]');
    await page.click('a:has-text("Accessibility")');

    // Check if high contrast toggle exists
    await expect(page.locator('text=High Contrast Mode')).toBeVisible();

    // Toggle high contrast mode
    await page.click('button:has-text("High Contrast Mode")');

    // Verify the high contrast class is added to the body
    const hasHighContrastClass = await page.evaluate(() => {
      return document.body.classList.contains('high-contrast');
    });

    expect(hasHighContrastClass).toBe(true);
  });

  test('post creation form should be accessible', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Log In")');

    // Navigate to create post page
    await page.click('a:has-text("Create Post")');

    // Run accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Test keyboard navigation for post creation
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="post-editor"]')).toBeFocused();

    // Test screen reader accessibility for post creation
    await expect(page.locator('[aria-label="Post content editor"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Add image"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Add emoji"]')).toBeVisible();
  });

  test('feature unlock card should be accessible', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Log In")');

    // Navigate to features page
    await page.click('a:has-text("Features")');

    // Run accessibility scan on feature cards
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="feature-card"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    // Test keyboard navigation for feature cards
    await page.keyboard.press('Tab');
    const firstFeatureCard = page.locator('[data-testid="feature-card"]').first();
    await expect(firstFeatureCard).toBeFocused();

    // Test that feature requirements are properly announced for screen readers
    await expect(page.locator('[aria-live="polite"]')).toBeVisible();
  });

  test('feedback form should be accessible', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Log In")');

    // Navigate to feedback page
    await page.click('a:has-text("Feedback")');

    // Run accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('select[name="feedback_type"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('textarea[name="content"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('button:has-text("Submit Feedback")')).toBeFocused();

    // Test form labels for screen readers
    await expect(page.locator('label[for="feedback_type"]')).toBeVisible();
    await expect(page.locator('label[for="content"]')).toBeVisible();
  });

  test('error states should be accessible', async ({ page }) => {
    // Force an error state by navigating to a non-existent page
    await page.goto('/non-existent-page');

    // Run accessibility scan on error page
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Check that error is properly announced for screen readers
    await expect(page.locator('[role="alert"]')).toBeVisible();

    // Check that error page has a proper heading structure
    await expect(page.locator('h1:has-text("Page Not Found")')).toBeVisible();

    // Check that there's a way to navigate back
    await expect(page.locator('a:has-text("Go back to home")')).toBeVisible();
  });

  test('loading states should be accessible', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);

    // Intercept API calls to simulate loading state
    await page.route('**/api/auth/login', async route => {
      // Delay the response to show loading state
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    // Click login to trigger loading state
    await page.click('button:has-text("Log In")');

    // Check that loading state is properly announced for screen readers
    await expect(page.locator('[role="status"]')).toBeVisible();
    await expect(page.locator('[aria-live="polite"]')).toBeVisible();

    // Wait for login to complete
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
