import { test, expect } from '@playwright/test';

test.describe('Kanban Board E2E', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Kanban Board');
  });
});
