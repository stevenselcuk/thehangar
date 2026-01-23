# The Hangar - AI Coding Agent Instructions

A browser-based Lovecraftian incremental game about aircraft maintenance where night shifts blur into cosmic horror. Balance technical precision with narrative ambiguity, resource scarcity with player agency, and corporate compliance with forbidden knowledge.

## Core Design Philosophy

**Narrative Tone:** Clinical aviation documentation meets Lovecraftian dread. Never explicitly state supernatural events—ground them in technical failures ("fuel lines dissolving," "structural resonance"). Maintain ambiguity: Is this workplace stress or cosmic horror?

**Player Psychology:** Create tension through resource scarcity (Focus/Sanity/Suspicion), meaningful trade-offs (efficiency vs. safety), and slow-burn revelation (terminal logs, archive fragments, janitor warnings).

## Architecture Overview

### State Management (Custom Reducer Pattern - NOT Redux/Zustand)

**Central Orchestration:**

- `gameReducer.ts` (665 lines): Main coordinator for all state updates
- `reducerComposer.ts` (687 lines): Routes TICK and ACTION events to domain slices
  - `composeTick()`: Passive updates (resource regen, tool degradation, location effects)
  - `composeAction()`: Player actions routed to 12+ domain slices
- All slices use **Immer's `produce()`** for immutable state mutations

**Domain Slices** (`state/slices/`):

- aircraftSlice, backshopSlice, complianceSlice, encountersSlice, eventsSlice
- hangarSlice, inventorySlice, officeSlice, proficiencySlice, resourcesSlice
- shopSlice, terminalSlice, terminalLocationSlice, aogSlice (~2,700 lines total)

**Critical Pattern:**

```typescript
// All slice exports must be PURE functions using Immer
export const mySliceReducer = produce((draft: SliceState, action: SliceAction) => {
  // Mutate draft directly - Immer handles immutability
  draft.someValue += 1;
});
```

### Game Loop (15 FPS Fixed Delta-Time)

**Engine:** `useGameEngine.ts`

- `TARGET_FPS = 15` with `requestAnimationFrame` tick loop
- Delta time calculations for frame-independent updates
- Stops on death conditions: `sanity <= 0 || suspicion >= 100`

**Tick Processing:** Events countdown, tools degrade, resources regenerate, location-based effects (noise, fatigue, temperature) apply passively

**Example - Location Effects:**

```typescript
// In gameReducer.ts processTick()
const locationProps = LOCATION_PROPERTIES[activeTab];

// Noise affects focus and suspicion
if (locationProps.noise === NoiseLevel.EXTREME_HIGH) {
  draft.hfStats.socialStress += 1.5 * (delta / 1000);
  draft.resources.focus -= 5.0 * (delta / 1000);
}

// Fatigue accumulates based on location
const fatigueRate = fatigueRateMap[locationProps.fatigue];
draft.hfStats.fatigue = Math.min(100, draft.hfStats.fatigue + fatigueRate * (delta / 1000));
```

### Data Architecture

**Static Content:** All game content in `src/data/` (NEVER mutate these files):

- `events.ts`: Event templates use `Omit<GameEvent, 'timeLeft'>` pattern (time added at spawn)
- `skills.ts`, `items.ts`, `jobs.ts`, `flavor.ts`, `anomalies.ts`, `archiveData.ts`
- `locationProperties.ts`: Defines noise, fatigue, temperature per TabType
- `aircraftScenarios.ts`: Aircraft-specific encounter branches

**Type Safety:** `types.ts` (394 lines) - all interfaces must be strictly followed

**Service Layer** (`services/`): Pure calculation functions only

- `CostCalculator.ts`, `RewardCalculator.ts`: No side effects, receive state, return values
- `logService.ts`: Immutable log creation (`addLogImmutable`) vs. draft mutation (`addLogToDraft`)
- `importExportService.ts`: Save/load with obfuscation validation

**Example - Service Pattern:**

