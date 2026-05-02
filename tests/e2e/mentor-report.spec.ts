import { test, expect } from '@playwright/test';

const MENTOR_PIN = process.env.E2E_MENTOR_PIN;
const GROUP_ID = process.env.E2E_GROUP_ID;

test.skip(
  !MENTOR_PIN || !GROUP_ID,
  'Set E2E_MENTOR_PIN and E2E_GROUP_ID in .env.local to run this test.',
);

test('mentor report does not leak PINs in the network response', async ({ page }) => {
  const groupResponses: string[] = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/rest/v1/groups')) {
      try {
        const body = await response.text();
        groupResponses.push(body);
      } catch {
        // streamed/empty body — fine
      }
    }
  });

  await page.goto('/mentor-report');
  await expect(page.getByRole('heading', { name: /class report/i })).toBeVisible();

  for (const body of groupResponses) {
    expect(body).not.toContain('pin_code');
  }
});

test('mentor with a valid PIN can submit a report', async ({ page }) => {
  await page.goto('/mentor-report');

  await page.getByLabel(/select group/i).click();
  await page
    .getByRole('option')
    .filter({ has: page.locator(`[data-value="${GROUP_ID}"]`) })
    .first()
    .click();

  await page.getByLabel(/class topic/i).fill('Smoke test class — playwright');

  await page.getByLabel(/pin code/i).fill(MENTOR_PIN!);

  await page.getByRole('button', { name: /submit report/i }).click();

  await expect(page.getByRole('heading', { name: /report submitted/i })).toBeVisible({
    timeout: 10_000,
  });
});
