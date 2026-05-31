import { test, expect } from '@playwright/test';

const MENTOR_ID = process.env.E2E_MENTOR_ID;
const MENTOR_PIN = process.env.E2E_MENTOR_PIN;

test.skip(
  !MENTOR_ID || !MENTOR_PIN,
  'Set E2E_MENTOR_ID and E2E_MENTOR_PIN in .env.local to run this test.',
);

test('wrong PIN is rejected at the mentor portal gate', async ({ page }) => {
  await page.goto('/mentor');

  await page.getByLabel(/your name/i).click();
  await page
    .getByRole('option')
    .filter({ has: page.locator(`[data-value="${MENTOR_ID}"]`) })
    .first()
    .click();

  await page.getByLabel(/pin code/i).fill('00000000');
  await page.getByRole('button', { name: /enter/i }).click();

  await expect(page.getByText(/invalid pin code/i)).toBeVisible();
});

test('valid PIN opens the portal and no response leaks a PIN', async ({ page }) => {
  const bodies: string[] = [];
  page.on('response', async (response) => {
    if (response.url().includes('/functions/v1/mentor-portal-data')) {
      try {
        bodies.push(await response.text());
      } catch {
        // streamed/empty body — fine
      }
    }
  });

  await page.goto('/mentor');

  await page.getByLabel(/your name/i).click();
  await page
    .getByRole('option')
    .filter({ has: page.locator(`[data-value="${MENTOR_ID}"]`) })
    .first()
    .click();

  await page.getByLabel(/pin code/i).fill(MENTOR_PIN!);
  await page.getByRole('button', { name: /enter/i }).click();

  await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible({
    timeout: 10_000,
  });

  for (const body of bodies) {
    expect(body).not.toContain('pin_code');
  }
});