```typescript
// RewardCalculator.ts - Pure function, no state mutation
export const calculateAircraftRewards = (
  aircraftType: AircraftType,
  taskType: string,
  state: GameState
): Partial<ResourceState> => {
  const baseReward = AIRCRAFT_BASE_REWARDS[aircraftType][taskType];
  const multiplier = 1 + state.proficiency.unlocked.length * 0.05;
  return { experience: baseReward.xp * multiplier, credits: baseReward.credits };
};

// In slice reducer, call service then apply results
const rewards = calculateAircraftRewards(aircraftType, task, draftAsState);
draft.resources.credits += rewards.credits;
draft.resources.experience += rewards.experience;
```

## Gameplay Systems

### Aircraft Servicing

**Aircraft Types:** MD-80, B737-400, B737-700, A330, B777-200ER, A300 Cargo

- Each has unique event pools and scenario branches
- Task types: TRANSIT_CHECK, DAILY_CHECK, ETOPS_CHECK
- Scenarios defined in `aircraftScenarios.ts` with branching choices

**Example - Aircraft Scenario Pattern:**

```typescript
{
  id: 'MD80_SCENARIO_1',
  description: 'Technical observation with creeping wrongness...',
  choices: [
    {
      text: 'Report it by the book.',
      outcome: {
        log: 'Clinical description of consequences',
        effects: { experience: 200, suspicion: 5 },
      },
    },
    {
      text: 'Take the risky path.',
      outcome: {
        log: 'Ambiguous supernatural hint',
        effects: { crystallineResonators: 1, sanity: -10 },
        event: { type: 'incident', id: 'FOLLOW_UP_EVENT' }, // Chain events
      },
    },
  ],
}
```

### AOG (Aircraft On Ground) Deployment System

**High-stakes time-sensitive missions** where player is deployed to remote stations.

**Data Structure** (`src/data/aog.ts`):

- Stations: LHR, HND, JFK (each with difficulty/description)
- Scenarios: Runway excursion, bird strike, lightning strike
- Actions: Multi-step resolution requiring resources

**State Shape:**

```typescript
aog: {
  active: boolean;           // Is deployment active?
  stationId: string | null;  // Where deployed (e.g., 'LHR')
  scenarioId: string | null; // What happened (e.g., 'BIRD_STRIKE')
  startTime: number;         // Deployment timestamp
  completedActions: string[]; // Actions already performed
  currentProgress: number;    // Progress toward resolution
  progressRequired: number;   // Total progress needed
  actionInProgress: {         // Currently executing action
    actionId: string;
    startTime: number;
    duration: number;
  } | null;
}
```

**Workflow:**

1. Trigger via event or dev mode: `ACCEPT_AOG_DEPLOYMENT`
2. System selects random station + scenario, sets `active: true`
3. UI switches to `AOG_DEPLOYMENT` tab
4. Player performs actions: `START_AOG_ACTION` → `RESOLVE_AOG_ACTION`
5. On completion: `COMPLETE_AOG_DEPLOYMENT` (rewards credits/XP)

### Anomaly & Retrofit System

**Discovery:** Random chance when completing jobs (higher for retrofit jobs)

- Anomalies are eldritch components with impossible properties
- Example: "Harmonic Crystalline Resonator" (vibrates at impossible frequency)

**Retrofit Jobs:** Special high-reward tasks using anomalies

```typescript
{
  title: 'Retrofit Galley Coffee Maker',
  description: 'Install resonance-based heating using crystalline resonator',
  requirements: { crystallineResonators: 5, alclad: 20 },
  rewardXP: 2000,
  isRetrofit: true,
  bonusId: 'focus_regen_coffee', // Permanent passive bonus
}
```

**Pattern:**

- Anomalies discovered → stored in `state.anomalies[]`
- Trigger retrofit job via backshops: `ANALYZE_ANOMALY`
- Complete job → gain permanent bonus tracked in flags
- Bonuses: `focus_regen_coffee`, `tool_degrade_resist`, etc.

## Critical Conventions

### Writing Scenarios & Events

Follow the **clinical aviation tone** with creeping horror:

