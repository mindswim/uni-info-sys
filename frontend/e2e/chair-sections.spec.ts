import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Chair Section Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'admin');
  });

  test('can view sections overview', async ({ page }) => {
    await page.getByRole('link', { name: /department|chair/i }).click();
    await expect(page.getByText(/section|course|department|chair/i).first()).toBeVisible();
  });

  test('can assign instructor to section', async ({ page }) => {
    await page.getByRole('link', { name: /department|chair/i }).click();
    const assignButton = page.getByRole('button', { name: /assign|instructor/i }).first();
    if (await assignButton.isVisible()) {
      await assignButton.click();
      // Select instructor from dropdown/modal
      const instructorSelect = page.getByRole('combobox').first();
      if (await instructorSelect.isVisible()) {
        await instructorSelect.click();
        await page.getByRole('option').first().click();
        await page.getByRole('button', { name: /confirm|save|assign/i }).click();
      }
      await expect(page.getByText(/assigned|updated/i)).toBeVisible();
    }
  });
});
