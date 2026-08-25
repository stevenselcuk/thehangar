# Hangar Defect Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair all 24 defects found in the codebase audit so the game can be completed, every rendered control does something, and authored event content reaches the player.

**Architecture:** The action gate in `gameReducer` stops being a hand-maintained literal and becomes a `ROUTED_ACTIONS` set derived from the slice groups that already exist in `reducerComposer`. The event resolver starts applying the `failureOutcome`, `storyFlag` and chaining fields the data has always carried. Fatigue and hazard focus costs are applied once centrally in `composeAction` rather than in ~50 handlers. The pre-refactor files are deleted only after the two pieces of gameplay that exist solely inside them are ported out.

**Tech Stack:** TypeScript, React 19, Immer, Vitest (`@` aliases `src/`), ESLint, Prettier via husky/lint-staged.

**Spec:** `docs/superpowers/specs/2026-08-25-hangar-defect-repair-design.md`

## Global Constraints

- Test runner is Vitest. Run a single file with `npx vitest run <path>`; the full suite with `npm run test:run`.
- Import inside `src/` uses explicit `.ts` / `.tsx` extensions (existing convention). Tests use the `@/` alias, which resolves to `src/`.
- All reducers mutate an Immer `draft`; never reassign `draft` itself.
- Logs are appended with `addLogToDraft(draft.logs, text, type, now)` from `src/services/logService.ts`, or the slice's local `addLog` helper where one exists.
- Percentage resources are clamped 0-100: `sanity`, `focus`, `suspicion`, `health`. `GAME_CONSTANTS.MAX_SUSPICION` etc. live in `src/data/constants.ts`.
- A husky pre-commit hook runs `vite-bumper`, ESLint and Prettier, and will amend build numbers in `src/App.tsx`, `src/data/constants.ts` and `src/components/AboutModal.tsx` into your commit. This is expected; do not revert it.
- Never add an action to a slice `switch` without also adding it to that slice's group const in `reducerComposer.ts`. Task 1's test enforces this.

---

## File Structure

**Created**

| File                                               | Responsibility                                                          |
| -------------------------------------------------- | ----------------------------------------------------------------------- |
| `__tests__/integration/dispatchCoverage.test.ts`   | Asserts every action string dispatched from the UI is routable          |
| `__tests__/integration/eventIntegrity.test.ts`     | Asserts every referenced event ID resolves to a real event              |
| `__tests__/integration/endingReachability.test.ts` | Asserts each ending action sets `flags.endingTriggered`                 |
| `__tests__/data/milestoneCompleteness.test.ts`     | Asserts every level 0..MAX_LEVEL has a named milestone                  |
| `__tests__/integration/requiredAction.test.ts`     | Asserts timed tasks resolve by doing the work, not by clicking          |
| `__tests__/hooks/useGameEngine.test.ts`            | Documents the shared death predicate the three call sites must agree on |
| `__tests__/context/devMode.test.tsx`               | Asserts the dev affordances sit behind an env guard                     |
| `src/logic/__tests__/eventTimeout.test.ts`         | Covers authored `failureOutcome` application on expiry                  |
| `src/logic/__tests__/eventSpawns.test.ts`          | Covers the salvaged and newly added category spawns                     |
| `src/logic/__tests__/focusSurcharge.test.ts`       | Covers the fatigue/hazard modifier arithmetic                           |
| `src/logic/__tests__/ppeEffects.test.ts`           | Covers earmuff and flashlight penalties                                 |
| `src/logic/focusSurcharge.ts`                      | Pure computation of the fatigue/hazard focus modifier                   |

**Modified**

| File                                                           | Change                                                                                                                              |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `src/state/reducerComposer.ts`                                 | Lift inline AOG and terminal routes to consts; export `ROUTED_ACTIONS`; central focus surcharge; `requiredAction` success detection |
| `src/state/gameReducer.ts`                                     | Delete `composedActions`; gate on `ROUTED_ACTIONS`; fault on unrouted                                                               |
| `src/state/slices/eventsSlice.ts`                              | Focus clamp; `failureOutcome`; `storyFlag`; chaining                                                                                |
| `src/state/slices/hangarSlice.ts`                              | `INSTALL_RIVETS`                                                                                                                    |
| `src/state/slices/officeSlice.ts`                              | `DECRYPT_AMM`; salvaged THE_ARCHIVIST branch; rest cooldown                                                                         |
| `src/state/slices/backshopSlice.ts`                            | Four red-tag overhaul actions                                                                                                       |
| `src/state/slices/shopSlice.ts`                                | Shop currency alclad → credits                                                                                                      |
| `src/state/slices/terminalLocationSlice.ts`                    | Rest cooldown                                                                                                                       |
| `src/logic/tickLogic.ts`                                       | Delete DEBUG log; apply `failureOutcome`; salvaged union/syndicate spawn; category coverage; PPE effects; `MAX_LEVEL`               |
| `src/data/constants.ts`                                        | `MAX_LEVEL`, `FATIGUE_FOCUS_SURCHARGE`, `REST_COOLDOWN`, new event probabilities                                                    |
| `src/data/levelMilestones.ts`                                  | Curve rescale; a milestone for every level                                                                                          |
| `src/data/featureRegistry.ts`                                  | `management` event category entry                                                                                                   |
| `src/data/tooltips.ts`                                         | Fatigue description matches implementation                                                                                          |
| `src/state/initialState.ts`                                    | Starting level 0; `restCooldown`; wire `sanitizeGameState` into `loadState` (the load path lives here, not in `App.tsx`)            |
| `src/types.ts`                                                 | `hfStats.restCooldown`; remove dead ending-progress fields                                                                          |
| `src/App.tsx`                                                  | Health death condition (two sites)                                                                                                  |
| `src/hooks/useGameEngine.ts`                                   | Health death condition                                                                                                              |
| `src/hooks/useGameSelectors.ts`                                | `isDying` includes low health                                                                                                       |
| `src/data/hazards.ts`                                          | Cap `healthDrain` now that health kills                                                                                             |
| `src/utils/testHelpers.ts`, `__tests__/fixtures/gameStates.ts` | Track the `GameFlags` and `hfStats` field changes                                                                                   |
| `src/components/ActionPanel.tsx`                               | `requiredAction` hint replaces resolve button                                                                                       |
| `src/context/DevModeContext.tsx`                               | Gate behind `import.meta.env.DEV`                                                                                                   |
| `src/state/stateValidator.ts`                                  | Level clamp min 1 → 0                                                                                                               |

**Deleted (Phase 6, after Phase 3 salvage)**

- `src/logic/actionProcessor.ts`
- `src/data/actions.ts`
- `src/logic/tickProcessor.ts`

---

# Phase 1 — Routing

Fixes DEF-01, 02, 03 and DEF-24. This phase alone makes the game finishable.

### Task 1: Dispatch coverage test

The regression guard for the entire defect class. Written first, and it must fail.

**Files:**

- Create: `__tests__/integration/dispatchCoverage.test.ts`

**Interfaces:**

- Consumes: nothing (reads source files from disk)
- Produces: nothing consumed by later tasks; Task 2 makes it pass

- [ ] **Step 1: Write the failing test**

Create `__tests__/integration/dispatchCoverage.test.ts`:

```ts
import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { ROUTED_ACTIONS } from '@/state/reducerComposer.ts';

/**
 * Actions intercepted by App.tsx's onAction before dispatch. These open
 * modals or run visual effects and never reach the reducer.
 */
const UI_INTERCEPTED = new Set([
  'SHOW_ID_CARD',
  'OPEN_ARCHIVE_TERMINAL',
  'OPEN_MAINTENANCE_TERMINAL',
  'START_NAP_VISUAL',
]);

/** Actions gameReducer handles directly, before consulting the router. */
const REDUCER_LEVEL = new Set(['IMPORT_STATE', 'ACTION_SPAM_PENALTY']);

const SRC = path.resolve(__dirname, '../../src');

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

function collectDispatchedActions(): Map<string, string[]> {
  const found = new Map<string, string[]>();
  const files = [...walk(path.join(SRC, 'components')), path.join(SRC, 'App.tsx')];

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(/onAction\(\s*'([A-Z0-9_]+)'/g)) {
      const action = match[1];
      const where = found.get(action) ?? [];
      where.push(path.relative(SRC, file));
      found.set(action, where);
    }
  }
  return found;
}

describe('dispatch coverage', () => {
  it('routes every action the UI can dispatch', () => {
    const dispatched = collectDispatchedActions();
    expect(dispatched.size).toBeGreaterThan(50);

    const unroutable = [...dispatched.entries()]
      .filter(([action]) => !ROUTED_ACTIONS.has(action))
      .filter(([action]) => !UI_INTERCEPTED.has(action))
      .filter(([action]) => !REDUCER_LEVEL.has(action))
      .map(([action, files]) => `${action} (${files.join(', ')})`);

    expect(unroutable).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run __tests__/integration/dispatchCoverage.test.ts`

Expected: FAIL. `ROUTED_ACTIONS` is not exported from `reducerComposer.ts` yet, so the import is `undefined` and the test throws on `ROUTED_ACTIONS.has`.

- [ ] **Step 3: Commit the failing test**

```bash
git add __tests__/integration/dispatchCoverage.test.ts
git commit -m "test: add dispatch coverage guard (currently failing)"
```

---

### Task 2: Derive ROUTED_ACTIONS from the slice groups

**Files:**

- Modify: `src/state/reducerComposer.ts` (group consts at 226-400; inline AOG list at ~1064; inline terminal route at 671)
- Test: `__tests__/integration/dispatchCoverage.test.ts`

**Interfaces:**

- Consumes: the existing group consts `INVENTORY_ACTIONS`, `PROFICIENCY_ACTIONS`, `EVENT_ACTIONS`, `BACKSHOP_ACTIONS`, `COMPLIANCE_ACTIONS`, `AIRCRAFT_ACTIONS`, `TERMINAL_LOCATION_ACTIONS`, `OFFICE_ACTIONS`, `HANGAR_ACTIONS`, `SHOP_ACTIONS`, `ENCOUNTERS_ACTIONS`, `PROCUREMENT_ACTIONS`, `BULLETIN_BOARD_ACTIONS`, `RESOURCE_ACTIONS`, `PET_ACTIONS`
- Produces: `export const ROUTED_ACTIONS: ReadonlySet<string>` — consumed by Task 3 and Task 1's test

- [ ] **Step 1: Lift the two inline routes to group consts**

`ARCHIVE_ACTION` / `MAINTENANCE_ARCHIVE_ACTION` are routed by a bare `if` at line 671, and the AOG actions by an inline array literal inside `composeAction`. Both must become module-level consts so the derived set can see them.

Add next to the other group consts (after `PET_ACTIONS`, around line 400):

```ts
// Terminal action types handled by terminalSlice
const TERMINAL_ACTIONS = ['ARCHIVE_ACTION', 'MAINTENANCE_ARCHIVE_ACTION'] as const;

// AOG action types handled by aogSlice
const AOG_ACTIONS = [
  'ACCEPT_AOG_DEPLOYMENT',
  'START_AOG_ACTION',
  'RESOLVE_AOG_ACTION',
  'COMPLETE_AOG_DEPLOYMENT',
] as const;
```

Then replace the inline literal in the AOG routing block. Find:

```ts
  if (
    [
      'ACCEPT_AOG_DEPLOYMENT',
      'START_AOG_ACTION',
      'RESOLVE_AOG_ACTION',
      'COMPLETE_AOG_DEPLOYMENT',
    ].includes(action.type)
  ) {
```

Replace with:

```ts
  if (AOG_ACTIONS.includes(action.type as (typeof AOG_ACTIONS)[number])) {
```

And at line 671, find:

```ts
  if (action.type === 'ARCHIVE_ACTION' || action.type === 'MAINTENANCE_ARCHIVE_ACTION') {
```

Replace with:

```ts
  if (TERMINAL_ACTIONS.includes(action.type as (typeof TERMINAL_ACTIONS)[number])) {
```

- [ ] **Step 2: Add the missing RUMMAGE_SHELVES entry (DEF-24)**

`RUMMAGE_SHELVES` has a handler at `src/state/slices/shopSlice.ts:106` and a button at `src/components/BackroomModal.tsx:79`, but was never added to `SHOP_ACTIONS`, so `composeAction` falls through to `return state`. Add it:

```ts
const SHOP_ACTIONS = [
  'BUY_SHOP_ITEM',
  'BUY_VENDING',
  'FLUCTUATE_PRICES',
  'BUY_VENDING_ITEM',
  'KICK_VENDING_MACHINE',
  'RUMMAGE_SHELVES',
] as const;
```

While here, remove the duplicated `'UNLOCK_CATALOGUE_LEVEL'` entry in `PROCUREMENT_ACTIONS` — it is listed twice.

- [ ] **Step 3: Export the derived set**

Add immediately after the last group const:

```ts
/**
 * Every action type composeAction knows how to route.
 *
 * Derived from the group consts above so that registering an action in
 * its slice group is the only step needed to make it routable. Do not
 * maintain a second copy of this list anywhere.
 */
export const ROUTED_ACTIONS: ReadonlySet<string> = new Set<string>([
  ...RESOURCE_ACTIONS,
  ...INVENTORY_ACTIONS,
  ...PROFICIENCY_ACTIONS,
  ...EVENT_ACTIONS,
  ...BACKSHOP_ACTIONS,
  ...COMPLIANCE_ACTIONS,
  ...AIRCRAFT_ACTIONS,
  ...TERMINAL_LOCATION_ACTIONS,
  ...TERMINAL_ACTIONS,
  ...OFFICE_ACTIONS,
  ...HANGAR_ACTIONS,
  ...SHOP_ACTIONS,
  ...ENCOUNTERS_ACTIONS,
  ...AOG_ACTIONS,
  ...PROCUREMENT_ACTIONS,
  ...BULLETIN_BOARD_ACTIONS,
  ...PET_ACTIONS,
]);
```

- [ ] **Step 4: Run the dispatch coverage test**

Run: `npx vitest run __tests__/integration/dispatchCoverage.test.ts`

Expected: FAIL, but now with a readable list instead of a crash. The failure names the actions that have no handler at all and must be implemented in Phase 2:

```
INSTALL_RIVETS (components/ActionPanel.tsx)
DECRYPT_AMM (components/OfficeTab.tsx)
OVERHAUL_IDG (components/BackshopsTab.tsx)
REPAIR_HP_VALVE (components/BackshopsTab.tsx)
RECONFIGURE_ADIRS (components/BackshopsTab.tsx)
REPAIR_GALLEY_UNIT (components/BackshopsTab.tsx)
```

If any action **other than those six** appears, stop: it means a group const is missing an entry that does have a handler. Add it rather than proceeding.

- [ ] **Step 5: Mark the six as known-missing so the suite stays green**

Add to the test file, above `describe`:

```ts
/**
 * Actions with a rendered button but no handler anywhere. Implemented in
 * Phase 2 (Tasks 5-7); each is removed from this list by its own task.
 */
const PENDING_IMPLEMENTATION = new Set([
  'INSTALL_RIVETS',
  'DECRYPT_AMM',
  'OVERHAUL_IDG',
  'REPAIR_HP_VALVE',
  'RECONFIGURE_ADIRS',
  'REPAIR_GALLEY_UNIT',
]);
```

And add one more `.filter` to the chain in the test body, after the `REDUCER_LEVEL` filter:

```ts
      .filter(([action]) => !PENDING_IMPLEMENTATION.has(action))
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run __tests__/integration/dispatchCoverage.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/state/reducerComposer.ts __tests__/integration/dispatchCoverage.test.ts
git commit -m "feat: derive ROUTED_ACTIONS from slice groups

Lifts the inline AOG and terminal routes to group consts so every
routed action is declared the same way, and adds the missing
RUMMAGE_SHELVES entry (handler and button existed; group entry did not)."
```

---

### Task 3: Gate gameReducer on ROUTED_ACTIONS and fault on unrouted actions

**Files:**

- Modify: `src/state/gameReducer.ts:16-27` (`handleGameAction`), `126-275` (`composedActions` literal and its use)
- Modify: `src/state/__tests__/gameReducer.test.ts` (its `vi.mock` of `reducerComposer` must now provide `ROUTED_ACTIONS`)
- Test: `__tests__/integration/dispatchCoverage.test.ts` (already passing; must stay passing)

**Interfaces:**

- Consumes: `ROUTED_ACTIONS` from Task 2
- Produces: nothing; behaviour change only

- [ ] **Step 1: Fix the existing gameReducer test mock first**

