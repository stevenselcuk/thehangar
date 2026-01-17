# The Hangar - AI Coding Agent Instructions

## Project Overview

A browser-based incremental/idle game built with React 19, TypeScript, and Vite. Players manage aircraft maintenance operations in an unsettling, Lovecraftian-themed hangar environment. The game features a tick-based engine, resource management, random events, skill progression, and multiple gameplay tabs.

## Architecture

### State Management Pattern

- **Slice-based architecture**: [state/gameReducer.ts](../src/state/gameReducer.ts) coordinates state changes (459 lines), routing to 12+ specialized domain slices via [state/reducerComposer.ts](../src/state/reducerComposer.ts) (621 lines)
- **Immer integrated**: All state updates use Immer's `produce()` for immutable draft-based mutations in gameReducer and all slices
- **Game loop**: [hooks/useGameEngine.ts](../src/hooks/useGameEngine.ts) drives `requestAnimationFrame` ticks that dispatch `TICK` actions
- **Persistence**: Auto-save to localStorage via [hooks/useAutoSave.ts](../src/hooks/useAutoSave.ts) with debouncing

### Core Game Loop Flow

1. `useGameEngine` → `requestAnimationFrame` → dispatch `TICK` with delta time
2. `gameReducer` → `composeTick()` (from reducerComposer) + `processTick()` (from logic/tickProcessor.ts) → routes to slices, mutates resources, triggers events, updates timers
3. `gameReducer` → `composeAction()` (from reducerComposer) → routes player actions to domain slices (aircraft, inventory, proficiency, events, etc.) → 12+ specialized slice reducers handle domain logic
4. `useAutoSave` → debounced localStorage save every 2 seconds

### Key Files

- [types.ts](../src/types.ts): 364 lines of TypeScript interfaces (`GameState`, `ResourceState`, `GameEvent`, etc.)
- [state/gameReducer.ts](../src/state/gameReducer.ts): 459-line orchestration reducer using Immer, delegates to slices
- [state/reducerComposer.ts](../src/state/reducerComposer.ts): 621-line slice composer, routes TICK/ACTION to 12+ domain slices
- [logic/tickProcessor.ts](../src/logic/tickProcessor.ts): 297-line tick processor (legacy manual spreading, migration to Immer pending)
- [logic/actionProcessor.ts](../src/logic/actionProcessor.ts): 1139-line action processor (legacy manual spreading, migration to Immer pending)
- [components/ActionPanel.tsx](../src/components/ActionPanel.tsx): 803 lines - largest component file, main gameplay UI orchestrator
- [data/](../src/data/): Static game content (`events.ts`, `skills.ts`, `items.ts`, `flavor.ts`, etc.) - import directly, never mutate

### Slice-Based Architecture

The game state is managed through a **slice pattern** similar to Redux Toolkit:

- **Domain slices**: 12+ specialized reducers for different game systems
- **Reducer composer**: Routes TICK and ACTION events to appropriate slices
- **Immer integration**: All slices use draft-based mutations for immutability
- **Type-safe actions**: Each slice exports its own action union type

**Slice Roster** (all fully implemented with tests in `__tests__/slices/` and `__tests__/state/slices/`):

- `aircraftSlice` (266 lines) - Aircraft state, scenarios, job cards
- `encountersSlice` (99 lines) - Random encounters & hazards
- `shopSlice` (91 lines) - Vending machine logic
- `terminalLocationSlice` (220 lines) - Terminal tab navigation
- `backshopSlice` (311 lines) - Backshop operations
- `complianceSlice` (333 lines) - Regulatory compliance tracking
- `eventsSlice` (316 lines) - Event system (audits, incidents, manifestations)
- `inventorySlice` (341 lines) - Rotables, tools, items
- `proficiencySlice` (237 lines) - Skills, training, certifications
- `terminalSlice` (286 lines) - Terminal interactions
- `hangarSlice` (266 lines) - Hangar-specific operations
- `officeSlice` - HR floor interactions

**Action Flow**: UI → `dispatch(ACTION)` → `gameReducer` → `composeAction()` → domain slice → Immer draft mutation → new state

## Testing Strategy