```typescript
{
  id: 'EVENT_ID',
  type: 'audit' | 'incident' | 'eldritch_manifestation',
  title: 'SHORT CAPS TITLE',
  description: 'Clinical, technical tone with creeping wrongness',
  totalTime: 40000, // milliseconds (timeLeft added at spawn)
  choices: [/* player agency with cost/effects */],
  failureOutcome: {/* consequences */}
}
```

**Best Practices:**

- Use precise aviation jargon: P/N numbers (e.g., P/N-9847-B), component designations, SRF procedures
- Ground supernatural in technical failures: "fuel lines dissolving," "structural resonance"
- Maintain ambiguity - never explicitly state what's happening (cosmic horror principle)
- See `ROADMAP.md` lines 37-48 for full scenario guidelines

**Flavor Text Categories** (`src/data/flavor.ts`):

- `VOID_BROADCASTS`: Eldritch radio messages ("THE HATCH IS NOT SEALED. YOU ARE LEAKING REALITY")
- `STANDARD_RADIO_CHATTER`: Normal aviation comms for contrast
- `TOOLROOM_MASTER_DIALOGUE`: Gruff mechanic wisdom
- `MASTER_LORE`: Hints about facility's dark history
- `KARDEX_INTEL_LOGS`: Forbidden knowledge about containment protocols
- `SYSTEM_LOGS`: Technical status messages with ominous undertones

**Event Chaining:** Use `nextEventId` to create multi-stage scenarios

```typescript
choices: [
  {
    id: 'investigate',
    label: 'Investigate the Source',
    nextEventId: 'incident:FOLLOW_UP_DISCOVERY', // Chains to next event
    effects: { sanity: -10 },
  },
];
```

### Component Creation

**Lazy Loading:** All modals use React.lazy:

```typescript
const MyModal = React.lazy(() => import('./components/MyModal.tsx'));
// Wrap usage in <Suspense fallback={<LoadingFallback />}>
```

**Styling:** TailwindCSS with terminal-green aesthetic (`emerald-500`, `emerald-900`, CRT effects)

## Testing Strategy

**Unit Tests:** Vitest + React Testing Library

- Test files: `__tests__/**/*.test.ts(x)` (co-located: `src/*//__tests__/*.test.ts`)
- Run: `npm test` (watch mode), `npm run test:run` (CI mode)
- Coverage: `npm run test:coverage` (v8 provider, no enforced thresholds)

**E2E Tests:** Playwright

- Files: `e2e/*.spec.ts`
- Run: `npm run test:e2e`, `npm run test:e2e:ui`, `npm run test:e2e:debug`
- Uses dev server (port 5173) locally, preview server (port 4173) in CI

**Key Testing Pattern:**

```typescript
// Describe blocks for context, nested for sub-features
describe('domainSlice', () => {
  describe('specificFeature', () => {
    test('should do X when Y', () => {
      /* ... */
    });
  });
});
```

**Example - Slice Test with Seeded Random:**

```typescript
import seedrandom from 'seedrandom';

beforeEach(() => {
  Math.random = seedrandom('test-aircraft-slice'); // Deterministic tests
  initialState = {
    activeAircraft: null,
    resources: { sanity: 100, focus: 100 /* ... */ },
    inventory: { pencil: true, notebook: true /* ... */ },
    flags: {
      /* ... */
    },
  };
});

it('should get new aircraft task', () => {
  const action: AircraftAction = {
    type: 'GET_NEW_AIRCRAFT_TASK',
    payload: {},
  };
  const newState = aircraftReducer(initialState, action);

  expect(newState.activeAircraft).not.toBeNull();
  expect(newState.activeAircraft?.id).toBe(AircraftType.MD_80);
  expect(newState.logs).toHaveLength(1);
});
```

**Testing Immutability:**

```typescript
it('should not mutate original state', () => {
  const action = { type: 'SOME_ACTION', payload: {} };
  const originalRef = initialState;

  aircraftReducer(initialState, action);

  expect(initialState).toBe(originalRef); // Reference unchanged
});
```

## Development Workflow

**Setup:**

