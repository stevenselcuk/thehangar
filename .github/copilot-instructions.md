# The Hangar - AI Agent Instructions

## Project Overview

A browser-based incremental game about aircraft maintenance in a Lovecraftian-themed hangar. Built with React 19 + TypeScript 5.8 + Vite 6.2. Uses custom reducer-based state management (no Redux/Zustand) with Immer for immutability.

## Architecture Fundamentals

### State Management Pattern

- **Central orchestration**: [gameReducer.ts](../src/state/gameReducer.ts) (459 lines) coordinates all state updates
- **Domain slices**: 12+ specialized reducers in [state/slices/](../src/state/slices/) (~2,700 lines total)
  - Example: [hangarSlice.ts](../src/state/slices/hangarSlice.ts) handles radio/FOD/NDT operations
  - Each slice exports typed actions and uses Immer's `produce()` for safe mutations
- **Routing layer**: [reducerComposer.ts](../src/state/reducerComposer.ts) (621 lines) routes TICK/ACTION events
  - `composeTick()`: passive updates (resource regen, tool degradation)
  - `composeAction()`: player actions routed to domain slices

**CRITICAL**: Always use Immer's `produce()` when modifying state. Never mutate state directly.

### Game Loop Architecture

- [useGameEngine.ts](../src/hooks/useGameEngine.ts): `requestAnimationFrame` at 15 FPS with delta time
- State updates flow: RAF tick → dispatch('TICK') → composeTick() → resourcesSlice
- Active tab affects tick behavior (e.g., BACKSHOPS increases suspicion passively)

### Service Layer (Pure Functions)

- [CostCalculator.ts](../src/services/CostCalculator.ts): Cost validation, resource checks, skill requirements
- [RewardCalculator.ts](../src/services/RewardCalculator.ts): XP/reward calculations
- [logService.ts](../src/services/logService.ts): Centralized log management with timestamps
- **Pattern**: Services are stateless, take game state as input, return calculated values

## Data Architecture

### Static Game Content

- All game data in [src/data/](../src/data/): events, skills, items, flavor text, aircraft, jobs
- **IMMUTABLE**: Never mutate imported data objects - they're templates
- **Event pattern**: Use `Omit<GameEvent, 'timeLeft'>` in data files (see [events.ts](../src/data/events.ts))
  - Time added at spawn: `{ ...template, timeLeft: totalTime }`

### Type Safety

- [types.ts](../src/types.ts): 379 lines of interfaces/enums (e.g., `GameState`, `ResourceState`, `GameEvent`)
- Path alias: `@/` → `src/` (configured in vite.config.ts)
- Import style: `import { GameState } from '@/types'` or relative `'../types.ts'`

## Development Workflows

### Testing Commands

```bash
npm test              # Vitest watch mode (use this during development)
npm run test:run      # CI mode (single run)
npm run test:coverage # Generate coverage report → coverage/
npm run test:e2e      # Playwright E2E tests
```

### Test Patterns

- **Fixtures**: Use [**tests**/fixtures/gameStates.ts](../__tests__/fixtures/gameStates.ts) for common scenarios
  ```typescript
  import { initialGameState } from '../fixtures/gameStates';
  const testState = {
    ...initialGameState,
    resources: { ...initialGameState.resources, credits: 1000 },
  };
  ```
- **Seeded random**: Use `createSeededRandom('test-seed')` from [testHelpers.ts](../src/utils/testHelpers.ts) for deterministic tests
- **Logic tests**: Test pure functions in [**tests**/logic/](../__tests__/logic/) - see [levels.test.ts](../__tests__/logic/levels.test.ts) for examples

### Testing Patterns in Depth

**Slice Testing Pattern** (see [hangarSlice.test.ts](../__tests__/slices/hangarSlice.test.ts))

```typescript
import { hangarReducer } from '@/state/slices/hangarSlice';
import { midGameState } from '../fixtures/gameStates';

describe('hangarSlice', () => {
  it('should handle LISTEN_RADIO action', () => {
    const sliceState = {
      resources: midGameState.resources,
      flags: midGameState.flags,
      // ... extract only slice-relevant state
    };
    const result = hangarReducer(sliceState, {
      type: 'LISTEN_RADIO',
      payload: {},
    });
    expect(result.logs).toHaveLength(1);
    expect(result.resources.sanity).toBeLessThanOrEqual(100);
  });
});
```

**Deterministic Random Testing**

```typescript
import { mockMathRandom } from '../utils/testHelpers';

describe('random event system', () => {
  it('should trigger void broadcast predictably', () => {
    const restore = mockMathRandom('test-seed-123');
    // Test logic that depends on Math.random()
    restore(); // Always clean up!
  });
});
```

**State Immutability Verification**

```typescript
import { verifyImmutability } from '../utils/testHelpers';

it('should not mutate original state', () => {
  const original = { ...initialGameState };
  const updated = gameReducer(original, { type: 'TICK', payload: { delta: 1000 } });
  expect(verifyImmutability(original, updated)).toBe(true);
});
```

**Fixture Usage Patterns**

```typescript
// Use pre-built fixtures for common scenarios
import {
  crisisGameState, // Low sanity, high suspicion
  fearState, // isAfraid flag active
  nightCrewActiveState, // Delegation systems enabled
  sls3UnlockedState, // Late-game content unlocked
} from '../fixtures/gameStates';

// Modify fixtures for specific test needs
const testState = {
  ...crisisGameState,
  resources: { ...crisisGameState.resources, suspicion: 99 },
};
```

### Development Server

```bash
npm run dev          # Starts Vite at http://localhost:5173
# Dev mode: Call window.enableDevMode() in browser console
```

