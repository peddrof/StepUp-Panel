import { test, expect, type Page } from '@playwright/test';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

test.skip(
  !ADMIN_EMAIL || !ADMIN_PASSWORD,
  'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD in .env.local to run this test.',
);

async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL!);
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD!);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  await page.waitForURL('**/admin', { timeout: 10_000 });
}

test('dashboard shows the Needs attention panel', async ({ page }) => {
  await login(page);
  await expect(
    page.getByRole('heading', { name: /needs attention/i }),
  ).toBeVisible({ timeout: 10_000 });
});

test('people page exposes the at-risk filter and risk column', async ({ page }) => {
  await login(page);
  await page.goto('/admin/people');
  await expect(page.getByRole('button', { name: /at risk/i })).toBeVisible({
    timeout: 10_000,
  });
  await expect(
    page.getByRole('columnheader', { name: /^risk$/i }),
  ).toBeVisible();
  await expect(
    page.getByRole('columnheader', { name: /attendance/i }),
  ).toBeVisible();
});