### Test Stack

- **Unit/Integration**: Vitest + React Testing Library + jsdom
- **E2E**: Playwright (configured but minimal coverage)
- **Deterministic testing**: Use `seedrandom` for reproducible random tests (see [utils/testHelpers.ts](../src/utils/testHelpers.ts))

### Test Organization

```
__tests__/
  fixtures/gameStates.ts  # Reusable GameState fixtures (initialGameState, midGameState, etc.)
  logic/                  # Pure functions (levels.test.ts, tickProcessor.test.ts)
  state/                  # State creation/loading
  utils/                  # Pure helpers
  components/             # Component tests (ErrorBoundary.test.ts)
```

### Testing Conventions

- **Fixtures first**: Import from `__tests__/fixtures/gameStates.ts` for common scenarios
- **Seeded random**: `import seedrandom from 'seedrandom'; Math.random = seedrandom('test-seed');`
- **Coverage targets**: 90%+ for all code (aspirational goal: 100%)
- **Run commands**: `npm test` (watch), `npm run test:coverage`, `npm run test:run` (CI)

### When Writing Tests

- Use `vitest.setup.ts` mocks (localStorage, Audio API are pre-mocked globally)
- Test tick-based logic with `processTick()` from logic/tickProcessor.ts or `composeTick()` from reducerComposer.ts - pass delta times (e.g., `1000` = 1 second)
- Use `createMockGameState()` from testHelpers for quick state creation
- Verify immutability: `expect(result).not.toBe(original)`
- **All tests run automatically in CI/CD** - ensure they pass locally before pushing
- **CI runs**: `npm ci && npm run lint && npm run test:run && npm run test:e2e && npm run build`
- **Coverage reports** are automatically uploaded to Codecov on every run
- **E2E tests** use Chromium browser in CI (install with `npx playwright install chromium`)

## Development Workflows

### Start Development

```bash
npm install
npm run dev           # Vite dev server (localhost:5173)
```

### Linting & Formatting

```bash
npm run lint          # ESLint check
npm run lint:fix      # Auto-fix issues
npm run format        # Prettier format
```

### Testing

```bash
npm test              # Vitest watch mode
npm run test:ui       # Interactive test UI
npm run test:coverage # Generate coverage report → coverage/lcov-report/index.html
npm run test:e2e      # Playwright E2E tests
```

### Build

```bash
npm run build         # Production build → dist/
npm run preview       # Preview production build
```

### CI/CD (GitHub Actions)

```bash
# All workflows run automatically on push/PR
# View status: https://github.com/stevenselcuk/thehangar/actions

# Workflows:
# - ci.yml: Main pipeline (lint, test, build, deploy)
# - codeql.yml: Security scanning
# - dependency-review.yml: PR dependency checks
# - health-check.yml: Weekly monitoring

# Manual workflow trigger (Health Check only):
# Actions tab → "Codebase Health Check" → "Run workflow"

# Local CI simulation:
npm ci                # Clean install (matches CI)
npm run lint          # Linting
npm run test:run      # Tests (CI mode)
npm run test:coverage # Coverage
npm run test:e2e      # E2E tests
npm run build         # Production build
```

**CI Environment:**

- **OS**: Ubuntu Linux (latest)
- **Node**: 20.x
- **Package Manager**: npm (clean install with `npm ci`)
- **Browser**: Chromium (for E2E tests)
- **Caching**: node_modules cached by package-lock.json hash
- **Artifacts**: Coverage reports, test reports (7-day retention)
- **Deployment**: Auto-deploy to GitHub Pages on push to `main`

**Cost**: $0 (GitHub free tier - unlimited minutes for public repos)

For detailed workflow documentation, see [.github/WORKFLOWS.md](WORKFLOWS.md)

## Code Conventions

### Imports

- **Always use `.ts`/`.tsx` extensions** in imports (e.g., `from './types.ts'` not `from './types'`)
- **Data imports**: Import static data directly from `data/` folder (e.g., `import { skillsData } from '../data/skills.ts'`)

### Component Patterns

