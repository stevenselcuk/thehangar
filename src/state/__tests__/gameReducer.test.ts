import { beforeEach, describe, expect, it, vi } from 'vitest';
import { processTick } from '../../logic/tickLogic';
import { composeAction, composeTick } from '../reducerComposer';
import { gameReducer } from '../gameReducer';
import { GameState } from '../../types';

// Mock dependencies
vi.mock('../../logic/tickLogic', () => ({
  processTick: vi.fn(),
}));

vi.mock('../reducerComposer', () => ({
  composeAction: vi.fn(() => ({})), // Return empty object to avoid proxy issues with Immer
  composeTick: vi.fn(() => ({})),   // Return empty object
}));

describe('gameReducer', () => {
  let initialState: GameState;
  const mockTriggerEvent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockTriggerEvent.mockClear();

    initialState = {
      resources: {
        credits: 100,
        sanity: 100,
        focus: 100,
        suspicion: 0,
        experience: 0,
        technicalLogbookHours: 0,
      },
      inventory: {},
      flags: {
        isAfraid: false,
        janitorPresent: false,
        onPerformanceImprovementPlan: false,
        activeComponentFailure: null,
      },
      hfStats: {
        fearTimer: 0,
        socialStress: 0,
        accessTunnelFound: false,
      },
      proficiency: {},
      stats: {},
      logs: [],
      notificationQueue: [],
      activeEvent: null,
      activeHazards: [],
      activeScenario: null,
      calibrationMinigame: { active: false, toolId: null, toolLabel: null },
      lastUpdate: Date.now(),
      activeJob: null,
    } as unknown as GameState;
  });

  describe('TICK action', () => {
    it('should call composeTick and processTick', () => {
      const action = {
        type: 'TICK',
        payload: {
          delta: 1000,
          triggerEvent: mockTriggerEvent,
          activeTab: 'terminal' as const,
        },
      } as const;

      gameReducer(initialState, action);

      // Check call arguments manually to avoid accessing revoked proxy (draft)
      const composeTickCalls = vi.mocked(composeTick).mock.calls;
      expect(composeTickCalls).toHaveLength(1);
      expect(composeTickCalls[0][1]).toBe(1000);
      expect(composeTickCalls[0][2]).toBe('terminal');

      const processTickCalls = vi.mocked(processTick).mock.calls;
      expect(processTickCalls).toHaveLength(1);
      expect(processTickCalls[0][1]).toBe(1000);
      expect(processTickCalls[0][2]).toBe(mockTriggerEvent);
      expect(processTickCalls[0][3]).toBe('terminal');
    });

    it('should trigger random events based on probability', () => {
      const action = {
        type: 'TICK',
        payload: {
          delta: 1000,
          triggerEvent: mockTriggerEvent,
          activeTab: 'terminal' as const,
        },
      } as const;

      // Spy on Math.random to trigger event (< 0.0003)
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.0002);

      gameReducer(initialState, action);

      expect(mockTriggerEvent).toHaveBeenCalled();
      randomSpy.mockRestore();
    });

    it('should trigger FUEL_CONTAM event based on probability', () => {
      const action = {
        type: 'TICK',
        payload: {
          delta: 1000,
          triggerEvent: mockTriggerEvent,
          activeTab: 'terminal' as const,
        },
      } as const;

      // Need to fail the first check (>= 0.0003) but pass the second (< 0.0001)
      // Math.random() is called multiple times.
      // 1. First check (< 0.0003) -> Return 0.5 (fail)
      // 2. Second check (< 0.0001) -> Return 0.00005 (pass)
      const randomSpy = vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.5)
        .mockReturnValueOnce(0.00005);

      gameReducer(initialState, action);

      expect(mockTriggerEvent).toHaveBeenCalledWith('incident', 'FUEL_CONTAM');
      randomSpy.mockRestore();
    });
  });

  describe('ACTION action', () => {
    it('should route known actions to composeAction', () => {
      const action = {
        type: 'ACTION',
        payload: {
          type: 'PET_CAT',
          payload: { someData: 'test' },
        },
      } as const;

      gameReducer(initialState, action);

      const composeActionCalls = vi.mocked(composeAction).mock.calls;
      expect(composeActionCalls).toHaveLength(1);
      expect(composeActionCalls[0][1]).toEqual({
        type: 'PET_CAT',
        payload: { someData: 'test' }
      });
    });

    it('should handle IMPORT_STATE correctly', () => {
      const importedState = {
        ...initialState,
        resources: { ...initialState.resources, credits: 9999 },
        // These should be reset by reducer
        activeEvent: { id: 'test' },
        activeHazards: ['fire'],
        activeScenario: { id: 'test' },
        calibrationMinigame: { active: true },
      } as unknown as GameState;

      const action = {
        type: 'ACTION',
        payload: {
          type: 'IMPORT_STATE',
          payload: { state: importedState },
        },
      } as const;

      const newState = gameReducer(initialState, action);

      expect(newState.resources.credits).toBe(9999);
      expect(newState.activeEvent).toBeNull();
      expect(newState.activeHazards).toEqual([]);
      expect(newState.activeScenario).toBeNull();
      expect(newState.calibrationMinigame.active).toBe(false);
    });

    it('should warn on unknown actions', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const action = {
            type: 'ACTION',
            payload: {
                type: 'UNKNOWN_ACTION',
            }
        } as const;

        gameReducer(initialState, action);

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unhandled action type'));
        consoleSpy.mockRestore();
    });
  });

  describe('Dev Mode Actions', () => {
    it('should handle UPDATE_RESOURCE', () => {
        const action = {
            type: 'UPDATE_RESOURCE',
            payload: { credits: 500 }
        } as const;

        const newState = gameReducer(initialState, action);
        expect(newState.resources.credits).toBe(500);
    });

    it('should handle UPDATE_INVENTORY', () => {
        const action = {
            type: 'UPDATE_INVENTORY',
            payload: { 'test-item': { id: 'test-item', name: 'Test', count: 1 } }
        } as any; // Cast because payload type might be strictly typed in real code but loose in test

        const newState = gameReducer(initialState, action);
        expect(newState.inventory['test-item']).toBeDefined();
    });

    it('should handle UPDATE_FLAGS', () => {
        const action = {
            type: 'UPDATE_FLAGS',
            payload: { isAfraid: true }
        } as const;

        const newState = gameReducer(initialState, action);
        expect(newState.flags.isAfraid).toBe(true);
    });

    it('should handle UPDATE_HF_STATS', () => {
        const action = {
            type: 'UPDATE_HF_STATS',
            payload: { fearTimer: 100 }
        } as const;

        const newState = gameReducer(initialState, action);
        expect(newState.hfStats.fearTimer).toBe(100);
    });

    it('should handle UPDATE_PROFICIENCY', () => {
        const action = {
            type: 'UPDATE_PROFICIENCY',
            payload: { unlocked: ['skill1'] }
        } as any;

        const newState = gameReducer(initialState, action);
        expect(newState.proficiency.unlocked).toEqual(['skill1']);
    });

    it('should handle UPDATE_STATS', () => {
        const action = {
            type: 'UPDATE_STATS',
            payload: { 'stat1': 10 }
        } as any;

        const newState = gameReducer(initialState, action);
        expect(newState.stats['stat1']).toBe(10);
    });

     it('should handle UPDATE_STATE', () => {
        const action = {
            type: 'UPDATE_STATE',
            payload: { activeJob: { id: 'job1', timeLeft: 100 } as any }
        } as const;

        const newState = gameReducer(initialState, action);
        expect(newState.activeJob?.id).toBe('job1');
    });

    it('should handle CLEAR_NOTIFICATIONS', () => {
        initialState.notificationQueue = [{ id: '1', message: 'Test' } as any];
        const action = { type: 'CLEAR_NOTIFICATIONS' } as const;

        const newState = gameReducer(initialState, action);
        expect(newState.notificationQueue).toEqual([]);
    });

    it('should handle TRIGGER_EVENT', () => {
        const action = {
            type: 'TRIGGER_EVENT',
            payload: { type: 'test-event' }
        } as const;

        gameReducer(initialState, action);

        const composeActionCalls = vi.mocked(composeAction).mock.calls;
        expect(composeActionCalls).toHaveLength(1);
        expect(composeActionCalls[0][1]).toEqual({
            type: 'TRIGGER_EVENT',
            payload: { type: 'test-event' }
        });
    });

    // Test the IMPORT_STATE case which is also a top-level action type, not just nested in ACTION
    it('should handle top-level IMPORT_STATE action', () => {
        const importedState = {
          ...initialState,
          resources: { ...initialState.resources, credits: 8888 },
          activeEvent: { id: 'test' },
        } as unknown as GameState;

        const action = {
          type: 'IMPORT_STATE',
          payload: {
            state: importedState,
          },
        } as const;

        const newState = gameReducer(initialState, action);

        expect(newState.resources.credits).toBe(8888);
        expect(newState.activeEvent).toBeNull(); // Should be reset
      });
  });
});
