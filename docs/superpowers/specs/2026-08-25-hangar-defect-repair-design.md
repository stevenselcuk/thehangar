# The Hangar — Defect Repair Design

**Date:** 2026-08-25
**Baseline:** `06c0706` (main)
**Scope:** All 23 findings from the defect audit (DEF-01 … DEF-23)
**Audit report:** https://claude.ai/code/artifact/98646b5d-7f85-44ba-8494-09f8b1051ec6

---

## 1. Problem

A static audit of the codebase found 23 defects. Five make the game
unfinishable. Seven make the event system discard authored content. Six
drain tension out of the resource economy. Five are structural.

They share one historical cause. Commit `b25e2dd "[DEBT] Tried to pay
the debt. done some refactor"` (26 Jan 2026) split the reducer:
`gameReducer.ts` lost 425 lines and `tickLogic.ts` was created to
replace `tickProcessor.ts`. The originals stayed in the tree. Four
later commits edited the retired copies instead of their replacements,
including `50c16cf "[GAME] Rewired Union features"`, which wrote the
union and syndicate event spawns into `tickProcessor.ts:43-66` — a file
the game does not execute.

Most of this work is reconnection, not authoring. The scenario content
is largely written; the machinery that delivers it is not wired.

---

## 2. Goals

1. The game can be completed without DevMode.
2. Every button the player can click does something.
3. Authored event content — outcomes, flags, chains — reaches the player.
4. Resources the UI presents as constraints behave as constraints.
5. A defect of any of these classes cannot ship silently again.

### Non-goals

- Writing new narrative content. Dangling event references are
  resolved by re-pointing or removal, not by fabricating events.
- Rewriting `reducerComposer`'s slice-to-state mapping.
- Visual or audio changes.

---

## 3. Architecture decisions

### 3.1 Routing: derive the allowlist, don't maintain it

`gameReducer.ts` gates every action through a hand-maintained
126-element `composedActions` array literal. Anything absent falls
through to `handleGameAction`, a stub containing one `console.warn`.
This is the direct cause of DEF-01, DEF-02 and DEF-03, and it is a
defect _class_, not three defects.

`reducerComposer.ts` already declares the authoritative per-slice
action lists (`INVENTORY_ACTIONS`, `OFFICE_ACTIONS`, `HANGAR_ACTIONS`,
…). The fix derives the gate from them:

- Lift the inline AOG array in `composeAction` to a module-level
  `AOG_ACTIONS` const, so every routed group is declared the same way.
- Export `ROUTED_ACTIONS: ReadonlySet<string>` as the union of all
  group consts.
- `gameReducer` imports it, deletes its literal, and gates on
  `ROUTED_ACTIONS.has(type)`.
- `handleGameAction` throws under `import.meta.env.DEV` and, in
  production, warns and pushes a `SYSTEM FAULT` notification.

Registering an action in its slice group now routes it. The two
remaining registration points (the slice's `switch` case and its group
const) sit in the same file, adjacent to each other.

**Rejected — handler registry (`Record<actionType, handler>`):** a
genuine single registration point, but it requires rewriting all 1,170
lines of `reducerComposer` including each slice's bespoke state-subset
mapping. High risk of silent state-mapping bugs for no gameplay gain.

**Rejected — dispatch to every slice and detect a no-op:** cannot
distinguish "handled, state unchanged" from "not handled". Toggles and
insufficient-resource branches legitimately return unchanged state and
would raise false faults.

### 3.2 Focus cost: one central surcharge pass

Two defects (DEF-14 fatigue, and the abandoned hazard
`focusCostModifier` at `reducerComposer.ts:425-448`) both need to scale
the focus cost of arbitrary actions. Each slice checks and deducts
focus itself, so there is no cost to intercept up front — this is
exactly the problem the comments in `reducerComposer` gave up on.

Resolution: apply the surcharge _after_ the slice runs. `composeAction`
records `focus` before dispatch, measures the decrease afterwards, and
deducts an additional `decrease * (modifier - 1)`, floored at 0.

```
fatigueFactor = 1 + (fatigue / 100) * FATIGUE_FOCUS_SURCHARGE   // 0 → 1.0x, 100 → 1.5x
hazardFactor  = Π(hazard.effects.focusCostModifier)             // 1 when no hazard sets one
modifier      = fatigueFactor * hazardFactor
surcharge     = max(0, focusBefore - focusAfter) * (modifier - 1)
```

Actions that do not spend focus are unaffected, because the measured
decrease is zero. This adds one interception point rather than editing
~50 handlers, and it resolves both defects together.

### 3.3 Event chaining: immediate successor, not a queue

`GameState.activeEvent` is a single slot. `EventChoice` and
`EventOutcome` declare `nextEventId` and `event: { type, id }`, neither
of which is read anywhere.

