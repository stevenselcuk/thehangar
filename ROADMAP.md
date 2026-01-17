# The Hangar - Development Roadmap

**Last Updated**: January 2026  
**Project Status**: ✅ Core MVP Complete | 🚧 Active Development | 📈 75% Test Coverage

## Table of Contents

1. [Current State](#current-state)
2. [Technical Debt](#technical-debt)
3. [Features & Enhancements](#features--enhancements)
4. [Performance Optimizations](#performance-optimizations)
5. [UI/UX Improvements](#uiux-improvements)
6. [Testing & Quality](#testing--quality)
7. [Documentation](#documentation)
8. [Long-Term Vision](#long-term-vision)

---

## Current State

### ✅ Completed Features

**Core Gameplay**

- Tick-based game engine (15 FPS via requestAnimationFrame, delta time calculations)
- Resource management system (Focus, Sanity, Suspicion, Credits, XP, Kardex Fragments)
- Job card system with multiple aircraft types (MD-80, B737-400/700, A330, B777-200ER, A300 Cargo)
- Tool degradation and condition tracking with calibration mini-game
- Random event system (audits, accidents, eldritch manifestations, component failures)
- Skill tree with 20+ skills across multiple specializations
- Multiple gameplay tabs (Structure Shop, Hangar, Apron/Line, Toolroom, Canteen, Terminal, Office, HR Floor, Backshops, Training)
- Auto-save to localStorage (60s interval + beforeunload) with state validation
- Component calibration mini-game with difficulty scaling
- Training and certification system (A&P, EASA, NDT, Type Ratings)
- Mail system with time-sensitive messages
- Hazard tracking (noise exposure, social stress, fatigue)
- Rotable management (repair, registration, untraceable parts)
- Archive terminal with KARDEX system
- Maintenance terminal for aircraft diagnostics

**Technical Infrastructure**

- React 19.2.3 with TypeScript 5.8 (strict mode)
- Vite 6.2 build system with ultra-fast HMR and `@/` path alias
- Immer 11.1.3 for immutable state updates (✅ Complete integration)
- TailwindCSS 4.1.18 with terminal-green aesthetic
- Vitest + React Testing Library + Playwright
- ~75% overall test coverage (strong in logic/services, weak in components)
- GitHub Actions CI/CD pipeline with automated deployment
- CodeQL security scanning + dependency reviews
- ESLint flat config + Prettier code quality tools

**Architecture**

- ✅ **Slice-Based State Management**: Fully migrated to domain slices
  - 12+ specialized reducers (~2,700 lines) in `state/slices/`
  - `gameReducer.ts` (459 lines) orchestrates all state updates
  - `reducerComposer.ts` (621 lines) routes TICK/ACTION events
  - All slices use Immer's `produce()` for safe mutations
- Service-oriented architecture (CostCalculator, RewardCalculator, logService)
- Comprehensive type safety (379 lines in types.ts)
- Centralized logging service with timestamps

---

## Technical Debt

### � High Priority

#### 1. State Management Cleanup

**Status**: ✅ **COMPLETE** (January 2026)  
**Effort**: Completed  
**Impact**: High

- **Achievement**: State management fully migrated to slice-based architecture
  - `gameReducer.ts` (459 lines) orchestrates 12+ domain slices via Immer
  - `reducerComposer.ts` (621 lines) routes TICK/ACTION events
  - All slices implemented: aircraft, backshop, compliance, encounters, events, hangar, inventory, office, proficiency, resources, shop, terminal, terminalLocation
  - Total slice code: ~2,700 lines across specialized domains
  - All slices use `produce()` from Immer for safe state mutations
- **Result**: Clean separation of concerns, easier testing, maintainable architecture

#### 2. Component Test Coverage

**Status**: 🔴 **CRITICAL GAP**  
**Effort**: Large (2-3 weeks)  
**Impact**: High

- **Issue**: Component test coverage is severely lacking at ~5% (1/20 components tested)
  - Only `ErrorBoundary.test.tsx` exists in `__tests__/components/`
  - 19/20 components have zero test coverage
  - Overall 75% coverage comes from logic/services/slices, not components
- **Critical Untested Components**:
  - **ActionPanel.tsx** (main UI orchestrator, tab router)
  - **ResourceBar.tsx** (core resource display)
  - **Sidebar.tsx** (log display system)
  - **Modal Components**: AboutModal, DashboardModal, ArchiveTerminalModal, MaintenanceTerminalModal, CalibrationMinigame, PersonalIdCardModal
  - **Tab Components**: BackshopsTab, CanteenTab, HRFloorTab, OfficeTab, TerminalTab, TrainingTab
  - **UI Elements**: ActionButton, HazardBar, ProficiencyTab, ImportExportView

- **Action Items**:
  - [ ] Create comprehensive test suite for ActionPanel.tsx (highest complexity)
  - [ ] Add tests for ResourceBar and Sidebar (core UI components)
  - [ ] Implement snapshot testing for all modals
  - [ ] Test user interaction flows with React Testing Library
  - [ ] Target 80%+ component coverage to match project standards
  - [ ] Reference `.github/copilot-instructions.md` for testing patterns

### 🟡 Medium Priority

#### 3. Path Alias Consistency

**Status**: ✅ **COMPLETE** (January 2026)  
**Effort**: Completed  
**Impact**: Low

- **Resolved**: All imports now use `@/` alias pointing to `src/`
- **Cleanup**: Path alias configured in vite.config.ts and tsconfig.json

#### 4. Error Boundary Coverage

**Status**: ⚠️ Partial  
**Effort**: Small (1 day)  
**Impact**: Low

- **Issue**: ErrorBoundary component has 1 skipped test
- **Action Items**:
  - [ ] Complete ErrorBoundary test suite
  - [ ] Add error recovery testing
  - [ ] Test error logging integration

### 🟢 Low Priority

#### 5. Code Organization

**Status**: 🔵 Planned  
**Effort**: Medium (3-5 days)  
**Impact**: Low

- **Opportunities**:
  - Extract magic numbers to constants
  - Consolidate flavor text generation
  - Create utility functions for common patterns
  - Consider ActionPanel.tsx refactoring if complexity increases

#### 6. E2E Test Maintenance

**Status**: 🔵 Deferred  
**Effort**: Medium (ongoing)  
**Impact**: Low

- **Note**: E2E tests intentionally deferred until v1.0.0
  - Game is rapidly evolving, E2E tests are costly to maintain
  - Will revisit once feature set stabilizes
  - Focus on unit and integration tests for now

---

## Features & Enhancements

### 🎮 Gameplay Features

#### High Priority

1. **Expanded Aircraft Types** ⭐⭐⭐
   - A380 (ultra-heavy wide-body)
   - B787 Dreamliner (composite-heavy maintenance)
   - Regional jets (CRJ, E175)
   - Cargo variants with unique challenges
   - Different maintenance profiles per type

2. **Deeper Skill Trees** ⭐⭐⭐
   - Avionics specialization branch
   - Structures/sheet metal track
   - Powerplant/engine track
   - Management/supervision path
   - Inspector authorization progression
   - Unlock new abilities and passive bonuses

3. **Enhanced Event System** ⭐⭐
   - More varied random events
   - Chained event sequences
   - Branching narrative paths
   - Time-pressure scenarios
   - Moral dilemma events affecting sanity/suspicion

4. **Rotable Management Expansion** ⭐⭐
   - Component repair mini-games
   - Part tracing and documentation
   - Red tag procedures
   - AOG (Aircraft on Ground) emergency scenarios
   - Vendor negotiations

#### Medium Priority

5. **New Game+ Mode** ⭐⭐
   - Carry over knowledge/skills
   - Increased difficulty
   - New hidden events
   - Alternate endings

6. **Achievement System** ⭐
   - 50+ achievements
   - Steam-style progress tracking
   - Hidden achievements for secrets
   - Reward cosmetic badges

7. **Dynamic Shift Scheduling** ⭐
   - Day/night cycles affect gameplay
   - Weekend shifts have different characteristics
   - Holiday events
   - Weather effects on workload

8. **Expanded Investigation Mechanics** ⭐⭐
   - More KARDEX terminal interactions
   - Archive research mini-game
   - Conspiracy theory board
   - Hidden lore discovery

#### Low Priority

9. **Audio System** ⭐
   - Ambient hangar sounds (APU whine, tools, radio chatter)
   - Event audio stingers
   - UI feedback sounds
   - Dynamic music based on sanity/tension
   - Voice-acted radio messages

10. **Automation & Delegation** ⭐
    - Hire junior technicians
    - Delegate simple tasks
    - Training management
    - Automation increases suspicion

11. **Union & Politics** ⭐
    - Union rep interactions
    - Workplace politics
    - Strike threats
    - Collective bargaining events

12. **Multiplayer Features** ⭐
    - Global leaderboards (survived shifts, sanity retention)
    - Shift comparison
    - Ghost mode (see other players' past choices)
    - Daily challenges

---

## Performance Optimizations

### 🚀 Optimization Opportunities

#### 1. Bundle Size Reduction

**Current**: ~500KB before compression  
**Target**: <300KB  
**Priority**: Medium

- [ ] Code splitting for tab components
- [ ] Lazy load modal components (already implemented)
- [ ] Tree-shake unused dependencies
- [ ] Analyze bundle with `vite-bundle-visualizer`
- [ ] Consider removing/replacing heavy dependencies

#### 2. Render Optimization

**Priority**: Low (no current performance issues)

- [ ] Memoize expensive component renders
- [ ] Use React.memo() for static components
- [ ] Optimize ResourceBar updates
- [ ] Virtualize long lists (if needed in future)

#### 3. Game Loop Optimization

**Current**: ~60 FPS, no lag reported  
**Priority**: Low

- [ ] Profile tick processor performance
- [ ] Consider Web Worker for heavy calculations
- [ ] Optimize event triggering logic
- [ ] Batch state updates where possible

#### 4. localStorage Performance

**Priority**: Low

- [ ] Compress save data (currently ~50KB uncompressed)
- [ ] Implement save slots
- [ ] Add export/import functionality
- [ ] Version migration system for old saves

---

## UI/UX Improvements

### 🎨 Interface Enhancements

#### High Priority

1. **Improved Onboarding** ⭐⭐⭐
   - Interactive tutorial
   - Tooltips for first-time users
   - Gradual feature introduction
   - Skip option for returning players

2. **Better Visual Feedback** ⭐⭐
   - Animations for resource changes
   - Tool condition visual indicators
   - Event importance highlighting
   - Success/failure feedback improvements

3. **Mobile Responsiveness** ⭐⭐
   - Touch-friendly controls
   - Responsive layout for tablets
   - Portrait mode support
   - Virtual keyboard considerations

#### Medium Priority

4. **Accessibility** ⭐⭐
   - Screen reader support
   - Keyboard navigation
   - High contrast mode
   - Colorblind-friendly design
   - Dyslexia-friendly font option

5. **Customization** ⭐
   - Theme options (dark mode already implemented)
   - Font size adjustment
   - UI layout preferences
   - Log filtering options

6. **Quality of Life** ⭐
   - Hotkeys for common actions
   - Undo last action (within reason)
   - Auto-organize inventory
   - Quick access toolbar
   - Bookmarks for important events

#### Low Priority

7. **Visual Polish** ⭐
   - Better icons
   - Smoother transitions
   - Particle effects for events
   - Improved loading states
   - Better error messages

8. **Advanced UI** ⭐
   - Split-screen mode (logs + work area)
   - Customizable dashboard
   - Drag-and-drop tool management
   - Multi-window support

---

## Testing & Quality

### 🧪 Testing Improvements

#### Immediate (January 2026)

1. **Component Test Expansion** 🔴 **TOP PRIORITY**
   - Critical gap: Only 1/20 components tested (5% coverage)
   - Priority targets:
     1. ActionPanel.tsx (main UI orchestrator)
     2. ResourceBar.tsx (core resource display)
     3. Sidebar.tsx (log system)
     4. ActionButton.tsx (reusable UI element)
     5. Modal components (lazy-loaded, complex interactions)
   - Target: 80%+ component coverage
   - See `.github/copilot-instructions.md` for testing workflows

2. **ErrorBoundary Test Completion** ⚠️
   - Complete skipped test
   - Add error recovery scenarios
   - Test error logging integration

#### Short Term (Q2 2026)

3. **Slice Test Enhancement** 🟢
   - Current: ~70% slice coverage
   - Target: 90%+ for all slices
   - Add edge case testing
   - Test Immer immutability guarantees

4. **Integration Test Expansion** 🟢
   - Complete game flow testing
   - Event handling scenarios
   - Save/load functionality
   - Cross-slice interactions

#### Long Term (Q3-Q4 2026)

5. **E2E Test Revival** 🔵
   - Deferred until v1.0.0 feature freeze
   - Will implement comprehensive Playwright suite
   - Game over conditions
   - Full session testing

6. **Visual Regression Testing** 🔵
   - Implement Playwright screenshots
   - Compare UI changes automatically
   - Catch unintended visual breaks

7. **Performance Testing** 🔵
   - Load testing for long sessions
   - Memory leak detection
   - Frame rate monitoring

---

## Documentation

### 📚 Documentation Needs

#### High Priority

1. **Architecture Documentation** ✅ **COMPLETE**
   - State management architecture fully documented in `.github/copilot-instructions.md`
   - Service layer patterns explained
   - Reducer composition guide included
   - Testing patterns with examples

2. **Contribution Workflows** ✅ **COMPLETE**
   - 6 comprehensive workflows in `.github/copilot-instructions.md`:
     - Adding a New Action (9 steps)
     - Adding a New Event (6 steps)
     - Adding a New Component/Tab (7 steps)
     - Debugging Game State (8 steps)
     - UI Fixes (6 steps)
     - UX Fixes (7 steps)
   - Mandatory quality standards enforced (tests, lint, docs)
   - Pre-commit checklist included

3. **API Documentation** ⚠️ Partial
   - Service APIs documented in source files
   - State shape documented in types.ts
   - Event structure in data/events.ts
   - **Needed**: Generate TypeDoc or similar for public APIs

#### Medium Priority

4. **Player Documentation** ⭐
   - Strategy guide
   - Skill build recommendations
   - Hidden mechanics explanations
   - FAQ

5. **Development Setup** ⭐
   - Local development best practices
   - Debugging tips
   - Common issues and solutions

#### Low Priority

6. **Code Comments** ⭐
   - Increase inline documentation
   - JSDoc for public APIs
   - Complex algorithm explanations

---

## Long-Term Vision

### 🔮 Future Possibilities (6-12+ Months)

#### Expanded Universe

- **Prequel Story**: How the hangar became this way
- **Multiple Locations**: Different airports/facilities
- **Character Background**: Customizable protagonist history
- **Endings Variety**: 5+ distinct endings based on choices

#### Advanced Mechanics

- **Dynamic Economy**: Tool prices fluctuate
- **Reputation System**: Affects job availability
- **Mentor System**: Train new techs for passive bonuses
- **Investigative Journalism**: Optional side quest

#### Platform Expansion

- **Desktop Apps**: Electron wrapper for offline play
- **Steam Release**: Full Steam integration
- **Mobile Port**: Native iOS/Android versions
- **Browser Extension**: Idle progress tracker

#### Community Features

- **Mod Support**: Custom events, skills, aircraft
- **Workshop**: Share community content
- **Wiki Integration**: In-game encyclopedia
- **Speedrun Mode**: Time attack challenges

---

## Implementation Priority Matrix

### Q1 2026 (Jan-Mar)

- [x] **Complete state migration to slices** (✅ Done - 12+ slices, ~2,700 lines)
- [x] **Implement reducer composition** (✅ Done - reducerComposer.ts with composeTick/composeAction)
- [x] **Full Immer integration** (✅ Done - all slices use produce())
- [x] **Documentation overhaul** (✅ Done - comprehensive copilot-instructions.md with workflows)
- [x] **Path alias consistency** (✅ Done - all imports use @/ alias)
- [ ] **Component test coverage expansion** (🔴 Priority 1 - currently 5%, target 80%+)
  - Focus: ActionPanel, ResourceBar, Sidebar, Modals, Tabs
- [ ] **ErrorBoundary test completion** (⚠️ Complete skipped tests)

### Q2 2026 (Apr-Jun)

- [ ] Expanded aircraft types (A380, B787)
- [ ] Deeper skill trees
- [ ] Enhanced event system
- [ ] Mobile responsiveness
- [ ] Achievement system

### Q3 2026 (Jul-Sep)

- [ ] New Game+ mode
- [ ] Audio system implementation
- [ ] Advanced automation features
- [ ] Performance optimizations
- [ ] E2E test expansion

### Q4 2026 (Oct-Dec)

- [ ] Multiplayer features
- [ ] Platform expansion planning
- [ ] Community features
- [ ] Advanced UI customization

---

## Contributing

Interested in contributing? Check out:

- [CONTRIBUTING.md](CONTRIBUTING.md) (TODO: Create)
- [Open Issues](https://github.com/stevenselcuk/thehangar/issues)
- [GitHub Discussions](https://github.com/stevenselcuk/thehangar/discussions)

### Priority Labels

- 🔴 **Critical**: Blocking issues, security concerns
- 🟠 **High**: Core features, major bugs
- 🟡 **Medium**: Enhancements, minor bugs
- 🟢 **Low**: Nice-to-haves, polish
- 🔵 **Future**: Long-term ideas, research

---

## Version History

- **v0.0.0** (Current) - MVP Core Gameplay
  - Functional game loop
  - 574 tests passing
  - 75% code coverage
  - CI/CD pipeline operational

---

**Next Review**: March 2026  
**Maintainer**: @stevenselcuk  
**License**: MIT
