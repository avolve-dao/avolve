import { test, expect } from '@playwright/test';

// Test data
const TEST_EMAIL = 'test-user@example.com';
const TEST_PASSWORD = 'TestPassword123!';
const TEST_INVITATION_CODE = 'TEST-INVITE-123';

test.describe('Invitation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the home page
    await page.goto('/');
  });

  test('should show invitation code input on signup', async ({ page }) => {
    // Navigate to signup page
    await page.click('text=Sign Up');

    // Check if invitation code input is visible
    await expect(page.locator('input[placeholder*="invitation code"]')).toBeVisible();
  });

  test('should show error for invalid invitation code', async ({ page }) => {
    // Navigate to signup page
    await page.click('text=Sign Up');

    // Enter invalid invitation code
    await page.fill('input[placeholder*="invitation code"]', 'INVALID-CODE');

    // Click continue or submit button
    await page.click('button:has-text("Continue")');

    // Check for error message
    await expect(page.locator('text=Invalid invitation code')).toBeVisible();
  });

  test('should allow requesting an invitation', async ({ page }) => {
    // Navigate to signup page
    await page.click('text=Sign Up');

    // Click on "Request an Invitation" link
    await page.click('text=Request an Invitation');

    // Fill out the request form
    await page.fill('input[placeholder*="email"]', TEST_EMAIL);
    await page.fill('input[placeholder*="name"]', 'Test User');
    await page.fill('textarea[placeholder*="join"]', 'I want to join Avolve to test the platform.');

    // Submit the form
    await page.click('button:has-text("Submit Request")');

    // Check for success message
    await expect(page.locator('text=Request Received')).toBeVisible();
  });

  test('should allow admin to create bulk invitations', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@avolve.io');
    await page.fill('input[type="password"]', 'AdminPassword123!');
    await page.click('button:has-text("Log In")');

    // Navigate to admin invitations page
    await page.goto('/admin/invitations');

    // Click on "Bulk Upload" tab
    await page.click('button:has-text("Bulk Upload")');

    // Fill in email list
    await page.click('button:has-text("Email List")');
    await page.fill(
      'textarea[placeholder*="user1@example.com"]',
      'bulk1@example.com\nbulk2@example.com\nbulk3@example.com'
    );

    // Set max uses and expiration
    await page.fill('input[id="maxUses"]', '1');
    await page.click('button:has-text("7 days")');
    await page.click('text=14 days');

    // Submit the form
    await page.click('button:has-text("Create Invitations")');

    // Check for success message
    await expect(page.locator('text=Successfully created')).toBeVisible();
  });

  test('should complete full onboarding flow with valid invitation code', async ({ page }) => {
    // This test requires a valid invitation code to be set up in the database

    // Navigate to signup page
    await page.goto('/signup');

    // Enter valid invitation code
    await page.fill('input[placeholder*="invitation code"]', TEST_INVITATION_CODE);
    await page.click('button:has-text("Continue")');

    // Fill out signup form
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Sign Up")');

    // Complete profile step
    await page.fill('input[placeholder*="name"]', 'Test User');
    await page.click('button:has-text("Next")');

    // Complete interests step
    await page.click('text=Technology');
    await page.click('text=Science');
    await page.click('button:has-text("Next")');

    // Complete group step
    await page.click('text=Innovators');
    await page.click('button:has-text("Next")');

    // Complete explore step
    await page.click('button:has-text("Next")');

    // Check for celebration step
    await expect(page.locator('text=Welcome to Avolve')).toBeVisible();

    // Check for dashboard redirect
    await page.click('button:has-text("Go to Dashboard")');
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
