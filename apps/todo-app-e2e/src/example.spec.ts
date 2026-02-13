import { test, expect } from '@playwright/test';

test('shows Todos heading', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('h1')).toContainText('Todos');
});

test('can add a todo', async ({ page }) => {
  await page.goto('/');

  const input = page.getByPlaceholder('What needs to be done?');
  await input.fill('Buy milk');
  await page.getByRole('button', { name: 'Add' }).click();

  await expect(page.locator('text=Buy milk')).toBeVisible();
});

test('can toggle todo completion', async ({ page }) => {
  await page.goto('/');

  const input = page.getByPlaceholder('What needs to be done?');
  await input.fill('Walk the dog');
  await page.getByRole('button', { name: 'Add' }).click();

  const todoItem = page.locator('text=Walk the dog');
  await expect(todoItem).toBeVisible();

  const toggleButton = page.getByRole('button', { name: 'Mark complete' });
  await toggleButton.click();

  await expect(page.getByRole('button', { name: 'Mark incomplete' })).toBeVisible();
});
