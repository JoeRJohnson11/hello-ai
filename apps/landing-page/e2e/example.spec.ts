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