Because a chain link is always an _immediate_ successor to the event
being resolved, no queue is needed: after clearing the resolved event,
construct the successor directly into `activeEvent` in the same
reducer pass. A `chainDepth` counter (max 5) and a self-reference check
guard against loops in the data.

### 3.4 `requiredAction`: verify by doing, not by clicking

Events carrying `requiredAction` currently render a button that
dispatches bare `RESOLVE_EVENT`; the reducer treats a missing
`choiceId` as proof of success. Every timed task is click-to-win.

The data's intent is that the player performs the named action. So
success detection moves into `composeAction`: after an action routes
successfully, if `state.activeEvent?.requiredAction === action.type`,
apply `successOutcome` and clear the event. `ActionPanel` replaces the
resolve button with a non-interactive hint naming the required action.

---

## 4. Workstreams

Ordered by dependency. Workstream 6 must follow 3.

### WS1 — Routing (DEF-01, DEF-02, DEF-03)

| File                           | Change                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| `src/state/reducerComposer.ts` | Lift inline AOG list to `AOG_ACTIONS`; export `ROUTED_ACTIONS`                                   |
| `src/state/gameReducer.ts`     | Delete `composedActions` literal; gate on `ROUTED_ACTIONS`; make `handleGameAction` throw in dev |

No per-action work: `TRIGGER_ALIEN_ENDING`, `TRIGGER_GOVT_ENDING`,
`TRIGGER_CRAZY_ENDING`, `START_EASA_MODULE`, `TAKE_AP_WRITTEN` and
`START_STANDARD_JOB` already have handlers and group entries.

Also remove the dead auto-ending check at
`reducerComposer.ts:1162-1167` — `endingAlienConspiracyProgress` and
`endingGovtConspiracyProgress` are never incremented. Either delete the
fields, or keep them and delete the check. Decision: **delete both
fields and the check**; the manual ending actions are the intended path
and the counters have no writer.

### WS2 — Missing handlers (DEF-04, DEF-05)

| Action                                                                       | Home            | Source                                                                                                      |
| ---------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------- |
| `INSTALL_RIVETS`                                                             | `hangarSlice`   | Port from `data/actions.ts:87-100` — focus 25, requires `rivetGun`, +200 XP                                 |
| `DECRYPT_AMM`                                                                | `officeSlice`   | New; uses existing `DECRYPT_AMM_SUCCESS` / `_FAIL` at `flavor.ts:204-206`; gated on `inventory.pcAssembled` |
| `OVERHAUL_IDG`, `REPAIR_HP_VALVE`, `RECONFIGURE_ADIRS`, `REPAIR_GALLEY_UNIT` | `backshopSlice` | One parameterised red-tag overhaul case                                                                     |

The Backshops four are four instances of one mechanic: repair a
specific red-tagged rotable. Implement as a table keyed by action type:

```ts
const OVERHAUL_TARGETS = {
  OVERHAUL_IDG: { pn: 'IDG-757-A', focus: 80, xp: 900, credits: 400 },
  REPAIR_HP_VALVE: { pn: 'PRV-ENG-HP1', focus: 60, xp: 600, credits: 250 },
  RECONFIGURE_ADIRS: { pn: 'ADIRS-HG2030', focus: 90, xp: 1100, credits: 500 },
  REPAIR_GALLEY_UNIT: { pn: 'BREW-MASTER', focus: 50, xp: 400, credits: 180 },
};
```

The table keys on **part number**, not rotable `id`, because
`BackshopsTab.tsx:18-21` selects its targets with
`r.pn === '…' && r.isRedTagged`. The handler must match the same
predicate or the button's enabled state and the handler's target will
disagree.

Focus costs are taken from what `BackshopsTab` already displays
(80/60/90/50), so the UI needs no change. Behaviour follows the
existing `REPAIR_ROTABLE` semantics at `inventorySlice.ts:174-196` —
condition → 100, clear `activeComponentFailure` if it matches,
increment `stats.rotablesRepaired` — **plus** clearing `isRedTagged`,
which `REPAIR_ROTABLE` does not currently do. Without that the button
would remain enabled after a successful overhaul and the job could be
repeated indefinitely.

### WS3 — Event system (DEF-06 … DEF-12)

**Point fixes**

- `eventsSlice.ts:341` — `Math.max(0, 100)` → clamp the actual value.
- `tickLogic.ts:522` — delete the `DEBUG:` `addLog`.

**Failure outcomes (DEF-07).** In the timeout branch at
`tickLogic.ts:498-528`: if `event.failureOutcome` exists, apply its
`effects` and `log`, plus its `storyFlag` and chain fields. Fall back
to the existing generic sanity/suspicion table only when it is absent.

