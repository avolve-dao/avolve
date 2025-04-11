import { test, expect } from '@playwright/test';

test.describe('Token System', () => {
  test('should display token balances', async ({ page }) => {
    await page.goto('/tokens');
    await expect(page.getByTestId('token-balance-gen')).toBeVisible();
    await expect(page.getByTestId('token-balance-sap')).toBeVisible();
  });

  test('should show token transaction history', async ({ page }) => {
    await page.goto('/tokens/history');
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Type' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Amount' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible();
  });

  test('should display token analytics', async ({ page }) => {
    await page.goto('/tokens/analytics');
    await expect(page.getByTestId('token-velocity')).toBeVisible();
    await expect(page.getByTestId('token-distribution')).toBeVisible();
    await expect(page.getByTestId('token-burn-rate')).toBeVisible();
  });

  test('should show token rewards for posts', async ({ page }) => {
    await page.goto('/journey/posts');
    await expect(page.getByTestId('post-reward-gen')).toBeVisible();
    await expect(page.getByTestId('post-reward-sap')).toBeVisible();
  });
});
