import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

test.skip(
  !ADMIN_EMAIL || !ADMIN_PASSWORD,
  'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD in .env.local to run this test.',
);

test('admin can log in and reach the dashboard', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel(/email/i).fill(ADMIN_EMAIL!);
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD!);
  await page.getByRole('button', { name: /sign in|log in/i }).click();

  await page.waitForURL('**/admin', { timeout: 10_000 });
  await expect(page).toHaveURL(/\/admin\/?$/);
});

test('unauthenticated /admin redirects to /login', async ({ page }) => {
  await page.context().clearCookies();
  const response = await page.goto('/admin');
  expect(response?.status()).toBeLessThan(400);
  await page.waitForURL('**/login', { timeout: 5_000 });
  await expect(page).toHaveURL(/\/login/);
});
