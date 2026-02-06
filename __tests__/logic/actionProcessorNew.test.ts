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
      vi.spyOn(Math, 'random').mockReturnValue(0.3); // Success (chance 0.6)
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
      expect(nextState.resources.suspicion).toBe(30); // -20
    });

    it('SUBMIT_FAKE_LOGS handles success correctly', () => {
      // Force random to return < 0.5 for success (chance 0.5)
      vi.spyOn(Math, 'random').mockReturnValue(0.4);
      state.resources.suspicion = 50; // Set initial suspicion

      const nextState = handleGameAction(
        state,
        'SUBMIT_FAKE_LOGS',
        {},
        mockCreateJob,
        mockTriggerEvent
      );

      expect(nextState.resources.suspicion).toBeLessThan(state.resources.suspicion); // Should reduce suspicion on success
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

      // actions.ts: focus +10, sanity -5
      expect(nextState.resources.sanity).toBe(45); // 50 - 5
      expect(nextState.resources.focus).toBe(60); // 50 + 10
    });
  });

  describe('Toolroom Actions', () => {
    it('SACRIFICE_TOOL requires a tool', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.3); // Success (chance 0.5)
      // Grant a wrench (required item)
      state.inventory.wrench = true;
      state.resources.sanity = 50; // Lower sanity so it can increase

      const nextState = handleGameAction(
        state,
        'SACRIFICE_TOOL',
        {},
        mockCreateJob,
        mockTriggerEvent
      );

      expect(nextState.inventory.wrench).toBe(false); // Validating item removal
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
