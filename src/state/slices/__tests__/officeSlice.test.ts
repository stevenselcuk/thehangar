import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { officeReducer, OfficeSliceState } from '../officeSlice';

// Mock dependencies
vi.mock('../../../services/logService', () => ({
  addLogToDraft: vi.fn(),
}));
vi.mock('../../../services/CostCalculator', () => ({
  hasSkill: vi.fn().mockReturnValue(false),
}));

describe('officeSlice', () => {
  let initialState: OfficeSliceState;
  let mockTriggerEvent: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockTriggerEvent = vi.fn();
    initialState = {
      flags: {
        autoSrfActive: false,
        endingTriggered: null,
      },
      resources: {
        credits: 100,
        experience: 0,
        sanity: 50,
        focus: 50,
        suspicion: 20,
      },
      inventory: {
        mainboard: false,
        graphicCard: false,
        cdRom: false,
        floppyDrive: false,
        pcAssembled: false,
        pcGpuUpgrade: false,
        pcHddUpgrade: false,
      },
      hfStats: {
        trainingProgress: 0,
        socialStress: 0,
      },
      stats: {
        srfsFiled: 0,
      },
      proficiency: {},
      logs: [],
      mail: [],
      activeEvent: null,
    } as unknown as OfficeSliceState;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('SEARCH_MANUALS', () => {
    it('should trigger KARDEX_RECOVERY with 5% chance', () => {
      // Mock random to hit the 5% chance (0.05 is the threshold in the requirement, so < 0.05 triggers)
      // The implementation will likely use a specific range.
      // Assuming implementation: if (Math.random() < 0.05) ...
      vi.spyOn(Math, 'random').mockReturnValue(0.04);

      const action = {
        type: 'SEARCH_MANUALS' as const,
        payload: {
          triggerEvent: mockTriggerEvent,
        },
      };

      officeReducer(initialState, action);

      expect(mockTriggerEvent).toHaveBeenCalledWith('eldritch_manifestation', 'KARDEX_RECOVERY');
    });

    it('should NOT trigger KARDEX_RECOVERY if chance is missed', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.06);

      const action = {
        type: 'SEARCH_MANUALS' as const,
        payload: {
          triggerEvent: mockTriggerEvent,
        },
      };

      officeReducer(initialState, action);

      expect(mockTriggerEvent).not.toHaveBeenCalledWith('eldritch_manifestation', 'KARDEX_RECOVERY');
    });
  });

  describe('REVIEW_SURVEILLANCE_LOGS', () => {
    it('should trigger THE_ARCHIVIST if suspicion > 75 and sanity < 40', () => {
      initialState.resources.suspicion = 80;
      initialState.resources.sanity = 30;

      const action = {
        type: 'REVIEW_SURVEILLANCE_LOGS' as const,
        payload: {
          triggerEvent: mockTriggerEvent,
        },
      };

      officeReducer(initialState, action);

      expect(mockTriggerEvent).toHaveBeenCalledWith('eldritch_manifestation', 'THE_ARCHIVIST');
    });

    it('should NOT trigger THE_ARCHIVIST if suspicion is low', () => {
      initialState.resources.suspicion = 50;
      initialState.resources.sanity = 30;

      const action = {
        type: 'REVIEW_SURVEILLANCE_LOGS' as const,
        payload: {
          triggerEvent: mockTriggerEvent,
        },
      };

      officeReducer(initialState, action);

      expect(mockTriggerEvent).not.toHaveBeenCalledWith('eldritch_manifestation', 'THE_ARCHIVIST');
    });

    it('should NOT trigger THE_ARCHIVIST if sanity is high', () => {
      initialState.resources.suspicion = 80;
      initialState.resources.sanity = 50;

      const action = {
        type: 'REVIEW_SURVEILLANCE_LOGS' as const,
        payload: {
          triggerEvent: mockTriggerEvent,
        },
      };

      officeReducer(initialState, action);

      expect(mockTriggerEvent).not.toHaveBeenCalledWith('eldritch_manifestation', 'THE_ARCHIVIST');
    });
  });
});