### Code Quality

```bash
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Prettier formatting
# Pre-commit: Husky + lint-staged runs both automatically
```

## Project-Specific Conventions

### Component Structure

- Modals lazy-loaded in [App.tsx](../src/App.tsx) for code splitting
- [ActionPanel.tsx](../src/components/ActionPanel.tsx): Router that renders active tab component
- Tabs export default component, handle their own action dispatch

### Component Architecture Patterns

**Tab Component Structure** (example from [BackshopsTab.tsx](../src/components/BackshopsTab.tsx))

```typescript
const BackshopsTab: React.FC<{ state: GameState; onAction: (...) => void }> = ({ state, onAction }) => {
  // Tabs are pure UI - no state management, only dispatch actions
  return (
    <div className="space-y-6">
      <h3>Backshops Area</h3>
      <ActionButton
        label="Clean ULD Container"
        onClick={() => onAction('CLEAN_ULD')}
        cost={{ label: 'FOCUS', value: 40 }}
        disabled={state.resources.focus < 40}
      />
    </div>
  );
};
```

**ActionButton Pattern** (all tabs use this)

```typescript
<ActionButton
  label="Perform Action"
  onClick={() => onAction('ACTION_TYPE', { payload: 'data' })}
  cost={{ label: 'FOC', value: 25 }}        // Optional cost display
  cooldown={60000}                           // Optional cooldown in ms
  disabled={!canPerformAction}               // Disable logic
  description="Tooltip/explanation text"    // Optional hover text
  className="border-red-900 text-red-400"   // Optional styling
/>
```

**Modal Lazy Loading Pattern** (from [App.tsx](../src/App.tsx))

```typescript
// Lazy load modals to reduce initial bundle size
const DashboardModal = lazy(() => import('./components/DashboardModal.tsx'));
const CalibrationMinigame = lazy(() => import('./components/CalibrationMinigame.tsx'));

// Render with Suspense boundary
{isDashboardOpen && (
  <Suspense fallback={<LoadingFallback />}>
    <DashboardModal state={state} onAction={onAction} onClose={() => setIsOpen(false)} />
  </Suspense>
)}
```

**Event Display Pattern** (from [ActionPanel.tsx](../src/components/ActionPanel.tsx))

```typescript
// Events render at top of active tab with color-coded urgency
const renderActiveEvent = () => {
  if (!state.activeEvent) return null;
  const progress = (event.timeLeft / event.totalTime) * 100;

  // Color scheme based on event type
  let borderColor = 'border-amber-600';  // Default: incidents
  if (event.type === 'audit') borderColor = 'border-red-600';
  if (event.type === 'eldritch_manifestation') borderColor = 'border-purple-900';

  return (
    <div className={`border-2 ${borderColor} relative`}>
      <div className="h-1.5 bg-current" style={{ width: `${progress}%` }} />
      {/* Event content */}
    </div>
  );
};
```

### Resource Management

- Focus: action capacity, suspicion: termination risk, sanity: madness threshold
- Clamping handled in resourcesSlice, not components
- Auto-save: [useAutoSave.ts](../src/hooks/useAutoSave.ts) persists to localStorage every 60s + beforeunload

### Adding New Actions

1. Define action type in relevant slice (e.g., `HangarAction` in hangarSlice.ts)
2. Add handler in slice reducer using Immer's `produce()`
3. Register in `SLICE_ACTIONS` array in [reducerComposer.ts](../src/state/reducerComposer.ts)
4. Add costs to `BASE_FOCUS_COSTS` in [CostCalculator.ts](../src/services/CostCalculator.ts)
5. Add rewards to `BASE_EXPERIENCE_REWARDS` in [RewardCalculator.ts](../src/services/RewardCalculator.ts)

## Critical Context

### Event System Deep Dive

**Event Data Structure** (from [events.ts](../src/data/events.ts))

```typescript
// Events are defined without timeLeft - it's added at spawn
type EventTemplates = Omit<GameEvent, 'timeLeft'>;

const eventsData: Record<string, EventTemplates[]> = {
  audit: [
    {
      id: 'FAA_INSPECTOR',
      type: 'audit',
      suitType: 'FAA_INSPECTOR',
      title: 'FAA Spot-Check',
      description: 'A regulatory inspector is performing a random spot-check...',
      totalTime: 40000, // Duration in milliseconds
      choices: [
        {
          id: 'comply',
          label: 'Present Documentation',
          cost: { resource: 'focus', amount: 30 },
          log: 'You present your A&P license...',
          effects: { experience: 350, suspicion: 5 },
        },
      ],
      failureOutcome: {
        log: 'FAILURE TO COMPLY: The FAA inspector has filed a report.',
        effects: { suspicion: 25, sanity: -10 },
      },
    },
  ],
};
```

**Multi-Choice Event Pattern**

- Events with `choices[]` present multiple buttons to player
- Each choice has optional `cost` (checked before allowing action)
- Each choice has `effects` applied to resources on selection
- Use `nextEventId` to chain events: `nextEventId: 'incident:RUSH_JOB_ACTIVE'`

**Single-Action Time-Sensitive Pattern**

- Events with `requiredAction` (string) have one button with countdown
- Player must complete action before `timeLeft` reaches 0
- Has both `successOutcome` and `failureOutcome`

**Event Triggering Flow**

1. Tick processor checks conditions: `if (Math.random() < 0.001 * (delta / 1000))`
2. Calls `triggerEvent('audit', 'SPECIFIC_EVENT_ID')` via callback
3. `eventsSlice.ts` handles TRIGGER_EVENT action
4. Finds template from `eventsData`, adds `timeLeft: totalTime`
5. Sets `draft.activeEvent = { ...template, timeLeft: totalTime }`

