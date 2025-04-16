// E2E Test: Onboarding Flow
// Framework: Playwright (recommended) or Cypress

import { test, expect } from '@playwright/test';

test.describe('User Onboarding Delight', () => {
  test('should complete onboarding with celebration and What\'s Next prompt', async ({ page }) => {
    // 1. Visit onboarding page
    await page.goto('/onboarding');

    // 2. Complete profile step (simulate user input)
    await page.fill('input[name="full_name"]', 'Test User');
    await page.click('button:has-text("Save")');

    // 3. Complete checklist actions
    await page.click('button:has-text("Claim Token")');
    await page.click('button:has-text("Join Circle")');

    // 4. Expect celebration (confetti/toast)
    await expect(page.locator('.confetti')).toBeVisible();
    await expect(page.locator('.toast-success')).toContainText('Congratulations');

    // 5. Expect What\'s Next prompt
    await expect(page.locator('.whats-next')).toBeVisible();
  });
});
