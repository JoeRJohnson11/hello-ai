import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  expect(await page.locator('h1').innerText()).toContain('Joe-bot');
});

test('has Home link in header', async ({ page }) => {
  await page.goto('/');

  const homeLink = page.getByRole('link', { name: 'Home' });
  await homeLink.waitFor({ state: 'visible', timeout: 10000 });

  await expect(homeLink).toBeVisible();
  await expect(homeLink).toHaveAttribute('href', /.+/);
});
