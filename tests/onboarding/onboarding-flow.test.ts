import { test, expect } from '@playwright/test';

// E2E onboarding flow test

test('User can complete onboarding flow', async ({ page }) => {
  await page.goto('/onboarding');

  // Profile step
  await page.fill('input[aria-label="Name"]', 'Test User');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/onboarding/);

  // Interests step
  await page.click('button[aria-pressed="false"]:has-text("Tech")');
  await page.click('button[type="submit"]');

  // Group step
  await page.click('button[aria-pressed="false"]:has-text("Growth")');
  await page.click('button[type="submit"]');

  // Explore step
  await page.click('button[type="button"]:has-text("Next")');

  // Celebrate step
  await expect(page.locator('text=You made it!')).toBeVisible();
  await page.click('a[href="/authenticated/dashboard"]');
  await expect(page).toHaveURL(/dashboard/);
});

// Resume onboarding test

test('User is prompted to resume onboarding if incomplete', async ({ page }) => {
  // Simulate incomplete onboarding
  await page.goto('/onboarding');
  await page.fill('input[aria-label="Name"]', 'Resume User');
  await page.click('button[type="submit"]');
  await page.goto('/');
  // Should see resume prompt
  await expect(page.locator('text=Resume onboarding')).toBeVisible();
  await page.click('a:has-text("Resume")');
  await expect(page).toHaveURL(/onboarding/);
});
