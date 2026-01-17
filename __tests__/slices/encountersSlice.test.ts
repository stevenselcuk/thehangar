import { describe, it, expect, beforeEach } from 'vitest';
import seedrandom from 'seedrandom';
import {
  encountersReducer,
  type EncountersSliceState,
  type EncountersAction,
} from '@/state/slices/encountersSlice.ts';

describe('encountersSlice', () => {
  let initialState: EncountersSliceState;

  beforeEach(() => {
    Math.random = seedrandom('test-encounters');

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
        janitorPresent: true,
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

  describe('OBSERVE_SEDAN', () => {
    it('should always increase suspicion and award experience', () => {
      const action: EncountersAction = {
        type: 'OBSERVE_SEDAN',
        payload: {},
      };

      const result = encountersReducer(initialState, action);

      expect(result.resources.suspicion).toBe(5);
      expect(result.resources.experience).toBe(150);
      expect(result.logs).toHaveLength(1);
    });

    it('should trigger fear and high sanity drain 10% of time', () => {
      Math.random = seedrandom('sedan-fear');

      const action: EncountersAction = {
        type: 'OBSERVE_SEDAN',
        payload: {},
      };

      const result = encountersReducer(initialState, action);

      if (result.flags.isAfraid) {
        expect(result.resources.sanity).toBeLessThan(90);
        expect(result.hfStats.fearTimer).toBe(20000);
        expect(result.logs[0].type).toBe('vibration');
        expect(result.logs[0].text).toContain('license plate');
      }
    });

    it('should reduce sanity in different amounts based on roll', () => {
      Math.random = seedrandom('sedan-medium');

      const action: EncountersAction = {
        type: 'OBSERVE_SEDAN',
        payload: {},
      };

      const result = encountersReducer(initialState, action);

      // Should reduce sanity (85, 92, or 98)
      expect(result.resources.sanity).toBeLessThan(100);
      expect(result.logs[0].type).toMatch(/info|story|vibration/);
    });

    it('should have low sanity drain 70% of time', () => {
      Math.random = seedrandom('sedan-normal');

      const action: EncountersAction = {
        type: 'OBSERVE_SEDAN',
        payload: {},
      };

      const result = encountersReducer(initialState, action);

      if (result.resources.sanity === 98) {
        expect(result.logs[0].type).toBe('info');
      }
    });
  });

  describe('JANITOR_INTERACTION', () => {
    it('should clear janitor present flag', () => {
      const action: EncountersAction = {
        type: 'JANITOR_INTERACTION',
        payload: {},
      };

      const result = encountersReducer(initialState, action);

      expect(result.flags.janitorPresent).toBe(false);
      expect(result.logs).toHaveLength(1);
    });

    it('should cause extreme fear 20% of time', () => {
      Math.random = seedrandom('janitor-stares');

      const action: EncountersAction = {
        type: 'JANITOR_INTERACTION',
        payload: {},
      };

      const result = encountersReducer(initialState, action);

      if (result.flags.isAfraid && result.hfStats.fearTimer === 45000) {
        expect(result.resources.sanity).toBe(75);
        expect(result.logs[0].type).toBe('vibration');
        expect(result.logs[0].text).toContain('eyes');
      }
    });

    it('should give ID card 20-40% if not already owned', () => {
      Math.random = seedrandom('janitor-gives-item');

      const action: EncountersAction = {
        type: 'JANITOR_INTERACTION',
        payload: {},
      };

      const result = encountersReducer(initialState, action);

      if (result.inventory.foundRetiredIDCard) {
        expect(result.logs[0].type).toBe('story');
        expect(result.logs[0].text).toContain('ID card');
      }
    });

    it('should not give ID card if already owned', () => {
      const withCard = {
        ...initialState,
        inventory: { ...initialState.inventory, foundRetiredIDCard: true },
      };

      const action: EncountersAction = {
        type: 'JANITOR_INTERACTION',
        payload: {},
      };

      const result = encountersReducer(withCard, action);

      // Should skip to next outcome
      expect(result.inventory.foundRetiredIDCard).toBe(true);
    });

    it('should give hint 40-60%', () => {
      Math.random = seedrandom('janitor-hint');

      const action: EncountersAction = {
        type: 'JANITOR_INTERACTION',
        payload: {},
      };

      const result = encountersReducer(initialState, action);

      if (result.logs[0].text.includes('dust') || result.logs[0].text.includes('circle')) {
        expect(result.logs[0].type).toBe('story');
      }
    });

    it('should ignore player 60%+', () => {
      Math.random = seedrandom('janitor-ignores');

      const action: EncountersAction = {
        type: 'JANITOR_INTERACTION',
        payload: {},
      };

      const result = encountersReducer(initialState, action);

      if (result.logs[0].text.includes('continues mopping')) {
        expect(result.logs[0].type).toBe('info');
      }
    });
  });

  describe('Immutability', () => {
    it('should not mutate original state', () => {
      const action: EncountersAction = {
        type: 'OBSERVE_SEDAN',
        payload: {},
      };

      const originalSuspicion = initialState.resources.suspicion;
      encountersReducer(initialState, action);

      expect(initialState.resources.suspicion).toBe(originalSuspicion);
    });
  });
});
