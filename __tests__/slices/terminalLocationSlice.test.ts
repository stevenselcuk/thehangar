import {
  terminalLocationReducer,
  type TerminalLocationAction,
  type TerminalLocationSliceState,
} from '@/state/slices/terminalLocationSlice.ts';
import seedrandom from 'seedrandom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('terminalLocationSlice', () => {
  let initialState: TerminalLocationSliceState;
  let mockTriggerEvent: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockTriggerEvent = vi.fn();
    Math.random = seedrandom('test-terminal');

    initialState = {
      resources: {
        alclad: 0,
        titanium: 0,
        fiberglass: 0,
        rivets: 0,
        hiloks: 0,
        collars: 0,
        grommets: 0,
        steelWire: 0,
        skydrol: 0,
        mek: 0,
        grease: 0,
        sealant: 0,
        sanity: 100,
        suspicion: 0,
        focus: 100,
        experience: 0,
        level: 1,
        credits: 50,
        kardexFragments: 0,
        crystallineResonators: 0,
        bioFilament: 0,
        technicalLogbookHours: 0,
        syndicateReputation: 0,
        unionReputation: 0,
        canned_tuna: 0,
        hardwareBolts: 0,
        threadlocker: 0,
        cableTools: 0,
        fdrData: 0,
        fqpu: 0,
        pressureTransducer: 0,
        aimsData: 0,
        ram: 0,
        smokeDetector: 0,
        doorSeal: 0,
        balanceWeights: 0,
        autopilotComputer: 0,
        rudderFeelComputer: 0,
        emergencyBatteryPack: 0,
        adfReceiver: 0,
      },
      flags: {
        foundNote: false,
        lightsFlickered: false,
        officeUnlocked: false,
        hangarUnlocked: false,
        tarmacUnlocked: false,
        foundManifest: false,
        revealedTruth: false,
        kardexActive: false,
        suitsVisiting: false,
        underSurveillance: false,
        nightCrewActive: false,
        nightCrewUnlocked: false,
        transitCheckDelegationActive: false,
        activeComponentFailure: null,
        suspicionEvent30Triggered: false,
        suspicionEvent60Triggered: false,
        suspicionEvent90Triggered: false,
        autoSrfActive: false,
        venomSurgeActive: false,
        fuelContaminationRisk: false,
        migraineActive: false,
        toolroomMasterPissed: false,
        janitorPresent: false,
        ndtFinding: null,
        sls3Unlocked: false,
        onPerformanceImprovementPlan: false,
        janitorArcStage: 0,
        toolroomMasterArcStage: 0,
        endingAlienConspiracyProgress: 0,
        endingGovtConspiracyProgress: 0,
        endingTriggered: null,
        foundPhoto: false,
        isHallucinating: false,
        isAfraid: false,
        storyFlags: { fdrDeconstructed: false },
      },
      hfStats: {
        fatigue: 0,
        socialStress: 0,
        trainingProgress: 0,
        compliancePressureTimer: 0,
        efficiencyBoost: 0,
        temperature: 20,
        lightingLevel: 100,
        fearTimer: 0,
        noiseExposure: 0,
        venomSurgeTimer: 0,
        toolroomMasterCooldown: 0,
        migraineTimer: 0,
        performanceReviewCooldown: 0,
        janitorCooldown: 0,
        scheduleCompressionTimer: 0,
        sanityShieldTimer: 0,
        foundLoopholeTimer: 0,
        clearanceLevel: 0,
        hfRecurrentDueDate: 0,
      },
      proficiency: {
        unlocked: [],
        skillPoints: 0,
        unlockedBonuses: [],
        easaModulesPassed: [],
      },
      logs: [],
    };
  });

  describe('WATCH_BOARDS', () => {
    it('should award experience and reduce sanity', () => {
      const action: TerminalLocationAction = {
        type: 'WATCH_BOARDS',
        payload: {
          triggerEvent: mockTriggerEvent as unknown as (type: string, id?: string) => void,
        },
      };

      const result = terminalLocationReducer(initialState, action);

      expect(result.resources.experience).toBe(80);
      expect(result.resources.sanity).toBe(97);
      expect(result.logs).toHaveLength(1);
    });
  });

  describe('GO_TERMINAL_RESTROOM', () => {
    it('should restore focus', () => {
      const lowFocus = {
        ...initialState,
        resources: { ...initialState.resources, focus: 50 },
      };

      const action: TerminalLocationAction = {
        type: 'GO_TERMINAL_RESTROOM',
        payload: {},
      };

      const result = terminalLocationReducer(lowFocus, action);

      expect(result.resources.focus).toBe(65);
      expect(result.logs).toHaveLength(1);
    });
  });

  describe('EAT_TERMINAL_BURGER', () => {
    it('should consume credits and restore focus/sanity', () => {
      const action: TerminalLocationAction = {
        type: 'EAT_TERMINAL_BURGER',
        payload: {},
      };

      const result = terminalLocationReducer(initialState, action);

      expect(result.resources.credits).toBe(38);
      expect(result.resources.focus).toBe(100);
      expect(result.resources.sanity).toBe(100);
      expect(result.logs[0].text).toContain('Burger');
    });

    it('should fail if insufficient credits', () => {
      const poorState = {
        ...initialState,
        resources: { ...initialState.resources, credits: 5 },
      };

      const action: TerminalLocationAction = {
        type: 'EAT_TERMINAL_BURGER',
        payload: {},
      };

      const result = terminalLocationReducer(poorState, action);

      expect(result.resources.credits).toBe(5);
      expect(result.logs[0].text).toContain('NOT ENOUGH');
    });
  });

  describe('SLEEP_AT_GATE', () => {
    it('should restore focus and sanity but increase suspicion', () => {
      const tired = {
        ...initialState,
        resources: { ...initialState.resources, focus: 30, sanity: 50 },
      };

      const action: TerminalLocationAction = {
        type: 'SLEEP_AT_GATE',
        payload: {
          triggerEvent: mockTriggerEvent as unknown as (type: string, id?: string) => void,
        },
      };

      const result = terminalLocationReducer(tired, action);

      expect(result.resources.focus).toBe(100);
      expect(result.resources.sanity).toBe(100);
      expect(result.resources.suspicion).toBe(20);
      expect(result.logs).toHaveLength(1);
    });
  });

  describe('SMALL_TALK_PERSONNEL', () => {
    it('should restore sanity', () => {
      const action: TerminalLocationAction = {
        type: 'SMALL_TALK_PERSONNEL',
        payload: {
          triggerEvent: mockTriggerEvent as unknown as (type: string, id?: string) => void,
        },
      };

      const result = terminalLocationReducer(initialState, action);

      expect(result.resources.sanity).toBeGreaterThanOrEqual(100);
      expect(result.logs).toHaveLength(1);
    });
  });

  describe('OFFER_ASSISTANCE', () => {
    it('should increase suspicion', () => {
      const action: TerminalLocationAction = {
        type: 'OFFER_ASSISTANCE',
        payload: {
          triggerEvent: mockTriggerEvent as unknown as (type: string, id?: string) => void,
        },
      };

      const result = terminalLocationReducer(initialState, action);

      expect(result.resources.suspicion).toBeGreaterThan(0);
    });
  });

  describe('USE_PAYPHONE', () => {
    it('should consume credits', () => {
      const action: TerminalLocationAction = {
        type: 'USE_PAYPHONE',
        payload: {},
      };

      const result = terminalLocationReducer(initialState, action);

      expect(result.resources.credits).toBe(45);
      expect(result.logs).toHaveLength(1);
    });

    it('should fail if insufficient credits', () => {
      const poorState = {
        ...initialState,
        resources: { ...initialState.resources, credits: 2 },
      };

      const action: TerminalLocationAction = {
        type: 'USE_PAYPHONE',
        payload: {},
      };

      const result = terminalLocationReducer(poorState, action);

      expect(result.resources.credits).toBe(2);
      expect(result.logs[0].text).toContain("don't have enough");
    });
  });

  describe('Immutability', () => {
    it('should not mutate original state', () => {
      const action: TerminalLocationAction = {
        type: 'WATCH_BOARDS',
        payload: {
          triggerEvent: mockTriggerEvent as unknown as (type: string, id?: string) => void,
        },
      };

      const originalExp = initialState.resources.experience;
      terminalLocationReducer(initialState, action);

      expect(initialState.resources.experience).toBe(originalExp);
    });
  });
});
