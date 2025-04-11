import { test, expect } from '@playwright/test';

test.describe('Journey System', () => {
  test('should show journey types on homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Superachiever Journey' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Superachievers Journey' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Supercivilization Journey' })).toBeVisible();
  });

  test('should require authentication for creating posts', async ({ page }) => {
    await page.goto('/superachiever');
    await expect(page.getByText('Sign in to start your journey')).toBeVisible();
  });

  test('should show token balance', async ({ page }) => {
    await page.goto('/tokens');
    await expect(page.getByTestId('token-balance-gen')).toBeVisible();
    await expect(page.getByTestId('token-balance-sap')).toBeVisible();
  });

  test('should display journey stats', async ({ page }) => {
    await page.goto('/stats');
    await expect(page.getByTestId('total-posts')).toBeVisible();
    await expect(page.getByTestId('engagement-score')).toBeVisible();
    await expect(page.getByTestId('token-rewards')).toBeVisible();
  });
});
