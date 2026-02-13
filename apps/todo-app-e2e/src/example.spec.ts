import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  expect(await page.locator('h1').innerText()).toContain('Todos');
});

test('has Home link in header', async ({ page }) => {
  await page.goto('/');

  const homeLink = page.getByRole('link', { name: 'Home' });
  await expect(homeLink).toBeVisible();
  await expect(homeLink).toHaveAttribute('href', /.+/);
});