- **Lazy loading**: Large modals use `lazy(() => import('./Modal.tsx'))` + `<Suspense>`
- **Audio**: Create Audio objects inline: `new Audio('/sounds/ui_click.mp3'); audio.volume = 0.3; audio.play().catch(() => {})`
- **Tab structure**: Each tab is a separate component (e.g., [components/BackshopsTab.tsx](../src/components/BackshopsTab.tsx)) rendered by [components/ActionPanel.tsx](../src/components/ActionPanel.tsx)

### Action Dispatch Pattern

Actions from UI → `onAction(type, payload)` → dispatched to reducer:

```tsx
dispatch({ type: 'ACTION', payload: { type: 'TIGHTEN_BOLT', payload: {} } });
```

### Resource Checks

Use focus costs for actions (defined in `baseCosts` within logic/actionProcessor.ts `handleGameAction`):

```typescript
const baseCosts: Record<string, number> = { 'TIGHTEN_BOLT': 3, 'COMPLETE_JOB': 15, ... };
```

### Logging Pattern

Add game logs via `addLog()` helper (within reducer context):

```typescript
addLog('Task completed successfully.', 'success'); // Types: 'info' | 'success' | 'warning' | 'error' | 'story' | 'levelup'
```

## Data Organization

- **Static content**: All game content (events, skills, items, flavor text) lives in `data/` folder
- **Never mutate data imports**: Clone before modifying (e.g., `{ ...eventsData['audit'][0] }`)
- **Event templates**: Events use `Omit<GameEvent, 'timeLeft'>` pattern - `timeLeft` added at spawn time

## Architecture Evolution: Slice-Based State Management

**Status**: ✅ **Complete** - Immer fully integrated, slice migration complete.

### Completed Work

**✅ Phase 1 - Immer Integration** (COMPLETE - January 2026)

- gameReducer.ts now uses Immer's `produce()` (459 lines)
- All 12+ domain slices use Immer draft mutations
- reducerComposer.ts orchestrates slice coordination (621 lines)
- All new code uses draft-based mutations
- gameReducer reduced from 1498→459 lines by extracting to slices

**✅ Phase 2 - Slice Extraction** (COMPLETE - January 2026)

- `processTick()` extracted to logic/tickProcessor.ts (297 lines)
- `handleGameAction()` extracted to logic/actionProcessor.ts (1139 lines)
- Domain logic separated into specialized slices:
  - **aircraftSlice.ts** (266 lines) - Aircraft state & scenarios
  - **encountersSlice.ts** (99 lines) - Random encounter logic
  - **shopSlice.ts** (91 lines) - Vending machine & purchases
  - **terminalLocationSlice.ts** (220 lines) - Terminal navigation
  - **backshopSlice.ts** (311 lines) - Backshop operations
  - **complianceSlice.ts** (333 lines) - Regulatory compliance
  - **eventsSlice.ts** (316 lines) - Event system
  - **inventorySlice.ts** (341 lines) - Inventory management
  - **proficiencySlice.ts** (237 lines) - Skills & training
  - **terminalSlice.ts** (286 lines) - Terminal interactions
  - **hangarSlice.ts** (266 lines) - Hangar operations
  - **officeSlice.ts** - Office/HR interactions

**⚠️ Phase 3 - Legacy Code Migration** (IN PROGRESS)

- tickProcessor.ts still uses manual spreading (legacy compatibility)
- actionProcessor.ts still uses manual spreading (legacy compatibility)
- Both will be migrated to full Immer patterns in future cleanup
- All new slices use Immer exclusively

### Architecture Benefits

- **Modularity**: Each domain has its own slice with isolated logic (~2,700 lines across 12+ slices)
- **Testability**: Slices can be tested independently (see `__tests__/slices/` and `__tests__/state/slices/`)
- **Maintainability**: gameReducer reduced from 1498→459 lines (68% reduction)
- **Type Safety**: Each slice has strongly-typed action unions
- **Immer**: Draft mutations prevent accidental state mutations
- **Composition**: reducerComposer.ts routes TICK/ACTION to appropriate slices automatically

### Remaining Technical Debt

**Medium Priority:**

