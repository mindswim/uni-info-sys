import { Page } from '@playwright/test';

export const personas = {
  admin: 'Dr.',
  student: 'Maria',
  enrolledStudent: 'David',
  waitlistedStudent: 'Sophie',
};

export async function login(page: Page, persona: keyof typeof personas) {
  const firstName = personas[persona];
  await page.goto('/auth/login');
  await page.getByRole('button', { name: new RegExp(`Login as ${firstName}`, 'i') }).click();
  // After login, the app redirects to the root page (not /dashboard)
  await page.waitForURL((url) => !url.pathname.includes('/auth/'), { timeout: 15000 });
}
