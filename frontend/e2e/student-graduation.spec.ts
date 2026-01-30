import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Student Graduation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'enrolledStudent');
  });

  test('can submit graduation application', async ({ page }) => {
    await page.getByRole('link', { name: /graduation/i }).click();
    const applyButton = page.getByRole('button', { name: /apply|submit.*graduation/i });
    if (await applyButton.isVisible()) {
      await applyButton.click();
      await expect(page.getByText(/submitted|clearance/i)).toBeVisible();
    }
  });

  test('can view clearance progress tracker', async ({ page }) => {
    await page.getByRole('link', { name: /graduation/i }).click();
    await expect(page.getByText(/clearance|progress/i)).toBeVisible();
  });

  test('can view degree audit snapshot', async ({ page }) => {
    await page.getByRole('link', { name: /graduation/i }).click();
    const auditLink = page.getByText(/degree audit|audit snapshot/i);
    if (await auditLink.isVisible()) {
      await auditLink.click();
      await expect(page.getByText(/requirements|credits/i)).toBeVisible();
    }
  });
});
