import { test, expect } from '@playwright/test';

test('admin page shows sign-in when not authenticated', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Admin/i })).toBeVisible({
    timeout: 5000,
  });
  await expect(page.getByText(/Sign in with your admin account/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /Sign in with Google/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Back to Joe-bot/i })).toBeVisible();
});