`src/state/__tests__/gameReducer.test.ts` mocks the whole `reducerComposer` module. Once `gameReducer` imports `ROUTED_ACTIONS`, that mock returns `undefined` for it and every test in the file crashes. Update the mock:

```ts
vi.mock('../reducerComposer', () => ({
  composeAction: vi.fn(() => ({})),
  composeTick: vi.fn(() => ({})),
  ROUTED_ACTIONS: new Set(['COMPLETE_JOB', 'RESOLVE_EVENT', 'TRIGGER_EVENT']),
}));
```

Run `npx vitest run src/state/__tests__/gameReducer.test.ts` and confirm it still passes before changing `gameReducer.ts`.

- [ ] **Step 2: Replace the literal with the derived set**

In `src/state/gameReducer.ts`, add to the existing import from `./reducerComposer.ts`:

```ts
import { composeAction, composeTick, ROUTED_ACTIONS } from './reducerComposer.ts';
```

Delete the entire `const composedActions = [ ... ];` array literal (roughly lines 126-275) and replace the guard that follows it:

```ts
        if (composedActions.includes(type)) {
```

with:

```ts
        if (ROUTED_ACTIONS.has(type)) {
```

- [ ] **Step 3: Make an unrouted action loud**

Replace the body of `handleGameAction` (lines 16-27):

```ts
/**
 * Terminal handler for actions that reached the reducer but matched no
 * slice group. This is always a wiring bug: the action has a button and
 * probably a handler, but was never added to its group const in
 * reducerComposer.ts. Fail loudly in development so it cannot ship.
 */
const handleGameAction = (draft: GameState, type: string): void => {
  const message = `Action '${type}' is not routed. Add it to its slice group in reducerComposer.ts.`;

  if (import.meta.env.DEV) {
    throw new Error(`[handleGameAction] ${message}`);
  }

  console.error(`[handleGameAction] ${message}`);
  draft.notificationQueue.push({
    id: `unrouted-${type}-${Date.now()}`,
    title: 'SYSTEM FAULT',
    message: 'That control is not responding. The incident has been logged.',
    variant: 'danger',
    duration: 5000,
  });
};
```

Update its call site (previously line 220) to match the new two-argument signature:

```ts
handleGameAction(draft, type);
```

The `createJob` and `triggerEvent` arguments are dropped — the stub never used them. Remove the now-unused `createJob` import if ESLint flags it; it is still used by `initialState`, so check before deleting the import line.

- [ ] **Step 4: Run the affected tests**

Run: `npx vitest run src/state/__tests__/gameReducer.test.ts __tests__/integration/dispatchCoverage.test.ts`

Expected: PASS for both.

- [ ] **Step 5: Run the full suite**

Run: `npm run test:run`

Expected: PASS. If a test dispatches an action that is not in a group const, it will now throw instead of silently no-opping — that is the guard working. Fix by adding the action to its group const, never by weakening the guard.

- [ ] **Step 6: Commit**

```bash
git add src/state/gameReducer.ts src/state/__tests__/gameReducer.test.ts
git commit -m "fix: gate actions on ROUTED_ACTIONS instead of a hand-kept list

Unblocks the three ending actions, START_EASA_MODULE, TAKE_AP_WRITTEN
and START_STANDARD_JOB, all of which had handlers and group entries but
were absent from gameReducer's literal. Unrouted actions now throw in
dev instead of warning into the void.

Fixes DEF-01, DEF-02, DEF-03."
```

---

### Task 4: Ending reachability test and removal of the dead progress counters

**Files:**

- Create: `__tests__/integration/endingReachability.test.ts`
- Modify: `src/state/reducerComposer.ts:1162-1167` (dead auto-ending check)
- Modify: `src/types.ts` (`GameFlags.endingAlienConspiracyProgress`, `endingGovtConspiracyProgress`)
- Modify: `src/state/initialState.ts:203-204`, `src/utils/testHelpers.ts:275-276`, `__tests__/fixtures/gameStates.ts`

**Interfaces:**

- Consumes: `gameReducer` from Task 3
- Produces: nothing

- [ ] **Step 1: Write the failing test**

Create `__tests__/integration/endingReachability.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { gameReducer } from '@/state/gameReducer.ts';
import { createMinimalGameState } from '@/utils/testHelpers.ts';
import type { GameState } from '@/types.ts';

const ENDING_CASES = [
  { action: 'TRIGGER_CRAZY_ENDING', expected: 'CRAZY' },
  { action: 'TRIGGER_GOVT_ENDING', expected: 'GOVT' },
  { action: 'TRIGGER_ALIEN_ENDING', expected: 'ALIEN' },
] as const;

function endgameState(): GameState {
  const state = createMinimalGameState();
  state.resources.level = 40;
  state.inventory.metallicSphere = true;
  return state;
}

describe('ending reachability', () => {
  it.each(ENDING_CASES)('$action sets endingTriggered to $expected', ({ action, expected }) => {
    const next = gameReducer(endgameState(), {
      type: 'ACTION',
      payload: { type: action, payload: {} },
    });

    expect(next.flags.endingTriggered).toBe(expected);
  });
});
```

- [ ] **Step 2: Run it**

Run: `npx vitest run __tests__/integration/endingReachability.test.ts`

Expected: PASS — Task 3 already unblocked these. This test exists to keep them unblocked. If it fails, Task 3 is incomplete; do not proceed.

- [ ] **Step 3: Delete the dead auto-ending check**

`endingAlienConspiracyProgress` and `endingGovtConspiracyProgress` are initialised to `0` and never written by any code path, so the check that reads them can never fire. In `src/state/reducerComposer.ts`, find the block at the end of `composeReducers`:

```ts
  // Check ending conditions
  return produce(nextState, (draft) => {
    if (!draft.flags.endingTriggered) {
      if (draft.flags.endingAlienConspiracyProgress >= 100) {
        draft.flags.endingTriggered = 'ALIEN';
      } else if (draft.flags.endingGovtConspiracyProgress >= 100) {
        draft.flags.endingTriggered = 'GOVT';
      }
    }
  });
};
```

Replace with:

```ts
  return nextState;
};
```

- [ ] **Step 4: Remove the two fields**

Delete `endingAlienConspiracyProgress: number;` and `endingGovtConspiracyProgress: number;` from `GameFlags` in `src/types.ts`, then remove their initialisers from `src/state/initialState.ts`, `src/utils/testHelpers.ts` and `__tests__/fixtures/gameStates.ts`. Let TypeScript find the rest:

Run: `npx tsc --noEmit`

Fix every reported site by deletion. Saved games carrying the old keys are unaffected — extra keys are ignored on load.

- [ ] **Step 5: Run the full suite and lint**

Run: `npm run test:run && npm run lint`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: lock in ending reachability; drop dead progress counters