**Event Resolution**

- Player actions dispatch `RESOLVE_EVENT` with `choiceId`
- `eventsSlice.ts` applies effects, adds log, clears `activeEvent`
- Failure (timeout) applies `failureOutcome` automatically in tick processor

### Debugging Guide

**State Desync Issues**

```typescript
// WRONG: Mutating state directly
state.resources.credits += 100; // ❌ Breaks Immer's tracking

// CORRECT: Use produce() or work within draft
return produce(state, (draft) => {
  draft.resources.credits += 100; // ✅ Immer tracks this
});
```

**Event Not Triggering**

1. Check if another event is active: `state.activeEvent !== null` blocks new events
2. Verify probability calculation: `Math.random() < 0.001 * (delta / 1000)` scales with delta
3. Check event exists in `eventsData`: Typos in event ID cause silent failures
4. Verify active tab: Some events only trigger in specific tabs (BACKSHOPS)

**Action Not Working**

1. Check if action is registered in `reducerComposer.ts` SLICE_ACTIONS array
2. Verify cost calculation in `CostCalculator.ts` BASE_FOCUS_COSTS
3. Check slice reducer has handler for action type
4. Inspect browser console for Redux-style action logging (if dev mode active)

**Resource Clamping**

- All resources should clamp in `resourcesSlice.ts`, not in UI
- Sanity: `Math.max(0, Math.min(100, newValue))`
- Focus: Auto-regenerates in tick, clamp to 0-100
- Suspicion: Game over at 100, but allow it to reach 100 for death screen

**Testing State Changes**

```typescript
// Use fixtures to set up complex scenarios quickly
import { crisisGameState } from '../fixtures/gameStates';

// Then modify for specific test
const testState = {
  ...crisisGameState,
  activeEvent: mockAuditEvent,
};

// Verify immutability
const result = reducer(testState, action);
expect(result).not.toBe(testState); // New reference
expect(testState.resources).toBe(testState.resources); // Original unchanged
```

**Common Pitfalls**

- **Logs not appearing**: Use `addLogToDraft()` from logService, not `draft.logs.push()`
- **Tool condition not updating**: Tool must be in inventory AND in toolConditions object
- **Tab-specific actions**: Passive effects like suspicion gain tied to activeTab in useGameEngine
- **Save/load corruption**: Always use `stateValidator.ts` when loading from localStorage

### Aviation Domain Knowledge

**Critical Terminology**

- **Rotables**: Reusable/repairable aircraft components (hydraulic pumps, avionics, actuators). Track condition, P/N (part number), S/N (serial number)
- **NDT (Non-Destructive Testing)**: Inspection methods that don't damage the part
  - Ultrasonic: Sound waves detect internal cracks
  - HFEC (High-Frequency Eddy Current): Electromagnetic inspection for surface cracks
  - Borescope: Camera inspection of engine internals
  - Dye Penetrant: Liquid reveals surface defects
- **SRF (Service Release Form)**: Paperwork certifying work completion - bureaucratic horror potential
- **ETOPS (Extended Operations)**: Twin-engine long-distance flights (e.g., over oceans). Higher scrutiny/suspicion
- **Line Maintenance**: Quick turnaround work at the gate (transit checks, daily checks)
- **Heavy Maintenance**: Deep inspections in hangars, component overhaul
- **P/N**: Part Number - manufacturer's identifier for component type
- **S/N**: Serial Number - unique identifier for specific component instance
- **APU (Auxiliary Power Unit)**: Small jet engine that provides power when main engines off
- **MEL (Minimum Equipment List)**: What can be broken and still fly (legally)

**Aircraft Types in Game**

- MD-80: Old, loud, analog. More mechanical issues. Nostalgic horror.
- B737-400: Classic Boeing. Reliable but aging fleet.
- B737-700: Modern, digital. Less character. Corporate feel.
- A330: Wide-body Airbus. Complex systems. European bureaucracy.
- B777-200ER: Large twin-engine. ETOPS certified. High stakes.
- A300 (Cargo): No cabin crew interactions. Mysterious cargo.

**Job Types**

- **Transit Check**: 15-30 min, visual inspection between flights
- **Daily Check**: 1-2 hours, detailed inspection, fluid checks
- **ETOPS Check**: 3-4 hours, rigorous inspection for long-distance flight approval

**Maintenance Areas**

- **Apron/Line**: Outdoor aircraft parking, quick turnarounds
- **Hangar**: Indoor heavy maintenance, mysterious backshops
- **Toolroom**: Tool calibration, precision equipment checkout
- **Backshops**: Component overhaul, where "weird parts" come from

### Known Issues (from ROADMAP.md)

- ⚠️ Component test coverage is ~5% (only ErrorBoundary tested) - logic/services are well-tested at 75%
- Legacy files need migration: tickProcessor.ts (297 lines), actionProcessor.ts (1139 lines)

### ESLint Config

- Flat config in [eslint.config.js](../eslint.config.js) (TypeScript ESLint 8.x)
- React 19 with new JSX transform
- Ignores: dist/, coverage/, node_modules/

## Quick Reference

- **State composition**: Draft mutations in slices → composed in reducerComposer → returned to App
- **Log messages**: Use `addLogToDraft()` from logService in slices, not manual array pushes
- **Time-based logic**: All durations in milliseconds, use delta time from TICK payload
- **Aviation terms**: Rotables (reusable parts), NDT (non-destructive testing), SRF (service release form), ETOPS (extended operations)

---

## Game Narrative & Writing Guidelines

