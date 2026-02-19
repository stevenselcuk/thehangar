import { expect, Page, test } from '@playwright/test';

// Helper to get current level from UI
async function getLevel(page: Page): Promise<number> {
  const levelText = await page.locator('text=/LVL \\d+/').textContent();
  if (!levelText) throw new Error('Level indicator not found');
  // text is "LVL X"
  const match = levelText.match(/LVL (\d+)/);
  if (!match) throw new Error(`Could not parse level from text: ${levelText}`);
  return parseInt(match[1], 10);
}

test.describe('Progression Level 0 to 3', () => {
  test.beforeEach(async ({ page }) => {
    // Clear state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should progress from Level 0 to Level 3', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes timeout for leveling up

    await page.goto('/');

    // --- ONBOARDING ---
    console.log('Starting Onboarding...');

    // 1. NDA
    await expect(page.locator('text=FORM NDA-7B')).toBeVisible();
    await page.fill('input[placeholder="Type your name..."]', 'Test Player');
    await page.click('button:has-text("[ ACKNOWLEDGE & SIGN ]")');

    // 2. Offer
    await expect(page.locator('text=OFFER OF EMPLOYMENT')).toBeVisible({ timeout: 10000 });
    await page.fill('input[placeholder="Type your name to accept..."]', 'Test Player');
    await page.click('button:has-text("[ ACCEPT OFFER ]")');

    // 3. ID Card
    await expect(page.locator('text=ID CARD GENERATION')).toBeVisible();
    await page.fill('input[placeholder="Your initials here..."]', 'TP');
    await page.click('button:has-text("[ PRINT ID CARD ]")');

    // 4. Complete
    // Text is animated with Matrix effect, so we wait for the button which appears after animations.
    const beginBtn = page.locator('button:has-text("[ BEGIN SHIFT ]")');
    await expect(beginBtn).toBeVisible({ timeout: 20000 });
    await beginBtn.click();

    // Check we are in game. Initial state starts at Level 1.
    // Level 0 is technically the onboarding phase.
    await expect(page.locator('text=LVL 1')).toBeVisible();
    console.log('Onboarding Complete. Started at Level 1.');

    // --- LEVEL 1 -> 2 ---
    // Goal: 1000 XP
    // Action: Toolroom Check Out (Toolroom)
    // Unlock Toolroom tab

    // There are mobile and desktop buttons, so we grab the first visible one
    const toolroomTab = page.locator('button:has-text("TOOLROOM")').first();
    await expect(toolroomTab).toBeVisible();
    await toolroomTab.click();

    // Find a check out button.
    // Verify we are in Toolroom
    await expect(page.locator('text=Master Toolroom Control')).toBeVisible();

    // Button label is "Check Out"
    // Note: There might be multiple. Any one works.
    const checkoutBtns = page.locator('button:has-text("Check Out")');
    // Ensure at least one button is present and visible/enabled before loop
    const checkoutBtn = checkoutBtns.first();
    await expect(checkoutBtn).toBeVisible();
    await expect(checkoutBtn).toBeEnabled();

    let currentLevel = await getLevel(page);
    while (currentLevel < 2) {
      // Try to click Check Out
      try {
        await checkoutBtn.click({ timeout: 2000 });
      } catch {
        console.log('Click failed or timed out. Checking state...');
        const count = await page.locator('button:has-text("Check Out")').count();
        console.log(`Remaining Check Out buttons: ${count}`);
        if (count === 0) {
          console.log('No buttons left! Breaking loop.');
          break;
        }
        // Retry
        continue;
      }

      currentLevel = await getLevel(page);
      const xpText = await page.locator('text=/LVL \\d+/').textContent(); // approximate
      console.log(`Current Status: ${xpText}`);
    }
    console.log('Loop finished. Level:', currentLevel);

    // Fallback to Canteen if Level 2 not reached (ran out of tools)
    if (currentLevel < 2) {
      console.log('Falling back to Canteen for remaining XP...');

      // Check if Canteen tab is available before clicking
      const canteenTab = page.locator('button:has-text("CANTEEN")').first();
      await expect(canteenTab).toBeVisible({ timeout: 5000 });
      await canteenTab.click();

      // "Inspect Vending Machine" is missing.
      // We fixed "Rummage in Lost & Found" to give XP. It is safer than Talking (Sanity+).
      const rummageBtn = page.locator('button:has-text("Rummage in Lost & Found")');

      // Wait for the button to appear in case of render delay
      await expect(rummageBtn).toBeVisible({ timeout: 5000 });

      while (currentLevel < 2) {
        if (await rummageBtn.isDisabled()) {
          const dead = await page.locator('text=SYSTEM FAILURE').count();
          if (dead > 0) throw new Error('Died during Level 1 grind');

          console.log('Waiting for Focus...');
          await page.waitForTimeout(1500); // Shorter wait to be more responsive
          continue;
        }

        // Ensure element is stable before clicking to avoid detachment errors
        try {
          await rummageBtn.click({ timeout: 2000 });
          console.log('Clicked Rummage');
        } catch {
          // Retry loop will handle it
          console.log('Click Rummage failed');
          await page.waitForTimeout(500);
          continue;
        }

        await page.waitForTimeout(200); // Slightly longer wait for state update
        currentLevel = await getLevel(page);
        console.log(`Canteen Loop: Level ${currentLevel}`);
      }
    }
    console.log('Reached Level 2!');

    // --- LEVEL 2 -> 3 ---
    // Goal: 1500 XP
    // Action: Continue Toolroom or Apron Line

    // We stay in Toolroom if it works, as it's most efficient for the test run time.
    // But let's verify Apron Line is unlocked to satisfy "Levels unlocked" requirement check.
    const apronTab = page.locator('button:has-text("APRON")').first();
    await expect(apronTab).toBeVisible();

    // Determine strategy: Toolroom is 0 cost. Apron Line "Marshalling" is 15 cost.
    // Since Toolroom might be empty, we use Apron Line (unlocked at Level 2).
    await apronTab.click();
    await page.waitForTimeout(500);

    const marshalBtn = page.locator('button:has-text("Marshal Aircraft")').first();
    // Wait for it to be visible
    await expect(marshalBtn).toBeVisible();

    currentLevel = await getLevel(page);
    while (currentLevel < 3) {
      if (await marshalBtn.isDisabled()) {
        console.log('Marshalling disabled (Focus?), switching to Canteen...');
        const canteenTab = page.locator('button:has-text("CANTEEN")').first();
        await canteenTab.click();

        const rummageBtn = page.locator('button:has-text("Rummage in Lost & Found")');
        while (currentLevel < 3) {
          if (await rummageBtn.isDisabled()) {
            await page.waitForTimeout(1000);
            continue;
          }
          try {
            await rummageBtn.click({ timeout: 2000 });
          } catch {
            continue;
          }
          currentLevel = await getLevel(page);
        }
        break;
      }

      await marshalBtn.click();
      currentLevel = await getLevel(page);
    }
    console.log('Reached Level 3!');

    // Assert final state
    await expect(page.locator('text=LVL 3')).toBeVisible();
  });
});
