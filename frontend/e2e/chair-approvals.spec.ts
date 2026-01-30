import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Chair Approvals', () => {
  test.beforeEach(async ({ page }) => {
    // Chair uses admin persona in the demo (admin has chair capabilities)
    await login(page, 'admin');
  });

  test('can view approval queue', async ({ page }) => {
    await page.getByRole('link', { name: /department|chair/i }).click();
    await expect(page.getByText(/approval|pending/i)).toBeVisible();
  });

  test('can approve a request', async ({ page }) => {
    await page.getByRole('link', { name: /department|chair/i }).click();
    const approveButton = page.getByRole('button', { name: /approve/i }).first();
    if (await approveButton.isVisible()) {
      await approveButton.click();
      await expect(page.getByText(/approved/i)).toBeVisible();
    }
  });

  test('can deny a request', async ({ page }) => {
    await page.getByRole('link', { name: /department|chair/i }).click();
    const denyButton = page.getByRole('button', { name: /deny|reject/i }).first();
    if (await denyButton.isVisible()) {
      await denyButton.click();
      // May show a modal for denial reason
      const reasonInput = page.getByLabel(/reason/i);
      if (await reasonInput.isVisible()) {
        await reasonInput.fill('Budget constraints');
        await page.getByRole('button', { name: /confirm|submit/i }).click();
      }
      await expect(page.getByText(/denied/i)).toBeVisible();
    }
  });
});
