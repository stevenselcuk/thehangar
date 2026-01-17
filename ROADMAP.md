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

- Tick-based game engine (60 FPS, delta time calculations)
- Resource management system (Focus, Sanity, Suspicion, Credits, XP)
- Job card system with multiple aircraft types (B737, A320, A330, B777)
- Tool degradation and condition tracking
- Random event system (audits, accidents, eldritch manifestations)
- Skill tree with 20+ skills
- Multiple gameplay tabs (Hangar, Toolroom, Apron, Backshops, Office, HR, Terminal)
- Auto-save to localStorage with state validation
- Component calibration mini-game
- Training and certification system
- Mail system with time-sensitive messages
- Hazard tracking (noise, fume exposure)

**Technical Infrastructure**

- React 19 with TypeScript 5.8 (strict mode)
- Vite 6.2 build system with fast HMR
- Immer for immutable state updates
- 574 passing tests across 19 test suites (~75% coverage)
- GitHub Actions CI/CD pipeline
- Automated deployment to GitHub Pages
- CodeQL security scanning
- ESLint + Prettier code quality tools

**Architecture**

- Service-oriented architecture (CostCalculator, RewardCalculator, ResourceValidator)
- Reducer composition with slice pattern
- Comprehensive type safety (8.6KB types.ts)
- Centralized logging service

---

## Technical Debt

### 🔴 High Priority

#### 1. State Management Cleanup

**Status**: ✅ Nearly Complete  
**Effort**: Small (1 day remaining)  
**Impact**: High

- **Achievement**: State management successfully migrated to slice-based architecture
  - `gameReducer.ts` (459 lines) now orchestrates 12+ domain slices via Immer
  - `reducerComposer.ts` (621 lines) routes TICK/ACTION events to specialized reducers
  - All slices fully implemented: aircraft, encounters, shop, terminalLocation, backshop, compliance, events, inventory, proficiency, terminal, hangar, office
  - Total slice code: ~2,700 lines across specialized domains
- **Remaining Items**:
  - [x] Complete migration of all actions to slice pattern
  - [x] Consolidate state composition in `reducerComposer.ts`
  - [x] Update documentation to reflect new architecture
  - [ ] Migrate legacy tickProcessor.ts (297 lines) to full Immer patterns
  - [ ] Migrate legacy actionProcessor.ts (1139 lines) to full Immer patterns

#### 2. Test Failures

**Status**: ⚠️ Needs Verification  
**Effort**: Small (1-2 days)  
**Impact**: Medium

- **Issue**: Test status unclear after slice migration
  - `core.test.ts` has 47 total tests with header warning about refactor impacts
  - Original claim of "11 failing tests" predates slice migration
  - Test file header notes: "Tests may fail due to service integration in main reducer"
  - Actual failure count unknown without running test suite

- **Action Items**:
  - [ ] Run `npm test` to determine actual failing test count
  - [ ] Update test expectations to match slice-based architecture
  - [ ] Verify efficiency boost calculations align with new service layer
  - [ ] Fix any legitimate test failures vs outdated expectations
  - [ ] Update test file headers to remove migration warnings

### 🟡 Medium Priority

#### 3. Path Alias Inconsistency

**Status**: ✅ Fixed (January 2026)  
**Effort**: Small  
**Impact**: Low

- **Resolved**: All imports now use `@/` alias pointing to `src/`
- **Cleanup**: Removed duplicate `state/` and `hooks/` directories at root

#### 4. Component Test Coverage

**Status**: 🔴 Critical Gap  
**Effort**: Large (2-3 weeks)  
**Impact**: High

- **Issue**: Component test coverage is severely lacking at ~5% (1/20 components tested)
  - Only `ErrorBoundary.test.tsx` exists in `__tests__/components/`
  - 19/20 components have zero test coverage
  - Overall 75% coverage comes from logic/services, not components