- Migrate tickProcessor.ts to use Immer drafts (currently uses manual spreading for backward compatibility)
- Migrate actionProcessor.ts to use Immer drafts (currently uses manual spreading for backward compatibility)
- Consolidate remaining legacy actions into domain slices
- Refactor ActionPanel.tsx (803 lines - largest component)

**Low Priority:**

- Add comprehensive slice integration tests
- Document slice contribution patterns
- Extract magic numbers to constants
- Add JSDoc comments to slice exports

## Testing Anti-Patterns to Avoid

- ❌ Don't create separate mocks when `vitest.setup.ts` already handles it (localStorage, Audio)
- ❌ Don't test implementation details - test behavior/outcomes
- ❌ Don't use real random - always seed with `seedrandom` for deterministic tests
- ❌ Don't mutate fixtures - spread and override: `{ ...initialGameState, resources: { ...initialGameState.resources, sanity: 50 } }`

## Lovecraftian Horror Theme Guidelines

### Core Aesthetic Principles

This game blends **mundane aviation maintenance** with **cosmic horror**. The horror emerges from the intersection of bureaucratic routine and inexplicable phenomena. Every piece of text should maintain this delicate balance.

### Writing Style Requirements

#### Logs & System Messages

- **Mundane actions**: Clinical, technical language ("Rivet installation complete.", "Tool calibration verified.")
- **Subtle wrongness**: Introduce unease through technical anomalies ("Serial number reads as: UNTRACEABLE", "The transponder signature doesn't match any known aircraft.")
- **Horror escalation**: When sanity/suspicion is high, descriptions become more visceral ("The metal groans under your touch, as if alive.", "You hear whispers through the radio static.")
- **Avoid melodrama**: Never use exclamation points for horror. Understatement is more terrifying.

#### Event Descriptions

- **The Suits**: Always maintain ambiguity. They are corporate, governmental, and something else entirely. Never explicitly confirm they're supernatural.
  - ✅ "Tall figures in charcoal grey. They don't have badges. They just watch."
  - ❌ "Eldritch beings in suits teleport into the hangar!"
- **Technical precision**: Ground horror in real aviation terminology (APU, ETOPS, NDT, rotables, line maintenance)
- **Bureaucratic dread**: The real horror is often administrative ("Your file has been flagged.", "A performance review has been scheduled.")

#### Resource & Mechanic Naming

- **Sanity**: Player's mental state. Drains from witnessing anomalies, overwork, The Suits' presence
- **Suspicion**: Corporate/regulatory scrutiny. Rises from rule-breaking, delegation, untraceable parts
- **Focus**: Concentration resource. Required for technical work. Depleted by fear, hallucinations
- **Kardex Fragments**: Cryptic references to a mysterious KARDEX system. Never fully explain what it is.

### Narrative Progression Arc

1. **Early game (Sanity 100-70)**: Routine maintenance with subtle oddities
   - "The aircraft's registration doesn't match any records you can find."
   - "You find a passenger manifest with one too many names."

2. **Mid game (Sanity 70-40)**: Escalating weirdness, player starts questioning reality
   - "The janitor appears at impossible times, always watching."
   - "Component P/N: [REDACTED] - This part shouldn't exist."

3. **Late game (Sanity 40-0)**: Full cosmic horror, reality breakdown
   - "The fuselage breathes. You can feel its pulse through your tools."
   - "The Suits converge. They know what you've seen."

### Specific Content Guidelines

#### Event Types & Tone

- **Audit events**: Kafkaesque bureaucracy meets corporate horror. Emphasize powerlessness.
- **Accidents**: Sudden, visceral, technical failures with unexplained causes
- **Eldritch manifestations**: Physics-defying phenomena presented as technical anomalies
- **Incidents**: Mundane problems that hint at deeper wrongness

#### Dialog & NPC Voice

- **Toolroom Master**: Gruff, experienced, seen too much. Hints at dark knowledge.
  - "Been here 30 years. Used to be more techs. Now it's just me."
- **Radio chatter**: Mix normal ATC with impossible transmissions
  - Standard: "Ground, Aircraft 234 requesting pushback, Gate B12."
  - Void: "...coordinate 9M-MRO... all frequencies... the star is dead..."
