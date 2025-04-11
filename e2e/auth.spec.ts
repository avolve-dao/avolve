import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show sign in form', async ({ page }) => {
    await page.goto('/auth/signin');
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should show validation errors', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should navigate to sign up', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.getByRole('link', { name: 'Sign Up' }).click();
    await expect(page.url()).toContain('/auth/signup');
  });

  test('should show password requirements', async ({ page }) => {
    await page.goto('/auth/signup');
    const passwordInput = page.getByLabel('Password');
    await passwordInput.click();
    await passwordInput.fill('weak');
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
  });
});
