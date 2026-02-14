import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// For CI with Vercel Preview: set BASE_URL_TODO_APP to the deployment URL.
// todo-app dev runs on port 3012 (see apps/todo-app/project.json)
const baseURL =
  process.env['BASE_URL_TODO_APP'] ||
  process.env['BASE_URL'] ||
  'http://localhost:3012';
const isDeployedUrl = baseURL.startsWith('https://');

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  /* Run your local dev server before starting the tests (skip when using deployed URL) */
  webServer: isDeployedUrl
    ? undefined
    : {
    command: 'pnpm exec nx run @hello-ai/todo-app:dev',
    url: 'http://localhost:3012',
    reuseExistingServer: true,
    timeout: process.env.CI ? 180000 : 60000,
    cwd: workspaceRoot,
  },
  projects:
    process.env.CI
      ? [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
      : [
          {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
          },
          {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
          },
          {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
          },
        ],
});