### Lovecraftian Horror Theme

**Core Aesthetic**: Blend mundane aviation maintenance with cosmic horror. Horror emerges from the intersection of bureaucratic routine and inexplicable phenomena. Maintain this delicate balance in ALL text.

### Writing Style Requirements

**Logs & System Messages**

```typescript
// Mundane actions: Clinical, technical language
'Rivet installation complete. Torque verified to spec.';
'Tool calibration verified. Condition: 98.7%.';

// Subtle wrongness: Technical anomalies create unease
'Serial number reads as: UNTRACEABLE';
"The transponder signature doesn't match any known aircraft.";

// Horror escalation (high suspicion/low sanity):
'The metal groans under your touch, as if alive.';
'You hear whispers through the radio static. They know your name.';

// FORBIDDEN: Never use exclamation points for horror
'The Suits are watching!!!'; // ❌ Melodramatic
'The Suits are watching.'; // ✅ Understated dread
```

**Event Descriptions**

The Suits Pattern:

```typescript
// ✅ GOOD: Maintain ambiguity - corporate AND supernatural
description: "Tall figures in charcoal grey. They don't have badges. They just watch from the mezzanine.";

// ❌ BAD: Never explicitly confirm supernatural
description: 'Eldritch beings in suits teleport into the hangar!';
```

Technical Precision:

```typescript
// Ground horror in real aviation terminology
"Component P/N: [REDACTED]. This part shouldn't exist according to the Parts Catalog.";
'The APU is cycling itself without input. Hydraulic pressure fluctuates impossibly.';
```

Bureaucratic Dread:

```typescript
// Real horror is administrative
'Your file has been flagged. A performance review has been scheduled.';
'NOTICE: Mandatory drug screening - Report to HR within 2 hours.';
```

### Resource & Narrative Naming

- **Sanity**: Mental state. Drains from anomalies, overwork, The Suits' presence
- **Suspicion**: Corporate/regulatory scrutiny. Rises from rule-breaking, delegation, untraceable parts
- **Focus**: Concentration. Required for technical work. Depleted by fear, hallucinations
- **Kardex Fragments**: Cryptic references to mysterious KARDEX system. **Never fully explain what it is**

### Narrative Progression Arc

**Early game (Sanity 100-70): Routine with subtle oddities**

```typescript
"The aircraft's registration doesn't match any records you can find.";
'You find a passenger manifest with one too many names.';
'The janitor appears at odd hours, always watching from the shadows.';
```

**Mid game (Sanity 70-40): Escalating weirdness**

```typescript
'Component label: 9M-MRO SALVAGE. That flight disappeared a decade ago.';
'The Suits arrive unannounced. They inspect your bench without speaking.';
"Radio chatter: '...coordinates don't exist... the star is dead...'";
```

**Late game (Sanity 40-0): Reality breakdown**

```typescript
'The fuselage breathes. You can feel its pulse through your tools.';
"The rivets you installed yesterday are rusted through. It's been twenty minutes.";
"The Suits converge. They know what you've seen. They've always known.";
```

### Specific Content Guidelines

**Event Types & Tone**

- **Audit events**: Kafkaesque bureaucracy meets corporate horror. Emphasize powerlessness
- **Accidents**: Sudden, visceral, technical failures with unexplained causes
- **Eldritch manifestations**: Physics-defying phenomena as technical anomalies
- **Incidents**: Mundane problems hinting at deeper wrongness

**NPC Voice**

Toolroom Master:

```typescript
// Gruff, experienced, hints at dark knowledge
"Been here 30 years. Used to be more techs on this shift. Now it's just me.";
"That part you're asking about? It's not in the catalog. Never ask about those again.";
```

Radio Chatter (from [flavor.ts](../src/data/flavor.ts)):

```typescript
// Mix normal ATC with impossible transmissions
STANDARD_RADIO_CHATTER: [
  'Ground, Aircraft 234 requesting pushback, Gate B12.',
  'Tower, Heavy 981 on final, runway 24L.',
];

VOID_BROADCASTS: [
  '...coordinate 9M-MRO... all frequencies... the star is dead...',
  '...they are watching... through the windows... through the metal...',
];
```

Email/Memos:

```typescript
// Corporate doublespeak hiding sinister implications
'RE: Parts Inventory Discrepancy - Please disregard previous memo. No further action required.';
'REMINDER: Do not access Sub-Level Storage 3 without proper authorization. Violators will be subject to immediate review.';
```

### Atmospheric Details

**Always mention sensory details:**

- **Lighting**: "fluorescent flicker", "sodium vapor glow", "darkness between the rafters"
- **Sound**: "APU whine", "riveter staccato", "hangar echo", "unnatural silence"
- **Space**: Hangar is vast/empty/oppressive. Backshops are claustrophobic

Example (from [BackshopsTab.tsx](../src/components/BackshopsTab.tsx)):

```typescript
description: 'The ULD containers are stacked in the darkness. Something moves between them.';
```

### Content Checklist

When writing ANY new game text, verify:

- ✅ Uses precise aviation/maintenance terminology
- ✅ Avoids explaining supernatural directly (maintain ambiguity)
- ✅ Maintains clinical tone even when describing horror
- ✅ Escalates appropriately with player's sanity/suspicion levels
- ✅ Respects established lore (KARDEX, The Suits, 9M-MRO references)
- ✅ Builds dread through understatement, not jump scares

### Forbidden Elements

