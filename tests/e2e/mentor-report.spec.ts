import { test, expect } from '@playwright/test';

// The standalone /mentor-report form was retired (it exposed rosters to the
// public anon key before any PIN). It now redirects to the PIN-gated portal.
// Functional + PIN-leak coverage lives in mentor-portal.spec.ts.
test('/mentor-report redirects to the mentor portal', async ({ page }) => {
  await page.goto('/mentor-report');
  await page.waitForURL('**/mentor', { timeout: 5_000 });
  await expect(page).toHaveURL(/\/mentor$/);
});