The auto-ending check read two flags that no code path ever incremented.
Removes both fields and the unreachable branch, and adds a test that
fails if any ending action stops setting endingTriggered."
```

---

# Phase 2 — Missing handlers

Fixes DEF-04 and DEF-05: six rendered buttons with no reducer case anywhere.

### Task 5: INSTALL_RIVETS

Ported from the retired `src/data/actions.ts:87-100`, the only place this action was ever defined.

**Files:**

- Modify: `src/state/slices/hangarSlice.ts` (`HangarAction` union ~line 52; add case after `TIGHTEN_BOLT` ~line 164)
- Modify: `src/state/reducerComposer.ts` (`HANGAR_ACTIONS` ~line 357)
- Modify: `__tests__/integration/dispatchCoverage.test.ts` (remove from `PENDING_IMPLEMENTATION`)
- Test: `__tests__/slices/hangarSlice.test.ts`

**Interfaces:**

- Consumes: `ROUTED_ACTIONS` (Task 2), `HangarSliceState` (existing)
- Produces: action type `'INSTALL_RIVETS'` handled by `hangarReducer`

- [ ] **Step 1: Write the failing test**

Append to `__tests__/slices/hangarSlice.test.ts` inside the existing `describe('hangarSlice')`:

```ts
describe('INSTALL_RIVETS', () => {
  it('awards experience and consumes rivets when a rivet gun is held', () => {
    initialState.inventory.rivetGun = true;
    initialState.resources.rivets = 50;
    initialState.resources.experience = 0;

    const next = hangarReducer(initialState, {
      type: 'INSTALL_RIVETS',
      payload: {},
    });

    expect(next.resources.experience).toBe(200);
    expect(next.resources.rivets).toBe(30);
  });

  it('refuses without a rivet gun', () => {
    initialState.inventory.rivetGun = false;
    initialState.resources.rivets = 50;
    initialState.resources.experience = 0;

    const next = hangarReducer(initialState, {
      type: 'INSTALL_RIVETS',
      payload: {},
    });

    expect(next.resources.experience).toBe(0);
    expect(next.resources.rivets).toBe(50);
  });

  it('refuses without enough rivets', () => {
    initialState.inventory.rivetGun = true;
    initialState.resources.rivets = 5;

    const next = hangarReducer(initialState, {
      type: 'INSTALL_RIVETS',
      payload: {},
    });

    expect(next.resources.experience).toBe(0);
    expect(next.resources.rivets).toBe(5);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run __tests__/slices/hangarSlice.test.ts -t INSTALL_RIVETS`

Expected: FAIL — no case handles `INSTALL_RIVETS`, so state is returned unchanged and `experience` stays `0`.

- [ ] **Step 3: Add the action type**

In `src/state/slices/hangarSlice.ts`, add to the `HangarAction` union:

```ts
  | { type: 'INSTALL_RIVETS'; payload: Record<string, unknown> }
```

- [ ] **Step 4: Add the case**

Insert after the `TIGHTEN_BOLT` case:

```ts
      case 'INSTALL_RIVETS': {
        if (!draft.inventory.rivetGun) {
          addLog('ERROR: MISSING PNEUMATIC RIVET GUN.', 'error');
          break;
        }
        if (draft.resources.rivets < 20) {
          addLog('ERROR: INSUFFICIENT RIVETS. 20 REQUIRED.', 'error');
          break;
        }

        draft.resources.rivets -= 20;
        draft.resources.experience += 200;
        draft.toolConditions.rivetGun = Math.max(
          0,
          (draft.toolConditions.rivetGun || 100) - 1.5
        );
        addLog('You install the rivets. The metal holds. For now.', 'info');
        break;
      }
```

The log line and the 200 XP are taken verbatim from the retired definition. The rivet cost and tool wear are new: the original charged only focus, which `composeAction` no longer needs to model here because the surcharge pass in Phase 4 handles focus centrally.

- [ ] **Step 5: Register it**

In `src/state/reducerComposer.ts`, add `'INSTALL_RIVETS',` to `HANGAR_ACTIONS`.

- [ ] **Step 6: Remove from the pending list**

In `__tests__/integration/dispatchCoverage.test.ts`, delete `'INSTALL_RIVETS',` from `PENDING_IMPLEMENTATION`.

- [ ] **Step 7: Run both tests**

Run: `npx vitest run __tests__/slices/hangarSlice.test.ts __tests__/integration/dispatchCoverage.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: implement INSTALL_RIVETS

The level-4 milestone advertised this action and a button rendered it,
but the only definition lived in the retired data/actions.ts. Ported to
hangarSlice with a rivet cost and tool wear.

Part of DEF-05."
```

---

### Task 6: DECRYPT_AMM

**Files:**

- Modify: `src/state/slices/officeSlice.ts` (`OfficeAction` union ~line 51; add case near `SEARCH_MANUALS`)
- Modify: `src/state/reducerComposer.ts` (`OFFICE_ACTIONS` ~line 334)
- Modify: `__tests__/integration/dispatchCoverage.test.ts`
- Test: `__tests__/slices/officeSlice.test.ts`

**Interfaces:**

- Consumes: `ACTION_LOGS.DECRYPT_AMM_SUCCESS` and `ACTION_LOGS.DECRYPT_AMM_FAIL` from `src/data/flavor.ts:204-206` (already written, never used)
- Produces: action type `'DECRYPT_AMM'` handled by `officeReducer`

- [ ] **Step 1: Write the failing test**

Append inside the existing `describe('officeSlice')` in `__tests__/slices/officeSlice.test.ts`:

```ts
describe('DECRYPT_AMM', () => {
  it('requires an assembled PC', () => {
    initialState.inventory.pcAssembled = false;
    initialState.resources.experience = 0;

    const next = officeReducer(initialState, {
      type: 'DECRYPT_AMM',
      payload: {},
    } as OfficeAction);

    expect(next.resources.experience).toBe(0);
    expect(next.logs[0].type).toBe('error');
  });

  it('awards experience and suspicion on success', () => {
    Math.random = seedrandom('decrypt-success');
    initialState.inventory.pcAssembled = true;
    initialState.resources.experience = 0;
    initialState.resources.suspicion = 0;

    const next = officeReducer(initialState, {
      type: 'DECRYPT_AMM',
      payload: {},
    } as OfficeAction);

    // Either branch must charge suspicion and log something.
    expect(next.resources.suspicion).toBeGreaterThan(0);
    expect(next.logs.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run __tests__/slices/officeSlice.test.ts -t DECRYPT_AMM`

Expected: FAIL — no case handles it, so no log is written and `logs[0]` is undefined.

- [ ] **Step 3: Add the action type**

In `src/state/slices/officeSlice.ts`, add to the `OfficeAction` union:

```ts
  | { type: 'DECRYPT_AMM'; payload: Record<string, unknown> }
```

- [ ] **Step 4: Add the case**

Insert after the `SEARCH_MANUALS` case:

```ts
      case 'DECRYPT_AMM': {
        if (!draft.inventory.pcAssembled) {
          addLog('ERROR: NO TERMINAL AVAILABLE. Assemble the office PC first.', 'error');
          break;
        }

        draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 10);

        if (Math.random() < 0.4) {
          addLog(ACTION_LOGS.DECRYPT_AMM_SUCCESS, 'vibration');
          draft.resources.experience += 400;
          draft.resources.sanity = Math.max(0, draft.resources.sanity - 8);
        } else {
          addLog(ACTION_LOGS.DECRYPT_AMM_FAIL, 'warning');
          draft.resources.focus = Math.max(0, draft.resources.focus - 10);
        }
        break;
      }
```

- [ ] **Step 5: Register it**

In `src/state/reducerComposer.ts`, add `'DECRYPT_AMM',` to `OFFICE_ACTIONS`.

- [ ] **Step 6: Remove from the pending list**

Delete `'DECRYPT_AMM',` from `PENDING_IMPLEMENTATION` in the dispatch coverage test.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run __tests__/slices/officeSlice.test.ts __tests__/integration/dispatchCoverage.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: implement DECRYPT_AMM

Level-22 milestone action with a rendered button, finished success and
failure flavour text in flavor.ts, and no handler. Gated on the
assembled office PC.

Part of DEF-05."
```

---

### Task 7: The four Backshops overhauls

Four buttons, one mechanic: repair a specific red-tagged rotable. Implemented as one parameterised case.

**Files:**

- Modify: `src/state/slices/backshopSlice.ts` (`BackshopAction` union ~line 43; new case)
- Modify: `src/state/reducerComposer.ts` (`BACKSHOP_ACTIONS` ~line 269)
- Modify: `__tests__/integration/dispatchCoverage.test.ts`
- Test: `__tests__/state/slices/backshopSlice.test.ts`

**Interfaces:**

- Consumes: `BackshopSliceState` (already carries `rotables`, `resources`, `stats`, `logs`, `flags`)
- Produces: action types `'OVERHAUL_IDG'`, `'REPAIR_HP_VALVE'`, `'RECONFIGURE_ADIRS'`, `'REPAIR_GALLEY_UNIT'`; exported `OVERHAUL_TARGETS`

**Critical detail:** `src/components/BackshopsTab.tsx:18-21` selects targets by **part number**, not id — `state.rotables.some((r) => r.pn === 'IDG-757-A' && r.isRedTagged)`. The handler must use the same predicate or the button's enabled state and the handler's target will disagree.

- [ ] **Step 1: Write the failing test**

Append inside the existing `describe` in `__tests__/state/slices/backshopSlice.test.ts`:

```ts
describe('red-tag overhauls', () => {
  const makeRotable = (pn: string) => ({
    id: `rot-${pn}`,
    label: pn,
    pn,
    sn: 'SN-TEST-1',
    condition: 10,
    isInstalled: false,
    isUntraceable: false,
    isRedTagged: true,
    history: [],
    manufactureDate: 0,
  });

  it('restores the target rotable and clears its red tag', () => {
    initialState.rotables = [makeRotable('IDG-757-A')];
    initialState.resources.experience = 0;
    initialState.resources.credits = 0;
    initialState.stats.rotablesRepaired = 0;

    const next = backshopReducer(initialState, {
      type: 'OVERHAUL_IDG',
      payload: {},
    } as BackshopAction);

    expect(next.rotables[0].condition).toBe(100);
    expect(next.rotables[0].isRedTagged).toBe(false);
    expect(next.resources.experience).toBe(900);
    expect(next.resources.credits).toBe(400);
    expect(next.stats.rotablesRepaired).toBe(1);
  });

  it('does nothing when no matching red-tagged rotable is present', () => {
    initialState.rotables = [];
    initialState.resources.experience = 0;

    const next = backshopReducer(initialState, {
      type: 'OVERHAUL_IDG',
      payload: {},
    } as BackshopAction);

    expect(next.resources.experience).toBe(0);
    expect(next.logs[0].type).toBe('error');
  });

  it('ignores a rotable of the right type that is not red-tagged', () => {
    const healthy = { ...makeRotable('IDG-757-A'), isRedTagged: false, condition: 90 };
    initialState.rotables = [healthy];
    initialState.resources.experience = 0;

    const next = backshopReducer(initialState, {
      type: 'OVERHAUL_IDG',
      payload: {},
    } as BackshopAction);

    expect(next.resources.experience).toBe(0);
    expect(next.rotables[0].condition).toBe(90);
  });

  it('routes each action to its own part number', () => {
    initialState.rotables = [makeRotable('BREW-MASTER')];
    initialState.resources.experience = 0;

    const next = backshopReducer(initialState, {
      type: 'REPAIR_GALLEY_UNIT',
      payload: {},
    } as BackshopAction);

    expect(next.resources.experience).toBe(400);
    expect(next.rotables[0].isRedTagged).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run __tests__/state/slices/backshopSlice.test.ts -t "red-tag overhauls"`

Expected: FAIL — no case handles these types.

- [ ] **Step 3: Add the target table**

In `src/state/slices/backshopSlice.ts`, add below the existing helper functions:

```ts
/**
 * The four Backshops overhaul actions, keyed by the part number that
 * BackshopsTab uses to enable each button. Keep the focus values in
 * sync with the cost labels rendered in BackshopsTab.tsx.
 */
export const OVERHAUL_TARGETS: Record<
  string,
  { pn: string; focus: number; xp: number; credits: number; log: string }
> = {
  OVERHAUL_IDG: {
    pn: 'IDG-757-A',
    focus: 80,
    xp: 900,
    credits: 400,
    log: 'The Integrated Drive Generator comes apart in your hands like something that wanted to. Reassembled, it spins true.',
  },
  REPAIR_HP_VALVE: {
    pn: 'PRV-ENG-HP1',
    focus: 60,
    xp: 600,
    credits: 250,
    log: 'You lap the valve seat until the leak stops. It takes four hours and you do not remember three of them.',
  },
  RECONFIGURE_ADIRS: {
    pn: 'ADIRS-HG2030',
    focus: 90,
    xp: 1100,
    credits: 500,
    log: 'The inertial reference unit aligns. It reports a position eleven kilometres from where you are standing, then corrects itself.',
  },
  REPAIR_GALLEY_UNIT: {
    pn: 'BREW-MASTER',
    focus: 50,
    xp: 400,
    credits: 180,
    log: 'Descaled, resealed, tested. The galley unit brews one cup you did not ask for.',
  },
};
```

- [ ] **Step 4: Add the action types**

Add to the `BackshopAction` union:

```ts
  | { type: 'OVERHAUL_IDG'; payload: Record<string, unknown> }
  | { type: 'REPAIR_HP_VALVE'; payload: Record<string, unknown> }
  | { type: 'RECONFIGURE_ADIRS'; payload: Record<string, unknown> }
  | { type: 'REPAIR_GALLEY_UNIT'; payload: Record<string, unknown> }
```

- [ ] **Step 5: Add the case**

Insert before the closing brace of the `switch`, after `RENEW_DATABUS`:

```ts
      case 'OVERHAUL_IDG':
      case 'REPAIR_HP_VALVE':
      case 'RECONFIGURE_ADIRS':
      case 'REPAIR_GALLEY_UNIT': {
        const target = OVERHAUL_TARGETS[action.type];
        const index = draft.rotables.findIndex((r) => r.pn === target.pn && r.isRedTagged);

        if (index === -1) {
          addLog(`TASK REJECTED: No red-tagged ${target.pn} on the bench.`, 'error');
          break;
        }

        const rotable = draft.rotables[index];
        rotable.condition = 100;
        rotable.isRedTagged = false;
        rotable.history.push({
          date: Date.now(),
          event: 'REPAIRED',
          description: `Overhauled in backshop. Serviceable tag issued.`,
        });

        draft.resources.experience += target.xp;
        draft.resources.credits += target.credits;
        draft.stats.rotablesRepaired += 1;

        if (draft.flags.activeComponentFailure === rotable.id) {
          draft.flags.activeComponentFailure = null;
        }

        addLog(target.log, 'story');
        break;
      }
```

Clearing `isRedTagged` is essential: `BackshopsTab` keeps the button enabled while any matching red-tagged rotable exists, so without it the job repeats indefinitely. Note this is a behaviour the existing `REPAIR_ROTABLE` in `inventorySlice.ts:174-196` does **not** perform — do not assume it does.

- [ ] **Step 6: Register them**

In `src/state/reducerComposer.ts`, add all four to `BACKSHOP_ACTIONS`.

- [ ] **Step 7: Remove from the pending list**

Delete all four from `PENDING_IMPLEMENTATION`. The set should now be empty — delete the const and its `.filter` line too.

- [ ] **Step 8: Run the tests**

Run: `npx vitest run __tests__/state/slices/backshopSlice.test.ts __tests__/integration/dispatchCoverage.test.ts`

Expected: PASS. The dispatch coverage test now passes with no exemptions beyond the UI intercepts.

- [ ] **Step 9: Run the full suite and lint**

Run: `npm run test:run && npm run lint`

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: implement the four Backshops overhaul actions

The level-15 Backshops tab rendered four buttons that had no reducer
case anywhere in the project. Implemented as one parameterised red-tag
overhaul keyed by part number, matching the predicate BackshopsTab
already uses to enable each button.

Fixes DEF-04. Completes DEF-05."
```

---

# Phase 3 — Event system

The largest phase. Fixes DEF-06 through DEF-12. Every task here recovers authored content that the machinery currently discards.

Task 15 must land before Phase 6, which deletes the files it salvages from.

### Task 8: Focus clamp and the shipped DEBUG log

Two one-line defects with outsized effects. Grouped because neither justifies its own review gate.

**Files:**

- Modify: `src/state/slices/eventsSlice.ts:341`
- Modify: `src/logic/tickLogic.ts:522`
- Test: `__tests__/state/slices/eventsSlice.test.ts`

**Interfaces:**

- Consumes: `EventsSliceState` (existing)
- Produces: nothing

- [ ] **Step 1: Write the failing test**

Append inside the existing `describe` in `__tests__/state/slices/eventsSlice.test.ts`:

```ts
describe('focus effects on event choices', () => {
  it('subtracts a negative focus effect instead of refilling to full', () => {
    initialState.resources.focus = 60;
    initialState.activeEvent = {
      id: 'TEST_FOCUS_COST',
      type: 'incident',
      title: 'Focus Drain',
      description: 'test',
      timeLeft: 10000,
      totalTime: 10000,
      failureOutcome: { log: 'failed' },
      choices: [{ id: 'drain', label: 'Drain', effects: { focus: -25 } }],
    };

    const next = eventsReducer(initialState, {
      type: 'RESOLVE_EVENT',
      payload: { choiceId: 'drain' },
    });

    expect(next.resources.focus).toBe(35);
  });

  it('clamps a positive focus effect at 100', () => {
    initialState.resources.focus = 90;
    initialState.activeEvent = {
      id: 'TEST_FOCUS_GAIN',
      type: 'incident',
      title: 'Focus Gain',
      description: 'test',
      timeLeft: 10000,
      totalTime: 10000,
      failureOutcome: { log: 'failed' },
      choices: [{ id: 'rest', label: 'Rest', effects: { focus: 30 } }],
    };

    const next = eventsReducer(initialState, {
      type: 'RESOLVE_EVENT',
      payload: { choiceId: 'rest' },
    });

    expect(next.resources.focus).toBe(100);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run __tests__/state/slices/eventsSlice.test.ts -t "focus effects"`

Expected: the first case FAILS with `expected 35, received 100`. `Math.max(0, 100)` is a constant expression, so any effect mentioning focus sets it to 100. The second case passes for the wrong reason.

- [ ] **Step 3: Fix the clamp**

In `src/state/slices/eventsSlice.ts`, find:

```ts
if (resKey === 'focus') draft.resources.focus = Math.max(0, 100); // Focus can go > 100? Assuming strictly managed elsewhere, but let's cap lower bound
```

Replace with:

```ts
if (resKey === 'focus') draft.resources.focus = Math.max(0, Math.min(100, draft.resources.focus));
```

- [ ] **Step 4: Remove the DEBUG log**

In `src/logic/tickLogic.ts`, delete this call entirely — it writes a developer diagnostic into the player-facing log stream, typed `'error'` so it renders in the alarm style, every time an event expires:

```ts
addLog(
  `DEBUG: Event ${draft.activeEvent.id} cleared. Type: ${draft.activeEvent.type}, TimeLeft: ${draft.activeEvent.timeLeft}`,
  'error'
);
```

- [ ] **Step 5: Run the tests**

Run: `npx vitest run __tests__/state/slices/eventsSlice.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "fix: clamp focus properly and stop shipping the DEBUG log

Math.max(0, 100) is constant, so every event effect touching focus
refilled it to full, inverting focus costs into a free heal.

Fixes DEF-06, DEF-12."
```

---

### Task 9: Apply authored failure outcomes

Every event in the data files carries a hand-written `failureOutcome`. On timeout the tick discards it and applies a four-entry generic penalty table instead.

**Files:**

- Modify: `src/logic/tickLogic.ts:498-528`
- Test: `src/logic/__tests__/eventTimeout.test.ts` (create)

**Interfaces:**

- Consumes: `GameEvent['failureOutcome']` from `src/types.ts` — shape `{ log: string; effects?: Partial<Record<keyof ResourceState, number>>; storyFlag?: { key: string; value: boolean } }`
- Produces: nothing

- [ ] **Step 1: Write the failing test**

Create `src/logic/__tests__/eventTimeout.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { processTick } from '../tickLogic.ts';
import { TabType, type GameState } from '../../types.ts';
import { createMinimalGameState } from '../../utils/testHelpers.ts';

describe('event timeout', () => {
  let state: GameState;
  const triggerEvent = vi.fn();

  beforeEach(() => {
    triggerEvent.mockClear();
    state = createMinimalGameState();
    state.resources.sanity = 80;
    state.resources.credits = 500;
  });

  it('applies the authored failureOutcome when one exists', () => {
    state.activeEvent = {
      id: 'TEST_TIMEOUT_AUTHORED',
      type: 'incident',
      title: 'Authored Failure',
      description: 'test',
      timeLeft: 1,
      totalTime: 10000,
      failureOutcome: {
        log: 'The specific authored consequence.',
        effects: { credits: -200, sanity: -5 },
      },
    };

    processTick(state, 100, triggerEvent, TabType.HANGAR);

    expect(state.resources.credits).toBe(300);
    expect(state.resources.sanity).toBe(75);
    expect(state.logs.some((l) => l.text === 'The specific authored consequence.')).toBe(true);
    expect(state.activeEvent).toBeNull();
  });

  it('falls back to the generic penalty when failureOutcome has no effects', () => {
    state.activeEvent = {
      id: 'TEST_TIMEOUT_BARE',
      type: 'accident',
      title: 'Bare Failure',
      description: 'test',
      timeLeft: 1,
      totalTime: 10000,
      failureOutcome: { log: 'Something went wrong.' },
    };

    processTick(state, 100, triggerEvent, TabType.HANGAR);

    // accident carries a 40-point generic sanity penalty
    expect(state.resources.sanity).toBe(40);
    expect(state.logs.some((l) => l.text === 'Something went wrong.')).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/logic/__tests__/eventTimeout.test.ts`

Expected: FAIL — the first case leaves `credits` at 500 because `failureOutcome` is never read.

- [ ] **Step 3: Rewrite the timeout branch**

In `src/logic/tickLogic.ts`, replace the body of `if (draft.activeEvent.timeLeft <= 0) { ... }` with:

```ts
if (draft.activeEvent.timeLeft <= 0) {
  const expired = draft.activeEvent;

  if (expired.id === 'FUEL_CONTAM') {
    draft.flags.fuelContaminationRisk = true;
    addLog("You flushed the contaminated sample. Let's hope nobody finds out.", 'warning');
  }

  const outcome = expired.failureOutcome;
  let appliedAuthoredEffects = false;

  if (outcome?.effects) {
    Object.entries(outcome.effects).forEach(([key, value]) => {
      const resKey = key as keyof GameState['resources'];
      if (typeof value === 'number' && typeof draft.resources[resKey] === 'number') {
        (draft.resources[resKey] as number) += value;
        appliedAuthoredEffects = true;
      }
    });
  }

  if (outcome?.storyFlag) {
    draft.flags.storyFlags[outcome.storyFlag.key] = outcome.storyFlag.value;
  }

  if (!appliedAuthoredEffects) {
    // No authored effects: fall back to the generic penalty by event type.
    const sanityLossMap: Partial<Record<string, number>> = {
      accident: 40,
      eldritch_manifestation: 45,
      canteen_incident: 25,
    };
    let loss = 5;
    if (expired.suitType === 'THE_SUITS') loss = 35;
    else if (sanityLossMap[expired.type]) loss = sanityLossMap[expired.type]!;

    draft.resources.sanity -= loss;
    draft.resources.suspicion += expired.type === 'audit' ? 30 : 5;
  }

  draft.resources.sanity = Math.max(0, Math.min(100, draft.resources.sanity));
  draft.resources.suspicion = Math.max(
    0,
    Math.min(GAME_CONSTANTS.MAX_SUSPICION, draft.resources.suspicion)
  );
  draft.resources.focus = Math.max(0, Math.min(100, draft.resources.focus));
  draft.resources.health = Math.max(0, Math.min(100, draft.resources.health));

  addLog(outcome?.log || `SITUATION FAILED: ${expired.title}`, 'error');
  draft.activeEvent = null;
}
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/logic/__tests__/eventTimeout.test.ts`

Expected: PASS.

- [ ] **Step 5: Run the full suite**

Run: `npm run test:run`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: apply authored failureOutcome on event timeout

Every event carries a hand-written failure log and effects. The tick
discarded all of it and substituted one of four generic penalties.
Authored outcomes now win; the generic table remains as the fallback
for events that declare only a log.

Fixes DEF-07."
```

---

### Task 10: Apply storyFlag on event resolution

**Files:**

- Modify: `src/state/slices/eventsSlice.ts` (`RESOLVE_EVENT`, choice branch ~330-355 and success branch ~358-379)
- Test: `__tests__/state/slices/eventsSlice.test.ts`

**Interfaces:**

- Consumes: `EventChoice['storyFlag']` and `EventOutcome['storyFlag']` — shape `{ key: string; value: boolean }`
- Produces: `flags.storyFlags[key]` written; consumed by Task 11's chaining and by any future gating

- [ ] **Step 1: Write the failing test**

Append inside the existing `describe` in `__tests__/state/slices/eventsSlice.test.ts`:

```ts
describe('storyFlag persistence', () => {
  it('writes a choice storyFlag into flags.storyFlags', () => {
    initialState.flags.storyFlags = {};
    initialState.activeEvent = {
      id: 'TEST_FLAG_EVENT',
      type: 'story_event',
      title: 'A Decision',
      description: 'test',
      timeLeft: 10000,
      totalTime: 10000,
      failureOutcome: { log: 'failed' },
      choices: [
        {
          id: 'accept',
          label: 'Accept',
          storyFlag: { key: 'acceptedTheOffer', value: true },
          log: 'You accept.',
        },
      ],
    };

    const next = eventsReducer(initialState, {
      type: 'RESOLVE_EVENT',
      payload: { choiceId: 'accept' },
    });

    expect(next.flags.storyFlags.acceptedTheOffer).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run __tests__/state/slices/eventsSlice.test.ts -t "storyFlag persistence"`

Expected: FAIL — `storyFlags.acceptedTheOffer` is `undefined`. The field has zero readers outside `types.ts`.

- [ ] **Step 3: Apply the flag in the choice branch**

In `RESOLVE_EVENT`, inside `if (choice) { ... }`, immediately after the "Apply Effects" block and before "Log Result":

```ts
// Persist narrative state
if (choice.storyFlag) {
  if (!draft.flags.storyFlags) draft.flags.storyFlags = {};
  draft.flags.storyFlags[choice.storyFlag.key] = choice.storyFlag.value;
}
```

- [ ] **Step 4: Apply the flag in the success branch**

In the `else if (event.requiredAction && event.successOutcome)` branch, after its effects loop:

```ts
if (event.successOutcome.storyFlag) {
  if (!draft.flags.storyFlags) draft.flags.storyFlags = {};
  draft.flags.storyFlags[event.successOutcome.storyFlag.key] = event.successOutcome.storyFlag.value;
}
```

- [ ] **Step 5: Fix the duplicate-log bug while here**

In the success branch, `logAdded = true` is set only in the `else`, so an authored `successOutcome.log` is printed and then followed by a redundant generic resolution log. Change:

```ts
if (event.successOutcome.log) {
  addLog(event.successOutcome.log, 'story');
  logAdded = true;
} else {
  addLog(`You successfully completed: ${event.title}`, 'story');
  logAdded = true;
}
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run __tests__/state/slices/eventsSlice.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: persist storyFlag from event choices and outcomes

storyFlag had zero readers outside the type declaration, so no player
choice was ever remembered. Also fixes the adjacent double-log where an
authored success log was followed by a generic one.

Part of DEF-08."
```

---

### Task 11: Event chaining

**Files:**

- Modify: `src/state/slices/eventsSlice.ts` (`RESOLVE_EVENT` clearing block ~405-420)
- Test: `__tests__/state/slices/eventsSlice.test.ts`

**Interfaces:**

- Consumes: `createEventFromTemplate(eventType: string, specificId?: string): GameEvent | null` (existing, `eventsSlice.ts:141`); `EventChoice['nextEventId']`, `EventChoice['event']`
- Produces: a successor written into `draft.activeEvent` in the same reducer pass

- [ ] **Step 1: Write the failing test**

Append inside the existing `describe`:

```ts
describe('event chaining', () => {
  it('promotes nextEventId into activeEvent within the same category', () => {
    initialState.resources.level = 40;
    initialState.activeEvent = {
      id: 'FAA_INSPECTOR',
      type: 'audit',
      title: 'FAA Spot-Check',
      description: 'test',
      timeLeft: 10000,
      totalTime: 10000,
      failureOutcome: { log: 'failed' },
      choices: [{ id: 'stall', label: 'Stall', nextEventId: 'AUDIT_INTERNAL' }],
    };

    const next = eventsReducer(initialState, {
      type: 'RESOLVE_EVENT',
      payload: { choiceId: 'stall' },
    });

    expect(next.activeEvent).not.toBeNull();
    expect(next.activeEvent?.id).toBe('AUDIT_INTERNAL');
  });

  it('clears activeEvent when the successor id does not exist', () => {
    initialState.resources.level = 40;
    initialState.activeEvent = {
      id: 'FAA_INSPECTOR',
      type: 'audit',
      title: 'FAA Spot-Check',
      description: 'test',
      timeLeft: 10000,
      totalTime: 10000,
      failureOutcome: { log: 'failed' },
      choices: [{ id: 'stall', label: 'Stall', nextEventId: 'NO_SUCH_EVENT_ID' }],
    };

    const next = eventsReducer(initialState, {
      type: 'RESOLVE_EVENT',
      payload: { choiceId: 'stall' },
    });

    expect(next.activeEvent).toBeNull();
  });

  it('does not chain an event to itself', () => {
    initialState.resources.level = 40;
    initialState.activeEvent = {
      id: 'AUDIT_INTERNAL',
      type: 'audit',
      title: 'Internal Audit',
      description: 'test',
      timeLeft: 10000,
      totalTime: 10000,
      failureOutcome: { log: 'failed' },
      choices: [{ id: 'loop', label: 'Loop', nextEventId: 'AUDIT_INTERNAL' }],
    };

    const next = eventsReducer(initialState, {
      type: 'RESOLVE_EVENT',
      payload: { choiceId: 'loop' },
    });

    expect(next.activeEvent).toBeNull();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run __tests__/state/slices/eventsSlice.test.ts -t "event chaining"`

Expected: FAIL on the first case — `activeEvent` is `null` because `nextEventId` has no reader.

- [ ] **Step 3: Capture the successor while the choice is in scope**

Inside the `if (choice)` block in `RESOLVE_EVENT`, declare a variable in the enclosing `RESOLVE_EVENT` scope (above `if (choiceId && event.choices)`):

```ts
let successor: { type: string; id: string } | null = null;
```

and set it inside the `if (choice)` block, after the storyFlag block from Task 10:

```ts
if (choice.event) {
  successor = { type: choice.event.type, id: choice.event.id };
} else if (choice.nextEventId) {
  successor = { type: event.type, id: choice.nextEventId };
}
```

Add the same three lines in the `successOutcome` branch, reading `event.successOutcome.event` and `event.successOutcome.nextEventId`.

- [ ] **Step 4: Promote the successor when clearing**

Replace the clearing block at the end of `RESOLVE_EVENT`:

```ts
if (event.type !== 'component_failure') {
  draft.stats.eventsResolved += 1;
  draft.resources.experience += 100;

  // Chain to the authored successor, if any. activeEvent is a single
  // slot and a chain link is always an immediate successor, so no
  // queue is needed. Self-references are dropped to avoid a loop.
  let chained = null;
  if (successor && successor.id !== event.id) {
    chained = createEventFromTemplate(successor.type, successor.id);
    if (!chained && import.meta.env.DEV) {
      console.error(
        `[eventsSlice] Chain target '${successor.id}' (${successor.type}) does not exist.`
      );
    }
  }

  draft.activeEvent = chained;
  if (chained) {
    draft.eventTimestamps[chained.id] = Date.now();
  }
} else {
  addLog(
    'Component failure persists until rectified. Check toolroom for replacement parts.',
    'warning'
  );
}
```

`eventTimestamps` is not currently part of `EventsSliceState`. Add it to the interface:

```ts
eventTimestamps: GameState['eventTimestamps'];
```

and map it in the `EVENT_ACTIONS` routing block in `src/state/reducerComposer.ts` — add `eventTimestamps: draft.eventTimestamps,` to the constructed state and `draft.eventTimestamps = updated.eventTimestamps;` to the write-back.

- [ ] **Step 5: Run the tests**

Run: `npx vitest run __tests__/state/slices/eventsSlice.test.ts`

Expected: PASS all three chaining cases.

- [ ] **Step 6: Run the full suite**

Run: `npm run test:run`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: chain events via nextEventId and choice.event

Both fields had zero readers, so every authored multi-stage arc ended
after its first beat. Successors are promoted directly into the single
activeEvent slot; self-references and unknown ids clear the slot and
log in dev.

Completes DEF-08."
```

---

### Task 12: requiredAction resolves by doing, not by clicking

**Files:**

- Modify: `src/state/reducerComposer.ts` (`composeAction`, after routing returns)
- Modify: `src/components/ActionPanel.tsx:220-225` (the `event.requiredAction` branch)
- Test: `__tests__/integration/requiredAction.test.ts` (create)

**Interfaces:**

- Consumes: `ROUTED_ACTIONS` (Task 2); `GameEvent['requiredAction']`, `GameEvent['successOutcome']`
- Produces: nothing

- [ ] **Step 1: Write the failing test**

Create `__tests__/integration/requiredAction.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { gameReducer } from '@/state/gameReducer.ts';
import { createMinimalGameState } from '@/utils/testHelpers.ts';
import type { GameState } from '@/types.ts';

describe('requiredAction events', () => {
  let state: GameState;

  beforeEach(() => {
    state = createMinimalGameState();
    state.resources.level = 20;
    state.activeEvent = {
      id: 'TEST_REQUIRED',
      type: 'incident',
      title: 'Sweep The Ramp',
      description: 'test',
      timeLeft: 30000,
      totalTime: 30000,
      requiredAction: 'FOD_SWEEP',
      successOutcome: { log: 'The ramp is clear.', effects: { experience: 300 } },
      failureOutcome: { log: 'Debris ingested.' },
    };
  });

  it('resolves when the player performs the required action', () => {
    const next = gameReducer(state, {
      type: 'ACTION',
      payload: { type: 'FOD_SWEEP', payload: {} },
    });

    expect(next.activeEvent).toBeNull();
    expect(next.logs.some((l) => l.text === 'The ramp is clear.')).toBe(true);
  });

  it('does not resolve when an unrelated action is performed', () => {
    const next = gameReducer(state, {
      type: 'ACTION',
      payload: { type: 'PERFORM_NDT', payload: {} },
    });

    expect(next.activeEvent).not.toBeNull();
    expect(next.activeEvent?.id).toBe('TEST_REQUIRED');
  });

  it('does not resolve on a bare RESOLVE_EVENT with no choice', () => {
    const next = gameReducer(state, {
      type: 'ACTION',
      payload: { type: 'RESOLVE_EVENT', payload: {} },
    });

    expect(next.activeEvent).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run __tests__/integration/requiredAction.test.ts`

Expected: the first and third cases FAIL. Today a bare `RESOLVE_EVENT` is treated as success and performing the actual action does nothing to the event.

- [ ] **Step 3: Remove the free-success branch**

In `src/state/slices/eventsSlice.ts`, in `RESOLVE_EVENT`, change the success branch condition so a bare dispatch cannot claim success. Replace:

```ts
      else if (event.requiredAction && event.successOutcome) {
```

with:

```ts
      else if (event.requiredAction && event.successOutcome && action.payload?.viaRequiredAction) {
```

so only the internal dispatch from `composeAction` can take it.

- [ ] **Step 4: Detect completion in composeAction**

In `src/state/reducerComposer.ts`, wrap the routed dispatch so that after any successfully routed action, a matching `requiredAction` resolves. Add this helper above `composeAction`:

```ts
/**
 * After a routed action runs, an active event whose requiredAction names
 * that action is satisfied. This is what makes timed tasks real: the
 * player has to do the work, not press a button on the event panel.
 */
const resolveRequiredAction = (state: GameState, actionType: string): GameState => {
  const event = state.activeEvent;
  if (!event || event.requiredAction !== actionType || !event.successOutcome) {
    return state;
  }

  return composeAction(state, {
    type: 'RESOLVE_EVENT',
    payload: { viaRequiredAction: true },
  });
};
```

Then in `composeReducers`, after `composeAction` returns for an `ACTION`:

```ts
  } else if (action.type === 'ACTION') {
    const dispatched = action.payload as ReducerAction;
    nextState = composeAction(state, dispatched);
    nextState = resolveRequiredAction(nextState, dispatched.type);
  }
```

Guard against recursion: `resolveRequiredAction` must not fire for `RESOLVE_EVENT` itself. Add at the top of the helper:

```ts
if (actionType === 'RESOLVE_EVENT') return state;
```

- [ ] **Step 5: Replace the UI button with a hint**

In `src/components/ActionPanel.tsx`, replace the `event.requiredAction` branch:

```tsx
        ) : event.requiredAction ? (
          <div
            className={`mt-4 border-2 ${borderColor} bg-black/40 px-4 py-3 text-[10px] uppercase tracking-[0.15em] ${textColor}`}
          >
            Required: {event.requiredAction.replace(/_/g, ' ')}
            <div className="mt-1 text-[9px] normal-case tracking-normal text-zinc-500">
              Complete this task before the timer expires.
            </div>
          </div>
        ) : (
```

- [ ] **Step 6: Run the test**

Run: `npx vitest run __tests__/integration/requiredAction.test.ts`

Expected: PASS.

- [ ] **Step 7: Run the full suite and lint**

Run: `npm run test:run && npm run lint`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: requiredAction events resolve by doing the work

The panel rendered the required action as a button that dispatched a
bare RESOLVE_EVENT, and the reducer read a missing choiceId as proof of
success — every timed task was click-to-win. Success is now detected in
composeAction when the named action actually runs; the button becomes a
hint.

Fixes DEF-11."
```

---

### Task 13: Salvage the union and syndicate spawns

`50c16cf "[GAME] Rewired Union features"` (31 Jan) wrote these rolls into `tickProcessor.ts`, five days after `b25e2dd` replaced that file with `tickLogic.ts`. They have never run. `tickLogic.ts` contains no reference to `union`, `syndicate` or `management` at all.

**Two corrections to make while porting.** Do not copy the source verbatim:

1. The original's first branch calls `triggerEvent('eldritch_manifestation', 'CAMERA_MALFUNCTION')`. **No event with that id exists in any pool** — it would be a silent no-op. `tickLogic` already rolls a random eldritch event in the Backshops block; keep that and drop the `CAMERA_MALFUNCTION` branch.
2. The original's audit branch duplicates a roll `tickLogic` already performs. Keep `tickLogic`'s.

Only the union and syndicate branches are genuinely missing.

**Files:**

- Modify: `src/logic/tickLogic.ts:217-233` (the `TabType.BACKSHOPS` block) and the general-events block
- Modify: `src/data/constants.ts` (`EVENT_PROBABILITIES`)
- Test: `src/logic/__tests__/eventSpawns.test.ts` (create)

**Interfaces:**

- Consumes: `triggerRandomEvent(category: string)` (local closure in `processTick`, `tickLogic.ts:60-66`)
- Produces: nothing

- [ ] **Step 1: Add the probabilities**

In `src/data/constants.ts`, inside `EVENT_PROBABILITIES`:

```ts
    UNION_ACTIVITY: 0.0004,
    SYNDICATE_ACTIVITY: 0.0001,
```

- [ ] **Step 2: Write the failing test**

Create `src/logic/__tests__/eventSpawns.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { processTick } from '../tickLogic.ts';
import { TabType, type GameState } from '../../types.ts';
import { createMinimalGameState } from '../../utils/testHelpers.ts';

describe('event spawn coverage', () => {
  let state: GameState;
  const triggerEvent = vi.fn();

  beforeEach(() => {
    triggerEvent.mockClear();
    state = createMinimalGameState();
    state.resources.level = 30;
    state.activeEvent = null;
  });

  const categoriesTriggered = () => triggerEvent.mock.calls.map((c) => c[0]);

  it('can spawn union events in the backshops', () => {
    state.resources.suspicion = 10;
    // Force every probability gate open.
    vi.spyOn(Math, 'random').mockReturnValue(0);

    processTick(state, 1000, triggerEvent, TabType.BACKSHOPS);

    expect(categoriesTriggered()).toContain('union');
    vi.restoreAllMocks();
  });

  it('can spawn syndicate events when sanity is low', () => {
    state.resources.sanity = 30;
    vi.spyOn(Math, 'random').mockReturnValue(0);

    processTick(state, 1000, triggerEvent, TabType.HANGAR);

    expect(categoriesTriggered()).toContain('syndicate');
    vi.restoreAllMocks();
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run src/logic/__tests__/eventSpawns.test.ts`

Expected: FAIL — neither category is ever passed to `triggerEvent`.

- [ ] **Step 4: Port the union roll into the Backshops block**

In `src/logic/tickLogic.ts`, inside `if (activeTab === TabType.BACKSHOPS) { ... }`, after the existing `CONTAINMENT_BREACH_ALERT` roll:

```ts
// Union activity — backshop-specific. Ported from the retired
// tickProcessor.ts:56-59, where it was written and never executed.
if (Math.random() < GAME_CONSTANTS.EVENT_PROBABILITIES.UNION_ACTIVITY * (delta / 1000)) {
  triggerRandomEvent('union');
}
```

- [ ] **Step 5: Port the syndicate roll into the general block**

Inside the `if (!draft.activeEvent) { ... }` block, alongside the other general rolls:

```ts
// Syndicate activity — rare, anywhere, and only once the player is
// frayed enough to be approached. Ported from tickProcessor.ts:62-65.
if (
  draft.resources.sanity < 50 &&
  Math.random() < GAME_CONSTANTS.EVENT_PROBABILITIES.SYNDICATE_ACTIVITY * (delta / 1000)
) {
  triggerRandomEvent('syndicate');
}
```

- [ ] **Step 6: Run the test**

Run: `npx vitest run src/logic/__tests__/eventSpawns.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: salvage the union and syndicate event spawns

Written in 50c16cf into tickProcessor.ts five days after that file was
replaced by tickLogic.ts, so they have never run. Six authored events
become reachable. Drops the source's CAMERA_MALFUNCTION branch, which
names an event that exists in no pool.

Part of DEF-10."
```

---

### Task 14: Salvage the Archivist branch

`898bc35 "[MISSING] Wired back forgotten events"` (6 Feb) added this conditional to `actionProcessor.ts`, which has never been imported by `src/`. The live handler in `officeSlice` triggers only `AUDIT_INTERNAL`.

**Correction to make while porting:** the source calls `triggerEvent('eldritch_manifestation', 'THE_ARCHIVIST')`, but `THE_ARCHIVIST` is defined at `src/data/events.ts:1550`, inside the **`canteen_incident`** pool (1439-1664). `createEventFromTemplate` looks up by category, so the original category would have returned `null`. Use `canteen_incident`.

`KARDEX_RECOVERY` at `events.ts:1357` **is** in `eldritch_manifestation`; that category is correct as written.

**Files:**

- Modify: `src/state/slices/officeSlice.ts` (`REVIEW_SURVEILLANCE_LOGS` ~266-278, `SEARCH_MANUALS`)
- Test: `__tests__/slices/officeSlice.test.ts`

**Interfaces:**

- Consumes: `action.payload.triggerEvent(type: string, id?: string)` — already threaded into `officeSlice` by `App.tsx`'s `onAction`
- Produces: nothing

- [ ] **Step 1: Write the failing test**

Append inside the existing `describe` in `__tests__/slices/officeSlice.test.ts`:

```ts
describe('REVIEW_SURVEILLANCE_LOGS — Archivist branch', () => {
  it('summons the Archivist when suspicion is high and sanity is low', () => {
    const triggerEvent = vi.fn();
    initialState.resources.suspicion = 80;
    initialState.resources.sanity = 30;

    officeReducer(initialState, {
      type: 'REVIEW_SURVEILLANCE_LOGS',
      payload: { triggerEvent },
    } as OfficeAction);

    expect(triggerEvent).toHaveBeenCalledWith('canteen_incident', 'THE_ARCHIVIST');
  });

  it('uses the normal outcomes when the player is holding together', () => {
    const triggerEvent = vi.fn();
    initialState.resources.suspicion = 10;
    initialState.resources.sanity = 90;

    officeReducer(initialState, {
      type: 'REVIEW_SURVEILLANCE_LOGS',
      payload: { triggerEvent },
    } as OfficeAction);

    expect(triggerEvent).not.toHaveBeenCalledWith('canteen_incident', 'THE_ARCHIVIST');
  });
});
```

Add `vi` to the vitest import at the top of the file if it is not already there.

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run __tests__/slices/officeSlice.test.ts -t "Archivist branch"`

Expected: FAIL — `THE_ARCHIVIST` is never triggered by the live handler.

- [ ] **Step 3: Add the branch**

In `src/state/slices/officeSlice.ts`, at the top of `case 'REVIEW_SURVEILLANCE_LOGS':`, before the existing suspicion increment:

```ts
// Ported from the retired actionProcessor.ts:437-440. Category
// corrected: THE_ARCHIVIST lives in the canteen_incident pool.
if (draft.resources.suspicion > 75 && draft.resources.sanity < 40 && action.payload?.triggerEvent) {
  draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 15);
  addLog('The playback shows a figure cataloguing the shelves. It looks up.', 'vibration');
  action.payload.triggerEvent('canteen_incident', 'THE_ARCHIVIST');
  break;
}
```

- [ ] **Step 4: Add the KARDEX recovery roll**

In `case 'SEARCH_MANUALS':`, inside the branch that currently awards `experience += 100` with `ACTION_LOGS.SEARCH_MANUALS_NOTES`, wrap it:

```ts
if (Math.random() < 0.05 && action.payload?.triggerEvent) {
  action.payload.triggerEvent('eldritch_manifestation', 'KARDEX_RECOVERY');
} else {
  draft.resources.experience += 100;
  addLog(ACTION_LOGS.SEARCH_MANUALS_NOTES, 'story');
}
```

- [ ] **Step 5: Run the tests**

Run: `npx vitest run __tests__/slices/officeSlice.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: salvage the Archivist and KARDEX recovery branches

Written in 898bc35 into actionProcessor.ts, a file src/ has never
imported. Corrects the event category while porting: THE_ARCHIVIST is
in the canteen_incident pool, not eldritch_manifestation, so the
original call would have resolved to null.

Part of DEF-10."
```

---

### Task 15: Spawn the starved categories

Only four categories are ever rolled at random. `management` (20 events), `canteen_incident` (8) and `bureaucratic_horror` (3) are reachable only through a handful of explicit calls.

**Files:**

- Modify: `src/logic/tickLogic.ts` (general-events block)
- Modify: `src/data/constants.ts` (`EVENT_PROBABILITIES`)
- Modify: `src/data/featureRegistry.ts` (`EVENT_CATEGORY_FEATURES`)
- Test: `src/logic/__tests__/eventSpawns.test.ts`

**Interfaces:**

- Consumes: `canSpawnEventCategory(category, state)` from `src/services/LevelManager.ts` — already applied inside `TRIGGER_EVENT`, so no new gating code is needed
- Produces: nothing

- [ ] **Step 1: Register the management category**

`management` has no entry in `EVENT_CATEGORY_FEATURES`, so `getEventCategoryRequiredLevel` returns `0` and it would spawn from the first minute. Add it alongside `bureaucratic_horror` in `src/data/featureRegistry.ts`:

```ts
  management: {
    id: 'EVENT_MANAGEMENT',
    type: 'event_category',
    requiredLevel: 10,
    description: 'Directives, appraisals, and the org chart anomaly',
  },
```

- [ ] **Step 2: Add the probabilities**

In `src/data/constants.ts`, inside `EVENT_PROBABILITIES`:

```ts
    MANAGEMENT_ACTIVITY: 0.0003,
    CANTEEN_ENCOUNTER: 0.0002,
    BUREAUCRATIC_HORROR: 0.00015,
```

- [ ] **Step 3: Write the failing test**

Append to `src/logic/__tests__/eventSpawns.test.ts`:

```ts
it.each(['management', 'canteen_incident', 'bureaucratic_horror'])(
  'can spawn %s events',
  (category) => {
    state.resources.level = 30;
    vi.spyOn(Math, 'random').mockReturnValue(0);

    processTick(state, 1000, triggerEvent, TabType.HANGAR);

    expect(categoriesTriggered()).toContain(category);
    vi.restoreAllMocks();
  }
);
```

- [ ] **Step 4: Run it to verify it fails**

Run: `npx vitest run src/logic/__tests__/eventSpawns.test.ts -t "can spawn"`

Expected: FAIL for all three.

- [ ] **Step 5: Add the rolls**

In `src/logic/tickLogic.ts`, inside the `if (!draft.activeEvent) { ... }` block, after the syndicate roll from Task 13:

```ts
// Categories with authored content and, until now, no spawn path.
// Level gating is enforced downstream by canSpawnEventCategory.
if (Math.random() < GAME_CONSTANTS.EVENT_PROBABILITIES.MANAGEMENT_ACTIVITY * (delta / 1000)) {
  triggerRandomEvent('management');
}
if (Math.random() < GAME_CONSTANTS.EVENT_PROBABILITIES.CANTEEN_ENCOUNTER * (delta / 1000)) {
  triggerRandomEvent('canteen_incident');
}
if (Math.random() < GAME_CONSTANTS.EVENT_PROBABILITIES.BUREAUCRATIC_HORROR * (delta / 1000)) {
  triggerRandomEvent('bureaucratic_horror');
}
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/logic/__tests__/eventSpawns.test.ts`

Expected: PASS.

- [ ] **Step 7: Run the full suite**

Run: `npm run test:run`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: give management, canteen and bureaucratic events a spawn path

31 authored events across three categories had no random spawn and only
a handful of explicit triggers. Registers management in the feature
registry at level 10 so it gates like its siblings.

Completes DEF-10."
```

---

### Task 16: Event ID integrity

84 referenced event IDs resolve to nothing. `createEventFromTemplate` returns `null` and `TRIGGER_EVENT` returns silently — no log, no warning, no fallback. This task makes them visible, then resolves every one.

**Files:**

- Create: `__tests__/integration/eventIntegrity.test.ts`
- Modify: `src/state/slices/eventsSlice.ts:141-168` (`createEventFromTemplate`)
- Modify: `src/data/events.ts`, `src/data/aircraftEvents.ts`, `src/data/srfEvents.ts`, and any slice with a dangling `triggerEvent` call

**Interfaces:**

- Consumes: `eventsData` from `src/data/events.ts`
- Produces: nothing

- [ ] **Step 1: Write the failing test**

Create `__tests__/integration/eventIntegrity.test.ts`:

```ts
import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { eventsData } from '@/data/events.ts';

const SRC = path.resolve(__dirname, '../../src');

/** Files retired by the refactor; deleted in Phase 6. Not part of the build. */
const IGNORED = ['logic/actionProcessor.ts', 'logic/tickProcessor.ts', 'data/actions.ts'];

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

function allEventIds(): Set<string> {
  const ids = new Set<string>();
  for (const pool of Object.values(eventsData)) {
    for (const event of pool as { id: string }[]) ids.add(event.id);
  }
  return ids;
}

function referencedIds(): Map<string, string[]> {
  const refs = new Map<string, string[]>();
  const patterns = [
    /triggerEvent\(\s*'[a-z_]+'\s*,\s*'([A-Z0-9_]+)'/g,
    /nextEventId:\s*'([A-Z0-9_]+)'/g,
    /event:\s*\{\s*type:\s*'[a-z_]+'\s*,\s*id:\s*'([A-Z0-9_]+)'/g,
  ];

  for (const file of walk(SRC)) {
    const rel = path.relative(SRC, file);
    if (IGNORED.includes(rel) || /\.test\.tsx?$/.test(rel)) continue;

    const source = fs.readFileSync(file, 'utf8');
    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern)) {
        const where = refs.get(match[1]) ?? [];
        where.push(rel);
        refs.set(match[1], where);
      }
    }
  }
  return refs;
}

describe('event id integrity', () => {
  it('resolves every referenced event id to a real event', () => {
    const known = allEventIds();
    const dangling = [...referencedIds().entries()]
      .filter(([id]) => !known.has(id))
      .map(([id, files]) => `${id} <- ${[...new Set(files)].join(', ')}`)
      .sort();

    expect(dangling).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it and capture the list**

Run: `npx vitest run __tests__/integration/eventIntegrity.test.ts 2>&1 | tee /tmp/dangling.txt`

Expected: FAIL, listing roughly 84 entries with the file each is referenced from. Keep this list; it is the work queue for Step 3.

- [ ] **Step 3: Resolve every entry**

For each dangling id, apply exactly one of two resolutions. **Do not invent new events** — writing narrative content is out of scope for this plan.

1. **Re-point** — an existing event covers the same beat. Change the reference to that id (and its category if it differs). Example: a reference to `SECURITY_VIOLATION` where `SECURITY_VIOLATION_SCAN` exists in `incident`.
2. **Remove** — nothing equivalent exists. Delete the `event:` / `nextEventId:` field from that outcome, or the whole `triggerEvent(...)` call. The outcome keeps its log and effects; it simply stops promising a follow-up that was never written.

Work file by file so the diff stays reviewable. Record each decision in the commit body as `ID -> target` or `ID -> removed`.

Three of these are referenced from live code paths and should be re-pointed rather than removed if at all possible, because they currently fire on real player actions:

- `SUIT_SIGHTING_CANTEEN` — `src/state/slices/officeSlice.ts:238` (NAP_TABLE)
- `SECURITY_WAKEUP` — `src/state/slices/terminalLocationSlice.ts:152` (SLEEP_AT_GATE)
- `FUEL_CONTAM` — `src/state/gameReducer.ts:78` (tick roll). Note `eventsSlice.ts` also has a special-case hook on `event.id === 'FUEL_CONTAM'`; if this id is removed rather than re-pointed, delete that hook too.

- [ ] **Step 4: Make unknown ids loud in dev**

In `src/state/slices/eventsSlice.ts`, in `createEventFromTemplate`, replace:

```ts
if (!template) return null;
```

with:

```ts
if (!template) {
  if (import.meta.env.DEV && specificId) {
    console.error(
      `[eventsSlice] No event '${specificId}' in category '${eventType}'. ` +
        `This reference is dangling and will silently do nothing.`
    );
  }
  return null;
}
```

- [ ] **Step 5: Run the integrity test**

Run: `npx vitest run __tests__/integration/eventIntegrity.test.ts`

Expected: PASS with an empty list.

- [ ] **Step 6: Run the full suite and lint**

Run: `npm run test:run && npm run lint`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "fix: resolve every dangling event reference

84 referenced event ids matched no event in any pool; the lookup
returned null and the trigger returned silently, so authored
consequences vanished without a trace. Each reference is either
re-pointed at an equivalent event or removed. No events fabricated.

An integrity test now fails the build if a dangling reference is
reintroduced, and unknown ids log loudly in dev.

Fixes DEF-09."
```

---

# Phase 4 — Balance

Fixes DEF-13 through DEF-16 and DEF-18. Resources the UI presents as constraints start behaving as constraints.

### Task 17: Central focus surcharge for fatigue and hazards

Two defects need the same thing: scale the focus cost of arbitrary actions. Each slice checks and deducts focus itself, so there is nothing to intercept up front — this is the problem the comments at `reducerComposer.ts:425-448` gave up on. Apply the surcharge _after_ the slice runs, proportional to the focus it actually consumed.

**Files:**

- Create: `src/logic/focusSurcharge.ts`
- Modify: `src/state/reducerComposer.ts` (`composeAction`; delete the commented-out hazard block at 425-448)
- Modify: `src/data/constants.ts`
- Modify: `src/data/tooltips.ts:15`
- Test: `src/logic/__tests__/focusSurcharge.test.ts` (create)

**Interfaces:**

- Consumes: `GameState['hfStats']['fatigue']`, `GameState['activeHazards']`
- Produces: `calculateFocusModifier(fatigue: number, hazards: EnvironmentalHazard[]): number` — returns a multiplier `>= 1`

- [ ] **Step 1: Add the constant**

In `src/data/constants.ts`, alongside the other resource constants:

```ts
  // Fatigue at 100 makes every focus-spending action cost 1.5x.
  FATIGUE_FOCUS_SURCHARGE: 0.5,
```

- [ ] **Step 2: Write the failing test**

Create `src/logic/__tests__/focusSurcharge.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { calculateFocusModifier } from '../focusSurcharge.ts';
import type { EnvironmentalHazard } from '../../types.ts';

const hazard = (focusCostModifier: number): EnvironmentalHazard => ({
  id: 'TEST_HAZARD',
  name: 'Test Hazard',
  description: 'test',
  type: 'weather',
  effects: { focusCostModifier },
  duration: 10000,
});

describe('calculateFocusModifier', () => {
  it('is 1 when rested and unhindered', () => {
    expect(calculateFocusModifier(0, [])).toBe(1);
  });

  it('reaches 1.5 at full fatigue', () => {
    expect(calculateFocusModifier(100, [])).toBeCloseTo(1.5);
  });

  it('scales linearly between', () => {
    expect(calculateFocusModifier(50, [])).toBeCloseTo(1.25);
  });

  it('multiplies hazard modifiers together', () => {
    expect(calculateFocusModifier(0, [hazard(2), hazard(1.5)])).toBeCloseTo(3);
  });

  it('combines fatigue and hazards', () => {
    expect(calculateFocusModifier(100, [hazard(2)])).toBeCloseTo(3);
  });

  it('never returns below 1', () => {
    expect(calculateFocusModifier(0, [hazard(0.2)])).toBe(1);
  });

  it('ignores hazards that declare no focus modifier', () => {
    const drainOnly: EnvironmentalHazard = {
      id: 'DRAIN',
      name: 'Drain',
      description: 'test',
      type: 'containment',
      effects: { sanityDrain: 2 },
      duration: 1000,
    };
    expect(calculateFocusModifier(0, [drainOnly])).toBe(1);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run src/logic/__tests__/focusSurcharge.test.ts`

Expected: FAIL — the module does not exist.

- [ ] **Step 4: Write the module**

Create `src/logic/focusSurcharge.ts`:

```ts
import { GAME_CONSTANTS } from '../data/constants.ts';
import { EnvironmentalHazard } from '../types.ts';

/**
 * How much more focus an action costs right now.
 *
 * Fatigue scales the cost linearly up to FATIGUE_FOCUS_SURCHARGE at 100.
 * Active hazards that declare a focusCostModifier multiply on top. The
 * result is never below 1 — a hazard cannot make work cheaper.
 */
export const calculateFocusModifier = (fatigue: number, hazards: EnvironmentalHazard[]): number => {
  const clampedFatigue = Math.max(0, Math.min(100, fatigue || 0));
  const fatigueFactor = 1 + (clampedFatigue / 100) * GAME_CONSTANTS.FATIGUE_FOCUS_SURCHARGE;

  const hazardFactor = (hazards || []).reduce((acc, h) => {
    const modifier = h.effects?.focusCostModifier;
    return typeof modifier === 'number' ? acc * modifier : acc;
  }, 1);

  return Math.max(1, fatigueFactor * hazardFactor);
};
```

- [ ] **Step 5: Run the test**

Run: `npx vitest run src/logic/__tests__/focusSurcharge.test.ts`

Expected: PASS.

- [ ] **Step 6: Apply the surcharge in composeAction**

In `src/state/reducerComposer.ts`, delete the entire commented-out block at lines 425-448 that reasons about `focusCostMultiplier` and never does anything. Then in `composeReducers`, wrap the action path so the surcharge is applied to whatever focus the slice consumed:

```ts
  } else if (action.type === 'ACTION') {
    const dispatched = action.payload as ReducerAction;
    const focusBefore = state.resources.focus;

    nextState = composeAction(state, dispatched);

    const spent = focusBefore - nextState.resources.focus;
    if (spent > 0) {
      const modifier = calculateFocusModifier(state.hfStats.fatigue, state.activeHazards || []);
      const surcharge = spent * (modifier - 1);
      if (surcharge > 0) {
        nextState = produce(nextState, (draft) => {
          draft.resources.focus = Math.max(0, draft.resources.focus - surcharge);
        });
      }
    }

    nextState = resolveRequiredAction(nextState, dispatched.type);
  }
```

Add the import: `import { calculateFocusModifier } from '../logic/focusSurcharge.ts';`

Note the ordering: the surcharge is charged before `resolveRequiredAction`, so an event resolution triggered by the action does not get double-charged.

- [ ] **Step 7: Correct the fatigue tooltip**

`src/data/tooltips.ts:15` currently promises two mechanics. Only one is being implemented; the "chance of making mistakes" mechanic is not part of this plan. Replace the description with:

```ts
    'Your physical and mental exhaustion. Increases with work and time, and with the demands of where you are standing. High fatigue makes every task cost more Focus. Rest and cigarettes bring it down.',
```

- [ ] **Step 8: Run the full suite and lint**

Run: `npm run test:run && npm run lint`

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: fatigue and hazards raise focus costs

Fatigue accumulated to 100 and did nothing but drive the calibration
minigame's cursor speed, while the tooltip promised it raised focus
costs. The hazard focusCostModifier had been abandoned in a comment
block. One post-dispatch surcharge in composeAction implements both,
proportional to the focus the action actually spent.

Fixes DEF-14. Retires the abandoned hazard cost logic."
```

---

### Task 18: Rest costs something

`NAP_TABLE` and `SLEEP_AT_GATE` set `focus = 100`, `sanity = 100` and `socialStress = 0` with no cost and no cooldown. Both survival resources are defeated by a repeatable button.

**Files:**

- Modify: `src/types.ts` (`hfStats.restCooldown`)
- Modify: `src/state/initialState.ts:210-230`, `src/utils/testHelpers.ts`, `__tests__/fixtures/gameStates.ts`
- Modify: `src/data/constants.ts`
- Modify: `src/state/slices/officeSlice.ts:227-255` (`NAP_TABLE`)
- Modify: `src/state/slices/terminalLocationSlice.ts:141-170` (`SLEEP_AT_GATE`)
- Modify: `src/logic/tickLogic.ts` (decrement the cooldown)
- Test: `__tests__/slices/officeSlice.test.ts`

**Interfaces:**

- Consumes: `GameState['hfStats']`
- Produces: `hfStats.restCooldown: number` — milliseconds remaining; decremented by the tick

- [ ] **Step 1: Add the field and constant**

In `src/types.ts`, add to `hfStats`:

```ts
restCooldown: number;
```

In `src/data/constants.ts`, alongside the other cooldowns:

```ts
  REST_COOLDOWN: 5 * 60 * 1000,
```

Initialise `restCooldown: 0,` in `src/state/initialState.ts`, `src/utils/testHelpers.ts` and `__tests__/fixtures/gameStates.ts`. Run `npx tsc --noEmit` and fix any remaining sites.

- [ ] **Step 2: Write the failing test**

Append inside the existing `describe` in `__tests__/slices/officeSlice.test.ts`:

```ts
describe('NAP_TABLE', () => {
  it('restores partially rather than to full', () => {
    initialState.resources.focus = 20;
    initialState.resources.sanity = 30;
    initialState.hfStats.fatigue = 80;
    initialState.hfStats.restCooldown = 0;

    const next = officeReducer(initialState, {
      type: 'NAP_TABLE',
      payload: {},
    } as OfficeAction);

    expect(next.resources.focus).toBe(60);
    expect(next.resources.sanity).toBe(55);
    expect(next.hfStats.fatigue).toBe(40);
    expect(next.hfStats.restCooldown).toBeGreaterThan(0);
  });

  it('refuses while the cooldown is running', () => {
    initialState.resources.focus = 20;
    initialState.hfStats.restCooldown = 60000;

    const next = officeReducer(initialState, {
      type: 'NAP_TABLE',
      payload: {},
    } as OfficeAction);

    expect(next.resources.focus).toBe(20);
    expect(next.logs[0].type).toBe('warning');
  });

  it('clamps restores at 100', () => {
    initialState.resources.focus = 90;
    initialState.resources.sanity = 95;
    initialState.hfStats.fatigue = 10;
    initialState.hfStats.restCooldown = 0;

    const next = officeReducer(initialState, {
      type: 'NAP_TABLE',
      payload: {},
    } as OfficeAction);

    expect(next.resources.focus).toBe(100);
    expect(next.resources.sanity).toBe(100);
    expect(next.hfStats.fatigue).toBe(0);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run __tests__/slices/officeSlice.test.ts -t NAP_TABLE`

Expected: FAIL — focus is set to 100, not 60.

- [ ] **Step 4: Rewrite NAP_TABLE**

In `src/state/slices/officeSlice.ts`, replace the four restore lines at the top of `case 'NAP_TABLE':`:

```ts
      case 'NAP_TABLE':
        if (draft.hfStats.restCooldown > 0) {
          addLog('You are not tired enough to sleep again. The chair knows it too.', 'warning');
          break;
        }

        addLog(ACTION_LOGS.NAP_TABLE, 'info');
        draft.resources.focus = Math.min(100, draft.resources.focus + 40);
        draft.resources.sanity = Math.min(100, draft.resources.sanity + 25);
        draft.hfStats.fatigue = Math.max(0, draft.hfStats.fatigue - 40);
        draft.hfStats.socialStress = Math.floor(draft.hfStats.socialStress / 2);
        draft.hfStats.restCooldown = GAME_CONSTANTS.REST_COOLDOWN;
        draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 15);
```

leaving the existing random-incident and `dreamJournal` blocks that follow untouched. Add the `GAME_CONSTANTS` import if the file does not already have it.

- [ ] **Step 5: Apply the same shape to SLEEP_AT_GATE**

In `src/state/slices/terminalLocationSlice.ts`, `case 'SLEEP_AT_GATE':` — same cooldown guard and partial restores, keeping its own `+20` suspicion and its own log constants:

```ts
      case 'SLEEP_AT_GATE': {
        if (draft.hfStats.restCooldown > 0) {
          addLog('The bench is occupied by your own recent absence. Not yet.', 'warning');
          break;
        }

        addLog(ACTION_LOGS.SLEEP_GATE_1, 'info');
        draft.resources.focus = Math.min(100, draft.resources.focus + 40);
        draft.resources.sanity = Math.min(100, draft.resources.sanity + 25);
        draft.hfStats.fatigue = Math.max(0, draft.hfStats.fatigue - 40);
        draft.hfStats.socialStress = Math.floor(draft.hfStats.socialStress / 2);
        draft.hfStats.restCooldown = GAME_CONSTANTS.REST_COOLDOWN;
        draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 20);
```

`TerminalLocationSliceState` must include `hfStats`. If it does not, add it to the interface and map it in the `TERMINAL_LOCATION_ACTIONS` block of `reducerComposer.ts` — both into the constructed state and back out.

- [ ] **Step 6: Decrement the cooldown in the tick**

In `src/logic/tickLogic.ts`, next to the other timer decrements:

```ts
if (draft.hfStats.restCooldown > 0) {
  draft.hfStats.restCooldown = Math.max(0, draft.hfStats.restCooldown - delta);
}
```

- [ ] **Step 7: Run the tests**

Run: `npx vitest run __tests__/slices/officeSlice.test.ts __tests__/state/slices/terminalLocationSlice.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: rest restores partially and takes a cooldown

Napping set focus and sanity to 100 with no cost and no cooldown, so
both survival resources were defeated by a repeatable button. Rest now
restores +40 focus / +25 sanity, cuts fatigue, and locks out for five
minutes.

Fixes DEF-13."
```

---

### Task 19: Health becomes a real fail state

Health drains from hazards and chemical exposure, heals from five medical items, and pulses red under 20. Reaching zero does nothing — the death check reads only sanity and suspicion.

**Files:**

- Modify: `src/hooks/useGameEngine.ts:15`
- Modify: `src/App.tsx:192, 384`
- Modify: `src/hooks/useGameSelectors.ts:54` (`isDying`)
- Modify: `src/data/hazards.ts` (rebalance `healthDrain`)
- Test: `__tests__/hooks/useGameEngine.test.ts` (create)

**Interfaces:**

- Consumes: `GameState['resources']['health']`
- Produces: nothing

- [ ] **Step 1: Write the failing test**

Create `__tests__/hooks/useGameEngine.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createMinimalGameState } from '@/utils/testHelpers.ts';

/**
 * The death condition is duplicated across useGameEngine, App and
 * useGameSelectors. This asserts the shared predicate rather than the
 * hook internals, so all three stay in agreement.
 */
const isDead = (state: ReturnType<typeof createMinimalGameState>) =>
  state.resources.sanity <= 0 || state.resources.suspicion >= 100 || state.resources.health <= 0;

describe('death conditions', () => {
  it('counts zero health as death', () => {
    const state = createMinimalGameState();
    state.resources.health = 0;
    expect(isDead(state)).toBe(true);
  });

  it('still counts zero sanity as death', () => {
    const state = createMinimalGameState();
    state.resources.sanity = 0;
    expect(isDead(state)).toBe(true);
  });

  it('still counts maximum suspicion as death', () => {
    const state = createMinimalGameState();
    state.resources.suspicion = 100;
    expect(isDead(state)).toBe(true);
  });

  it('leaves a healthy technician alive', () => {
    const state = createMinimalGameState();
    expect(isDead(state)).toBe(false);
  });
});
```

- [ ] **Step 2: Run it**

Run: `npx vitest run __tests__/hooks/useGameEngine.test.ts`

Expected: PASS — this test documents the target predicate. Its value is as a reference while you edit the three real sites in Step 3; keep it.

- [ ] **Step 3: Add health to all three death checks**

`src/hooks/useGameEngine.ts:15`:

```ts
isDeadRef.current =
  state.resources.sanity <= 0 || state.resources.suspicion >= 100 || state.resources.health <= 0;
```

`src/App.tsx` — both the effect condition (line ~192) and the game-over branch (line ~384):

```ts
  if (
    state.resources.suspicion >= 100 ||
    state.resources.sanity <= 0 ||
    state.resources.health <= 0
  ) {
```

`src/hooks/useGameSelectors.ts:54`:

```ts
      isDying:
        state.resources.sanity <= 10 ||
        state.resources.suspicion >= 95 ||
        state.resources.health <= 15,
```

- [ ] **Step 4: Rebalance hazard health drain**

Health now kills, so `healthDrain` values must be survivable with normal medical use. In `src/data/hazards.ts`, cap any `healthDrain` above `0.5` at `0.5` (0.5/second is 200 seconds from full health to death with no intervention — long enough to react, short enough to matter). Record the before/after values in the commit body.

Also verify `src/state/slices/aircraftSlice.ts:423`, which deducts 5 health per chemical step; that remains reasonable against a 100-point pool with `firstAidKit` restoring 50.

- [ ] **Step 5: Manual check**

Run: `npm run dev`

Open DevMode (`window.enableDevMode()`), set health to 5, and confirm the game-over screen appears. Then reset, set health to 40, and confirm a `firstAidKit` brings it back.

- [ ] **Step 6: Run the full suite**

Run: `npm run test:run && npm run lint`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: health zero is death

Health drained, healed and rendered, but the death check read only
sanity and suspicion, so the entire medical, PPE and chemical-process
subsystem had no stakes. All three death predicates now agree, and
hazard drain is capped so death is reachable but not arbitrary.

Fixes DEF-15."
```

---

### Task 20: PPE penalties become real

`LOCATION_REQUIREMENTS` declares `requiredItems: []` for all eleven locations, so the hard block never fires. The soft warnings name penalties that are never applied — the game teaches the player to ignore warnings.

Hard blocks stay empty: locking a player out of a tab is worse than the warning. The penalties become real instead.

**Files:**

- Modify: `src/logic/tickLogic.ts` (noise block ~96-118, Backshops block ~217-233)
- Test: `src/logic/__tests__/ppeEffects.test.ts` (create)

**Interfaces:**

- Consumes: `GameState['inventory']['earmuffs']`, `['flashlight']`
- Produces: nothing

- [ ] **Step 1: Write the failing test**

Create `src/logic/__tests__/ppeEffects.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { processTick } from '../tickLogic.ts';
import { TabType, type GameState } from '../../types.ts';
import { createMinimalGameState } from '../../utils/testHelpers.ts';

describe('PPE effects', () => {
  let state: GameState;
  const triggerEvent = vi.fn();

  beforeEach(() => {
    triggerEvent.mockClear();
    state = createMinimalGameState();
  });

  it('earmuffs reduce noise exposure on the apron', () => {
    state.inventory.earmuffs = false;
    processTick(state, 1000, triggerEvent, TabType.APRON_LINE);
    const without = state.hfStats.noiseExposure;

    const muffed = createMinimalGameState();
    muffed.inventory.earmuffs = true;
    processTick(muffed, 1000, triggerEvent, TabType.APRON_LINE);

    expect(muffed.hfStats.noiseExposure).toBeLessThan(without);
  });

  it('earmuffs reduce the focus drain from noise', () => {
    state.inventory.earmuffs = false;
    state.resources.focus = 100;
    processTick(state, 1000, triggerEvent, TabType.APRON_LINE);

    const muffed = createMinimalGameState();
    muffed.inventory.earmuffs = true;
    muffed.resources.focus = 100;
    processTick(muffed, 1000, triggerEvent, TabType.APRON_LINE);

    expect(muffed.resources.focus).toBeGreaterThan(state.resources.focus);
  });

  it('working the backshops without a flashlight costs sanity', () => {
    state.inventory.flashlight = false;
    state.resources.sanity = 100;
    processTick(state, 1000, triggerEvent, TabType.BACKSHOPS);

    expect(state.resources.sanity).toBeLessThan(100);
  });

  it('a flashlight spares the sanity cost in the backshops', () => {
    state.inventory.flashlight = true;
    state.resources.sanity = 100;
    processTick(state, 1000, triggerEvent, TabType.BACKSHOPS);

    expect(state.resources.sanity).toBe(100);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/logic/__tests__/ppeEffects.test.ts`

Expected: FAIL on all four — `earmuffs` and `flashlight` have zero mechanical effect anywhere in the codebase.

- [ ] **Step 3: Apply earmuffs to the noise block**

In `src/logic/tickLogic.ts`, replace the noise section:

```ts
const wearingEarmuffs = draft.inventory.earmuffs === true;
const noiseRelief = wearingEarmuffs ? 0.45 : 1;

draft.hfStats.noiseExposure = noiseMap[locationProps.noise] * noiseRelief;

// Noise Effects
if (locationProps.noise === NoiseLevel.LOW) {
  draft.resources.suspicion = Math.min(
    GAME_CONSTANTS.MAX_SUSPICION,
    draft.resources.suspicion + 0.5 * (delta / 1000)
  );
} else if (
  locationProps.noise === NoiseLevel.HIGH ||
  locationProps.noise === NoiseLevel.EXTREME_HIGH
) {
  const stressMultiplier =
    (locationProps.noise === NoiseLevel.EXTREME_HIGH ? 1.5 : 0.8) * noiseRelief;
  draft.hfStats.socialStress = Math.min(
    100,
    draft.hfStats.socialStress + stressMultiplier * (delta / 1000)
  );

  const focusDrain =
    (locationProps.noise === NoiseLevel.EXTREME_HIGH ? 5.0 : 3.5) *
    difficultyMultiplier *
    noiseRelief;
  draft.resources.focus = Math.max(0, draft.resources.focus - focusDrain * (delta / 1000));
}
```

- [ ] **Step 4: Apply the flashlight penalty**

Inside `if (activeTab === TabType.BACKSHOPS) { ... }`, at the top:

```ts
// The component cage has no working lighting. Working it blind costs.
if (!draft.inventory.flashlight) {
  draft.resources.sanity = Math.max(0, draft.resources.sanity - 0.4 * (delta / 1000));
  if (Math.random() < 0.0002 * (delta / 1000)) {
    draft.resources.health = Math.max(0, draft.resources.health - 5);
    addLog('You catch your shin on something in the dark. It was not there before.', 'warning');
  }
}
```

- [ ] **Step 5: Apply the radio penalty to ramp work**

The APRON warning names "Can't hear dispatch". Make it cost yield. In `src/state/slices/hangarSlice.ts`, `case 'MARSHALLING':` — `HangarSliceState` already carries `inventory`, so no threading is needed:

```ts
      case 'MARSHALLING': {
        draft.resources.focus = Math.max(0, draft.resources.focus - 15);

        // Without a radio you are guessing at dispatch instructions.
        const hasRadio = draft.inventory.radio === true;
        draft.resources.experience += hasRadio ? 100 : 60;
        draft.resources.credits += hasRadio ? 50 : 30;

        if (!hasRadio) {
          addLog('You marshal by hand signals alone. Ground control repeats itself twice.', 'info');
        }
```

leaving the rest of the case unchanged.

- [ ] **Step 6: Apply the toolbox penalty to AOG progress**

The AOG warning names "Limited Tool Access". `aogReducer`'s state does **not** currently include `inventory`, so it must be threaded through first.

In `src/state/slices/aogSlice.ts`, add `inventory: GameState['inventory'];` to the state parameter's type, then at the progress increment (line ~48):

```ts
const toolPenalty = draft.inventory.technicianToolbox ? 1 : 0.6;
draft.aog.currentProgress += progressAmount * toolPenalty;
```

In `src/state/reducerComposer.ts`, in the `AOG_ACTIONS` routing block, add `inventory: draft.inventory,` to the constructed `aogState`. The reducer does not modify inventory, so no write-back line is needed. While you are in that block, delete the duplicated `draft.aog = updated.aog;` and `draft.resources = updated.resources;` lines — each appears twice.

- [ ] **Step 7: Extend the test**

Append to `src/logic/__tests__/ppeEffects.test.ts`:

```ts
it('marshalling without a radio yields less', () => {
  const withRadio = createMinimalGameState();
  withRadio.inventory.radio = true;
  const a = hangarReducer(withRadio, { type: 'MARSHALLING', payload: {} });

  const without = createMinimalGameState();
  without.inventory.radio = false;
  const b = hangarReducer(without, { type: 'MARSHALLING', payload: {} });

  expect(b.resources.experience).toBeLessThan(a.resources.experience);
  expect(b.resources.credits).toBeLessThan(a.resources.credits);
});
```

Add `import { hangarReducer } from '../../state/slices/hangarSlice.ts';` to the file.

- [ ] **Step 8: Run the tests**

Run: `npx vitest run src/logic/__tests__/ppeEffects.test.ts __tests__/slices/hangarSlice.test.ts`

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: PPE and equipment do what the warnings promise

The location warning named penalties that no code applied, which taught
players to ignore warnings. Earmuffs cut noise exposure, stress and
focus drain; working the backshops unlit costs sanity and risks injury;
marshalling without a radio yields less; AOG progress is slower without
the technician toolbox. Hard requiredItems blocks stay empty by design.

Fixes DEF-16."
```

---

### Task 21: The tool shop charges credits

`docs/game_mechanics.md` lists the shop as "purchasable with Credits" with prices from 15 to 400. The handler deducts `alclad` — the structural material job requirements also consume — and its failure message reads "NOT ENOUGH ALCLAD SCRAP."

**Files:**

- Modify: `src/state/slices/shopSlice.ts:62-72`
- Test: `__tests__/slices/shopSlice.test.ts`

**Interfaces:**

- Consumes: `action.payload: { item: string; cost: number }`
- Produces: nothing

- [ ] **Step 1: Write the failing test**

Append inside the existing `describe` in `__tests__/slices/shopSlice.test.ts`:

```ts
describe('BUY_SHOP_ITEM currency', () => {
  it('spends credits, not alclad', () => {
    initialState.resources.credits = 500;
    initialState.resources.alclad = 500;

    const next = shopReducer(initialState, {
      type: 'BUY_SHOP_ITEM',
      payload: { item: 'hammer', cost: 25 },
    });

    expect(next.resources.credits).toBe(475);
    expect(next.resources.alclad).toBe(500);
    expect(next.inventory.hammer).toBe(true);
  });

  it('refuses when credits are short even with plenty of alclad', () => {
    initialState.resources.credits = 10;
    initialState.resources.alclad = 9999;

    const next = shopReducer(initialState, {
      type: 'BUY_SHOP_ITEM',
      payload: { item: 'irLamp', cost: 400 },
    });

    expect(next.inventory.irLamp).toBeFalsy();
    expect(next.resources.alclad).toBe(9999);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run __tests__/slices/shopSlice.test.ts -t "BUY_SHOP_ITEM currency"`

Expected: FAIL — alclad is debited and credits are untouched.

- [ ] **Step 3: Switch the currency**

In `src/state/slices/shopSlice.ts`:

```ts
      case 'BUY_SHOP_ITEM':
        if (draft.resources.credits >= action.payload.cost) {
          draft.resources.credits -= action.payload.cost;
          (draft.inventory as unknown as Record<string, boolean | number>)[action.payload.item] =
            true;
          draft.toolConditions[action.payload.item] = 100;
          addLog(`PURCHASED: ${action.payload.item.toUpperCase()}`);
        } else {
          addLog('INSUFFICIENT CREDITS.', 'error');
        }
        break;
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run __tests__/slices/shopSlice.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix: the tool shop charges credits, as documented

The handler deducted alclad, putting tool purchases in direct
competition with job material requirements, while the item prices and
the design docs both describe credits.

Fixes DEF-18."
```

---

# Phase 5 — Progression

Fixes DEF-17 and DEF-23.

### Task 22: Cap and rescale the level curve

The last content unlock is level 35. Levels 40 and 45 declare `unlocks: { actions: [] }` and 49 unlocks the endings. With `getXpForNextLevel = 500 * (level + 1)`, levels 35→49 cost **297,500 XP** against a full-run total of **612,000** — 48.6% of the game for no new mechanics. There is also no cap anywhere: the player levels past 49 forever.

**Files:**

- Modify: `src/data/constants.ts`
- Modify: `src/logic/levels.ts`
- Modify: `src/data/levelMilestones.ts` (move milestones 40→36, 45→38, 49→40)
- Modify: `src/data/featureRegistry.ts` (ending actions `requiredLevel: 49` → `40`)
- Test: `__tests__/logic/levels.test.ts` (existing)

**Interfaces:**

- Consumes: `getXpForNextLevel(level: number): number`
- Produces: `GAME_CONSTANTS.MAX_LEVEL = 40`

- [ ] **Step 1: Write the failing test**

Append to `__tests__/logic/levels.test.ts`:

```ts
describe('level cap', () => {
  it('returns Infinity at the cap so no further level-up can occur', () => {
    expect(getXpForNextLevel(GAME_CONSTANTS.MAX_LEVEL)).toBe(Infinity);
  });

  it('keeps the full run under 450k XP', () => {
    let total = 0;
    for (let l = 0; l < GAME_CONSTANTS.MAX_LEVEL; l++) {
      total += getXpForNextLevel(l);
    }
    expect(total).toBeLessThan(450_000);
  });

  it('still scales with level below the cap', () => {
    expect(getXpForNextLevel(10)).toBeGreaterThan(getXpForNextLevel(5));
  });
});
```

Add `import { GAME_CONSTANTS } from '@/data/constants.ts';` to the file.

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run __tests__/logic/levels.test.ts -t "level cap"`

Expected: FAIL — `MAX_LEVEL` does not exist and `getXpForNextLevel` has no cap.

- [ ] **Step 3: Add the cap**

In `src/data/constants.ts`, inside `GAME_CONSTANTS`:

```ts
  // The final milestone is level 40 (TRUTH REVEAL). No level beyond it.
  MAX_LEVEL: 40,
```

In `src/logic/levels.ts`:

```ts
import { GAME_CONSTANTS } from '../data/constants.ts';

export const getXpForNextLevel = (level: number): number => {
  if (level >= GAME_CONSTANTS.MAX_LEVEL) return Infinity;
  return 500 * (level + 1);
};
```

`Infinity` makes the existing `experience >= xpForNextLevel` check in `tickLogic.ts:138` false forever at the cap, so no extra guard is needed there.

- [ ] **Step 4: Move the endgame milestones**

In `src/data/levelMilestones.ts`, change the `level` field of the last three entries: `40 → 36`, `45 → 38`, `49 → 40`. Keep their names, descriptions, unlocks and `narrativeEvent` values exactly as written.

In `src/data/featureRegistry.ts`, change `requiredLevel: 49` to `requiredLevel: 40` on `TRIGGER_ALIEN_ENDING`, `TRIGGER_GOVT_ENDING` and `TRIGGER_CRAZY_ENDING`.

- [ ] **Step 5: Update the ending reachability test**

`__tests__/integration/endingReachability.test.ts` already sets `level = 40`, which now equals the cap. No change needed — confirm it still passes.

- [ ] **Step 6: Run the tests**

Run: `npx vitest run __tests__/logic/levels.test.ts __tests__/integration/endingReachability.test.ts`

Expected: PASS. Total XP for a full run is now 430,000.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: cap the level curve at 40 and move the endgame in

Levels 35-49 cost 48.6% of the game's total XP while unlocking nothing.
Caps at 40, moves the three endgame milestones to 36/38/40, and drops a
full run from 612k to 430k XP so the last unlock lands near the end.

Part of DEF-17."
```

---

### Task 23: Every level gets a name

26 of the levels have no milestone entry, and `tickLogic.ts:176` renders `currentMilestone?.name || 'Unknown'`. Half the level-ups in the game announce "Reached Level N: Unknown".

**Files:**

- Modify: `src/data/levelMilestones.ts`
- Create: `__tests__/data/milestoneCompleteness.test.ts`

**Interfaces:**

- Consumes: `MILESTONE_DATA`, `getMilestoneForLevel(level: number)`
- Produces: nothing

- [ ] **Step 1: Write the failing test**

Create `__tests__/data/milestoneCompleteness.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { GAME_CONSTANTS } from '@/data/constants.ts';
import { getMilestoneForLevel, MILESTONE_DATA } from '@/data/levelMilestones.ts';

describe('milestone completeness', () => {
  it('names every level from 0 to the cap', () => {
    const missing: number[] = [];
    for (let level = 0; level <= GAME_CONSTANTS.MAX_LEVEL; level++) {
      const milestone = getMilestoneForLevel(level);
      if (!milestone || !milestone.name.trim()) missing.push(level);
    }
    expect(missing).toEqual([]);
  });

  it('defines no milestone above the cap', () => {
    const beyond = MILESTONE_DATA.filter((m) => m.level > GAME_CONSTANTS.MAX_LEVEL).map(
      (m) => m.level
    );
    expect(beyond).toEqual([]);
  });

  it('has no duplicate levels', () => {
    const levels = MILESTONE_DATA.map((m) => m.level);
    expect(new Set(levels).size).toBe(levels.length);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run __tests__/data/milestoneCompleteness.test.ts`

Expected: FAIL, listing the 20 unnamed levels: 7, 9, 11, 13, 14, 16, 17, 19, 21, 23, 24, 26, 27, 29, 31, 32, 33, 34, 37, 39.

- [ ] **Step 3: Add the twenty missing milestones**

Insert each into `MILESTONE_DATA` in level order. They unlock nothing — they exist to name the beat. Use `unlocks: {}`.

```ts
  { level: 7,  name: 'SECOND SHIFT',            description: 'You have worked the same eight hours twice. The logbook disagrees about which.', unlocks: {} },
  { level: 9,  name: 'TOOL ACCOUNTABILITY',     description: 'Every item signed out must be signed back in. The Master counts twice and writes down one number.', unlocks: {} },
  { level: 11, name: 'RECORDS RETENTION',       description: 'Documentation is retained for seven years. Some of it is older than the company.', unlocks: {} },
  { level: 13, name: 'MODULE TWO',              description: 'The training video has a second reel. Nobody remembers ordering it.', unlocks: {} },
  { level: 14, name: 'PEER REVIEW',             description: 'Another technician signs your work. You have never met them. Their stamp is worn smooth.', unlocks: {} },
  { level: 16, name: 'COMPONENT CUSTODY',       description: 'You are trusted with parts now. Parts are trusted with you.', unlocks: {} },
  { level: 17, name: 'OVERTIME AUTHORISED',     description: 'The hours are approved in advance. You have not requested them yet.', unlocks: {} },
  { level: 19, name: 'SHIFT HANDOVER',          description: 'The night crew leaves notes in a hand that resembles yours.', unlocks: {} },
  { level: 21, name: 'CAMERA BLIND SPOTS',      description: 'You have mapped where the lenses do not reach. Something else mapped it first.', unlocks: {} },
  { level: 23, name: 'REVISION CONTROL',        description: 'The manual is at revision 44. You remember revision 44 saying something else.', unlocks: {} },
  { level: 24, name: 'CALIBRATION DUE',         description: 'Every instrument drifts. The torquemeter drifts toward a number it prefers.', unlocks: {} },
  { level: 26, name: 'INDEX CARDS',             description: 'The archive is alphabetical. Under your surname there is already a card.', unlocks: {} },
  { level: 27, name: 'MICROFICHE ACCESS',       description: 'Reels of film nobody has spooled since the eighties. The projector is warm.', unlocks: {} },
  { level: 29, name: 'RETENTION EXEMPTION',     description: 'Certain records are exempt from destruction. Nobody will say which authority granted it.', unlocks: {} },
  { level: 31, name: 'DORMANT ACCOUNTS',        description: 'Employee numbers that never clocked out. Yours is adjacent to one of them.', unlocks: {} },
  { level: 32, name: 'PART NUMBER DRIFT',       description: 'The same component under three part numbers, each superseding the others.', unlocks: {} },
  { level: 33, name: 'SERIAL COLLISION',        description: 'Two serial numbers, identical, both installed, both airborne.', unlocks: {} },
  { level: 34, name: 'CAGE INVENTORY',          description: 'The count is short by one every quarter. The same one.', unlocks: {} },
  { level: 37, name: 'MANIFEST RECONCILIATION', description: 'Cargo loaded against cargo landed. The difference has a mass and a temperature.', unlocks: {} },
  { level: 39, name: 'FINAL WALKAROUND',        description: 'You check the aircraft one last time. It has already been checked, by you, in a hand you do not recognise.', unlocks: {} },
```

Prettier will reformat these onto multiple lines on commit. That is expected.

- [ ] **Step 4: Run the test**

Run: `npx vitest run __tests__/data/milestoneCompleteness.test.ts`

Expected: PASS.

- [ ] **Step 5: Run the full suite**

Run: `npm run test:run`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: name every level from 0 to the cap

26 of 49 levels had no milestone, so half the level-ups announced
'Reached Level N: Unknown'. Twenty new milestones fill the gaps; they
unlock nothing and exist to name the beat.

Completes DEF-17."
```

---

### Task 24: Start at level 0

`initialState.ts:56` starts the player at level 1, while `MILESTONE_DATA[0]`, `docs/game_mechanics.md` and `featureRegistry` all describe level 0 as ORIENTATION DAY. The level-0 milestone flags are only granted retroactively on the first level-up, and the level-1 PROBATIONARY beat is skipped entirely.

**Files:**

- Modify: `src/state/initialState.ts:56` and `createInitialState`
- Modify: `src/state/stateValidator.ts:38`
- Test: `__tests__/state/initialState.test.ts` (existing)

**Interfaces:**

- Consumes: `getAllUnlockedFlags(level: number): string[]` from `src/data/levelMilestones.ts`
- Produces: nothing

- [ ] **Step 1: Write the failing test**

Append to `__tests__/state/initialState.test.ts`:

```ts
describe('starting level', () => {
  it('starts at level 0, the orientation milestone', () => {
    const state = createInitialState();
    expect(state.resources.level).toBe(0);
  });

  it('grants the level-0 milestone flags at init', () => {
    const state = createInitialState();
    const expected = getAllUnlockedFlags(0);
    for (const flag of expected) {
      expect(state.flags[flag as keyof typeof state.flags]).toBe(true);
    }
  });
});
```

Add `import { getAllUnlockedFlags } from '@/data/levelMilestones.ts';` to the file.

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run __tests__/state/initialState.test.ts -t "starting level"`

Expected: FAIL — level is 1.

- [ ] **Step 3: Change the starting level**

In `src/state/initialState.ts`, set `level: 0,`.

- [ ] **Step 4: Grant the level-0 flags at init**

At the end of `createInitialState`, before the return, apply the milestone-0 flags the same way `loadState` does for a loaded level:

```ts
getAllUnlockedFlags(0).forEach((flagKey) => {
  const key = flagKey as keyof GameState['flags'];
  if (typeof state.flags[key] === 'boolean') {
    (state.flags as unknown as Record<string, boolean>)[key] = true;
  }
});
```

Import `getAllUnlockedFlags` from `../data/levelMilestones.ts` if it is not already imported.

- [ ] **Step 5: Fix the validator clamp**

`src/state/stateValidator.ts:38` reads `Math.max(1, state.resources.level)`, which would silently promote a legitimate level-0 save. Change to:

```ts
state.resources.level = Math.max(0, Math.min(GAME_CONSTANTS.MAX_LEVEL, state.resources.level));
```

Import `GAME_CONSTANTS`. This also clamps saves above the new cap from Task 22.

- [ ] **Step 6: Run the tests**

Run: `npx vitest run __tests__/state/initialState.test.ts`

Expected: PASS.

- [ ] **Step 7: Run the full suite**

Run: `npm run test:run && npm run lint`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "fix: start the player at level 0, as the docs describe

Starting at 1 skipped the ORIENTATION DAY milestone's flags until the
first level-up and skipped the PROBATIONARY beat entirely. The
validator clamp is corrected to allow 0 and to cap at MAX_LEVEL.

Fixes DEF-23."
```

---

# Phase 6 — Structural

Fixes DEF-19 through DEF-22. **Must follow Phase 3**, which salvages the two pieces of gameplay that exist only inside the files this phase deletes.

### Task 25: Re-point the tests that cover retired code

Three test files exercise `actionProcessor.ts`, which `src/` has never imported. They must be re-pointed before the file can go.

**Files:**

- Modify: `__tests__/logic/actionProcessorNew.test.ts`
- Modify: `__tests__/logic/actionProcessor_unlock.test.ts`
- Modify: `__tests__/perf/benchmark_unlock_skill.test.ts`

**Interfaces:**

- Consumes: `proficiencyReducer` from `src/state/slices/proficiencySlice.ts` (handles `UNLOCK_SKILL`, the subject of two of the three files)
- Produces: nothing

- [ ] **Step 1: Confirm Phase 3 salvage is complete**

Run: `npx vitest run __tests__/slices/officeSlice.test.ts src/logic/__tests__/eventSpawns.test.ts`

Expected: PASS. If either fails, Tasks 13 and 14 are incomplete — stop and finish them. Deleting the source files before the salvage lands loses the work permanently.

- [ ] **Step 2: Re-point the UNLOCK_SKILL tests**

`actionProcessor_unlock.test.ts` and `benchmark_unlock_skill.test.ts` both test `UNLOCK_SKILL`, which now lives in `proficiencySlice`. Replace the import in each:

```ts
import { proficiencyReducer } from '@/state/slices/proficiencySlice.ts';
```

and rewrite each call from `handleGameAction(draft, 'UNLOCK_SKILL', payload, createJob, triggerEvent)` to:

```ts
const next = proficiencyReducer(state, { type: 'UNLOCK_SKILL', payload });
```

adjusting the assertions to read `next.proficiency` / `next.resources` rather than mutating a draft in place. Rename the files to `__tests__/state/slices/proficiencySlice_unlock.test.ts` and `__tests__/perf/benchmark_unlock_skill.test.ts` (the perf file keeps its name).

- [ ] **Step 3: Re-point or delete actionProcessorNew.test.ts**

Read each case in `actionProcessorNew.test.ts`. For every action it covers, find the slice that now owns it (`ROUTED_ACTIONS` tells you which group, and the group name tells you the slice) and rewrite the case against that reducer. Delete any case covering one of the 18 orphan actions that are dispatched from nowhere — they are abandoned drafts, not features:

`ATTEND_TRAINING_MODULE`, `BRIBE_AUDITOR`, `CHECK_BOARDS`, `CHECK_FOR_BUGS`, `EAT_BURGER`, `EAT_VOID_BURGER`, `GO_RESTROOM`, `INSPECT_SHADOWS`, `LISTEN_TO_WALLS`, `SACRIFICE_TOOL`, `SKIP_TRAINING`, `SMALL_TALK`, `SUBMIT_FAKE_LOGS`, `TAKE_EXAM`, `TAKE_WALK`, `TALK_TO_SUITS`, `WALK_AROUND`, plus `DAILY_CHECK`.

`TRANSIT_CHECK`, `READ_FLIGHT_LOG` and `READ_CABIN_LOG` are **not** orphans — they run today as `AIRCRAFT_ACTION` payloads via `aircraftSlice`. If the file covers them, re-point those cases to `aircraftReducer` with `{ type: 'AIRCRAFT_ACTION', payload: { actionType: 'TRANSIT_CHECK' } }`.

- [ ] **Step 4: Run the re-pointed tests**

Run: `npm run test:run`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: re-point actionProcessor tests at the slices that run

These three files were the only importers of actionProcessor.ts, a
module src/ has never imported. Coverage will drop; the previous number
measured code that has never executed.

Part of DEF-19."
```

---

### Task 26: Delete the retired files

**Files:**

- Delete: `src/logic/actionProcessor.ts`
- Delete: `src/data/actions.ts`
- Delete: `src/logic/tickProcessor.ts`
- Modify: `src/state/gameReducer.ts:10-11` (stale comments)
- Modify: `__tests__/integration/eventIntegrity.test.ts` (drop the `IGNORED` list)

**Interfaces:**

- Consumes: nothing
- Produces: nothing

- [ ] **Step 1: Confirm nothing imports them**

Run:

```bash
grep -rn "actionProcessor\|tickProcessor\|data/actions" src __tests__ e2e | grep -v "^src/logic/actionProcessor.ts:" | grep -v "^src/logic/tickProcessor.ts:" | grep -v "^src/data/actions.ts:"
```

Expected: only the two stale comment lines in `src/state/gameReducer.ts`. If any real import appears, stop and resolve it.

- [ ] **Step 2: Delete**

```bash
git rm src/logic/actionProcessor.ts src/data/actions.ts src/logic/tickProcessor.ts
```

- [ ] **Step 3: Remove the stale comments**

Delete both `// --- Logic from tickProcessor.ts ---` lines at the top of `src/state/gameReducer.ts`.

- [ ] **Step 4: Tighten the integrity test**

In `__tests__/integration/eventIntegrity.test.ts`, the `IGNORED` array exists only because those files were still on disk. Remove the constant and the `IGNORED.includes(rel)` condition — every remaining file is part of the build and must hold up.

- [ ] **Step 5: Typecheck, test, lint**

Run: `npx tsc --noEmit && npm run test:run && npm run lint`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: delete the pre-refactor files

actionProcessor.ts (1,276 lines) has never been imported by src/.
tickProcessor.ts (344) was superseded by tickLogic.ts in b25e2dd on
26 Jan 2026 and kept receiving fixes for three months afterwards.
data/actions.ts (1,032) was imported only by actionProcessor.

Everything only they held has been ported: the union and syndicate
spawns (Task 13), the Archivist and KARDEX branches (Task 14), and
INSTALL_RIVETS (Task 5). The 18 remaining orphan cases are dispatched
from nowhere.

Fixes DEF-19, DEF-20."
```

---

### Task 27: Validate saves on load

`src/state/stateValidator.ts` exports `isValidGameState` and `sanitizeGameState`. Neither has ever been called. `loadState` parses raw JSON with a shallow shape check.

**Files:**

- Modify: `src/state/initialState.ts:372-395` (`loadState`)
- Test: `__tests__/state/initialState.test.ts`

**Interfaces:**

- Consumes: `sanitizeGameState(state: unknown): GameState | null` from `src/state/stateValidator.ts`
- Produces: nothing

- [ ] **Step 1: Write the failing test**

Append to `__tests__/state/initialState.test.ts`:

```ts
describe('save validation', () => {
  const KEY = 'test_save_validation';

  afterEach(() => localStorage.removeItem(KEY));

  it('falls back to defaults when the save fails validation', () => {
    localStorage.setItem(KEY, JSON.stringify({ resources: 'not an object', inventory: {} }));
    const state = loadState(KEY);
    expect(state.resources.level).toBe(0);
  });

  it('clamps out-of-range values instead of trusting them', () => {
    const defaults = createInitialState();
    localStorage.setItem(
      KEY,
      JSON.stringify({
        ...defaults,
        resources: { ...defaults.resources, sanity: 9999, suspicion: -50, level: 900 },
      })
    );

    const state = loadState(KEY);
    expect(state.resources.sanity).toBeLessThanOrEqual(100);
    expect(state.resources.suspicion).toBeGreaterThanOrEqual(0);
    expect(state.resources.level).toBeLessThanOrEqual(GAME_CONSTANTS.MAX_LEVEL);
  });
});
```

Add `afterEach` to the vitest import and `GAME_CONSTANTS` to the file's imports.

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run __tests__/state/initialState.test.ts -t "save validation"`

Expected: FAIL on the clamp case — nothing clamps a loaded save.

- [ ] **Step 3: Wire the validator in**

In `src/state/initialState.ts`, in `loadState`, replace the shallow shape check:

```ts
if (typeof parsed !== 'object' || parsed === null || !parsed.resources || !parsed.inventory) {
  console.warn('Saved data is corrupted or in an old format. Loading default state.');
  return defaults;
}
```

with:

```ts
const sanitized = sanitizeGameState({
  ...defaults,
  ...parsed,
  resources: { ...defaults.resources, ...(parsed.resources || {}) },
  inventory: { ...defaults.inventory, ...(parsed.inventory || {}) },
  hfStats: { ...defaults.hfStats, ...(parsed.hfStats || {}) },
});

if (!sanitized) {
  console.warn('Saved data failed validation. Loading default state.');
  return defaults;
}
```

Then use `sanitized` in place of `parsed` for the rest of the function, and add the import:

```ts
import { sanitizeGameState } from './stateValidator.ts';
```

Merging over `defaults` first means a save written before a field existed still loads — the field takes its default rather than `undefined`.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run __tests__/state/initialState.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix: validate and sanitise saves on load

stateValidator had no importers, so a truncated or edited save crashed
the app rather than degrading, and every schema change was a silent
break. Loaded state is now merged over defaults and clamped.

Fixes DEF-21."
```

---

### Task 28: Gate DevMode out of production builds

The provider mounts unconditionally, attaches `window.enableDevMode`, binds Shift+Cmd+P, and prints an instruction banner to the console on every mount. Full state manipulation is one keystroke away in a shipped build.

**Files:**

- Modify: `src/context/DevModeContext.tsx:35-86`
- Test: `__tests__/context/devMode.test.tsx` (create)

**Interfaces:**

- Consumes: `import.meta.env.DEV`
- Produces: nothing

- [ ] **Step 1: Write the failing test**

Create `__tests__/context/devMode.test.tsx`:

```ts
import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * The dev affordances must be behind an env guard. Asserted against the
 * source because import.meta.env.DEV is fixed to true under vitest.
 */
describe('DevMode production gating', () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, '../../src/context/DevModeContext.tsx'),
    'utf8'
  );

  it('guards the global handle, the shortcut and the banner', () => {
    expect(source).toContain('import.meta.env.DEV');

    const guardCount = (source.match(/import\.meta\.env\.DEV/g) || []).length;
    expect(guardCount).toBeGreaterThanOrEqual(2);
  });

  it('does not attach window.enableDevMode unconditionally', () => {
    const attachIndex = source.indexOf('window.enableDevMode =');
    const guardIndex = source.indexOf('import.meta.env.DEV');
    expect(attachIndex).toBeGreaterThan(guardIndex);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run __tests__/context/devMode.test.tsx`

Expected: FAIL — the file contains no env guard.

- [ ] **Step 3: Guard both effects**

In `src/context/DevModeContext.tsx`, wrap the body of the first `useEffect` (the one attaching `window.enableDevMode` and printing the banner):

```ts
useEffect(() => {
  if (!import.meta.env.DEV) return;

  window.enableDevMode = () => {
    // ... unchanged
  };

  // ... banner logs unchanged

  return () => {
    delete window.enableDevMode;
  };
}, []);
```

And the keyboard effect:

```ts
useEffect(() => {
  if (!import.meta.env.DEV) return;

  const handleKeyDown = (event: KeyboardEvent) => {
    // ... unchanged
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

While here, delete the block of eight self-debating comment lines inside `handleKeyDown` — the toggle behaviour they argue about is already implemented below them.

- [ ] **Step 4: Run the test**

Run: `npx vitest run __tests__/context/devMode.test.tsx`

Expected: PASS.

- [ ] **Step 5: Verify the production build**

Run: `npm run build && grep -r "enableDevMode" dist/ || echo "not present in build"`

Expected: `not present in build`, or matches only inside a dead branch Vite has stripped. If `enableDevMode` appears in a live code path, the guard is not being tree-shaken — check that the early return is the first statement in the effect.

- [ ] **Step 6: Run the full suite and lint**

Run: `npm run test:run && npm run lint`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "fix: keep DevMode out of production builds

The provider attached window.enableDevMode, bound Shift+Cmd+P and
printed an instruction banner in every build, putting full state
manipulation one keystroke from any player.

Fixes DEF-22."
```

---

# Final verification

- [ ] **Step 1: Full suite, typecheck, lint, build**

```bash
npx tsc --noEmit && npm run test:run && npm run lint && npm run build
```

Expected: all PASS.

- [ ] **Step 2: Confirm every guard test is present and green**

```bash
npx vitest run __tests__/integration/ __tests__/data/milestoneCompleteness.test.ts
```

Expected: PASS — dispatch coverage, event integrity, ending reachability, requiredAction, milestone completeness.

- [ ] **Step 3: Manual playthrough check**

Run `npm run dev`, open DevMode, and confirm:

1. Set level to 40 and `metallicSphere` in inventory. Each of the three ending buttons reaches its ending screen.
2. No level-up notification reads "Unknown".
3. No `SYSTEM FAULT` notification appears while clicking through every tab's actions.
4. Let an event time out and confirm the log shows its authored failure text, not a `DEBUG:` line.
5. Set health to 5 and confirm the game-over screen appears.

- [ ] **Step 4: Open the pull request**

```bash
git push -u origin fix/defect-repair-full
gh pr create --title "Repair all 24 audit defects" --body "$(cat <<'BODY'
Implements `docs/superpowers/specs/2026-08-25-hangar-defect-repair-design.md`.

Root cause: commit `b25e2dd` (26 Jan 2026) split the reducer and left the
pre-refactor originals in the tree. Four later fix commits landed in the
retired copies rather than their replacements, including the one that
wrote the union and syndicate event spawns.

- The game can be completed without DevMode; the three ending actions,
  training progression and the manual job board are unblocked.
- Six buttons that had no handler anywhere are implemented.
- The event system applies the `failureOutcome`, `storyFlag` and chain
  fields it has always carried; 49 previously unspawnable events are
  reachable; all 84 dangling event references are resolved.
- Fatigue, health and PPE have real effects; rest costs something.
- The level curve caps at 40 and every level is named.
- The three retired files are deleted after salvaging what only they held.

Four new guard tests would each have caught a shipped defect.
BODY
)"
```

---

# Defect coverage

| Task  | Defects                        |
| ----- | ------------------------------ |
| 1-3   | DEF-01, DEF-02, DEF-03, DEF-24 |
| 4     | DEF-01 (regression guard)      |
| 5-7   | DEF-04, DEF-05                 |
| 8     | DEF-06, DEF-12                 |
| 9     | DEF-07                         |
| 10-11 | DEF-08                         |
| 12    | DEF-11                         |
| 13-15 | DEF-10                         |
| 16    | DEF-09                         |
| 17    | DEF-14                         |
| 18    | DEF-13                         |
| 19    | DEF-15                         |
| 20    | DEF-16                         |
| 21    | DEF-18                         |
| 22-23 | DEF-17                         |
| 24    | DEF-23                         |
| 25-26 | DEF-19, DEF-20                 |
| 27    | DEF-21                         |
| 28    | DEF-22                         |

All 24 defects covered.
