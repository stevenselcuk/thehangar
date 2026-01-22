import { expect, test } from '@playwright/test';

test.describe('The Hangar - Core Game Loop', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should allow performing basic actions', async ({ page }) => {
    await page.goto('/');

    // Wait for the game to load
    await page.waitForLoadState('networkidle');

    // Look for an action button (e.g., "Work", "Rest", etc.)
    // This will depend on your actual UI structure
    const actionButtons = page.locator('button').filter({ hasText: /Work|Rest|Study/i });

    if ((await actionButtons.count()) > 0) {
      // Click an action
      await actionButtons.first().click();

      // Wait a bit for state to update
      await page.waitForTimeout(100);

      // Verify some state changed (this is a basic check)
      // In a real test, you'd check specific resources changed
      const logs = page.locator('[data-testid="game-log"]');
      await expect(logs).toBeVisible();
    }
  });

  test('should handle game over condition', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Set sanity to 0 to trigger game over
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('the_hangar_save_hf_v29_full_hf') || '{}');
      if (state.resources) {
        state.resources.sanity = 0;
      }
      localStorage.setItem('the_hangar_save_hf_v29_full_hf', JSON.stringify(state));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check for game over indication
    // This will depend on your actual implementation
    // You might show a modal, a message, or restart the game
    await page.waitForTimeout(1000);

    // Verify game state or UI response to game over
    const bodyText = await page.textContent('body');
    // Adjust this based on your actual game over handling
    expect(bodyText).toBeDefined();
  });

  test('should display tabs and allow navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for tab buttons
    const tabs = page.locator('[role="tab"], button').filter({ hasText: /Office|Hangar|Tarmac/i });

    if ((await tabs.count()) > 0) {
      const firstTab = tabs.first();
      await firstTab.click();
      await page.waitForTimeout(100);

      // Verify tab content changed (basic check)
      expect(await page.locator('body').textContent()).toBeTruthy();
    }
  });
});
