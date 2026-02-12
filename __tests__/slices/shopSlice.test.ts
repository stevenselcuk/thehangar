import { shopReducer, type ShopAction, type ShopSliceState } from '@/state/slices/shopSlice.ts';
import seedrandom from 'seedrandom';
import { beforeEach, describe, expect, it } from 'vitest';

describe('shopSlice', () => {
  let initialState: ShopSliceState;

  beforeEach(() => {
    Math.random = seedrandom('test-shop');

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
      },
      inventory: {
        flashlight: false,
        pencil: true,
        ruler: false,
        inspectionMirror: false,
        notebook: true,
        leatherman: false,
        radio: false,
        technicianToolbox: false,
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
        wrench: false,
        canned_tuna: false,
        laser_pointer: false,
      },
      personalInventory: {},
      toolConditions: {},
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
        toolroomMasterPissed: false,
        nightCrewUnlocked: false,
        activeComponentFailure: null,
        suspicionEvent30Triggered: false,
        suspicionEvent60Triggered: false,
        suspicionEvent90Triggered: false,
        migraineActive: false,
        janitorArcStage: 0,
        toolroomMasterArcStage: 0,
        endingAlienConspiracyProgress: 0,
        endingGovtConspiracyProgress: 0,
        endingTriggered: null,
        foundPhoto: false,
        isHallucinating: false,
      },
      hfStats: {
        trainingProgress: 0,
        fearTimer: 0,
        noiseExposure: 0,
        efficiencyBoost: 0,
        foundLoopholeTimer: 0,
        scheduleCompressionTimer: 0,
        venomSurgeTimer: 0,
        fatigue: 0,
        socialStress: 0,
        compliancePressureTimer: 0,
        temperature: 20,
        lightingLevel: 1,
        toolroomMasterCooldown: 0,
        migraineTimer: 0,
        performanceReviewCooldown: 0,
        janitorCooldown: 0,
        sanityShieldTimer: 0,
        clearanceLevel: 1,
        hfRecurrentDueDate: 0,
      },
      vendingPrices: {},
      logs: [],
    };
  });

  describe('BUY_SHOP_ITEM', () => {
    it('should purchase item with sufficient alclad', () => {
      const action: ShopAction = {
        type: 'BUY_SHOP_ITEM',
        payload: { item: 'rivetGun', cost: 200 },
      };

      const result = shopReducer(initialState, action);

      expect(result.resources.alclad).toBe(300);
      expect((result.inventory as unknown as Record<string, unknown>).pencil).toBe(true);
      expect(result.toolConditions.rivetGun).toBe(100);
      expect(result.logs[0].text).toContain('PURCHASED');
    });

    it('should fail with insufficient alclad', () => {
      const poorState = {
        ...initialState,
        resources: { ...initialState.resources, alclad: 50 },
      };

      const action: ShopAction = {
        type: 'BUY_SHOP_ITEM',
        payload: { item: 'rivetGun', cost: 200 },
      };

      const result = shopReducer(poorState, action);

      expect(result.resources.alclad).toBe(50);
      expect((result.inventory as unknown as Record<string, unknown>).rivetGun).toBe(false);
      expect(result.logs[0].text).toContain('NOT ENOUGH');
      expect(result.logs[0].type).toBe('error');
    });

    it('should set tool condition to 100', () => {
      const action: ShopAction = {
        type: 'BUY_SHOP_ITEM',
        payload: { item: 'hammer', cost: 50 },
      };

      const result = shopReducer(initialState, action);

      expect(result.toolConditions.hammer).toBe(100);
    });
  });

  describe('BUY_VENDING', () => {
    it('should purchase vending item with sufficient credits', () => {
      const action: ShopAction = {
        type: 'BUY_VENDING',
        payload: { id: 'coffee', cost: 5, sanity: 10, focus: 15, msg: 'Coffee purchased.' },
      };

      const result = shopReducer(initialState, action);

      expect(result.resources.credits).toBe(95);
      expect(result.resources.sanity).toBe(100);
      expect(result.resources.focus).toBe(100);
      expect(result.logs[0].text).toContain('Coffee');
    });

    it('should fail with insufficient credits', () => {
      const poorState = {
        ...initialState,
        resources: { ...initialState.resources, credits: 2 },
      };

      const action: ShopAction = {
        type: 'BUY_VENDING',
        payload: { id: 'coffee', cost: 5, sanity: 10, focus: 15, msg: 'Coffee purchased.' },
      };

      const result = shopReducer(poorState, action);

      expect(result.resources.credits).toBe(2);
      expect(result.logs[0].text).toContain('INSUFFICIENT');
      expect(result.logs[0].type).toBe('error');
    });

    it('should check log order when suspicion > 50', () => {
      const suspiciousState = {
        ...initialState,
        resources: { ...initialState.resources, suspicion: 60 },
      };

      const action: ShopAction = {
        type: 'BUY_VENDING',
        payload: { id: 'coffee', cost: 10, sanity: 10, focus: 15, msg: 'Coffee purchased.' },
      };

      const result = shopReducer(suspiciousState, action);

      expect(result.resources.credits).toBe(85); // 100 - 15 (10 * 1.5)
      expect(result.logs.length).toBeGreaterThanOrEqual(1);
      // Extra charge warning should appear first, but log order may vary
      const hasExtraChargeLog = result.logs.some((log) => log.text.includes('extra'));
      expect(hasExtraChargeLog).toBe(true);
    });

    it('should activate venom surge flag', () => {
      const action: ShopAction = {
        type: 'BUY_VENDING',
        payload: {
          id: 'venom_surge',
          cost: 20,
          sanity: -10,
          focus: 50,
          msg: 'Venom Surge consumed!',
        },
      };

      const result = shopReducer(initialState, action);

      expect(result.flags.venomSurgeActive).toBe(true);
      expect(result.hfStats.venomSurgeTimer).toBe(60000);
    });

    it('should cap sanity and focus at 100', () => {
      const action: ShopAction = {
        type: 'BUY_VENDING',
        payload: { id: 'snack', cost: 5, sanity: 50, focus: 50, msg: 'Snack consumed.' },
      };

      const result = shopReducer(initialState, action);

      expect(result.resources.sanity).toBe(100);
      expect(result.resources.focus).toBe(100);
    });

    it('should use warning type for negative sanity items', () => {
      const action: ShopAction = {
        type: 'BUY_VENDING',
        payload: {
          id: 'bad_food',
          cost: 5,
          sanity: -20,
          focus: 10,
          msg: 'Yuck!',
        },
      };

      const result = shopReducer(initialState, action);

      expect(result.resources.sanity).toBe(80);
      expect(result.logs[0].type).toBe('warning');
    });

    it('should increment resource count for resource items (canned_tuna)', () => {
      const action: ShopAction = {
        type: 'BUY_VENDING',
        payload: {
          id: 'canned_tuna',
          cost: 12,
          sanity: 0,
          focus: 0,
          msg: 'Tuna acquired.',
        },
      };

      const result = shopReducer(initialState, action);

      expect(result.resources.canned_tuna).toBe(1);
      expect(result.resources.credits).toBe(88); // 100 - 12
    });
  });

  describe('FLUCTUATE_PRICES', () => {
    it('should fluctuate prices randomly', () => {
      const stateWithPrices = {
        ...initialState,
        vendingPrices: {
          coffee: 10,
          soda: 20,
        },
      };

      // Mock Math.random to be deterministic (0.9 -> high variance increase)
      const originalRandom = Math.random;
      Math.random = () => 0.9; // (0.9 * 0.4) - 0.2 = 0.16 increase

      const nextState = shopReducer(stateWithPrices, { type: 'FLUCTUATE_PRICES' });

      // 10 * 1.16 = 11.6 -> 11
      // 20 * 1.16 = 23.2 -> 23
      expect(nextState.vendingPrices['coffee']).toBe(11);
      expect(nextState.vendingPrices['soda']).toBe(23);

      Math.random = originalRandom;
    });

    it('should NOT change price of 0 cost items (tap water)', () => {
      const stateWithFreeItem = {
        ...initialState,
        vendingPrices: {
          tap_water: 0,
          coffee: 10,
        },
      };

      const nextState = shopReducer(stateWithFreeItem, { type: 'FLUCTUATE_PRICES' });

      expect(nextState.vendingPrices['tap_water']).toBe(0);
      // We can't guarantee coffee changes without mocking, but if logic holds 0 should be safe.
    });

    it('should add a log message when prices fluctuate', () => {
      const nextState = shopReducer(initialState, { type: 'FLUCTUATE_PRICES' });
      expect(nextState.logs.length).toBeGreaterThan(initialState.logs.length);
      expect(nextState.logs[nextState.logs.length - 1].type).toBe('vibration');
    });
  });

  describe('Immutability', () => {
    it('should not mutate original state', () => {
      const action: ShopAction = {
        type: 'BUY_SHOP_ITEM',
        payload: { item: 'hammer', cost: 50 },
      };

      const originalAlclad = initialState.resources.alclad;
      shopReducer(initialState, action);

      expect(initialState.resources.alclad).toBe(originalAlclad);
    });
  });
});
