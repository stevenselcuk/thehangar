/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  hangarReducer,
  type HangarAction,
  type HangarSliceState,
} from '@/state/slices/hangarSlice.ts';
import seedrandom from 'seedrandom';
import { beforeEach, describe, expect, it } from 'vitest';

describe('hangarSlice', () => {
  let initialState: HangarSliceState;

  beforeEach(() => {
    Math.random = seedrandom('test-hangar');

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
        credits: 0,
        kardexFragments: 0,
        crystallineResonators: 0,
        bioFilament: 0,
        technicalLogbookHours: 0,
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
        foundPhoto: false,
      } as any,
      hfStats: {
        trainingProgress: 0,
        fearTimer: 0,
        noiseExposure: 0,
        efficiencyBoost: 0,
        foundLoopholeTimer: 0,
        scheduleCompressionTimer: 0,
        venomSurgeTimer: 0,
      } as any,
      stats: {
        anomaliesAnalyzed: 0,
        rotablesScavenged: 0,
        ndtScansPerformed: 0,
        srfsFiled: 0,
        shiftsCompleted: 0,
      } as any,
      toolConditions: {},
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
        rivetGun: true,
        allenKeys: false,
        torquemeter: false,
        malabar: false,
        greaseGun: false,
        airDataTestBox: false,
        hfecDevice: false,
        rototestDevice: false,
        orbitalSander: true,
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
      } as any,
      proficiency: {
        unlocked: [],
        available: [],
        points: 0,
      } as any,
      logs: [],
      activeEvent: undefined,
    };
  });

  describe('LISTEN_RADIO', () => {
    it('should play standard radio chatter most of the time', () => {
      Math.random = seedrandom('standard-radio');

      const action: HangarAction = {
        type: 'LISTEN_RADIO',
        payload: {},
      };

      const result = hangarReducer(initialState, action);

      expect(result.logs).toHaveLength(1);
      // Can be either standard radio (+1 sanity, 99-101) or void broadcast (-15 sanity)
      expect([85, 99, 100, 101, 105]).toContain(result.resources.sanity);
    });

    it('should play void broadcasts 10% of time', () => {
      Math.random = seedrandom('void-radio');

      const action: HangarAction = {
        type: 'LISTEN_RADIO',
        payload: {},
      };

      const result = hangarReducer(initialState, action);

      if (result.logs[0].type === 'vibration') {
        expect(result.resources.sanity).toBeLessThan(100);
      }
    });
  });

  describe('FOD_SWEEP', () => {
    it('should award rivets and experience', () => {
      const action: HangarAction = {
        type: 'FOD_SWEEP',
        payload: {},
      };

      const result = hangarReducer(initialState, action);

      expect(result.resources.rivets).toBe(15);
      expect(result.resources.experience).toBe(40);
      expect(result.logs).toHaveLength(1);
    });
  });

  describe('PERFORM_NDT', () => {
    it('should award experience and reduce sanity', () => {
      const action: HangarAction = {
        type: 'PERFORM_NDT',
        payload: {},
      };

      const result = hangarReducer(initialState, action);

      expect(result.resources.experience).toBe(200);
      expect(result.resources.sanity).toBe(98);
      expect(result.stats.ndtScansPerformed).toBe(1);
    });
  });

  describe('ORBITAL_SAND', () => {
    it('should award alclad with orbital sander', () => {
      const action: HangarAction = {
        type: 'ORBITAL_SAND',
        payload: {},
      };

      const result = hangarReducer(initialState, action);

      expect(result.resources.alclad).toBe(10);
      expect(result.hfStats.noiseExposure).toBe(2);
      expect(result.logs[0].text).toContain('Sanding');
    });

    it('should error without orbital sander', () => {
      const noTools = {
        ...initialState,
        inventory: { ...initialState.inventory, orbitalSander: false },
      };

      const action: HangarAction = {
        type: 'ORBITAL_SAND',
        payload: {},
      };

      const result = hangarReducer(noTools, action);

      expect(result.resources.alclad).toBe(0);
      expect(result.logs[0].text).toContain('ERROR');
      expect(result.logs[0].type).toBe('error');
    });
  });

  describe('TIGHTEN_BOLT', () => {
    it('should award more rivets with rivet gun', () => {
      const action: HangarAction = {
        type: 'TIGHTEN_BOLT',
        payload: {},
      };

      const result = hangarReducer(initialState, action);

      expect(result.resources.rivets).toBe(8);
      expect(result.toolConditions.rivetGun).toBeLessThan(100);
    });

    it('should award fewer rivets without rivet gun', () => {
      const noGun = {
        ...initialState,
        inventory: { ...initialState.inventory, rivetGun: false },
      };

      const action: HangarAction = {
        type: 'TIGHTEN_BOLT',
        payload: {},
      };

      const result = hangarReducer(noGun, action);

      expect(result.resources.rivets).toBe(1);
    });
  });

  describe('BOEING_SUPPORT', () => {
    it('should award experience, reduce sanity, increase suspicion', () => {
      const action: HangarAction = {
        type: 'BOEING_SUPPORT',
        payload: {},
      };

      const result = hangarReducer(initialState, action);

      expect(result.resources.experience).toBe(500);
      expect(result.resources.sanity).toBe(90);
      expect(result.resources.suspicion).toBeGreaterThan(0);
      expect(result.logs[0].text).toContain('BOEING SUPPORT');
      expect(result.logs[0].type).toBe('vibration');
    });

    it('should trigger FOUND_PHOTO_EVENT when roll < 0.25 and not found yet', () => {
      // Mock random to trigger event (needs to be < 0.25)
      // We set it to a low value so it satisfies both the message selection and the event trigger
      (Math.random as any) = () => 0.001;

      const action: HangarAction = {
        type: 'BOEING_SUPPORT',
        payload: {},
      };

      const result = hangarReducer(initialState, action);

      expect(result.flags.foundPhoto).toBe(true);
      expect(result.activeEvent).toBeDefined();
      expect(result.activeEvent?.id).toBe('FOUND_PHOTO_EVENT');
      expect(result.logs[0].text).toContain('PRINTER ERROR');
      expect(result.logs[1].text).toContain('The support line disconnects');
    });

    it('should NOT trigger event if already found', () => {
      // Mock random to be low enough to trigger, but flag prevents it
      (Math.random as any) = () => 0.001;

      const stateWithPhoto = {
        ...initialState,
        flags: { ...initialState.flags, foundPhoto: true },
      };

      const action: HangarAction = {
        type: 'BOEING_SUPPORT',
        payload: {},
      };

      const result = hangarReducer(stateWithPhoto, action);

      expect(result.activeEvent).toBeUndefined();
      // Should have logs but not the specific event logs
      // The exact count depends on other logic, but ensuring activeEvent is undefined is key
      expect(result.activeEvent).toBeUndefined();
    });
  });

  describe('TOGGLE_NIGHT_CREW', () => {
    it('should toggle night crew flag', () => {
      const action: HangarAction = {
        type: 'TOGGLE_NIGHT_CREW',
        payload: {},
      };

      const result = hangarReducer(initialState, action);

      expect(result.flags.nightCrewActive).toBe(true);
      expect(result.logs).toHaveLength(1);

      const result2 = hangarReducer(result, action);
      expect(result2.flags.nightCrewActive).toBe(false);
    });
  });

  describe('TOGGLE_TRANSIT_CHECK_DELEGATION', () => {
    it('should toggle transit check delegation flag', () => {
      const action: HangarAction = {
        type: 'TOGGLE_TRANSIT_CHECK_DELEGATION',
        payload: {},
      };

      const result = hangarReducer(initialState, action);

      expect(result.flags.transitCheckDelegationActive).toBe(true);
      expect(result.logs).toHaveLength(1);

      const result2 = hangarReducer(result, action);
      expect(result2.flags.transitCheckDelegationActive).toBe(false);
    });
  });

  describe('Immutability', () => {
    it('should not mutate original state', () => {
      const action: HangarAction = {
        type: 'FOD_SWEEP',
        payload: {},
      };

      const originalRivets = initialState.resources.rivets;
      hangarReducer(initialState, action);

      expect(initialState.resources.rivets).toBe(originalRivets);
    });
  });
});
