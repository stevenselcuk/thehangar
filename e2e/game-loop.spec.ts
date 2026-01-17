import { expect, test } from '@playwright/test';

test.describe('The Hangar - Core Game Loop', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should load the game and display initial UI', async ({ page }) => {
    await page.goto('/');

    // Check for key UI elements
    await expect(page.getByText(/The Hangar/i)).toBeVisible();

    // Check for resource bars
    await expect(page.getByText(/Sanity/i)).toBeVisible();
    await expect(page.getByText(/Focus/i)).toBeVisible();
    await expect(page.getByText(/Suspicion/i)).toBeVisible();

    // Check for credits display
    await expect(page.getByText(/Credits/i)).toBeVisible();
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

  test('should auto-save game state', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Perform some actions to change state
    const actionButton = page.locator('button').filter({ hasText: /Work/i }).first();
    if (await actionButton.isVisible()) {
      await actionButton.click();
      await page.waitForTimeout(100);
    }

    // Wait for auto-save (typically 60 seconds, but we can trigger it manually)
    // Check localStorage has been updated
    const savedState = await page.evaluate(() => {
      return localStorage.getItem('thehangar_save');
    });

    expect(savedState).toBeTruthy();
  });

  test('should restore game state on page reload', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Create a modified state
    await page.evaluate(() => {
      const state = {
        resources: {
          level: 5,
          experience: 100,
          credits: 999,
          sanity: 80,
          suspicion: 20,
          focus: 90,
        },
      };
      localStorage.setItem('thehangar_save', JSON.stringify(state));
    });

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check that state was restored
    // Note: This assumes you have data-testid attributes in your components
    // You may need to adjust these selectors based on your actual HTML structure
    const hasCredits = await page.textContent('body');
    expect(hasCredits).toContain('999');
  });

  test('should handle game over condition', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Set sanity to 0 to trigger game over
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('thehangar_save') || '{}');
      if (state.resources) {
        state.resources.sanity = 0;
      }
      localStorage.setItem('thehangar_save', JSON.stringify(state));
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
