import type { GameState } from '@/types';
import {
  createInitialState,
  createJob,
  generateVendingPrices,
  loadState,
} from '@/state/initialState';
import { mockMathRandom } from '@/utils/testHelpers';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('initialState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('generateVendingPrices', () => {
    it('should generate prices for all vending items', () => {
      const prices = generateVendingPrices();

      expect(typeof prices).toBe('object');
      expect(Object.keys(prices).length).toBeGreaterThan(0);
    });

    it('should generate prices in range 5-30', () => {
      const restoreRandom = mockMathRandom('vending-test');

      const prices = generateVendingPrices();

      Object.values(prices).forEach((price) => {
        expect(price).toBeGreaterThanOrEqual(5);
        expect(price).toBeLessThanOrEqual(30);
        expect(Number.isInteger(price)).toBe(true);
      });

      restoreRandom();
    });

    it('should generate deterministic prices with seeded random', () => {
      const restore1 = mockMathRandom('vending-seed-1');
      const prices1 = generateVendingPrices();
      restore1();

      const restore2 = mockMathRandom('vending-seed-1');
      const prices2 = generateVendingPrices();
      restore2();

      expect(prices1).toEqual(prices2);
    });
  });

  describe('createJob', () => {
    it('should create a job with required properties', () => {
      const job = createJob();

      expect(job).toHaveProperty('id');
      expect(job).toHaveProperty('title');
      expect(job).toHaveProperty('description');
      expect(job).toHaveProperty('requirements');
      expect(job).toHaveProperty('rewardXP');
      expect(job).toHaveProperty('timeLeft');
      expect(job).toHaveProperty('totalTime');
    });

    it('should generate unique job IDs', () => {
      const job1 = createJob();
      const job2 = createJob();

      expect(job1.id).not.toBe(job2.id);
    });

    it('should set timeLeft equal to totalTime', () => {
      const job = createJob();

      expect(job.timeLeft).toBe(job.totalTime);
    });

    it('should generate time duration in range 120-360 seconds', () => {
      const restoreRandom = mockMathRandom('job-test');
      const job = createJob();

      expect(job.totalTime).toBeGreaterThanOrEqual(120000); // 120 seconds
      expect(job.totalTime).toBeLessThanOrEqual(360000); // 360 seconds

      restoreRandom();
    });

    it('should have positive rewardXP', () => {
      const job = createJob();

      expect(job.rewardXP).toBeGreaterThan(0);
    });
  });

  describe('createInitialState', () => {
    it('should create a valid initial game state', () => {
      const state = createInitialState();

      expect(state).toHaveProperty('resources');
      expect(state).toHaveProperty('inventory');
      expect(state).toHaveProperty('flags');
      expect(state).toHaveProperty('logs');
      expect(state).toHaveProperty('activeJob');
      expect(state).toHaveProperty('vendingPrices');
    });

    it('should start with correct initial resources', () => {
      const state = createInitialState();

      expect(state.resources.alclad).toBe(50);
      expect(state.resources.rivets).toBe(50);
      expect(state.resources.credits).toBe(100);
      expect(state.resources.sanity).toBe(100);
      expect(state.resources.suspicion).toBe(0);
      expect(state.resources.focus).toBe(100);
      expect(state.resources.experience).toBe(0);
      expect(state.resources.level).toBe(1);
    });

    it('should start with basic inventory items', () => {
      const state = createInitialState();

      expect(state.inventory.flashlight).toBe(true);
      expect(state.inventory.pencil).toBe(true);
      expect(state.inventory.notebook).toBe(true);
      expect(state.inventory.isToolboxWithPlayer).toBe(true);
      expect(state.inventory.hasAPLicense).toBe(false);
    });

    it('should start with hangar and tarmac unlocked', () => {
      const state = createInitialState();

      expect(state.flags.hangarUnlocked).toBe(true);
      expect(state.flags.tarmacUnlocked).toBe(true);
      expect(state.flags.officeUnlocked).toBe(false);
    });

    it('should initialize with an active job', () => {
      const state = createInitialState();

      expect(state.activeJob).not.toBeNull();
      expect(state.activeJob).toHaveProperty('id');
      expect(state.activeJob).toHaveProperty('title');
    });

    it('should have no active event initially', () => {
      const state = createInitialState();

      expect(state.activeEvent).toBeNull();
      expect(state.activeHazards).toEqual([]);
      expect(state.activeScenario).toBeNull();
    });

    it('should initialize tool conditions', () => {
      const state = createInitialState();

      expect(state.toolConditions.leatherman).toBe(100);
      expect(state.toolConditions.rivetGun).toBe(100);
      expect(Object.keys(state.toolConditions).length).toBeGreaterThan(0);
    });

    it('should have initial log message', () => {
      const state = createInitialState();

      expect(state.logs).toHaveLength(1);
      expect(state.logs[0].type).toBe('info');
    });

    it('should initialize archive terminal with welcome message', () => {
      const state = createInitialState();

      expect(state.archiveTerminal.output.length).toBeGreaterThan(0);
      expect(state.archiveTerminal.output.some((line) => line.includes('ARCHIVAL SYSTEM'))).toBe(
        true
      );
    });

    it('should initialize maintenance terminal with welcome message', () => {
      const state = createInitialState();

      expect(state.maintenanceTerminal.output.length).toBeGreaterThan(0);
      expect(state.maintenanceTerminal.output.some((line) => line.includes('MAINTENANCE'))).toBe(
        true
      );
    });

    it('should initialize proficiency state', () => {
      const state = createInitialState();

      expect(state.proficiency.skillPoints).toBe(0);
      expect(state.proficiency.unlocked).toEqual([]);
      expect(state.proficiency.easaModulesPassed).toEqual([]);
    });

    it('should initialize stats at zero', () => {
      const state = createInitialState();

      expect(state.stats.jobsCompleted).toBe(0);
      expect(state.stats.srfsFiled).toBe(0);
      expect(state.stats.eventsResolved).toBe(0);
    });

    it('should set lastUpdate to current time', () => {
      const before = Date.now();
      const state = createInitialState();
      const after = Date.now();

      expect(state.lastUpdate).toBeGreaterThanOrEqual(before);
      expect(state.lastUpdate).toBeLessThanOrEqual(after);
    });
  });

  describe('loadState', () => {
    const SAVE_KEY = 'test-save-key';

    it('should return initial state when no saved data exists', () => {
      const state = loadState(SAVE_KEY);

      expect(state).toHaveProperty('resources');
      expect(state).toHaveProperty('inventory');
      expect(state.resources.sanity).toBe(100);
    });

    it('should load saved state from localStorage', () => {
      const savedState: Partial<GameState> = {
        resources: {
          alclad: 200,
          titanium: 100,
          fiberglass: 0,
          rivets: 300,
          hiloks: 0,
          collars: 0,
          grommets: 0,
          steelWire: 0,
          skydrol: 0,
          mek: 0,
          grease: 0,
          sealant: 0,
          sanity: 75,
          suspicion: 40,
          focus: 60,
          experience: 1000,
          level: 5,
          credits: 500,
          kardexFragments: 2,
          crystallineResonators: 0,
          bioFilament: 0,
          technicalLogbookHours: 100,
        },
        inventory: {
          flashlight: true,
          pencil: true,
          ruler: true,
          inspectionMirror: false,
          notebook: true,
          leatherman: true,
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
          orbitalSander: false,
          irLamp: false,
          sonicCleaner: false,
          hasAPLicense: true,
          apWrittenPassed: true,
          apPracticalPassed: false,
          hasAvionicsCert: false,
          isToolboxWithPlayer: true,
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
          foundNote: false,
          lightsFlickered: false,
          officeUnlocked: true,
          hangarUnlocked: true,
          tarmacUnlocked: true,
          foundManifest: false,
          revealedTruth: false,
          kardexActive: false,
          suitsVisiting: false,
          underSurveillance: false,
          nightCrewActive: false,
          isHallucinating: false,
          isAfraid: false,
          toolroomMasterPissed: false,
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
          onPerformanceImprovementPlan: false,
          janitorPresent: false,
          ndtFinding: null,
          sls3Unlocked: false,
          storyFlags: {},
        },
      };

      localStorage.setItem(SAVE_KEY, JSON.stringify(savedState));

      const loaded = loadState(SAVE_KEY);

      expect(loaded.resources.alclad).toBe(200);
      expect(loaded.resources.level).toBe(5);
      expect(loaded.inventory.hasAPLicense).toBe(true);
      expect(loaded.flags.officeUnlocked).toBe(true);
    });

    it('should reset transient flags on load', () => {
      const savedState = {
        ...createInitialState(),
        flags: {
          ...createInitialState().flags,
          migraineActive: true,
          isHallucinating: true,
          isAfraid: true,
          janitorPresent: true,
          ndtFinding: { type: 'HFEC', description: 'Test', severity: 'minor' },
        },
      };

      localStorage.setItem(SAVE_KEY, JSON.stringify(savedState));

      const loaded = loadState(SAVE_KEY);

      // Transient effects should be reset
      expect(loaded.flags.migraineActive).toBe(false);
      expect(loaded.flags.isHallucinating).toBe(false);
      expect(loaded.flags.isAfraid).toBe(false);
      expect(loaded.flags.janitorPresent).toBe(false);
      expect(loaded.flags.ndtFinding).toBeNull();
    });

    it('should reset transient timers on load', () => {
      const savedState = {
        ...createInitialState(),
        hfStats: {
          ...createInitialState().hfStats,
          fearTimer: 300,
          migraineTimer: 200,
          compliancePressureTimer: 150,
          performanceReviewCooldown: 100,
          janitorCooldown: 50,
        },
      };

      localStorage.setItem(SAVE_KEY, JSON.stringify(savedState));

      const loaded = loadState(SAVE_KEY);

      expect(loaded.hfStats.fearTimer).toBe(0);
      expect(loaded.hfStats.migraineTimer).toBe(0);
      expect(loaded.hfStats.compliancePressureTimer).toBe(0);
      expect(loaded.hfStats.performanceReviewCooldown).toBe(0);
      expect(loaded.hfStats.janitorCooldown).toBe(0);
    });

    it('should clear active events and hazards on load', () => {
      const savedState = {
        ...createInitialState(),
        activeEvent: { id: 'test-event', type: 'accident' },
        activeHazards: [{ id: 'test-hazard' }],
        activeScenario: { id: 'test-scenario' },
      };

      localStorage.setItem(SAVE_KEY, JSON.stringify(savedState));

      const loaded = loadState(SAVE_KEY);

      expect(loaded.activeEvent).toBeNull();
      expect(loaded.activeHazards).toEqual([]);
      expect(loaded.activeScenario).toBeNull();
    });

    it('should handle corrupted JSON gracefully', () => {
      localStorage.setItem(SAVE_KEY, 'invalid json {{{');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const loaded = loadState(SAVE_KEY);

      expect(loaded).toHaveProperty('resources');
      expect(loaded.resources.sanity).toBe(100);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle null saved state', () => {
      localStorage.setItem(SAVE_KEY, 'null');

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const loaded = loadState(SAVE_KEY);

      expect(loaded).toHaveProperty('resources');
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should handle missing required properties', () => {
      const invalidState = { someRandomKey: 'value' };
      localStorage.setItem(SAVE_KEY, JSON.stringify(invalidState));

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const loaded = loadState(SAVE_KEY);

      expect(loaded).toHaveProperty('resources');
      expect(loaded).toHaveProperty('inventory');
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should merge defaults with saved state', () => {
      const defaults = createInitialState();
      const partialState = {
        resources: {
          ...defaults.resources,
          alclad: 999,
        },
        inventory: {
          ...defaults.inventory,
          flashlight: false,
        },
        flags: defaults.flags,
      };

      localStorage.setItem(SAVE_KEY, JSON.stringify(partialState));

      const loaded = loadState(SAVE_KEY);

      // Saved values should be present
      expect(loaded.resources.alclad).toBe(999);
      // Default values should fill in missing properties
      expect(loaded.resources.sanity).toBeDefined();
      expect(loaded.inventory.pencil).toBeDefined();
    });

    it('should preserve proficiency data', () => {
      const savedState = {
        ...createInitialState(),
        proficiency: {
          skillPoints: 10,
          unlocked: ['skill1', 'skill2'],
          unlockedBonuses: ['bonus1'],
          easaModulesPassed: [1, 2, 3],
        },
      };

      localStorage.setItem(SAVE_KEY, JSON.stringify(savedState));

      const loaded = loadState(SAVE_KEY);

      expect(loaded.proficiency.skillPoints).toBe(10);
      expect(loaded.proficiency.unlocked).toEqual(['skill1', 'skill2']);
      expect(loaded.proficiency.easaModulesPassed).toEqual([1, 2, 3]);
    });

    it('should update lastUpdate to current time', () => {
      const savedState = {
        ...createInitialState(),
        lastUpdate: 1000000,
      };

      localStorage.setItem(SAVE_KEY, JSON.stringify(savedState));

      const before = Date.now();
      const loaded = loadState(SAVE_KEY);
      const after = Date.now();

      expect(loaded.lastUpdate).toBeGreaterThanOrEqual(before);
      expect(loaded.lastUpdate).toBeLessThanOrEqual(after);
      expect(loaded.lastUpdate).not.toBe(1000000);
    });
  });
});