```bash
npm install
npm run dev  # Starts Vite dev server at http://localhost:5173
```

**Dev Tools:**

- Browser console: `window.enableDevMode()` for dev panel
- Husky + lint-staged: Pre-commit hooks auto-format TS/TSX/JSON/MD files
- ESLint: Flat config (`eslint.config.js`), enforces `@typescript-eslint/no-explicit-any: error`

**Scripts:**

- `npm run lint` / `npm run lint:fix`: ESLint checks
- `npm run format`: Prettier auto-format
- `npm run build`: Production build (Vite outputs to `dist/`)
- `npm run bump`: Auto-increment `_build_N` version markers in code
- `npm run fresh`: Reset build version to 0

**Save System:**

- Key: `the_hangar_save__build_12` (localStorage)
- Save on: resource changes, level-ups, state mutations (auto-save via `useAutoSave.ts`)
- Import/Export: Obfuscated JSON via `importExportService.ts`

## CI/CD Pipeline

**GitHub Actions Workflows:**

**Main CI/CD** (`.github/workflows/ci.yml`):

- **Jobs:** install → lint → test → e2e → build → deploy
- **Concurrency:** Cancels previous runs on new push
- **Caching:** node_modules cached via `hashFiles('**/package-lock.json')`
- **Coverage:** Uploaded to Codecov (unittests flag)
- **E2E:** Playwright with chromium only, retries 2x in CI
- **Deployment:**
  - Staging: GitHub Pages (stevenselcuk.github.io/thehangar)
  - Production: Custom domain (hangar.tabbythecat.com)

**Other Workflows:**

- `codeql.yml`: Security scanning for vulnerabilities
- `dependency-review.yml`: PR-based dependency vulnerability checks
- `health-check.yml`: Periodic uptime monitoring

**Critical CI Commands:**

```bash
npm ci --legacy-peer-deps         # Clean install (CI)
npm run lint                       # ESLint check
npm run test:coverage              # Unit tests + coverage
npm run build                      # Vite production build
npx playwright install --with-deps # Install E2E browsers
npm run test:e2e                   # Playwright E2E tests
```

**Deployment Conditions:**

- Staging: Auto-deploy on push to `main`
- Production: Manual approval or tag-based release
- Environment variables: Set via GitHub Secrets (`VITE_BASE_PATH`, `CODECOV_TOKEN`)

**Artifact Retention:**

- Coverage reports: 7 days
- Playwright reports: 7 days (uploaded on test failure)

## Integration Points

**External Dependencies:**

- Sentry: Error monitoring (`@sentry/react`)
- lz-string: Save compression
- Immer: Immutable state updates (CRITICAL - all reducers depend on this)

**PWA Support:** vite-plugin-pwa with auto-update strategy

## Common Pitfalls

1. **Never mutate data files** (`src/data/*`) - they're templates, not state
2. **Always use `produce()` in slices** - direct mutations without Immer break state
3. **Service functions must be pure** - no direct state mutations, return values only
4. **Event templates lack `timeLeft`** - added by spawn logic, never hardcode in data
5. **Use delta time** - never assume fixed frame rate in calculations
6. **Logs**: Use `addLogToDraft()` in reducers (mutates draft), `addLogImmutable()` elsewhere

## Key Files to Reference

- State flow: [reducerComposer.ts](../src/state/reducerComposer.ts) (routing logic)
- Type definitions: [types.ts](../src/types.ts) (all interfaces)
- Game loop: [useGameEngine.ts](../src/hooks/useGameEngine.ts) (15 FPS tick)
- Scenario writing: [ROADMAP.md](../ROADMAP.md) (narrative guidelines, lines 1-50)
- Available events: [src/data/events.ts](../src/data/events.ts) (templates for all event types)

## Project Context

- **Version:** Build 12 (see `_build_` markers in code)
- **Target:** Modern browsers (React 19, TS 5.8, Vite 6.2)
- **Deployment:** Staging (GitHub Pages), Production (hangar.tabbythecat.com)
- **CI/CD:** GitHub Actions (lint, test, build, CodeQL, dependency review)
