/** nx-agents full-run test */
import path from 'path';
import { workspaceRoot } from '@nx/devkit';
import { test, expect } from '@playwright/test';

const testImagePath = path.join(
  workspaceRoot,
  'apps',
  'joe-bot-e2e',
  'fixtures',
  'test-image.png'
);

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

test('can send a message and see it appear in the chat', async ({ page }) => {
  await page.goto('/');

  const textarea = page.getByPlaceholder(/Ask anything/);
  const sendButton = page.getByRole('button', { name: /Send/i });

  const testMessage = 'Hello, Joe-bot!';
  await textarea.fill(testMessage);
  await sendButton.click();

  // User message should appear in the chat (core chat flow works)
  await expect(page.getByText(testMessage).first()).toBeVisible({
    timeout: 5000,
  });
  // Input should be cleared after send
  await expect(textarea).toHaveValue('');
});

test('can attach a photo and send', async ({ page }) => {
  await page.goto('/');

  const fileInput = page.getByLabel('Attach images');
  await expect(fileInput).toBeAttached();

  await fileInput.setInputFiles(testImagePath);

  // Thumbnail preview should appear
  await expect(page.getByAltText('test-image.png')).toBeVisible({
    timeout: 3000,
  });

  const sendButton = page.getByRole('button', { name: /Send/i });
  await sendButton.click();

  // User message should show photo was attached
  await expect(page.getByText(/1 photo/)).toBeVisible({
    timeout: 5000,
  });
});

test('has Home link in header', async ({ page }) => {
  await page.goto('/');

  const homeLink = page.getByRole('link', { name: 'Home' });
  await homeLink.waitFor({ state: 'visible', timeout: 10000 });

  await expect(homeLink).toBeVisible();
  await expect(homeLink).toHaveAttribute('href', /.+/);
});
