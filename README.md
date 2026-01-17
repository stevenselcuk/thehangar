# The Hangar

[![CI/CD Pipeline](https://github.com/stevenselcuk/thehangar/actions/workflows/ci.yml/badge.svg)](https://github.com/stevenselcuk/thehangar/actions/workflows/ci.yml)
[![Dependency Review](https://github.com/stevenselcuk/thehangar/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/stevenselcuk/thehangar/actions/workflows/dependency-review.yml)
[![Health Check](https://github.com/stevenselcuk/thehangar/actions/workflows/health-check.yml/badge.svg)](https://github.com/stevenselcuk/thehangar/actions/workflows/health-check.yml)
[![CodeQL](https://github.com/stevenselcuk/thehangar/actions/workflows/codeql.yml/badge.svg)](https://github.com/stevenselcuk/thehangar/actions/workflows/codeql.yml)

A browser-based incremental/idle game about aircraft maintenance in an unsettling, Lovecraftian-themed hangar. Manage resources, maintain aircraft, unlock skills, and try to survive the night shift without losing your sanity—or attracting too much attention from The Suits.

## Game Overview

You are an aircraft maintenance technician working the graveyard shift at a remote commercial aviation facility. What starts as routine riveting and paperwork gradually reveals something deeply wrong with your workplace. Strange components arrive without documentation. Auditors appear at impossible hours. The aircraft themselves seem... aware.

### Core Gameplay Loop

- **Resource Management**: Balance Focus (work capacity), Sanity (mental state), Suspicion (regulatory scrutiny), and Credits (money)
- **Tick-Based Economy**: Passive resource generation, time-sensitive events, degrading equipment
- **Skill Progression**: Level up to unlock new capabilities and survival techniques
- **Multiple Tabs**: Explore different areas (Hangar, Toolroom, Apron, Backshops, Office, HR Floor, Terminal)
- **Event System**: Random audits, accidents, eldritch manifestations, and bureaucratic nightmares
- **Aircraft Servicing**: Perform transit checks, daily inspections, and ETOPS checks on various aircraft types

### Key Features

- **Lovecraftian Horror**: Cosmic dread meets corporate bureaucracy
- **Authentic Aviation**: Real maintenance terminology (rotables, NDT, SRFs, line operations)
- **Persistent State**: Auto-save to localStorage, resume your shift anytime
- **Multiple Endings**: Lose sanity → madness. Hit 100% suspicion → terminated.
- **Deep Systems**: Tool calibration, component failure, automated workflows, training certifications

## Technical Stack

- **Frontend**: React 19 (latest features including new JSX transform)
- **Language**: TypeScript 5.8 (strict mode)
- **Build Tool**: Vite 6.2 (ultra-fast HMR)
- **State Management**: Custom reducer pattern (no Redux/Zustand)
- **Testing**: Vitest + React Testing Library + Playwright
- **Styling**: TailwindCSS (terminal-green aesthetic with horror theming)

## Architecture Highlights

### State Management

- **Single Giant Reducer**: 1498-line `gameReducer.ts` handles all state mutations
- **No Immer (yet)**: Manual object spreading for immutability (`{ ...prev, resources: { ...prev.resources } }`)
- **Embedded Logic**: `processTick()` and `handleGameAction()` live inside the reducer
- **Why?**: Performance-critical game loop requires tight control; refactoring to Immer is planned

### Game Loop

- **requestAnimationFrame**: ~60 FPS tick rate, delta time calculations
- **Time-Based Systems**: Events countdown, tools degrade, resources regenerate
- **Conditional Logic**: Different mechanics activate based on active tab (e.g., Backshops increases suspicion)

### Data Architecture

- **Static Content**: All game data in `data/` folder (events, skills, items, flavor text)
- **Type Safety**: 364 lines of TypeScript interfaces in `types.ts`
- **Event Templates**: Use `Omit<GameEvent, 'timeLeft'>` pattern, time added at spawn

## Development Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or pnpm

### Installation

```bash
# Clone repository
git clone <repository-url>
cd thehangar

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:5173`

### Dev Mode

Dev mode can be enabled by calling `window.enableDevMode()` in the browser console.

### Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server with HMR
npm run build            # Production build → dist/
npm run preview          # Preview production build

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code with Prettier

# Testing
npm test                 # Vitest watch mode (unit/integration)
npm run test:run         # Run tests once (CI mode)
npm run test:coverage    # Generate coverage report
npm run test:ui          # Interactive test UI
npm run test:e2e         # Playwright end-to-end tests
npm run test:e2e:ui      # Playwright with UI
npm run test:e2e:debug   # Debug E2E tests
```

## Project Structure

```
thehangar/
├── src/                 # All source code
│   ├── components/      # React components (tabs, modals, UI elements)
│   │   ├── ActionPanel.tsx  # Main game interface router
│   │   ├── BackshopsTab.tsx # Component overhaul area
│   │   └── ...          # Other specialized tabs
│   ├── data/            # Static game content (never mutate imports!)
│   │   ├── events.ts    # Random events (audits, accidents, manifestations)
│   │   ├── skills.ts    # Skill tree definitions
│   │   ├── items.ts     # Tools, consumables, rotables
│   │   ├── flavor.ts    # Atmospheric text, dialog, logs
│   │   └── ...          # Aircraft, training, mail, etc.
│   ├── hooks/           # Custom React hooks
│   │   ├── useGameEngine.ts # requestAnimationFrame game loop
│   │   └── useAutoSave.ts   # Debounced localStorage persistence
│   ├── logic/           # Pure game logic functions
│   │   ├── levels.ts    # XP calculations, level-up messages
│   │   ├── tickProcessor.ts # Time-based resource updates
│   │   └── actionProcessor.ts # Action handling logic
│   ├── services/        # Business logic services
│   │   ├── CostCalculator.ts # Cost calculations and validations
│   │   ├── RewardCalculator.ts # Reward and XP calculations
│   │   ├── ResourceValidator.ts # Resource validation
│   │   └── logService.ts # Log management service
│   ├── state/           # State management
│   │   ├── gameReducer.ts   # Main game reducer
│   │   ├── reducerComposer.ts # Reducer composition utilities
│   │   ├── initialState.ts  # Default game state, localStorage loading
│   │   ├── stateValidator.ts # Runtime type checking for saved games
│   │   └── slices/      # State slice reducers
│   │       ├── hangarSlice.ts
│   │       └── officeSlice.ts
│   ├── utils/           # Utilities and test helpers
│   │   ├── gameHelpers.ts   # Log management, clamping, cost checks
│   │   └── testHelpers.ts   # Seeded random, fixtures, test utilities
│   ├── types.ts         # TypeScript type definitions (364 lines)
│   ├── App.tsx          # Root component, modal management
│   └── styles.css       # Global styles
├── __tests__/           # Test suites
│   ├── fixtures/        # Reusable game state fixtures
│   ├── logic/           # Pure function tests (levels, tick processor, actions)
│   ├── services/        # Service layer tests
│   ├── state/           # State management tests
│   └── components/      # Component tests
├── public/              # Static assets (sounds, images)
├── e2e/                 # Playwright E2E tests
└── index.tsx            # Application entry point
```

## Gameplay Guide

### Resources

- **Focus (0-100)**: Concentration. Required for all actions. Regenerates slowly (faster when not delegating work).
- **Sanity (0-100)**: Mental stability. Drains from witnessing anomalies, overwork, and The Suits. Game over at 0.
- **Suspicion (0-100)**: Regulatory scrutiny. Rises from rule-breaking, using untraceable parts, automation. Game over at 100.
- **Credits**: Money. Buy tools, training, food. Earned from completing jobs and passive income.
- **Experience/Level**: Unlock skill points. Level up by working, resolving events, and studying.

### Key Mechanics

1. **Job Cards**: Timed maintenance tasks requiring specific tools/resources. Complete before timeout.
2. **Events**: Random situations requiring immediate response (audits, accidents, manifestations).
3. **Tools**: Degrade with use. Must be repaired or calibrated (precision mini-game).
4. **Rotables**: Aircraft components with condition tracking. Fail catastrophically if neglected.
5. **Delegation**: Automate work for passive income but increases suspicion.
6. **NDT (Non-Destructive Testing)**: Inspect for cracks, corrosion, anomalies.

### Tips for New Players

- Keep Focus above 30 to handle emergencies
- Don't let Suspicion exceed 50 early game (audits escalate)
- Save up for rivet gun ASAP (8x resource generation)
- Check rotables condition regularly (failures are expensive)
- The janitor knows more than he says
- Don't look directly at The Suits

## Testing Philosophy

### Coverage Goals

- **Target**: 90%+ for all code (aspirational: 100%)
- **Current**: ~75% overall (574 tests passing across 19 test suites)
  - Logic: ~95% (levels, tick processor, action processor)
  - Services: 100% (cost calculator, reward calculator, validators)
  - State: ~80% (state initialization and management)
  - Utils: 100% (helper functions)
  - Components: ~60% (UI components - work in progress)

### Test Categories

1. **Pure Functions** (`logic/`, `utils/`): Deterministic, fast, no dependencies
2. **Integration Tests** (`logic/tickProcessor`, `state/gameReducer`): Complex state interactions
3. **Component Tests** (`components/`): React Testing Library, user interactions
4. **E2E Tests** (`e2e/`): Playwright, full game flow

### Key Testing Practices

- **Seeded Random**: All tests using `Math.random()` must seed with `seedrandom('test-seed')` for determinism
- **Fixtures**: Use `__tests__/fixtures/gameStates.ts` for common scenarios
- **Immutability Verification**: Always check `result !== original` for state updates
- **Global Mocks**: `vitest.setup.ts` pre-mocks localStorage and Audio API

## CI/CD & Deployment

### GitHub Actions Pipeline

This project uses **GitHub Actions** for continuous integration and deployment:

- ✅ **Automated Testing**: Every push/PR runs linting, unit tests, and E2E tests
- ✅ **Code Quality**: ESLint checks enforce code standards
- ✅ **Security Scanning**: Weekly CodeQL analysis + dependency reviews
- ✅ **Coverage Reporting**: Automatic upload to Codecov
- ✅ **Auto-Deployment**: Pushes to `main` deploy to GitHub Pages
- ✅ **Health Monitoring**: Weekly automated health checks

**Workflows:**

- [ci.yml](.github/workflows/ci.yml) - Main CI/CD pipeline (3-5 min)
- [codeql.yml](.github/workflows/codeql.yml) - Security scanning
- [dependency-review.yml](.github/workflows/dependency-review.yml) - PR dependency checks
- [health-check.yml](.github/workflows/health-check.yml) - Weekly monitoring

**Live Site**: [https://stevenselcuk.github.io/thehangar/](https://stevenselcuk.github.io/thehangar/) (auto-deployed from main)

**View Status**: [Actions Tab](https://github.com/stevenselcuk/thehangar/actions)

For detailed workflow documentation, see [.github/WORKFLOWS.md](.github/WORKFLOWS.md)

## Contributing

### Code Style

- **Imports**: Always include file extensions (`.ts`, `.tsx`)
- **State Updates**: Manual spreading (Immer migration planned)
- **Logging**: Use `addLog()` helper with type-safe log types
- **Audio**: Create inline: `new Audio('/sounds/ui_click.mp3')`

### Adding Content

1. **New Action**: Add to `handleGameAction()` switch in `gameReducer.ts`
2. **New Event**: Add template to `data/events.ts` with proper types
3. **New Component**: Create in `components/`, import in `ActionPanel.tsx`
4. **New Resource**: Update `ResourceState` interface, add to initial state

### Lovecraftian Writing Guidelines

- Use precise aviation terminology
- Maintain clinical tone even when describing horror
- Avoid explicit supernatural explanations (ambiguity is key)
- Ground horror in bureaucratic/technical failures
- Escalate weirdness with sanity/suspicion levels
- See `.github/copilot-instructions.md` for comprehensive style guide

### Pull Request Checklist

- [ ] TypeScript compiles without errors
- [ ] ESLint passes (`npm run lint`)
- [ ] Tests pass (`npm test`)
- [ ] Coverage doesn't decrease
- [ ] Manual testing in dev environment
- [ ] New features include tests
- [ ] Horror theme maintained for narrative content
- [ ] CI/CD checks pass (automated via GitHub Actions)
- [ ] Dependency review approved (automated)
- [ ] No security vulnerabilities introduced

## Roadmap

### Planned Features

- [ ] Immer integration for state management (refactoring)
- [ ] More aircraft types (A380, B787, regional jets)
- [ ] Deeper skill trees (avionics specialization, management track)
- [ ] Multiplayer leaderboards (survived shifts, sanity retention)
- [ ] Audio engine (ambient hangar sounds, event stingers)
- [ ] Achievement system
- [ ] New Game+ (carry over knowledge, harder difficulty)

### Performance Optimization

- [ ] Bundle size analysis (currently ~500KB before compression)
- [ ] Code splitting for tabs
- [ ] Memoization for expensive renders
- [ ] Web Worker for tick processor

## License

MIT License (see LICENSE file)

## Credits

- Game Design & Development: stevenselcuk
- Aviation Consulting: [Your Name/Contributors]
- Horror Writing: [Your Name/Contributors]
- Testing Framework: Vitest, Playwright, React Testing Library
- Built with React, TypeScript, Vite

## Support

- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Feature requests and gameplay feedback welcome
- **Wiki**: Full documentation at [Wiki Link]

---

**Warning**: This game contains themes of workplace anxiety, cosmic horror, and bureaucratic dread. Recommended for players 16+.