- **Critical Untested Components**:
  - **ActionPanel.tsx** (803 lines) - Largest file, main UI orchestrator
  - ResourceBar.tsx - Core resource display
  - Sidebar.tsx - Log display system
  - All modal components (AboutModal, DashboardModal, ArchiveTerminalModal, etc.)
  - All tab components (BackshopsTab, CanteenTab, HRFloorTab, OfficeTab, TerminalTab, TrainingTab)
  - ActionButton.tsx, HazardBar.tsx, ProficiencyTab.tsx

- **Action Items**:
  - [ ] Prioritize ActionPanel.tsx tests (highest complexity)
  - [ ] Add tests for ResourceBar and Sidebar (core UI)
  - [ ] Implement snapshot testing for modals
  - [ ] Test user interaction flows with React Testing Library
  - [ ] Target 80%+ component coverage to match project standards

#### 5. Error Boundary Coverage

**Status**: ⚠️ Partial  
**Effort**: Small (1 day)  
**Impact**: Low

- **Issue**: ErrorBoundary component has 1 skipped test
- **Action Items**:
  - [ ] Complete ErrorBoundary test suite
  - [ ] Add error recovery testing
  - [ ] Test error logging integration

### 🟢 Low Priority

#### 6. Code Organization

**Status**: 🔵 Planned  
**Effort**: Medium (3-5 days)  
**Impact**: Low

- **Primary Target**: ActionPanel.tsx (803 lines) - Largest file in codebase
  - Main gameplay UI orchestrator rendering all tabs
  - Candidates for extraction: tab rendering logic, event display, job card display
  - Consider splitting into ActionPanelCore + TabRenderer pattern
- **Secondary Opportunities**:
  - Extract magic numbers to constants
  - Consolidate flavor text generation
  - Create utility functions for common patterns
  - gameReducer.ts (459 lines) is well-sized, no split needed

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

#### Immediate (Next Sprint)

1. **Verify Test Suite Status** 🔴
   - Run `npm test` to determine actual failing test count
   - Update test expectations post-slice migration
   - Priority: Align tests with new architecture

2. **Component Test Expansion** 🔴
   - Critical gap: Only 1/20 components tested (5% coverage)
   - Priority: ActionPanel.tsx (803 lines), ResourceBar, Sidebar
   - Target: 80%+ component coverage

#### Short Term (1-2 Months)

3. **Increase Coverage** 🟢
   - Target: 85% overall
   - Focus on components (currently 60%)
   - Add integration tests for critical flows

4. **E2E Test Expansion** 🟢
   - Complete job flow
   - Event handling scenarios
   - Game over conditions
   - Save/load functionality

5. **Visual Regression Testing** 🔵
   - Implement Playwright screenshots
   - Compare UI changes automatically
   - Catch unintended visual breaks

#### Long Term (3-6 Months)

6. **Performance Testing** 🔵
   - Load testing for long game sessions
   - Memory leak detection
   - Frame rate monitoring
   - Save/load time benchmarks

7. **Fuzz Testing** 🔵
   - Random action sequences
   - Edge case discovery
   - State corruption detection

---

## Documentation

### 📚 Documentation Needs

#### High Priority

1. **Architecture Documentation** ⭐⭐⭐
   - Service layer patterns
   - State management flow
   - Reducer composition guide
   - Testing patterns

2. **Contribution Guide** ⭐⭐
   - How to add new actions
   - How to create events
   - How to add skills
   - PR checklist

3. **API Documentation** ⭐⭐
   - Service APIs (CostCalculator, etc.)
   - State shape documentation
   - Event structure
   - Type definitions guide

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

- [x] Fix test infrastructure
- [x] Implement all domain slices (12+ slices complete)
- [x] Complete state migration to slices (gameReducer 1498→459 lines)
- [x] Documentation overhaul (copilot-instructions.md updated)
- [ ] Verify and fix test suite (run npm test for actual status)
- [ ] Component test coverage expansion (priority: ActionPanel, ResourceBar, Sidebar)
- [ ] Migrate legacy processors to Immer (tickProcessor.ts, actionProcessor.ts)

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
