import { describe, expect, it, vi } from 'vitest';
import { composeAction } from '../../src/state/reducerComposer';
import { GameState } from '../../src/types';

// Mock dependencies
vi.mock('../../src/services/LevelManager', async () => {
  const actual = await vi.importActual('../../src/services/LevelManager');
  return {
    ...actual,
    isActionUnlocked: vi.fn().mockReturnValue(false),
    getLockedFeatureMessage: vi.fn().mockReturnValue('Level 5 Required'),
  };
});

// Partial mock of initial state
const mockState: GameState = {
  resources: {
    level: 1,
  },
  notificationQueue: [],
  // Add other necessary properties with minimal values
  time: {},
  inventory: {},
  personalInventory: {},
  rotables: [],
  anomalies: [],
  toolConditions: {},
  flags: {},
  logs: [],
  journal: [],
  mail: [],
  lastUpdate: 0,
  eventTimestamps: {},
  activeJob: null,
  activeEvent: null,
  activeHazards: [],
  activeAircraft: null,
  activeScenario: null,
  vendingPrices: {},
  proficiency: {},
  archiveTerminal: {},
  maintenanceTerminal: {},
  stats: {},
  calibrationMinigame: { active: false },
  hfStats: {},
  aog: { active: false },
  procurement: {},
  toolroom: {},
  bulletinBoard: {},
  pet: {},
} as unknown as GameState;

// Helper function to create a fresh initial state for each test
const createInitialState = (): GameState => ({
  ...mockState,
  resources: {
    ...mockState.resources,
  },
  stats: {
    ...mockState.stats,
    accessViolations: 0,
    jobsCompleted: 0,
    srfsFiled: 0,
    ndtScansPerformed: 0,
    anomaliesAnalyzed: 0,
    rotablesRepaired: 0,
    rotablesScavenged: 0,
    eventsResolved: 0,
  },
  logs: [],
  activeEvent: null,
});

describe('reducerComposer - Blocked Actions', () => {
  it('should add a notification when an action is blocked', () => {
    const initialState = createInitialState();
    // Ensure level is low enough to block action
    initialState.resources.level = 1;

    const action = { type: 'PET_CAT' }; // Requires Level 5

    const nextState = composeAction(initialState, action);

    expect(nextState.notificationQueue).toHaveLength(1);
    expect(nextState.notificationQueue[0].title).toBe('ACCESS DENIED');
    expect(nextState.notificationQueue[0].variant).toBe('danger');
    expect(nextState.notificationQueue[0].id).toContain('blocked-PET_CAT');
  });

  it('should increment access violations and trigger consequences', () => {
    let state = createInitialState();
    state.resources.level = 1;
    const action = { type: 'PET_CAT' };

    // 1st Violation
    state = composeAction(state, action);
    expect(state.stats.accessViolations).toBe(1);
    expect(state.logs).toHaveLength(0); // No log yet
    expect(state.activeEvent).toBeNull(); // No event yet

    // 2nd Violation
    state = composeAction(state, action);
    expect(state.stats.accessViolations).toBe(2);
    expect(state.logs).toHaveLength(0); // No log yet
    expect(state.activeEvent).toBeNull(); // No event yet

    // 3rd Violation - Should trigger warning log
    state = composeAction(state, action);
    expect(state.stats.accessViolations).toBe(3);
    expect(state.logs).toHaveLength(1);
    expect(state.logs[0].text).toContain('SYSTEM ALERT');
    expect(state.activeEvent).toBeNull(); // No event yet

    // 4th Violation
    state = composeAction(state, action);
    expect(state.stats.accessViolations).toBe(4);
    expect(state.logs).toHaveLength(1); // Still 1 log
    expect(state.activeEvent).toBeNull(); // No event yet

    // 5th Violation - Should trigger error log
    state = composeAction(state, action);
    expect(state.stats.accessViolations).toBe(5);
    expect(state.logs).toHaveLength(2); // Now 2 logs
    expect(state.logs[0].text).toContain('SECURITY NOTICE'); // Newest log is at index 0
    expect(state.activeEvent).toBeNull(); // No event yet

    // 6th to 9th Violations
    for (let i = 0; i < 4; i++) {
      state = composeAction(state, action);
    }
    expect(state.stats.accessViolations).toBe(9);
    expect(state.logs).toHaveLength(3); // Log added at 8 violations
    expect(state.logs[0].text).toContain('Intrusion protocols');
    expect(state.activeEvent).toBeNull(); // No event yet

    // 10th Violation - Should trigger Security Scan Event
    state = composeAction(state, action);
    expect(state.stats.accessViolations).toBe(10);
    expect(state.logs).toHaveLength(3); // Still 3 logs
    expect(state.activeEvent).toBeDefined();
    expect(state.activeEvent?.id).toBe('SECURITY_VIOLATION_SCAN');
  });
});
