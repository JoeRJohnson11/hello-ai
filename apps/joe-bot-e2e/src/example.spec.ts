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

test('has Home link in header', async ({ page }) => {
  await page.goto('/');

  const homeLink = page.getByRole('link', { name: 'Home' });
  await homeLink.waitFor({ state: 'visible', timeout: 10000 });

  await expect(homeLink).toBeVisible();
  await expect(homeLink).toHaveAttribute('href', /.+/);
});