**Flags and chaining (DEF-08).** In `RESOLVE_EVENT`, after applying
cost/effects/log, apply `storyFlag` to `flags.storyFlags`, then resolve
`nextEventId` (same category) or `event: { type, id }` (explicit
category) into `activeEvent` per §3.3.

**`requiredAction` (DEF-11).** Per §3.4. Also fix the adjacent bug: the
success branch sets `logAdded = true` only in its `else` case, so an
authored `successOutcome.log` is followed by a redundant generic
resolution log.

**Salvage (DEF-10 root cause).**

- `tickProcessor.ts:43-66` → `tickLogic.ts`: the union and syndicate
  spawn rolls, preserving the `randomRoll` else-if ladder.
- `actionProcessor.ts:386-440` → `officeSlice.ts` `REVIEW_SURVEILLANCE_LOGS`:
  the conditional that fires `THE_ARCHIVIST` (suspicion > 75 and
  sanity < 40) and `KARDEX_RECOVERY`.

**Category spawn coverage (DEF-10).** Extend the tick dispatcher to
also roll for `management`, `canteen_incident` and
`bureaucratic_horror`. Level gating needs no new work —
`canSpawnEventCategory` already consults `EVENT_CATEGORY_FEATURES`.
`management` has no registry entry and therefore defaults to level 0;
add one at level 10 to match its bureaucratic tone. New probabilities
go in `GAME_CONSTANTS.EVENT_PROBABILITIES`.

**Dangling references (DEF-09).** 84 referenced event IDs match no
event in any pool; `createEventFromTemplate` returns `null` and
`TRIGGER_EVENT` returns silently. Every one is resolved by exactly one
of:

1. **Re-point** to a semantically equivalent existing event.
2. **Remove** the reference (drop the `event` / `nextEventId` field).

No events are fabricated. `createEventFromTemplate` gains a dev-mode
assertion on unknown IDs, and an integrity test (§6) fails the build if
a dangling reference is ever reintroduced.

### WS4 — Balance (DEF-13, 14, 15, 16, 18)

**Focus surcharge (DEF-14).** Per §3.2, in `composeAction`. New
constant `FATIGUE_FOCUS_SURCHARGE = 0.5` (fatigue 100 → 1.5× focus
cost). Update `tooltips.ts:15` so the fatigue description matches what
is now implemented, and drop the "chance of making mistakes" clause —
that mechanic is not being added.

**Rest (DEF-13).** `NAP_TABLE` and `SLEEP_AT_GATE` currently set
`focus = 100`, `sanity = 100`, `socialStress = 0` with no cost or
cooldown. Change to:

- Partial restore: `focus += 40`, `sanity += 25`, `socialStress /= 2`,
  `fatigue -= 40` (all clamped).
- Cooldown: new `hfStats.restCooldown` (ms), 5 minutes, following the
  existing cooldown-field pattern in `hfStats`. Blocked attempts log
  and no-op.
- Suspicion cost unchanged (+15 / +20).

**Health (DEF-15).** Add `health <= 0` to the death condition in
`useGameEngine.ts:15` and the game-over branch in `App.tsx:384`, so all
three fail states agree. `EndingScreen` needs no new type — this is a
death, not an ending. Rebalance hazard `healthDrain` and the chemical
fume path so death is reachable but not arbitrary; medical items in
`inventorySlice.ts:272-290` become meaningful without retuning.

**PPE and location requirements (DEF-16).** `LOCATION_REQUIREMENTS`
declares `requiredItems: []` for all eleven locations, so the hard
block never fires, and the soft warnings name penalties that are never
applied. Keep hard blocks empty — locking a player out of a tab is
worse than the warning — and make the soft penalties real:

| Item                | Location      | Effect when missing                                                                                                    |
| ------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `earmuffs`          | HANGAR, APRON | `noiseExposure` not reduced; keeps current drain (with earmuffs: −40 exposure, proportional socialStress/focus relief) |
| `flashlight`        | BACKSHOPS     | Sanity drain and injury (`health`) chance while in the tab                                                             |
| `radio`             | APRON         | Reduced yield on ramp actions                                                                                          |
| `technicianToolbox` | AOG           | Reduced AOG action progress                                                                                            |

**Shop currency (DEF-18).** `shopSlice.ts:62-71` deducts
`alclad`; `items.ts` prices and `docs/game_mechanics.md` both describe
credits. Switch to `credits`, update the failure message, leave
`alclad` as a job material only.

### WS5 — Progression (DEF-17, DEF-23)

**Curve.** The last content unlock is level 35; levels 40 and 45
unlock nothing and 49 unlocks the (currently blocked) endings. With
`getXpForNextLevel = 500 * (level + 1)`, levels 35→49 cost 297,500 XP
of a 612,000 total — 48.6% of the game for no new mechanics. There is
also no max-level cap anywhere: the player can level past 49 forever.