- **Email/Memos**: Corporate doublespeak hiding sinister implications

#### Visual Atmosphere in Text

- **Lighting**: Always mention the quality of light ("fluorescent flicker", "sodium vapor glow", "darkness between the rafters")
- **Sound**: Emphasize industrial ambience ("APU whine", "riveter staccato", "hangar echo", "unnatural silence")
- **Space**: The hangar is vast, empty, oppressive. Backshops are claustrophobic.

### Adding New Content Checklist

When writing ANY new game text:

- [ ] Does it use precise aviation/maintenance terminology?
- [ ] Does it avoid explaining the supernatural directly?
- [ ] Does it maintain clinical tone even when describing horror?
- [ ] Does it escalate appropriately with player's sanity/suspicion levels?
- [ ] Does it respect the established lore (KARDEX, The Suits, 9M-MRO references)?
- [ ] Does it avoid cheap jump scares in favor of building dread?

### Forbidden Elements

- ❌ Explicit monster descriptions (keep entities ambiguous)
- ❌ Supernatural powers for the player (you're just a mechanic)
- ❌ Happy endings or reassurance (the horror is inescapable)
- ❌ Breaking the fourth wall or meta-humor
- ❌ Over-the-top gore (this is psychological horror)

### Reference Examples from Codebase

- **Good flavor text**: See `ACTION_LOGS` and `VOID_BROADCASTS` in [data/flavor.ts](../src/data/flavor.ts)
- **Event structure**: Study [data/events.ts](../src/data/events.ts) for proper escalation patterns
- **Event implementation**: Review [state/slices/eventsSlice.ts](../src/state/slices/eventsSlice.ts) (316 lines) for event handling logic
- **NPC dialog**: Review `TOOLROOM_MASTER_DIALOUGE` for character voice

## Common Tasks

### Adding a New Action

**Recommended approach (slice-based):**

1. Determine which domain slice owns the action (aircraft, inventory, proficiency, events, etc.)
2. Add action type to appropriate slice's action union in [state/slices/](../src/state/slices/)
3. Implement logic in the slice's reducer using Immer draft mutations
4. Register action type in [state/reducerComposer.ts](../src/state/reducerComposer.ts) routing tables if needed
5. Add log entry with `addLog()` helper
6. Test the action in the corresponding test file (e.g., `__tests__/slices/inventorySlice.test.ts`)

**Legacy alternative (not recommended for new actions):**

1. Add action type to `handleGameAction` switch in [logic/actionProcessor.ts](../src/logic/actionProcessor.ts)
2. Define focus cost in `baseCosts` record
3. Implement logic with manual object spreading
4. Add log entry with `addLog()`
5. Return updated state

**Note**: New actions should use the slice-based approach. The legacy actionProcessor is maintained for backward compatibility during migration.

### Adding a New Event

1. Add event template to appropriate array in [data/events.ts](../src/data/events.ts) (e.g., `eventsData['audit']`)
2. Define `choices` with `cost`, `effects`, `log`
3. Event triggers via `triggerEvent('type', 'id')` in tick processor or action handler
4. Event handling is managed by [state/slices/eventsSlice.ts](../src/state/slices/eventsSlice.ts) (316 lines)

### Adding a New Component/Tab

1. Create component in [components/](../src/components/) folder
2. Import and lazy-load in [App.tsx](../src/App.tsx) if modal, or render in [ActionPanel.tsx](../src/components/ActionPanel.tsx) if tab
3. Use `onAction` prop to dispatch actions to reducer
4. Use `state` prop for read-only access to game state
5. For large components (>500 lines), consider code splitting with `React.lazy()`

**Note**: ActionPanel.tsx is 803 lines and is a candidate for refactoring into smaller sub-components.

### Debugging Game State

- Check browser localStorage key: `the_hangar_save_hf_v26_full_hf`
- State validation exists in [state/stateValidator.ts](../src/state/stateValidator.ts)
- Logs are stored in `state.logs` (max 50 entries, newest first)
- Use browser DevTools Redux DevTools Extension to inspect state changes
- All slice state is composed in [state/reducerComposer.ts](../src/state/reducerComposer.ts)
