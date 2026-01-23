import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleGameAction } from '../../src/logic/actionProcessor';
import { createInitialState } from '../../src/state/initialState';
import { GameState } from '../../src/types';

describe('actionProcessor - New Events', () => {
  let state: GameState;
  const mockCreateJob = vi.fn();
  const mockTriggerEvent = vi.fn();

  beforeEach(() => {
    state = createInitialState();
    mockCreateJob.mockReset();
    mockTriggerEvent.mockReset();
  });

  describe('Audit Actions', () => {
    it('BRIBE_AUDITOR should reduce suspicion and cost credits', () => {
      state.resources.credits = 200;
      state.resources.suspicion = 50;

      const nextState = handleGameAction(
        state,
        'BRIBE_AUDITOR',
        {},
        mockCreateJob,
        mockTriggerEvent
      );

      expect(nextState.resources.credits).toBe(100); // Cost 100
      expect(nextState.resources.suspicion).toBe(35); // -15
    });

    it('SUBMIT_FAKE_LOGS handles success correctly', () => {
      // Force random to return < 0.6 for success
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const nextState = handleGameAction(
        state,
        'SUBMIT_FAKE_LOGS',
        {},
        mockCreateJob,
        mockTriggerEvent
      );

      expect(nextState.resources.suspicion).toBeGreaterThan(state.resources.suspicion); // Always adds suspicion
      expect(nextState.resources.experience).toBeGreaterThan(state.resources.experience);
    });
  });

  describe('Canteen Actions', () => {
    it('EAT_VOID_BURGER affects sanity and focus', () => {
      state.resources.sanity = 50;
      state.resources.focus = 50;

      const nextState = handleGameAction(
        state,
        'EAT_VOID_BURGER',
        {},
        mockCreateJob,
        mockTriggerEvent
      );

      expect(nextState.resources.sanity).toBe(40); // -10
      expect(nextState.resources.focus).toBe(75); // +25
    });
  });

  describe('Toolroom Actions', () => {
    it('SACRIFICE_TOOL requires a tool', () => {
      // Grant a tool
      // Reset all tools to 0 first
      Object.keys(state.toolConditions).forEach((t) => (state.toolConditions[t] = 0));
      state.toolConditions['hammer'] = 100;

      const nextState = handleGameAction(
        state,
        'SACRIFICE_TOOL',
        {},
        mockCreateJob,
        mockTriggerEvent
      );

      expect(nextState.toolConditions['hammer']).toBe(0);
      expect(nextState.resources.sanity).toBeGreaterThan(state.resources.sanity);
    });
  });

  describe('Training Actions', () => {
    it('ATTEND_TRAINING_MODULE increases progress', () => {
      state.hfStats.trainingProgress = 0;

      const nextState = handleGameAction(
        state,
        'ATTEND_TRAINING_MODULE',
        {},
        mockCreateJob,
        mockTriggerEvent
      );

      expect(nextState.hfStats.trainingProgress).toBe(20);
      expect(nextState.resources.sanity).toBeLessThan(state.resources.sanity);
    });
  });
});
