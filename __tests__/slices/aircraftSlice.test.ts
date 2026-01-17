import seedrandom from 'seedrandom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AircraftType } from '@/types.ts';
import {
  aircraftReducer,
  type AircraftAction,
  type AircraftSliceState,
} from '@/state/slices/aircraftSlice.ts';

describe('aircraftSlice', () => {
  let initialState: AircraftSliceState;
  let mockTriggerEvent: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockTriggerEvent = vi.fn();
    Math.random = seedrandom('test-aircraft-slice');

    initialState = {
      activeAircraft: null,
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
        credits: 0,
        kardexFragments: 0,
        crystallineResonators: 0,
        bioFilament: 0,
        technicalLogbookHours: 0,
      },
      inventory: {
        flashlight: false,
        pencil: true,
        ruler: false,
        inspectionMirror: false,
        notebook: true,
        leatherman: false,
        radio: false,
        torxScrewdriver: false,
        snapOnWrenchSet: false,
        hammer: false,
        atlasCopcoDrill: false,
        rivetGun: false,
        allenKeys: false,
        torquemeter: false,
        malabar: false,
        greaseGun: false,
        airDataTestBox: false,
        hfecDevice: false,
        rototestDevice: false,
        orbitalSander: false,
        irLamp: false,
        sonicCleaner: false,
        hasAPLicense: false,
        apWrittenPassed: false,
        apPracticalPassed: false,
        hasAvionicsCert: false,
        isToolboxWithPlayer: false,
        pcAssembled: false,
        pcGpuUpgrade: false,
        pcHddUpgrade: false,
        foundRetiredIDCard: false,
        ford150: false,
        tireKit: false,
        mixedTouchUpPaint: 0,
        mainboard: false,
        graphicCard: false,
        cdRom: false,
        floppyDrive: false,
        metallicSphere: false,
        earmuffs: false,
        hasTruckLockbox: false,
        hasHfInitial: false,
        hasHfRecurrent: false,
        hasFts: false,
        hasHdi: false,
        hasNdtLevel1: false,
        hasNdtLevel2: false,
        hasNdtLevel3: false,
        ndtCerts: [],
        hasEasaB1_1: false,
        hasEasaB2: false,
        hasEasaC: false,
        typeRating737: 0,
        typeRatingA330: 0,
      },
      flags: {
        nightCrewActive: false,
        transitCheckDelegationActive: false,
        autoSrfActive: false,
        isAfraid: false,
        fuelContaminationRisk: false,
        ndtFinding: null,
        venomSurgeActive: false,
        sls3Unlocked: false,
        janitorPresent: false,
        onPerformanceImprovementPlan: false,
        storyFlags: { fdrDeconstructed: false },
      },
      hfStats: {
        trainingProgress: 0,
        fearTimer: 0,
        noiseExposure: 0,
        efficiencyBoost: 0,
        foundLoopholeTimer: 0,
        scheduleCompressionTimer: 0,
        venomSurgeTimer: 0,
      },
      logs: [],
    };
  });

  describe('GET_NEW_AIRCRAFT_TASK', () => {
    it('should assign a new aircraft task', () => {
      const action: AircraftAction = {
        type: 'GET_NEW_AIRCRAFT_TASK',
        payload: {},
      };

      const result = aircraftReducer(initialState, action);

      expect(result.activeAircraft).not.toBeNull();
      expect(result.activeAircraft?.id).toBeDefined();
      expect(['TRANSIT_CHECK', 'DAILY_CHECK', 'ETOPS_CHECK']).toContain(
        result.activeAircraft?.task
      );
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].text).toContain('ASSIGNMENT:');
    });

    it('should not assign if already has active aircraft', () => {
      const stateWithActive = {
        ...initialState,
        activeAircraft: { id: AircraftType.B737_700, task: 'TRANSIT_CHECK' as const },
      };

      const action: AircraftAction = {
        type: 'GET_NEW_AIRCRAFT_TASK',
        payload: {},
      };

      const result = aircraftReducer(stateWithActive, action);

      expect(result.activeAircraft).toEqual(stateWithActive.activeAircraft);
      expect(result.logs).toHaveLength(0);
    });
  });

  describe('AIRCRAFT_ACTION', () => {
    it('should complete TRANSIT_CHECK and award rewards', () => {
      const stateWithAircraft = {
        ...initialState,
        activeAircraft: { id: AircraftType.B737_700, task: 'TRANSIT_CHECK' as const },
      };

      const action: AircraftAction = {
        type: 'AIRCRAFT_ACTION',
        payload: {
          aircraftId: AircraftType.B737_700,
          actionType: 'TRANSIT_CHECK',
          triggerEvent: mockTriggerEvent,
        },
      };

      const result = aircraftReducer(stateWithAircraft, action);

      expect(result.resources.experience).toBe(120);
      expect(result.resources.credits).toBe(25);
      expect(result.resources.alclad).toBe(5);
      expect(result.resources.technicalLogbookHours).toBe(1);
      expect(result.activeAircraft).toBeNull();
      expect(result.logs.some((log) => log.text.includes('Task complete'))).toBe(true);
    });

    it('should complete DAILY_CHECK with higher rewards', () => {
      const action: AircraftAction = {
        type: 'AIRCRAFT_ACTION',
        payload: {
          aircraftId: AircraftType.B737_700,
          actionType: 'DAILY_CHECK',
          triggerEvent: mockTriggerEvent,
        },
      };

      const result = aircraftReducer(initialState, action);

      expect(result.resources.experience).toBe(250);
      expect(result.resources.credits).toBe(60);
      expect(result.resources.alclad).toBe(10);
      expect(result.resources.technicalLogbookHours).toBe(2);
    });

    it('should complete ETOPS_CHECK and increase suspicion', () => {
      const action: AircraftAction = {
        type: 'AIRCRAFT_ACTION',
        payload: {
          aircraftId: AircraftType.B777_200ER,
          actionType: 'ETOPS_CHECK',
          triggerEvent: mockTriggerEvent,
        },
      };

      const result = aircraftReducer(initialState, action);

      expect(result.resources.experience).toBe(400);
      expect(result.resources.credits).toBe(100);
      expect(result.resources.suspicion).toBe(5);
      expect(result.resources.technicalLogbookHours).toBe(4);
    });

    it('should read flight log and display entry', () => {
      const action: AircraftAction = {
        type: 'AIRCRAFT_ACTION',
        payload: {
          aircraftId: AircraftType.B737_700,
          actionType: 'READ_FLIGHT_LOG',
          triggerEvent: mockTriggerEvent,
        },
      };

      const result = aircraftReducer(initialState, action);

      expect(result.resources.experience).toBe(60);
      expect(result.logs.length).toBeGreaterThanOrEqual(2);
      expect(result.logs.some((log) => log.type === 'story')).toBe(true);
    });
  });

  describe('SERVICE_LAVATORY', () => {
    it('should award credits and experience', () => {
      const action: AircraftAction = {
        type: 'SERVICE_LAVATORY',
        payload: {},
      };

      const result = aircraftReducer(initialState, action);

      expect(result.resources.credits).toBe(40);
      expect(result.resources.experience).toBe(80);
      expect(result.resources.sanity).toBe(95);
      expect(result.logs).toHaveLength(1);
    });
  });

  describe('SMALL_TALK_CABIN', () => {
    it('should restore sanity and display random log', () => {
      const action: AircraftAction = {
        type: 'SMALL_TALK_CABIN',
        payload: { triggerEvent: mockTriggerEvent },
      };

      const result = aircraftReducer(initialState, action);

      expect(result.resources.sanity).toBeGreaterThanOrEqual(100);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('story');
    });
  });

  describe('SMOKE_CIGARETTE', () => {
    it('should restore sanity and focus', () => {
      const lowState = {
        ...initialState,
        resources: { ...initialState.resources, sanity: 50, focus: 50 },
      };

      const action: AircraftAction = {
        type: 'SMOKE_CIGARETTE',
        payload: { triggerEvent: mockTriggerEvent },
      };

      const result = aircraftReducer(lowState, action);

      expect(result.resources.sanity).toBe(55);
      expect(result.resources.focus).toBe(55);
      expect(result.logs).toHaveLength(1);
    });
  });

  describe('DRINK_GALLEY_COFFEE', () => {
    it('should restore focus but reduce sanity', () => {
      const lowState = {
        ...initialState,
        resources: { ...initialState.resources, focus: 50 },
      };

      const action: AircraftAction = {
        type: 'DRINK_GALLEY_COFFEE',
        payload: { triggerEvent: mockTriggerEvent },
      };

      const result = aircraftReducer(lowState, action);

      expect(result.resources.focus).toBe(60);
      expect(result.resources.sanity).toBe(95);
      expect(result.logs).toHaveLength(1);
    });
  });

  describe('SCAVENGE_GALLEYS', () => {
    it('should increase suspicion', () => {
      const action: AircraftAction = {
        type: 'SCAVENGE_GALLEYS',
        payload: { triggerEvent: mockTriggerEvent },
      };

      const result = aircraftReducer(initialState, action);

      expect(result.resources.suspicion).toBe(5);
    });
  });

  describe('WATCH_RUNWAY', () => {
    it('should award experience and focus', () => {
      const action: AircraftAction = {
        type: 'WATCH_RUNWAY',
        payload: {},
      };

      const result = aircraftReducer(initialState, action);

      expect(result.resources.experience).toBe(20);
      expect(result.resources.focus).toBe(100);
      expect(result.logs).toHaveLength(1);
    });
  });

  describe('Immutability', () => {
    it('should not mutate original state', () => {
      const action: AircraftAction = {
        type: 'SERVICE_LAVATORY',
        payload: {},
      };

      const originalSanity = initialState.resources.sanity;
      aircraftReducer(initialState, action);

      expect(initialState.resources.sanity).toBe(originalSanity);
    });
  });
});