- ❌ Explicit monster descriptions (keep entities ambiguous)
- ❌ Supernatural powers for player (you're just a mechanic)
- ❌ Happy endings or reassurance (horror is inescapable)
- ❌ Breaking fourth wall or meta-humor
- ❌ Over-the-top gore (this is psychological horror)
- ❌ Exclamation points in horror text (understatement is key)

### Reference Examples from Codebase

- **Flavor text**: See `ACTION_LOGS`, `VOID_BROADCASTS`, `SYSTEM_LOGS` in [data/flavor.ts](../src/data/flavor.ts)
- **Event structure**: Study [data/events.ts](../src/data/events.ts) for proper escalation patterns
- **Event handling**: Review [state/slices/eventsSlice.ts](../src/state/slices/eventsSlice.ts) for event resolution logic
- **NPC dialog**: Check `TOOLROOM_MASTER_DIALOGUE` for character voice consistency

---

## Development Workflows & Checklists

> **🚨 MANDATORY REQUIREMENTS FOR ALL TASKS:**
>
> - ✅ **100% Test Coverage**: Write/update tests for ALL new code
> - ✅ **Zero Lint Errors**: Run `npm run lint:fix` before completion
> - ✅ **Documentation**: Update relevant docs (README, ROADMAP, this file)

### Workflow 1: Adding a New Action

**Use Case**: Adding player interaction like "CALIBRATE_TOOL" or "INSPECT_CARGO"

**Step 1: Define Action in Relevant Slice**

```typescript
// File: src/state/slices/hangarSlice.ts (or appropriate domain slice)

export type HangarAction =
  | { type: 'EXISTING_ACTION'; payload: Record<string, unknown> }
  | { type: 'CALIBRATE_TOOL'; payload: { toolId: string } }; // ✅ Add this
// ... other actions
```

**Step 2: Implement Action Handler with Immer**

```typescript
// In same slice file, inside produce() block
export const hangarReducer = produce((draft, action) => {
  switch (action.type) {
    case 'CALIBRATE_TOOL': {
      const { toolId } = action.payload;

      // Check preconditions
      if (!draft.inventory[toolId]) {
        addLog('ERROR: Tool not found', 'error');
        return;
      }

      // Mutate draft safely with Immer
      draft.toolConditions[toolId] = 100;
      draft.resources.credits -= 50;
      addLog(`${toolId} calibrated successfully.`, 'success');
      break;
    }
  }
});
```

**Step 3: Register in Reducer Composer**

```typescript
// File: src/state/reducerComposer.ts
const HANGAR_ACTIONS = [
  'LISTEN_RADIO',
  'FOD_SWEEP',
  'CALIBRATE_TOOL', // ✅ Add to appropriate array
  // ...
] as const;
```

**Step 4: Add Cost Configuration**

```typescript
// File: src/services/CostCalculator.ts
export const BASE_FOCUS_COSTS: Record<string, number> = {
  CLEAN_ULD: 40,
  CALIBRATE_TOOL: 30, // ✅ Add cost entry
  // ...
};
```

**Step 5: Add Reward Configuration**

```typescript
// File: src/services/RewardCalculator.ts
export const BASE_EXPERIENCE_REWARDS = {
  TRANSIT_CHECK: 120,
  CALIBRATE_TOOL: 200, // ✅ Add reward entry
  // ...
};
```

**Step 6: Add UI Button in Tab Component**

```typescript
// File: src/components/ToolroomTab.tsx (or appropriate tab)
<ActionButton
  label="Calibrate Tool"
  onClick={() => onAction('CALIBRATE_TOOL', { toolId: 'torquemeter' })}
  cost={{ label: 'FOCUS', value: 30 }}
  disabled={state.resources.focus < 30}
  description="Restore tool to 100% condition. Requires calibration equipment."
/>
```

**Step 7: Write Tests** (MANDATORY)

```typescript
// File: __tests__/slices/hangarSlice.test.ts
describe('CALIBRATE_TOOL action', () => {
  it('should calibrate tool and deduct cost', () => {
    const state = {
      ...initialState,
      inventory: { torquemeter: true },
      toolConditions: { torquemeter: 50 },
      resources: { ...initialState.resources, credits: 100 },
    };

    const result = hangarReducer(state, {
      type: 'CALIBRATE_TOOL',
      payload: { toolId: 'torquemeter' },
    });

    expect(result.toolConditions.torquemeter).toBe(100);
    expect(result.resources.credits).toBe(50);
    expect(result.logs[0].text).toContain('calibrated successfully');
  });

  it('should handle missing tool gracefully', () => {
    const state = { ...initialState, inventory: { torquemeter: false } };

    const result = hangarReducer(state, {
      type: 'CALIBRATE_TOOL',
      payload: { toolId: 'torquemeter' },
    });

    expect(result.logs[0].type).toBe('error');
  });
});
```

**Step 8: Quality Checks** (MANDATORY)

```bash
# Run tests
npm test -- hangarSlice.test.ts

# Check coverage
npm run test:coverage

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Verify in dev mode
npm run dev
# Test in browser with window.enableDevMode()
```

**Step 9: Update Documentation**

- [ ] Add action to ROADMAP.md feature list
- [ ] Update copilot-instructions.md if pattern is unique
- [ ] Add JSDoc comments to action handler

---

### Workflow 2: Adding a New Event

**Use Case**: Creating time-sensitive events like audits, accidents, or manifestations

**Step 1: Design Event Data**

```typescript
// File: src/data/events.ts
export const eventsData: Record<string, EventTemplates[]> = {
  audit: [
    // ... existing events
    {
      id: 'SAFETY_AUDIT',
      type: 'audit',
      suitType: 'INTERNAL_SECURITY',
      title: 'Emergency Safety Audit',
      description:
        'Corporate safety inspectors arrived unannounced. All work must halt for compliance review.',
      totalTime: 45000, // 45 seconds
      choices: [
        {
          id: 'comply',
          label: 'Submit to Inspection',
          cost: { resource: 'focus', amount: 40 },
          log: 'You cooperate fully. They find minor violations but issue only a warning.',
          effects: { experience: 200, suspicion: 8 },
        },
        {
          id: 'stall',
          label: 'Request Documentation Time',
          cost: { resource: 'sanity', amount: 15 },
          log: 'You buy time to hide discrepancies. Risky, but effective.',
          effects: { suspicion: -5, experience: 300 },
        },
      ],
      failureOutcome: {
        log: 'AUDIT FAILURE: Non-compliance citation issued. Your file has been flagged.',
        effects: { suspicion: 35, credits: -500 },
      },
    },
  ],
};
```

**Step 2: Add Flavor Text** (Follow narrative guidelines!)

```typescript
// File: src/data/flavor.ts
export const ACTION_LOGS: Record<string, string> = {
  // ... existing logs
  SAFETY_AUDIT_COMPLY:
    'The inspectors scrutinize your bench. Every rivet, every torque reading. They say nothing. They just... record.',
  SAFETY_AUDIT_STALL:
    'You produce binders of documentation, burying them in paperwork. They seem annoyed but accept the delay.',
};
```

**Step 3: Add Triggering Logic** (if probabilistic)

```typescript
// File: src/state/gameReducer.ts (in processTick function)
if (draft.resources.suspicion > 50 && Math.random() < 0.0003 * (delta / 1000)) {
  triggerEvent('audit', 'SAFETY_AUDIT');
}
```

**Step 4: Write Event Tests** (MANDATORY)

```typescript
// File: __tests__/slices/eventsSlice.test.ts
describe('SAFETY_AUDIT event', () => {
  it('should trigger and display event correctly', () => {
    const state = initialGameState;

    const result = eventsReducer(state, {
      type: 'TRIGGER_EVENT',
      payload: { type: 'audit', id: 'SAFETY_AUDIT' },
    });

    expect(result.activeEvent).toBeDefined();
    expect(result.activeEvent?.id).toBe('SAFETY_AUDIT');
    expect(result.activeEvent?.timeLeft).toBe(45000);
    expect(result.activeEvent?.choices).toHaveLength(2);
  });

  it('should handle comply choice correctly', () => {
    const state = {
      ...initialGameState,
      activeEvent: mockSafetyAuditEvent,
    };

    const result = eventsReducer(state, {
      type: 'RESOLVE_EVENT',
      payload: { choiceId: 'comply' },
    });

    expect(result.activeEvent).toBeNull();
    expect(result.resources.suspicion).toBe(8);
    expect(result.logs[0].text).toContain('cooperate');
  });

  it('should apply failure outcome on timeout', () => {
    // Test timeout scenario (handled in gameReducer tick)
    const state = {
      ...initialGameState,
      activeEvent: { ...mockSafetyAuditEvent, timeLeft: 0 },
    };

    const result = gameReducer(state, {
      type: 'TICK',
      payload: { delta: 1000, triggerEvent: vi.fn(), activeTab: TabType.HANGAR },
    });

    expect(result.resources.suspicion).toBeGreaterThan(30);
  });
});
```

**Step 5: Quality Checks** (MANDATORY)

```bash
npm test -- eventsSlice.test.ts
npm run test:coverage
npm run lint:fix
npm run format
```

**Step 6: Documentation**

- [ ] Add event ID to event types reference in types.ts comments
- [ ] Update ROADMAP.md with new event feature
- [ ] Document trigger conditions

---

### Workflow 3: Adding a New Component/Tab

**Use Case**: Creating new gameplay area like "SecurityOfficeTab" or "CargoHoldTab"

**Step 1: Add Tab to TabType Enum**

```typescript
// File: src/types.ts
export enum TabType {
  STRUCTURE_SHOP = 'STRUCTURE_SHOP',
  HANGAR = 'HANGAR',
  SECURITY_OFFICE = 'SECURITY_OFFICE', // ✅ Add new tab
  // ... existing tabs
}
```

**Step 2: Create Tab Component**

```typescript
// File: src/components/SecurityOfficeTab.tsx
import React from 'react';
import { GameState } from '../types';
import ActionButton from './ActionButton';

const SecurityOfficeTab: React.FC<{
  state: GameState;
  onAction: (type: string, payload?: Record<string, unknown>) => void;
}> = ({ state, onAction }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xs text-emerald-700 uppercase tracking-widest border-b border-emerald-900/30 pb-2">
        Security Office
      </h3>

      <p className="text-[10px] text-zinc-500 italic">
        The office is cramped and windowless. Banks of monitors show grainy footage of empty hangars.
        A filing cabinet in the corner has a lock that looks recently forced.
      </p>

      <div className="p-4 border border-emerald-900/40 bg-black/40">
        <h4 className="text-[10px] text-emerald-600 uppercase mb-4 font-bold">Actions</h4>
        <div className="grid grid-cols-2 gap-3">
          <ActionButton
            label="Review Footage"
            onClick={() => onAction('REVIEW_FOOTAGE')}
            cost={{ label: 'FOCUS', value: 20 }}
            description="Scan through security recordings. Looking for... what?"
          />
          <ActionButton
            label="Check Access Logs"
            onClick={() => onAction('CHECK_ACCESS_LOGS')}
            cost={{ label: 'FOCUS', value: 15 }}
            description="See who entered restricted areas during the night shift."
          />
        </div>
      </div>
    </div>
  );
};

export default SecurityOfficeTab;
```

**Step 3: Register in ActionPanel Router**

```typescript
// File: src/components/ActionPanel.tsx
import SecurityOfficeTab from './SecurityOfficeTab';

// In switch statement:
switch (activeTab) {
  case TabType.SECURITY_OFFICE:
    return <SecurityOfficeTab state={state} onAction={onAction} />;
  // ... other cases
}
```

**Step 4: Add Tab Button to App Header**

```typescript
// File: src/App.tsx (in header section)
{Object.values(TabType).map((t) => (
  <button
    key={t}
    onClick={() => { playClick(); setActiveTab(t); }}
    className={/* ... styling ... */}
  >
    [ {t.replace(/_/g, ' ')} ]
  </button>
))}
```

**Step 5: Create Component Tests** (MANDATORY)

```typescript
// File: __tests__/components/SecurityOfficeTab.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import SecurityOfficeTab from '@/components/SecurityOfficeTab';
import { initialGameState } from '../fixtures/gameStates';

describe('SecurityOfficeTab', () => {
  const mockOnAction = vi.fn();

  it('should render tab with title and description', () => {
    render(<SecurityOfficeTab state={initialGameState} onAction={mockOnAction} />);

    expect(screen.getByText(/Security Office/i)).toBeInTheDocument();
    expect(screen.getByText(/banks of monitors/i)).toBeInTheDocument();
  });

  it('should dispatch REVIEW_FOOTAGE action on button click', () => {
    render(<SecurityOfficeTab state={initialGameState} onAction={mockOnAction} />);

    const button = screen.getByText(/Review Footage/i);
    fireEvent.click(button);

    expect(mockOnAction).toHaveBeenCalledWith('REVIEW_FOOTAGE', undefined);
  });

  it('should disable buttons when focus is insufficient', () => {
    const lowFocusState = {
      ...initialGameState,
      resources: { ...initialGameState.resources, focus: 5 }
    };

    render(<SecurityOfficeTab state={lowFocusState} onAction={mockOnAction} />);

    const button = screen.getByText(/Review Footage/i);
    expect(button).toBeDisabled();
  });
});
```

**Step 6: Quality Checks** (MANDATORY)

```bash
npm test -- SecurityOfficeTab.test.tsx
npm run test:coverage
npm run lint:fix
npm run format
npm run dev  # Verify UI renders correctly
```

**Step 7: Documentation**

- [ ] Add component to component structure in copilot-instructions.md
- [ ] Update ROADMAP.md with new tab feature
- [ ] Add JSDoc comments explaining tab purpose

---

### Workflow 4: Debugging Game State Issues

**Symptom**: State not updating, actions not working, desyncs between UI and state

**Step 1: Enable Dev Mode**

```javascript
// In browser console:
window.enableDevMode();
// Opens DevModeModal with live state inspector
```

**Step 2: Check Action Registration**

```typescript
// Verify action is in correct slice array in reducerComposer.ts
const HANGAR_ACTIONS = [
  'LISTEN_RADIO',
  'YOUR_ACTION_HERE', // ❓ Is it listed?
];

// Check if slice is imported
import { HangarAction, hangarReducer } from './slices/hangarSlice.ts';
```

**Step 3: Verify Reducer Logic with Immer**

```typescript
// WRONG - Direct mutation without produce()
state.resources.credits += 100; // ❌ Breaks immutability

// CORRECT - Using produce() wrapper
return produce(state, (draft) => {
  draft.resources.credits += 100; // ✅ Immer tracks changes
});
```

**Step 4: Check Cost/Resource Validation**

```typescript
// Verify cost exists in CostCalculator.ts
export const BASE_FOCUS_COSTS: Record<string, number> = {
  YOUR_ACTION: 30, // ❓ Is it defined?
};

// Check validation in slice reducer
if (draft.resources.focus < 30) {
  addLog('Insufficient focus', 'error');
  return; // Early return prevents execution
}
```

**Step 5: Inspect State Flow with Logging**

```typescript
// Add temporary debug logs in slice
export const hangarReducer = produce((draft, action) => {
  console.log('🔍 Action received:', action.type, action.payload);

  switch (action.type) {
    case 'YOUR_ACTION':
      console.log('🔍 Before:', draft.resources.credits);
      draft.resources.credits += 100;
      console.log('🔍 After:', draft.resources.credits);
      break;
  }
});
```

**Step 6: Use Fixture-Based Testing**

```typescript
// Isolate issue with controlled test
const testState = {
  ...crisisGameState, // Use relevant fixture
  resources: { ...crisisGameState.resources, focus: 100 },
};

const result = hangarReducer(testState, {
  type: 'YOUR_ACTION',
  payload: {},
});

console.log('Expected credits: 200, Actual:', result.resources.credits);
```

**Step 7: Check Browser Console**

- Look for React errors (red text)
- Check for undefined variables
- Verify action dispatch calls
- Inspect `state` object in console: `console.log(state.resources)`

**Step 8: Verify localStorage Corruption**

```javascript
// Clear corrupted save data
localStorage.removeItem('the_hangar_save_hf_v26_full_hf');
window.location.reload();
```

---

### Workflow 5: UI Fixes

**Use Case**: Visual bugs, layout issues, responsive design problems

**Step 1: Identify Component**

```bash
# Find component file
npm run dev
# Inspect element in browser DevTools
# Check React component tree
```

**Step 2: Fix Styling with TailwindCSS**

```typescript
// Follow project's terminal aesthetic
<div className="
  p-4                          // Padding
  border border-emerald-900/40 // Border with opacity
  bg-black/40                  // Semi-transparent background
  text-emerald-500             // Terminal green text
  text-[10px]                  // Precise font size
  uppercase tracking-widest    // Terminal styling
">
  Content
</div>
```

**Step 3: Verify Responsive Behavior**

```typescript
// Use grid for responsive layouts
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  <ActionButton />
  <ActionButton />
</div>
```

**Step 4: Test Visual States**

```typescript
// Test disabled, hover, active states
<ActionButton
  disabled={state.resources.focus < 30}
  className="hover:bg-emerald-900 disabled:opacity-50"
/>
```

**Step 5: Write Visual Regression Tests** (MANDATORY)

```typescript
// File: __tests__/components/YourComponent.test.tsx
it('should apply correct styling classes', () => {
  const { container } = render(<YourComponent />);
  const element = container.querySelector('.border-emerald-900');
  expect(element).toBeInTheDocument();
});

it('should handle disabled state visually', () => {
  const { container } = render(<ActionButton disabled={true} />);
  expect(container.firstChild).toHaveClass('opacity-50');
});
```

**Step 6: Quality Checks** (MANDATORY)

```bash
npm test -- YourComponent.test.tsx
npm run lint:fix
npm run format
npm run dev  # Test in multiple screen sizes
```

---

### Workflow 6: UX Fixes

**Use Case**: Confusing UI, unclear feedback, poor interaction flow

**Step 1: Identify UX Issue**

- Is user action unclear? → Add description/tooltip
- Is feedback missing? → Add log message
- Is cost hidden? → Show cost in button
- Is cooldown confusing? → Add cooldown display

**Step 2: Add Clear Action Feedback**

```typescript
// Before: Silent action
onAction('CALIBRATE_TOOL', { toolId: 'torquemeter' });

// After: Clear log feedback
onAction('CALIBRATE_TOOL', { toolId: 'torquemeter' });
// In reducer:
addLog('Torquemeter calibrated successfully. Condition: 100%', 'success');
```

**Step 3: Improve Button Affordances**

```typescript
// Before: Unclear what action does
<ActionButton label="Calibrate" onClick={() => onAction('CALIBRATE_TOOL')} />

// After: Clear cost, description, and state
<ActionButton
  label="Calibrate Torquemeter"
  onClick={() => onAction('CALIBRATE_TOOL', { toolId: 'torquemeter' })}
  cost={{ label: 'CR', value: 50 }}
  cooldown={120000}
  disabled={state.resources.credits < 50}
  description="Restore tool to factory specifications. Required for precision work."
  className={state.toolConditions.torquemeter < 50 ? 'border-amber-800' : ''}
/>
```

**Step 4: Add Progressive Disclosure**

```typescript
// Show advanced options only when relevant
{state.proficiency.unlocked.includes('advancedCalibration') && (
  <ActionButton
    label="Deep Calibration"
    description="Advanced calibration technique. Higher cost, perfect results."
  />
)}
```

**Step 5: Improve Error Messages**

```typescript
// Before: Generic error
addLog('Action failed', 'error');

// After: Specific, actionable error
addLog('ERROR: Insufficient credits (need 50, have 32). Perform jobs to earn credits.', 'error');
```

**Step 6: Write UX Tests** (MANDATORY)

```typescript
// File: __tests__/components/YourComponent.test.tsx
describe('UX improvements', () => {
  it('should show cost to user before action', () => {
    render(<ActionButton cost={{ label: 'CR', value: 50 }} />);
    expect(screen.getByText(/CR.*50/i)).toBeInTheDocument();
  });

  it('should display tooltip on hover', () => {
    render(<ActionButton description="Helpful tooltip" />);
    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);
    expect(screen.getByText(/Helpful tooltip/i)).toBeInTheDocument();
  });

  it('should provide actionable error feedback', () => {
    const state = { ...initialGameState, resources: { ...initialGameState.resources, credits: 10 } };
    render(<YourComponent state={state} />);

    const button = screen.getByText(/Calibrate/i);
    fireEvent.click(button);

    expect(screen.getByText(/need 50, have 10/i)).toBeInTheDocument();
  });
});
```

**Step 7: Quality Checks** (MANDATORY)

```bash
npm test -- YourComponent.test.tsx
npm run lint:fix
npm run format
npm run dev  # User test the flow
```

---

## Pre-Commit Checklist (ALL TASKS)

Before marking any task complete, verify:

```bash
# 1. All tests pass
npm test
✅ Expected: 0 failed, all suites pass

# 2. Coverage maintained/improved
npm run test:coverage
✅ Expected: Coverage stays ≥75% (or improves)

# 3. No lint errors
npm run lint:fix
✅ Expected: 0 errors, 0 warnings

# 4. Code formatted
npm run format
✅ Expected: All files formatted

# 5. Types are valid
npx tsc --noEmit
✅ Expected: 0 errors

# 6. Dev server runs
npm run dev
✅ Expected: Compiles without errors, UI works in browser

# 7. E2E tests pass (for major changes)
npm run test:e2e
✅ Expected: All E2E tests pass
```

**Documentation Checklist:**

- [ ] Update ROADMAP.md (if feature is user-facing)
- [ ] Update copilot-instructions.md (if pattern is reusable)
- [ ] Add/update JSDoc comments in code
- [ ] Update README.md (if workflow changes)
- [ ] Add inline code comments for complex logic

**Git Commit Message Format:**

```
<type>(<scope>): <subject>

<body>

Closes #<issue-number>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `perf`

Example:

```
feat(hangar): add tool calibration action

- Implemented CALIBRATE_TOOL action in hangarSlice
- Added cost validation and resource checks
- Created 100% test coverage for calibration flow
- Updated CostCalculator with calibration costs

Closes #42
```
