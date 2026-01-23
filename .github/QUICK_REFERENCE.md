# The Hangar - Quick Reference Guide

## 🎮 Game Development Commands

```bash
# Development
npm run dev                    # Start dev server (http://localhost:5173)
window.enableDevMode()         # In browser console for dev panel

# Testing
npm test                       # Run tests in watch mode
npm run test:run               # Run tests once (CI mode)
npm run test:coverage          # Generate coverage report
npm run test:e2e               # Run Playwright E2E tests
npm run test:e2e:ui            # E2E with interactive UI

# Code Quality
npm run lint                   # Check code with ESLint
npm run lint:fix               # Auto-fix linting issues
npm run format                 # Format with Prettier

# Build & Version
npm run build                  # Production build
npm run bump                   # Increment _build_N version markers
npm run fresh                  # Reset build version to 0

# Git Workflow
git add .
git commit -m "Your commit message"
git push origin main           # Triggers CI + Deploy
git push origin develop        # Triggers CI only

# Create feature branch
git checkout -b feature/new-feature
git push origin feature/new-feature
# Then create PR on GitHub → Triggers CI + Dependency Review
```

## 🏗️ Architecture Quick Reference

### State Management Pattern

```typescript
// Custom reducer with Immer - NOT Redux/Zuzu
import { produce } from 'immer';

export const mySliceReducer = produce((draft: State, action: Action) => {
  draft.someValue += 1; // Mutate draft directly
});
```

### Service Layer Pattern

```typescript
// Pure functions - no side effects
export const calculateRewards = (state: GameState): Partial<ResourceState> => {
  return { experience: 100, credits: 50 };
};

// In reducer, call service then apply
const rewards = calculateRewards(draftAsState);
draft.resources.credits += rewards.credits;
```

### Event Template Pattern

```typescript
// events.ts - Templates use Omit<GameEvent, 'timeLeft'>
type EventTemplates = Omit<GameEvent, 'timeLeft'>;

// timeLeft added at spawn time, never hardcoded
```

### Testing Pattern

```typescript
import seedrandom from 'seedrandom';

beforeEach(() => {
  Math.random = seedrandom('test-seed'); // Deterministic
});
```

## 📊 Monitoring URLs

- **Actions Dashboard**: `https://github.com/stevenselcuk/thehangar/actions`
- **Staging**: `https://stevenselcuk.github.io/thehangar/`
- **Production**: `https://hangar.tabbythecat.com`
- **Security Alerts**: `https://github.com/stevenselcuk/thehangar/security`
- **Coverage**: Codecov integration (unittests flag)
- **Dependency Graph**: `https://github.com/stevenselcuk/thehangar/network/dependencies`

## ⚡ Workflow Triggers

| Workflow          | Trigger          | When                         |
| ----------------- | ---------------- | ---------------------------- |
| CI/CD             | Push/PR          | Every commit to main/develop |
| Dependency Review | PR               | When dependencies change     |
| Health Check      | Schedule         | Every Monday at 9 AM UTC     |
| CodeQL            | Push/PR/Schedule | Code changes + weekly scan   |

## 🛠️ Manual Workflow Trigger

```bash
# Via GitHub UI:
1. Go to Actions tab
2. Select workflow (e.g., "Codebase Health Check")
3. Click "Run workflow"
4. Choose branch
5. Click "Run workflow" button
```

## 🔧 Local Testing

```bash
# Install dependencies
npm ci

# Run the same checks as CI
npm run lint              # ESLint
npm run test:run          # Unit tests
npm run test:coverage     # With coverage
npm run test:e2e          # Playwright E2E
npm run build             # Production build
```

## 📦 Artifacts

After workflow runs, download artifacts:

1. Go to Actions tab
2. Click on a workflow run
3. Scroll to "Artifacts" section
4. Download: coverage-report, playwright-report, dist

## 🐛 Debugging Guide

### Workflow Failures

```bash
# Run the same checks as CI
npm ci --legacy-peer-deps       # Clean install
npm run lint                    # ESLint
npm run test:run                # Unit tests
npm run test:coverage           # With coverage
npm run test:e2e                # E2E tests
npm run build                   # Production build

# Verbose testing
npm run test:run -- --reporter=verbose
npm run test:e2e:ui             # Interactive E2E
npm run test:e2e:debug          # Debug mode
```

