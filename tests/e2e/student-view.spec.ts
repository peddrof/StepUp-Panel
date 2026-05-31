import { test, expect, type Page } from '@playwright/test';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;
const STUDENT_ID = process.env.E2E_STUDENT_ID;

test.skip(
  !ADMIN_EMAIL || !ADMIN_PASSWORD || !STUDENT_ID,
  'Set E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD and E2E_STUDENT_ID in .env.local to run this test.',
);

async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL!);
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD!);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  await page.waitForURL('**/admin', { timeout: 10_000 });
}

test('admin can open a student detail view', async ({ page }) => {
  await login(page);
  await page.goto(`/admin/students/${STUDENT_ID}`);

  // The student name renders as the page heading.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({
    timeout: 10_000,
  });
  // Attendance summary card is present.
  await expect(page.getByText(/attendance/i).first()).toBeVisible();
  await expect(page.getByText(/back to people/i)).toBeVisible();
});
