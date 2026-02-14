import { test, expect } from '@playwright/test';

test('shows Current Projects heading', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('h1')).toContainText('Current Projects');
});

test('has links to Joe-bot and Todo App', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('h2:has-text("Joe-bot")')).toBeVisible();
  await expect(page.locator('h2:has-text("Todo App")')).toBeVisible();
});

test('Joe-bot and Todo App cards are clickable links with valid href', async ({
  page,
}) => {
  await page.goto('/');

  const joeBotLink = page.locator('a:has(h2:has-text("Joe-bot"))');
  const todoAppLink = page.locator('a:has(h2:has-text("Todo App"))');

  await expect(joeBotLink).toBeVisible();
  await expect(todoAppLink).toBeVisible();

  // Links must have non-empty href pointing to http(s) or relative path
  await expect(joeBotLink).toHaveAttribute('href', /^(https?:\/\/|\/)/);
  await expect(todoAppLink).toHaveAttribute('href', /^(https?:\/\/|\/)/);
});
