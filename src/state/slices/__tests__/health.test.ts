import { describe, expect, it } from 'vitest';
import { GameState, Inventory, ResourceState } from '../../../types';
import { EventsAction, eventsReducer } from '../eventsSlice';
import { inventoryReducer } from '../inventorySlice';

// Mock initial state helper
const getInitialState = (overrides?: Partial<GameState>): GameState =>
  ({
    inventory: {} as unknown as Inventory,
    personalInventory: {},
    rotables: [],
    toolConditions: {},
    flags: {
      toolroomMasterPissed: false,
      activeComponentFailure: null,
    },
    resources: {
      credits: 100,
      health: 50, // Start damaged to test healing
      sanity: 100,
      focus: 100,
      paracetamol: 1,
      ibuprofen: 1,
      naproxen: 1,
      ketamine: 1,
      firstAidKit: 1,
    } as unknown as ResourceState,
    hfStats: {
      noiseExposure: 0,
      socialStress: 0,
      efficiencyBoost: 0,
      toolroomMasterCooldown: 0,
    },
    calibrationMinigame: {
      active: false,
      toolId: null,
      toolLabel: null,
    },
    activeEvent: null,
    stats: {
      rotablesRepaired: 0,
    },
    logs: [],
    toolroom: {
      status: 'OPEN',
      unavailableTools: [],
      nextStatusChange: 0,
    },
    ...overrides,
  }) as unknown as GameState;

describe('Health & Medicine', () => {
  it('should heal with Paracetamol (+5)', () => {
    const initialState = getInitialState();
    const action = {
      type: 'USE_ITEM' as const,
      payload: { id: 'paracetamol', label: 'Paracetamol' },
    };
    const nextState = inventoryReducer(initialState, action);

    expect(nextState.resources.health).toBe(55);
    expect(nextState.resources.paracetamol).toBe(0);
  });

  it('should heal with Ibuprofen (+10)', () => {
    const initialState = getInitialState();
    const action = {
      type: 'USE_ITEM' as const,
      payload: { id: 'ibuprofen', label: 'Ibuprofen' },
    };
    const nextState = inventoryReducer(initialState, action);

    expect(nextState.resources.health).toBe(60);
    expect(nextState.resources.ibuprofen).toBe(0);
  });

  it('should heal with Naproxen (+15)', () => {
    const initialState = getInitialState();
    const action = {
      type: 'USE_ITEM' as const,
      payload: { id: 'naproxen', label: 'Naproxen' },
    };
    const nextState = inventoryReducer(initialState, action);

    expect(nextState.resources.health).toBe(65);
    expect(nextState.resources.naproxen).toBe(0);
  });

  it('should heal massively with Ketamine but drain sanity/focus', () => {
    const initialState = getInitialState();
    const action = {
      type: 'USE_ITEM' as const,
      payload: { id: 'ketamine', label: 'Ketamine' },
    };
    const nextState = inventoryReducer(initialState, action);

    expect(nextState.resources.health).toBe(100); // 50 + 50
    expect(nextState.resources.sanity).toBe(80); // 100 - 20
    expect(nextState.resources.focus).toBe(80); // 100 - 20
    expect(nextState.resources.ketamine).toBe(0);
  });

  it('should heal with First Aid Kit (+25)', () => {
    const initialState = getInitialState();
    const action = {
      type: 'USE_ITEM' as const,
      payload: { id: 'firstAidKit', label: 'First Aid Kit' },
    };
    const nextState = inventoryReducer(initialState, action);

    expect(nextState.resources.health).toBe(75);
    expect(nextState.resources.firstAidKit).toBe(0);
  });

  it('should not heal beyond 100', () => {
    const initialState = getInitialState({
      resources: {
        health: 95,
        paracetamol: 1,
      } as unknown as ResourceState,
    });
    const action = {
      type: 'USE_ITEM' as const,
      payload: { id: 'paracetamol', label: 'Paracetamol' },
    };
    const nextState = inventoryReducer(initialState, action);

    expect(nextState.resources.health).toBe(100);
  });

  it('should take damage from an event choice', () => {
    // We need to use eventsReducer for this, not inventoryReducer
    // Mock full GameState for eventsReducer (or at least the parts it needs)
    const mockEvent = {
      id: 'TEST_EVENT',
      title: 'Test Event',
      type: 'accident',
      description: 'Ouch',
      timeLeft: 100,
      totalTime: 100,
      choices: [
        {
          id: 'ouch',
          label: 'Get Hurt',
          effects: { health: -10 },
        },
      ],
    };

    const initialState = {
      activeEvent: mockEvent,
      resources: { health: 100, experience: 0 },
      stats: { eventsResolved: 0 },
      logs: [],
      hfStats: {},
      flags: {},
    } as unknown as GameState;

    const action = {
      type: 'RESOLVE_EVENT',
      payload: { choiceId: 'ouch' },
    } as EventsAction;

    const nextState = eventsReducer(initialState, action);

    expect(nextState.resources.health).toBe(90);
    expect(nextState.activeEvent).toBeNull();
  });
});
