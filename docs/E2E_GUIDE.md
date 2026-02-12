# E2E Testing Guide

This guide explains how to write End-to-End (E2E) tests for *The Hangar*, focusing on simulating realistic player behavior.

## Philosophy

Tests should interact with the game as a player would:
*   Clicking visible buttons.
*   Reading visible text.
*   Waiting for resources (Focus, Cooldowns).
*   Handling game loops (grinding actions).

**Strict Rule:** No direct state manipulation (cheating) allowed in tests (except for initial setup reset).

## Helper Functions

We use helper functions to read game state from the UI:

```typescript
// Get current level from the resource bar
async function getLevel(page: Page): Promise<number> {
  const levelText = await page.locator('text=/LVL \\d+/').textContent();
  // ... parsing logic
}
```

## Progression Testing Roadmap

This section tracks the completion status of E2E progression tests.

- [x] **Level 0-3 (Orientation & Early Game)**
    - **Level 0 -> 1:** Onboarding completion.
    - **Level 1 -> 2:** Toolroom checkout (or Canteen Rummage if tools exhausted).
    - **Level 2 -> 3:** Toolroom/Canteen grinding or Apron Line operations.
    - **Key Actions:** `GET_TOOLROOM_ITEM`, `RUMMAGE_LOST_FOUND`, `MARSHALLING`.
    - **Notes:** Fixed a bug where `RUMMAGE_LOST_FOUND` awarded no XP.

- [ ] **Level 4-10 (Maintenance & Terminal)**
    - Target Actions: `HARVEST_ROTABLE`, `LISTEN_FUSELAGE`.
    - New Tabs: Terminal (Lvl 8).

- [ ] **Level 11-20 (Mid Game)**
    - Target Actions: `ANALYZE_ANOMALY`.
    - New Tabs: Backshops (Lvl 15).

## Writing a Progression Test

1.  **Setup:** Clear `localStorage` and load the game.
2.  **Loop:** Create a `while` loop checking the current level.
3.  **Action:** Inside the loop, check if your target action button is enabled.
    *   If enabled, click it.
    *   If disabled (cooldown/resource), wait (e.g., `page.waitForTimeout`).
4.  **Verification:** Ensure the level increases.

### Example: Grinding Action

```typescript
while (currentLevel < targetLevel) {
    if (await actionBtn.isEnabled()) {
        await actionBtn.click();
        await page.waitForTimeout(100); // UI update delay
    } else {
        // Wait for resource regeneration
        await page.waitForTimeout(1000);
    }
    currentLevel = await getLevel(page);
}
```
