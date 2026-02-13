import { test, expect } from '@playwright/test';

test('shows chat UI', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('h1')).toContainText('Joe-bot');
});

test('has chat input and send controls', async ({ page }) => {
  await page.goto('/');

  const textarea = page.getByPlaceholder(/Ask anything/);
  await expect(textarea).toBeVisible();

  const sendButton = page.getByRole('button', { name: /Send/i });
  await expect(sendButton).toBeVisible();
});
