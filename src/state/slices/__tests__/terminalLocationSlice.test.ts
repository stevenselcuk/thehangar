import { beforeEach, describe, expect, it, vi } from 'vitest';
import { terminalLocationReducer, TerminalLocationSliceState } from '../terminalLocationSlice';

// Mock the flavor data import
vi.mock('../../../data/flavor.ts', () => ({
  ACTION_LOGS: {},
  PAYPHONE_FLAVOR_TEXTS: ['Test flavor text'],
  REGULAR_TALK_LOGS: { CLUES: [], WARNINGS: [], RAMBLES: [] },
  SMALL_TALK_PERSONNEL_LOGS: [],
}));

describe('terminalLocationReducer', () => {
  let initialState: TerminalLocationSliceState;

  beforeEach(() => {
    initialState = {
      resources: {
        credits: 100,
        sanity: 50,
        focus: 50,
        suspicion: 10,
        experience: 0,
        technicalLogbookHours: 0,
      },
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
      logs: [],
    } as unknown as TerminalLocationSliceState;
  });

  describe('USE_PAYPHONE', () => {
    it('should restore sanity to 100 and increase other stats', () => {
      const action = { type: 'USE_PAYPHONE' } as const;
      const newState = terminalLocationReducer(initialState, action);

      expect(newState.resources.credits).toBe(95); // -5 credits
      expect(newState.resources.sanity).toBe(100); // Set to 100
      expect(newState.resources.focus).toBe(70); // +20
      expect(newState.resources.suspicion).toBe(20); // +10
      expect(newState.hfStats.socialStress).toBe(20); // +20
    });

    it('should fail if not enough credits', () => {
      initialState.resources.credits = 4;
      const action = { type: 'USE_PAYPHONE' } as const;
      const newState = terminalLocationReducer(initialState, action);

      expect(newState.resources.credits).toBe(4);
      expect(newState.resources.sanity).toBe(50); // Unchanged
      expect(newState.logs).toHaveLength(1);
      expect(newState.logs[0].text).toContain("don't have enough change");
    });

    it('should trigger events based on random roll', () => {
      // Mock Math.random to trigger specific path
      // 0.05 -> trigger EASA audit logic (roll < 0.1) -> roll < 0.5 (EASA)
      const mockRandom = vi.spyOn(Math, 'random');

      // We need to control the flavor text roll (randomLog) and isSpooky roll too.
      // 1. flavor index: 0 (Math.floor(0 * len))
      // 2. isSpooky: 0.5 (false)
      // 3. event roll: 0.05 (< 0.1 -> Audit)
      // 4. audit type roll: 0.4 (< 0.5 -> EASA)

      mockRandom.mockReturnValue(0.05); // Always return low value to trigger all probability checks

      const triggerEvent = vi.fn();
      const action = {
        type: 'USE_PAYPHONE',
        payload: { triggerEvent },
      } as const;

      terminalLocationReducer(initialState, action);

      expect(triggerEvent).toHaveBeenCalledWith('audit', 'PAYPHONE_EASA_AUDIT');

      mockRandom.mockRestore();
    });
  });
});