### Game State Debugging

```javascript
// In browser console
window.enableDevMode(); // Enable dev panel
localStorage.getItem('the_hangar_save__build_12'); // View save
localStorage.clear(); // Reset game

// Check state in React DevTools
// Find GameProvider context
```

### Common Issues

**Issue:** Slice not updating state  
**Fix:** Ensure using `produce()` from Immer

**Issue:** Event not spawning with timeLeft  
**Fix:** Events are templates; spawn logic adds timeLeft

**Issue:** Service function mutating state  
**Fix:** Services must be pure; return values, don't mutate

**Issue:** Tests non-deterministic  
**Fix:** Use seeded random: `Math.random = seedrandom('seed')`

**Issue:** Immer draft type errors  
**Fix:** Cast with `as typeof draft.logs`

## 🔐 Secrets Setup

Add secrets in: Settings → Secrets and variables → Actions

| Secret Name     | Required | Purpose                   |
| --------------- | -------- | ------------------------- |
| `CODECOV_TOKEN` | Optional | Coverage reporting        |
| `DEPLOY_KEY`    | No       | (Handled by GitHub Pages) |

## 📁 Critical File Paths

### State Management

- `src/state/gameReducer.ts` (665 lines) - Main coordinator
- `src/state/reducerComposer.ts` (687 lines) - Event router
- `src/state/slices/` - 12+ domain slices (~2,700 lines)

### Game Data (NEVER MUTATE)

- `src/data/events.ts` - Event templates (Omit<GameEvent, 'timeLeft'>)
- `src/data/flavor.ts` - VOID_BROADCASTS, KARDEX_INTEL_LOGS
- `src/data/aircraftScenarios.ts` - Branching scenarios
- `src/data/anomalies.ts` - Eldritch components

### Services (Pure Functions)

- `src/services/RewardCalculator.ts` - XP/credit calculations
- `src/services/CostCalculator.ts` - Resource cost logic
- `src/services/logService.ts` - Log creation utilities

### Type Definitions

- `src/types.ts` (394 lines) - All interfaces

## ⚙️ Configuration Files

| File                                      | Purpose                       |
| ----------------------------------------- | ----------------------------- |
| `.github/workflows/ci.yml`                | Main CI/CD pipeline           |
| `.github/workflows/dependency-review.yml` | Dependency security           |
| `.github/workflows/health-check.yml`      | Weekly health checks          |
| `.github/workflows/codeql.yml`            | Security scanning             |
| `eslint.config.js`                        | Flat config, no-explicit-any  |
| `vitest.config.ts`                        | Vitest settings, jsdom env    |
| `playwright.config.ts`                    | E2E config, chromium only     |
| `vite.config.ts`                          | Vite build, PWA, bumper       |
| `.env.example`                            | Environment variable template |

## 📈 Performance Tips

✅ Workflows use dependency caching (saves ~30 seconds per run)  
✅ Jobs run in parallel (saves ~2 minutes total)  
✅ Artifacts expire after 7 days (saves storage)  
✅ Cancel outdated runs automatically (saves minutes)

## 🎯 Success Checklist

- [ ] GitHub Pages enabled (Settings → Pages)
- [ ] First workflow run completed successfully
- [ ] Site is live at GitHub Pages URL
- [ ] Badges showing in README
- [ ] (Optional) Codecov token added
- [ ] (Optional) Update VITE_BASE_PATH if repo name changed

## 💡 Common Issues

**Issue:** Deploy fails with 404  
**Fix:** Enable GitHub Pages with "GitHub Actions" source

**Issue:** Tests fail but pass locally  
**Fix:** Check for hardcoded localhost URLs

**Issue:** Build fails with "out of memory"  
**Fix:** Add `NODE_OPTIONS=--max-old-space-size=4096` to build step

**Issue:** E2E tests timeout  
**Fix:** Increase timeout in `playwright.config.ts`

## 📞 Need Help?

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Troubleshooting Guide](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows)
- Check [WORKFLOWS.md](.github/WORKFLOWS.md) for detailed info

---

**Status Check:**

```bash
# View all workflow statuses
gh run list  # requires GitHub CLI

# Or visit:
# https://github.com/stevenselcuk/thehangar/actions
```
