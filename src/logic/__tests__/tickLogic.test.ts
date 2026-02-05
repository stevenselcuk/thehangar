import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { processTick } from '../tickLogic';
import { GameState, TabType } from '../../types';

// Mock dependencies
vi.mock('../../services/logService', () => ({
  addLogToDraft: vi.fn(),
}));
vi.mock('../locationRequirements', () => ({
  checkLocationRequirements: vi.fn().mockReturnValue({ satisfied: true, missingSoft: [], missingRequired: [] }),
}));
vi.mock('../levels', () => ({
  getXpForNextLevel: vi.fn().mockReturnValue(1000),
  getLevelUpLog: vi.fn().mockReturnValue('Level Up'),
}));

describe('processTick', () => {
  let draft: GameState;
  let mockTriggerEvent: any;

  beforeEach(() => {
    mockTriggerEvent = vi.fn();
    draft = {
      resources: {
        sanity: 100,
        suspicion: 0,
        credits: 100,
        level: 1,
        experience: 0,
        focus: 100,
        alclad: 0,
        rivets: 0,
      } as any,
      flags: {
        nightCrewActive: false,
        isAfraid: false,
        transitCheckDelegationActive: false,
        autoSrfActive: false,
      } as any,
      hfStats: {
        fatigue: 0,
        socialStress: 0,
        noiseExposure: 0,
        temperature: 22,
        trainingProgress: 100, // Default to 100 so it doesn't trigger training event
      } as any,
      toolConditions: {
        'drill': 100,
      } as any,
      time: {
        totalPlayTime: 10000,
      } as any,
      eventTimestamps: {},
      inventory: {},
      rotables: [],
      mail: [],
      logs: [],
      vendingPrices: {},
      proficiency: { unlocked: [], skillPoints: 0 } as any,
      notificationQueue: [],
      pet: { hunger: 0 } as any,
      activeEvent: null,
      activeJob: null,
      lastUpdate: 0,
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Reality Breakdown', () => {
    it('should trigger TIMELINE_CORRUPTION if sanity < 20', () => {
      draft.resources.sanity = 15;

      // Mock random to trigger (assuming low chance)
      // I need to know the threshold I'll implement. Let's assume 0.0005 per tick or similar.
      // I will set random to 0.0.
      vi.spyOn(Math, 'random').mockReturnValue(0.0);

      processTick(draft, 1000, mockTriggerEvent, TabType.OFFICE);

      expect(mockTriggerEvent).toHaveBeenCalledWith('eldritch_manifestation', 'TIMELINE_CORRUPTION');
    });

    it('should NOT trigger TIMELINE_CORRUPTION if sanity >= 20', () => {
      draft.resources.sanity = 25;
      vi.spyOn(Math, 'random').mockReturnValue(0.0);

      processTick(draft, 1000, mockTriggerEvent, TabType.OFFICE);

      expect(mockTriggerEvent).not.toHaveBeenCalledWith('eldritch_manifestation', 'TIMELINE_CORRUPTION');
    });
  });

  describe('Audit Encounters (The Suits)', () => {
    it('should trigger AUDIT_INTERNAL_SUITS_1 periodically when suspicion > 30', () => {
      draft.resources.suspicion = 40;
      // Setup time to cross 1000ms boundary
      // Prev time was 10000. New time will be 11000.
      // 10000 % 1000 == 0. 11000 % 1000 == 0.
      // Logic: floor(now/1000) > floor(prev/1000).
      // prev=10000 (10), now=11000 (11). 11 > 10. True.

      // Also random check or suspicion condition. Suspicion > 30 is true.

      // Assuming random check is ignored if suspicion > 30 OR random < 0.01.
      // But I should check how I implement it.
      // "Condition: tick % 1000 === 0 AND (suspicion > 30 OR random < 0.01)"

      draft.time.totalPlayTime = 11000;
      const delta = 1000; // Passed to processTick

      // I need to ensure processTick uses draft.time.totalPlayTime
      // NOTE: processTick is void, it modifies draft.
      // But draft.time.totalPlayTime is usually updated OUTSIDE processTick in composed reducer?
      // Wait, processTick in tickLogic receives draft.
      // And in reducerComposer:
      // draft.time = timeReducer(...)
      // composeTick call... processTick call.
      // So draft.time IS updated before processTick.

      vi.spyOn(Math, 'random').mockReturnValue(0.5); // fail random part, pass suspicion part

      processTick(draft, delta, mockTriggerEvent, TabType.OFFICE);

      expect(mockTriggerEvent).toHaveBeenCalledWith('audit', 'AUDIT_INTERNAL_SUITS_1');
    });
  });

  describe('Canteen/Vending Incidents', () => {
    it('should trigger CANTEEN_VENDING_PROPHECY when in CANTEEN tab', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.0); // Trigger chance

      processTick(draft, 1000, mockTriggerEvent, TabType.CANTEEN);

      expect(mockTriggerEvent).toHaveBeenCalledWith('canteen_incident', 'CANTEEN_VENDING_PROPHECY');
    });

    it('should NOT trigger CANTEEN_VENDING_PROPHECY when NOT in CANTEEN tab', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.0);

      processTick(draft, 1000, mockTriggerEvent, TabType.OFFICE);

      expect(mockTriggerEvent).not.toHaveBeenCalledWith('canteen_incident', 'CANTEEN_VENDING_PROPHECY');
    });
  });

  describe('Toolroom Sacrifices', () => {
    it('should trigger INCIDENT_TOOLROOM_DEMAND if tool condition < 20', () => {
      draft.toolConditions['drill'] = 10;
      vi.spyOn(Math, 'random').mockReturnValue(0.0);

      processTick(draft, 1000, mockTriggerEvent, TabType.TOOLROOM);

      expect(mockTriggerEvent).toHaveBeenCalledWith('incident', 'INCIDENT_TOOLROOM_DEMAND');
    });
  });

  describe('Training & Indoctrination', () => {
    it('should trigger INCIDENT_TRAINING_MODULE if trainingProgress < 20 and timer trigger', () => {
      draft.hfStats.trainingProgress = 10;
      draft.time.totalPlayTime = 15000; // Crosses 5000 boundary (5000, 10000, 15000)
      // floor(15000/5000) = 3. floor(14000/5000) = 2.
      // So delta=1000, prev=14000.

      processTick(draft, 1000, mockTriggerEvent, TabType.TRAINING);

      expect(mockTriggerEvent).toHaveBeenCalledWith('incident', 'INCIDENT_TRAINING_MODULE');
    });
  });
});
