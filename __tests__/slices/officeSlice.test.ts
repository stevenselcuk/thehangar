import { ACTION_LOGS } from '@/data/flavor.ts';
import {
  officeReducer,
  type OfficeAction,
  type OfficeSliceState,
} from '@/state/slices/officeSlice.ts';
import seedrandom from 'seedrandom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('officeSlice', () => {
  let initialState: OfficeSliceState;

  beforeEach(() => {
    Math.random = seedrandom('test-office');

    initialState = {
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
        endingTriggered: null,
        foundPhoto: false,
        isHallucinating: false,
        isAfraid: false,
        storyFlags: { fdrDeconstructed: false },
        foundSnapon: false,
      },
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
        credits: 300,
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
        flightComputerMemory: 0,
        health: 100,
        contaminatedSkydrol: 0,
        primer: 0,
        ventilationUnit: 0,
        ppeMask: 0,
        nitrileGloves: 0,
        paracetamol: 0,
        ibuprofen: 0,
        naproxen: 0,
        ketamine: 0,
        firstAidKit: 0,
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
        wrench: false,
        technicianToolbox: false,
        snaponToolbox: false,
        canned_tuna: false,
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
        restCooldown: 0,
      },
      stats: {
        anomaliesAnalyzed: 0,
        rotablesScavenged: 0,
        ndtScansPerformed: 0,
        srfsFiled: 0,
        jobsCompleted: 0,
        rotablesRepaired: 0,
        eventsResolved: 0,
        accessViolations: 0,
      },
      proficiency: {
        unlocked: [],
        skillPoints: 0,
        unlockedBonuses: [],
        easaModulesPassed: [],
      },
      logs: [],
      mail: [],
      activeEvent: undefined,
    };
  });

  describe('TOGGLE_AUTO_SRF', () => {
    it('should toggle auto SRF flag', () => {
      const action: OfficeAction = {
        type: 'TOGGLE_AUTO_SRF',
        payload: {},
      };

      const result = officeReducer(initialState, action);

      expect(result.flags.autoSrfActive).toBe(true);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].text).toContain('auto-filer');

      const result2 = officeReducer(result, action);
      expect(result2.flags.autoSrfActive).toBe(false);
    });
  });

  describe('CHECK_INTERNAL_MAIL', () => {
    it('should log mail check', () => {
      const action: OfficeAction = {
        type: 'CHECK_INTERNAL_MAIL',
        payload: {},
      };

      const result = officeReducer(initialState, action);

      expect(result.logs).toHaveLength(1);
    });
  });

  describe('CROSS_REFERENCE_MANIFESTS', () => {
    it('should award experience and reduce sanity', () => {
      const action: OfficeAction = {
        type: 'CROSS_REFERENCE_MANIFESTS',
        payload: {},
      };

      const result = officeReducer(initialState, action);

      expect(result.resources.experience).toBe(1500);
      expect(result.resources.sanity).toBe(70);
      expect(result.resources.suspicion).toBe(20);
      expect(result.logs[0].type).toBe('vibration');
    });
  });

  describe('DIGITAL_STUDY', () => {
    it('should increase training progress', () => {
      const action: OfficeAction = {
        type: 'DIGITAL_STUDY',
        payload: {},
      };

      const result = officeReducer(initialState, action);

      expect(result.hfStats.trainingProgress).toBe(20);
      expect(result.resources.sanity).toBe(98);
    });

    it('should increase more with HDD upgrade', () => {
      const withHdd = {
        ...initialState,
        inventory: { ...initialState.inventory, pcHddUpgrade: true },
      };

      const action: OfficeAction = {
        type: 'DIGITAL_STUDY',
        payload: {},
      };

      const result = officeReducer(withHdd, action);

      expect(result.hfStats.trainingProgress).toBe(25);
    });
  });

  describe('CREATE_SRF', () => {
    it('should award credits and increase SRF count', () => {
      const action: OfficeAction = {
        type: 'CREATE_SRF',
        payload: {},
      };

      const result = officeReducer(initialState, action);

      expect(result.resources.credits).toBe(375);
      expect(result.resources.experience).toBe(150);
      expect(result.stats.srfsFiled).toBe(1);
    });
  });

  describe('SEARCH_MANUALS', () => {
    it('should find PC components', () => {
      Math.random = seedrandom('find-mainboard');

      const action: OfficeAction = {
        type: 'SEARCH_MANUALS',
        payload: {},
      };

      const result = officeReducer(initialState, action);

      if (result.inventory.mainboard || result.inventory.graphicCard || result.inventory.cdRom) {
        expect(result.logs[0].type).toBe('story');
      }
    });

    it('should sometimes find nothing', () => {
      Math.random = seedrandom('find-nothing');

      const action: OfficeAction = {
        type: 'SEARCH_MANUALS',
        payload: {},
      };

      const result = officeReducer(initialState, action);

      expect(result.logs).toHaveLength(2);
    });

    describe('KARDEX recovery gate', () => {
      it('summons KARDEX_RECOVERY on the rare roll inside the notes branch', () => {
        // First call is consumed by addLogToDraft's id generation for the
        // "Digging through the archive" entry logged before the roll.
        vi.spyOn(Math, 'random')
          .mockReturnValueOnce(0.9)
          .mockReturnValueOnce(0.3)
          .mockReturnValueOnce(0.01);
        const triggerEvent = vi.fn();
        initialState.resources.experience = 0;

        const result = officeReducer(initialState, {
          type: 'SEARCH_MANUALS',
          payload: { triggerEvent },
        } as OfficeAction);

        expect(triggerEvent).toHaveBeenCalledWith('eldritch_manifestation', 'KARDEX_RECOVERY');
        expect(result.resources.experience).toBe(0);

        vi.restoreAllMocks();
      });

      it('falls through to the normal notes outcome when the rare roll misses', () => {
        // First call is consumed by addLogToDraft's id generation for the
        // "Digging through the archive" entry logged before the roll.
        vi.spyOn(Math, 'random')
          .mockReturnValueOnce(0.9)
          .mockReturnValueOnce(0.3)
          .mockReturnValueOnce(0.5);
        const triggerEvent = vi.fn();
        initialState.resources.experience = 0;

        const result = officeReducer(initialState, {
          type: 'SEARCH_MANUALS',
          payload: { triggerEvent },
        } as OfficeAction);

        expect(triggerEvent).not.toHaveBeenCalled();
        expect(result.resources.experience).toBe(100);
        expect(result.logs.some((l) => l.text === ACTION_LOGS.SEARCH_MANUALS_NOTES)).toBe(true);

        vi.restoreAllMocks();
      });
    });
  });

  describe('DECRYPT_AMM', () => {
    it('requires an assembled PC', () => {
      initialState.inventory.pcAssembled = false;
      initialState.resources.experience = 0;

      const next = officeReducer(initialState, {
        type: 'DECRYPT_AMM',
        payload: {},
      } as OfficeAction);

      expect(next.resources.experience).toBe(0);
      expect(next.logs[0].type).toBe('error');
    });

    it('awards experience and sanity loss on success', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      initialState.inventory.pcAssembled = true;
      initialState.resources.experience = 0;
      initialState.resources.suspicion = 0;
      initialState.resources.sanity = 100;

      const next = officeReducer(initialState, {
        type: 'DECRYPT_AMM',
        payload: {},
      } as OfficeAction);

      expect(next.resources.experience).toBe(400);
      expect(next.resources.sanity).toBe(92);
      expect(next.resources.suspicion).toBe(10);
      expect(next.logs[0].text).toBe(ACTION_LOGS.DECRYPT_AMM_SUCCESS);

      vi.restoreAllMocks();
    });

    it('reduces focus on failure', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.9);
      initialState.inventory.pcAssembled = true;
      initialState.resources.experience = 0;
      initialState.resources.suspicion = 0;
      initialState.resources.focus = 100;

      const next = officeReducer(initialState, {
        type: 'DECRYPT_AMM',
        payload: {},
      } as OfficeAction);

      expect(next.resources.experience).toBe(0);
      expect(next.resources.focus).toBe(90);
      expect(next.resources.suspicion).toBe(10);
      expect(next.logs[0].text).toBe(ACTION_LOGS.DECRYPT_AMM_FAIL);

      vi.restoreAllMocks();
    });
  });

  describe('ASSEMBLE_PC', () => {
    it('should succeed with all components', () => {
      const withComponents = {
        ...initialState,
        inventory: {
          ...initialState.inventory,
          mainboard: true,
          graphicCard: true,
          cdRom: true,
          floppyDrive: true,
        },
      };

      const action: OfficeAction = {
        type: 'ASSEMBLE_PC',
        payload: { cost: 20 },
      };

      const result = officeReducer(withComponents, action);

      expect(result.inventory.pcAssembled).toBe(true);
      expect(result.resources.experience).toBe(500);
      expect(result.logs[0].text).toContain('Windows XP');
    });

    it('should fail without components and refund focus', () => {
      const action: OfficeAction = {
        type: 'ASSEMBLE_PC',
        payload: { cost: 20 },
      };

      const result = officeReducer(initialState, action);

      expect(result.inventory.pcAssembled).toBe(false);
      expect(result.resources.focus).toBe(120);
      expect(result.logs[0].text).toContain('FAILED');
    });
  });

  describe('UPGRADE_PC_GPU', () => {
    it('should purchase GPU upgrade', () => {
      const action: OfficeAction = {
        type: 'UPGRADE_PC_GPU',
        payload: {},
      };

      const result = officeReducer(initialState, action);

      expect(result.resources.credits).toBe(50);
      expect(result.inventory.pcGpuUpgrade).toBe(true);
    });

    it('should not purchase if insufficient credits', () => {
      const poorState = {
        ...initialState,
        resources: { ...initialState.resources, credits: 100 },
      };

      const action: OfficeAction = {
        type: 'UPGRADE_PC_GPU',
        payload: {},
      };

      const result = officeReducer(poorState, action);

      expect(result.inventory.pcGpuUpgrade).toBe(false);
      expect(result.resources.credits).toBe(100);
    });
  });

  describe('UPGRADE_PC_HDD', () => {
    it('should purchase HDD upgrade', () => {
      const action: OfficeAction = {
        type: 'UPGRADE_PC_HDD',
        payload: {},
      };

      const result = officeReducer(initialState, action);

      expect(result.resources.credits).toBe(150);
      expect(result.inventory.pcHddUpgrade).toBe(true);
    });
  });

  describe('NAP_TABLE', () => {
    it('should restore focus and sanity partially but increase suspicion', () => {
      const tired = {
        ...initialState,
        resources: { ...initialState.resources, focus: 30, sanity: 40 },
      };

      const action: OfficeAction = {
        type: 'NAP_TABLE',
        payload: {},
      };

      const result = officeReducer(tired, action);

      expect(result.resources.focus).toBe(70);
      expect(result.resources.sanity).toBe(65);
      expect(result.resources.suspicion).toBe(15);
    });

    it('restores partially rather than to full', () => {
      initialState.resources.focus = 20;
      initialState.resources.sanity = 30;
      initialState.hfStats.fatigue = 80;
      initialState.hfStats.restCooldown = 0;

      const next = officeReducer(initialState, {
        type: 'NAP_TABLE',
        payload: {},
      } as OfficeAction);

      expect(next.resources.focus).toBe(60);
      expect(next.resources.sanity).toBe(55);
      expect(next.hfStats.fatigue).toBe(40);
      expect(next.hfStats.restCooldown).toBeGreaterThan(0);
    });

    it('refuses while the cooldown is running', () => {
      initialState.resources.focus = 20;
      initialState.hfStats.restCooldown = 60000;

      const next = officeReducer(initialState, {
        type: 'NAP_TABLE',
        payload: {},
      } as OfficeAction);

      expect(next.resources.focus).toBe(20);
      expect(next.logs[0].type).toBe('warning');
    });

    it('clamps restores at 100', () => {
      initialState.resources.focus = 90;
      initialState.resources.sanity = 95;
      initialState.hfStats.fatigue = 10;
      initialState.hfStats.restCooldown = 0;

      const next = officeReducer(initialState, {
        type: 'NAP_TABLE',
        payload: {},
      } as OfficeAction);

      expect(next.resources.focus).toBe(100);
      expect(next.resources.sanity).toBe(100);
      expect(next.hfStats.fatigue).toBe(0);
    });
  });

  describe('READ_MAGAZINE', () => {
    it('should restore focus but reduce sanity', () => {
      const action: OfficeAction = {
        type: 'READ_MAGAZINE',
        payload: {},
      };

      const result = officeReducer(initialState, action);

      expect(result.resources.focus).toBe(100);
      expect(result.resources.sanity).toBe(90);
    });
  });

  describe('REVIEW_SURVEILLANCE_LOGS — Archivist branch', () => {
    it('summons the Archivist when suspicion is high and sanity is low', () => {
      const triggerEvent = vi.fn();
      initialState.resources.suspicion = 80;
      initialState.resources.sanity = 30;

      officeReducer(initialState, {
        type: 'REVIEW_SURVEILLANCE_LOGS',
        payload: { triggerEvent },
      } as OfficeAction);

      expect(triggerEvent).toHaveBeenCalledWith('canteen_incident', 'THE_ARCHIVIST');
    });

    it('uses the normal outcomes when the player is holding together', () => {
      const triggerEvent = vi.fn();
      initialState.resources.suspicion = 10;
      initialState.resources.sanity = 90;

      officeReducer(initialState, {
        type: 'REVIEW_SURVEILLANCE_LOGS',
        payload: { triggerEvent },
      } as OfficeAction);

      expect(triggerEvent).not.toHaveBeenCalledWith('canteen_incident', 'THE_ARCHIVIST');
    });

    it('does not summon the Archivist when suspicion is high but sanity is not low', () => {
      const triggerEvent = vi.fn();
      initialState.resources.suspicion = 80;
      initialState.resources.sanity = 90;

      officeReducer(initialState, {
        type: 'REVIEW_SURVEILLANCE_LOGS',
        payload: { triggerEvent },
      } as OfficeAction);

      expect(triggerEvent).not.toHaveBeenCalledWith('canteen_incident', 'THE_ARCHIVIST');
    });

    it('does not summon the Archivist when sanity is low but suspicion is not high', () => {
      const triggerEvent = vi.fn();
      initialState.resources.suspicion = 10;
      initialState.resources.sanity = 30;

      officeReducer(initialState, {
        type: 'REVIEW_SURVEILLANCE_LOGS',
        payload: { triggerEvent },
      } as OfficeAction);

      expect(triggerEvent).not.toHaveBeenCalledWith('canteen_incident', 'THE_ARCHIVIST');
    });
  });

  describe('Immutability', () => {
    it('should not mutate original state', () => {
      const action: OfficeAction = {
        type: 'CREATE_SRF',
        payload: {},
      };

      const originalCredits = initialState.resources.credits;
      officeReducer(initialState, action);

      expect(initialState.resources.credits).toBe(originalCredits);
    });
  });
});
