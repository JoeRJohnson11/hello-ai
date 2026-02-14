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

test('has Home link in header', async ({ page }) => {
  await page.goto('/');

  const homeLink = page.getByRole('link', { name: 'Home' });
  await expect(homeLink).toBeVisible();
  await expect(homeLink).toHaveAttribute('href', /.+/);
});

test('can delete a todo', async ({ page }) => {
  await page.goto('/');

  const input = page.getByPlaceholder('What needs to be done?');
  await input.fill('Todo to delete');
  await page.getByRole('button', { name: 'Add' }).click();

  await expect(page.locator('text=Todo to delete')).toBeVisible();

  await page.getByRole('button', { name: 'Delete' }).first().click();

  await expect(page.locator('text=Todo to delete')).not.toBeVisible();
});

test('filter buttons work correctly', async ({ page }) => {
  await page.goto('/');

  // Add completed and active todos
  const input = page.getByPlaceholder('What needs to be done?');
  await input.fill('Active task');
  await page.getByRole('button', { name: 'Add' }).click();
  await input.fill('Completed task');
  await page.getByRole('button', { name: 'Add' }).click();

  await page.getByRole('button', { name: 'Mark complete' }).nth(1).click();

  // All filter: both visible
  await page.getByRole('button', { name: 'All' }).click();
  await expect(page.locator('text=Active task')).toBeVisible();
  await expect(page.locator('text=Completed task')).toBeVisible();

  // Active filter: only active visible
  await page.getByRole('button', { name: 'Active' }).click();
  await expect(page.locator('text=Active task')).toBeVisible();
  await expect(page.locator('text=Completed task')).not.toBeVisible();

  // Completed filter: only completed visible
  await page.getByRole('button', { name: 'Completed' }).click();
  await expect(page.locator('text=Active task')).not.toBeVisible();
  await expect(page.locator('text=Completed task')).toBeVisible();
});