- `MAX_LEVEL = 40` in `GAME_CONSTANTS`; `tickLogic` stops levelling at
  the cap.
- Move milestones 40 → 36, 45 → 38, 49 → 40.
- Total XP for a full run becomes ~430,000, with the final unlock near
  the end of the curve.

**Milestone coverage.** 26 of the levels have no milestone entry, and
`tickLogic.ts:176` renders `currentMilestone?.name || 'Unknown'`. Give
every level 0-40 a milestone with a name and description. Levels that
unlock nothing carry `unlocks: {}` — they exist to name the beat, not
to gate content.

**Starting level (DEF-23).** `initialState.ts:56` starts at level 1
while the docs, `MILESTONE_DATA[0]` and `featureRegistry` all describe
level 0 as ORIENTATION DAY. Set `level: 0` and grant the level-0
milestone flags at init rather than retroactively on first level-up.

### WS6 — Structural (DEF-19, 20, 21, 22)

**Delete the retired files (DEF-19, DEF-20).** After WS3's salvage lands:

- Remove `src/logic/actionProcessor.ts`, `src/data/actions.ts`,
  `src/logic/tickProcessor.ts`.
- Of the 21 `actionProcessor` cases never rewritten into a slice, 18
  are dispatched from nowhere (abandoned drafts) and 3
  (`TRANSIT_CHECK`, `READ_FLIGHT_LOG`, `READ_CABIN_LOG`) already run as
  `AIRCRAFT_ACTION` payloads via `aircraftSlice`. Nothing further to
  port.
- Re-point `__tests__/logic/actionProcessorNew.test.ts`,
  `__tests__/logic/actionProcessor_unlock.test.ts` and
  `__tests__/perf/benchmark_unlock_skill.test.ts` at the slices that
  actually run. Coverage will drop; the previous number measured code
  that has never executed.

**Save validation (DEF-21).** `stateValidator.ts` has no importers.
Wire `sanitizeGameState` into the load path in `App.tsx`, falling back
to a fresh state when it returns `null`. Its `level` clamp is
`Math.max(1, …)` and must become `Math.max(0, …)` to match WS5.

**DevMode (DEF-22).** Gate the provider body behind
`import.meta.env.DEV`: no `window.enableDevMode`, no keyboard shortcut,
no console banner in a production build.

---

## 5. Risks

| Risk                                                                       | Mitigation                                                                                                  |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `MAX_LEVEL = 40` invalidates saves above 40                                | `sanitizeGameState` clamps on load. No known live saves; add a migration if that changes.                   |
| Health death makes the game punishing                                      | Rebalance hazard drain in the same change; verify a full run is survivable with normal medical use.         |
| Removing the ending progress fields breaks stored saves                    | They are read nowhere else; `sanitizeGameState` tolerates extra keys.                                       |
| Central focus surcharge double-charges an action that manages focus itself | Surcharge is proportional to the _measured_ decrease, so an action that does not reduce focus pays nothing. |
| Re-pointing 84 event references changes narrative intent                   | Re-point only where semantically equivalent; otherwise remove. Record every decision in the commit.         |

---

## 6. Verification

Existing: `npm run test:run`, `npm run lint`.

Four new tests, each of which would have caught a shipped defect:

1. **Dispatch coverage** — every action string dispatched from
   `src/components/**` and `src/App.tsx` is either in `ROUTED_ACTIONS`
   or in the App-level UI-intercept list. Catches DEF-01 … DEF-05.
2. **Event ID integrity** — every event ID referenced by
   `triggerEvent(...)`, `nextEventId` or `event: { type, id }` resolves
   to an event in `eventsData`. Catches DEF-09.
3. **Ending reachability** — from a level-40 state with the required
   items, each `TRIGGER_*_ENDING` action sets `flags.endingTriggered`.
   Catches DEF-01.
4. **Milestone completeness** — every level from 0 to `MAX_LEVEL` has a
   milestone with a non-empty name. Catches DEF-17.

Manual check before merge: a DevMode-assisted run to level 40 that
triggers one ending, confirming no `SYSTEM FAULT` notification fires
and no `Unknown` level-up appears.

---

## 7. Defect coverage

| Workstream      | Defects                        |
| --------------- | ------------------------------ |
| WS1 Routing     | DEF-01, 02, 03                 |
| WS2 Handlers    | DEF-04, 05                     |
| WS3 Events      | DEF-06, 07, 08, 09, 10, 11, 12 |
| WS4 Balance     | DEF-13, 14, 15, 16, 18         |
| WS5 Progression | DEF-17, 23                     |
| WS6 Structural  | DEF-19, 20, 21, 22             |

All 23 addressed.
