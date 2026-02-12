import { ACTION_LOGS } from '@/data/flavor.ts';
import { trainingData } from '@/data/training.ts';
import {
  getNextEasaModule,
  hasSkillUnlocked,
  proficiencyReducer,
  rollEasaExamPass,
  type ProficiencySliceState,
} from '@/state/slices/proficiencySlice.ts';
import { createMinimalGameState, mockMathRandom } from '@/utils/testHelpers.ts';
import { describe, expect, it } from 'vitest';

// Helper to create a minimal proficiency state
const createProficiencyState = (
  overrides: Partial<ProficiencySliceState> = {}
): ProficiencySliceState => {
  const fullState = createMinimalGameState();
  return {
    proficiency: fullState.proficiency,
    resources: {
      credits: fullState.resources.credits,
      experience: fullState.resources.experience,
      level: fullState.resources.level,
    },
    inventory: fullState.inventory,
    hfStats: {
      hfRecurrentDueDate: fullState.hfStats.hfRecurrentDueDate,
    },
    logs: fullState.logs,
    ...overrides,
  };
};

describe('proficiencySlice', () => {
  describe('TAKE_MANDATORY_COURSE', () => {
    it('should complete a mandatory course and update inventory', () => {
      const state = createProficiencyState({
        resources: { credits: 500, experience: 0, level: 1 },
      });

      const result = proficiencyReducer(state, {
        type: 'TAKE_MANDATORY_COURSE',
        payload: {
          id: 'hfInitial',
        },
      });

      expect(result.resources.credits).toBe(300);
      expect(result.resources.experience).toBe(500);
      expect(result.inventory.hasHfInitial).toBe(true);
      expect(result.logs[0].text).toContain('TRAINING COMPLETE: Human Factors (Initial)');
      expect(result.logs[0].type).toBe('story');
    });

    it('should set hfRecurrentDueDate for HF Initial course', () => {
      const state = createProficiencyState({
        resources: { credits: 500, experience: 0, level: 1 },
      });

      const result = proficiencyReducer(state, {
        type: 'TAKE_MANDATORY_COURSE',
        payload: {
          id: 'hfInitial',
        },
      });

      expect(result.hfStats.hfRecurrentDueDate).toBeGreaterThan(Date.now());
    });

    it('should set hfRecurrentDueDate for HF Recurrent course', () => {
      const state = createProficiencyState({
        resources: { credits: 500, experience: 0, level: 1 },
        inventory: { ...createMinimalGameState().inventory, hasHfInitial: true },
      });

      const result = proficiencyReducer(state, {
        type: 'TAKE_MANDATORY_COURSE',
        payload: {
          id: 'hfRecurrent',
        },
      });

      expect(result.hfStats.hfRecurrentDueDate).toBeGreaterThan(Date.now());
      expect(result.inventory.hasHfRecurrent).toBe(true);
    });

    it('should not set hfRecurrentDueDate for non-HF courses', () => {
      const state = createProficiencyState({
        resources: { credits: 500, experience: 0, level: 1 },
        hfStats: { hfRecurrentDueDate: 0 },
      });

      const result = proficiencyReducer(state, {
        type: 'TAKE_MANDATORY_COURSE',
        payload: {
          id: 'fts',
        },
      });

      expect(result.hfStats.hfRecurrentDueDate).toBe(0);
      expect(result.inventory.hasFts).toBe(true);
    });
  });

  describe('TAKE_AP_EXAM', () => {
    it('should pass the A&P Written exam', () => {
      const state = createProficiencyState({
        resources: { credits: 500, experience: 0, level: 1 },
      });

      const result = proficiencyReducer(state, {
        type: 'TAKE_AP_EXAM',
        payload: {
          id: 'apWritten',
        },
      });

      expect(result.resources.credits).toBe(250);
      expect(result.resources.experience).toBe(1000);
      expect(result.inventory.apWrittenPassed).toBe(true);
      expect(result.logs[0].text).toContain('FAA EXAM PASSED');
      expect(result.logs[0].type).toBe('levelup');
    });

    it('should pass the A&P Practical exam', () => {
      const state = createProficiencyState({
        resources: { credits: 1000, experience: 0, level: 1 },
        inventory: { ...createMinimalGameState().inventory, apWrittenPassed: true },
      });

      const result = proficiencyReducer(state, {
        type: 'TAKE_AP_EXAM',
        payload: {
          id: 'apPractical',
        },
      });

      expect(result.resources.credits).toBe(500);
      expect(result.resources.experience).toBe(2500);
      expect(result.inventory.apPracticalPassed).toBe(true);
      expect(result.logs[0].text).toContain('inspector signs off');
    });

    it('should grant A&P License', () => {
      const state = createProficiencyState({
        inventory: { ...createMinimalGameState().inventory, apPracticalPassed: true },
      });

      const result = proficiencyReducer(state, {
        type: 'TAKE_AP_EXAM',
        payload: {
          id: 'hasAPLicense',
        },
      });

      expect(result.inventory.hasAPLicense).toBe(true);
      expect(result.logs[0].text).toBe(ACTION_LOGS.EXAM_PASS);
      expect(result.logs[0].type).toBe('levelup');
    });
  });

  describe('TAKE_AVIONICS_EXAM', () => {
    it('should pass the Avionics exam and deduct correct costs', () => {
      const state = createProficiencyState({
        resources: { credits: 1000, experience: 0, level: 1 },
        inventory: { ...createMinimalGameState().inventory, hasAPLicense: true },
      });

      const result = proficiencyReducer(state, {
        type: 'TAKE_AVIONICS_EXAM',
        payload: {},
      });

      expect(result.resources.credits).toBe(1000 - trainingData.faaLicense.avionics.costCredits);
      expect(result.resources.experience).toBe(trainingData.faaLicense.avionics.rewardXp);
      expect(result.inventory.hasAvionicsCert).toBe(true);
      expect(result.logs[0].text).toContain('AVIONICS CERTIFIED');
    });
  });

  describe('TAKE_EASA_EXAM', () => {
    it('should pass an EASA module and add it to easaModulesPassed', () => {
      // Random > 0.3 means pass (70% rate)
      const restoreRandom = mockMathRandom('easa-pass-seed-1');
      const state = createProficiencyState({
        resources: { credits: 500, experience: 0, level: 1 },
        proficiency: {
          skillPoints: 0,
          unlocked: [],
          unlockedBonuses: [],
          easaModulesPassed: [],
        },
      });

      const result = proficiencyReducer(state, {
        type: 'TAKE_EASA_EXAM',
        payload: {},
      });

      expect(result.resources.credits).toBe(500 - trainingData.easaLicense.examCost.costCredits);
      // With seeded random, it should pass
      if (result.proficiency.easaModulesPassed.length > 0) {
        expect(result.proficiency.easaModulesPassed[0]).toBe(1); // First module ID
        expect(result.resources.experience).toBe(trainingData.easaLicense.examCost.rewardXp);
        expect(result.logs[0].text).toContain('EASA MODULE PASSED');
        expect(result.logs[0].type).toBe('story');
      }

      restoreRandom();
    });

    it('should fail an EASA module and not add it to easaModulesPassed', () => {
      // Need to ensure Math.random() returns <= 0.3 for fail
      const originalRandom = Math.random;
      Math.random = () => 0.2; // This should fail (0.2 <= 0.3)

      const state = createProficiencyState({
        resources: { credits: 500, experience: 0, level: 1 },
        proficiency: {
          skillPoints: 0,
          unlocked: [],
          unlockedBonuses: [],
          easaModulesPassed: [],
        },
      });

      const result = proficiencyReducer(state, {
        type: 'TAKE_EASA_EXAM',
        payload: {},
      });

      expect(result.resources.credits).toBe(500 - trainingData.easaLicense.examCost.costCredits);
      expect(result.proficiency.easaModulesPassed).toHaveLength(0);
      expect(result.resources.experience).toBe(0); // No XP on failure
      expect(result.logs[0].text).toContain('EASA MODULE FAILED');
      expect(result.logs[0].type).toBe('warning');

      Math.random = originalRandom;
    });

    it('should progress through multiple EASA modules sequentially', () => {
      // Force all to pass
      const originalRandom = Math.random;
      Math.random = () => 0.5; // > 0.3, so all should pass

      let state = createProficiencyState({
        resources: { credits: 2000, experience: 0, level: 1 },
        proficiency: {
          skillPoints: 0,
          unlocked: [],
          unlockedBonuses: [],
          easaModulesPassed: [],
        },
      });

      // Take module 1
      state = proficiencyReducer(state, { type: 'TAKE_EASA_EXAM', payload: {} });
      expect(state.proficiency.easaModulesPassed).toEqual([1]);

      // Take module 2
      state = proficiencyReducer(state, { type: 'TAKE_EASA_EXAM', payload: {} });
      expect(state.proficiency.easaModulesPassed).toEqual([1, 2]);

      // Take module 3
      state = proficiencyReducer(state, { type: 'TAKE_EASA_EXAM', payload: {} });
      expect(state.proficiency.easaModulesPassed).toEqual([1, 2, 3]);

      Math.random = originalRandom;
    });
  });

  describe('CERTIFY_EASA_LICENSE', () => {
    it('should grant EASA B1.1 license', () => {
      const state = createProficiencyState({
        proficiency: {
          skillPoints: 0,
          unlocked: [],
          unlockedBonuses: [],
          easaModulesPassed: Array.from({ length: 17 }, (_, i) => i + 1), // All 17 modules
        },
      });

      const result = proficiencyReducer(state, {
        type: 'CERTIFY_EASA_LICENSE',
        payload: {},
      });

      expect(result.inventory.hasEasaB1_1).toBe(true);
      expect(result.logs[0].text).toContain('EASA B1.1 LICENSE GRANTED');
      expect(result.logs[0].type).toBe('levelup');
    });
  });

  describe('TAKE_NDT_EXAM', () => {
    it('should pass NDT Level I exam', () => {
      const state = createProficiencyState({
        resources: { credits: 1000, experience: 0, level: 1 },
      });

      const result = proficiencyReducer(state, {
        type: 'TAKE_NDT_EXAM',
        payload: {
          id: 'hasNdtLevel1',
        },
      });

      expect(result.resources.credits).toBe(500);
      expect(result.resources.experience).toBe(1000);
      expect(result.inventory.hasNdtLevel1).toBe(true);
      expect(result.logs[0].text).toContain('NDT CERTIFICATION: You have achieved NDT Level I');
    });

    it('should pass NDT Level II exam', () => {
      const state = createProficiencyState({
        resources: { credits: 1500, experience: 0, level: 1 },
        inventory: { ...createMinimalGameState().inventory, hasNdtLevel1: true },
      });

      const result = proficiencyReducer(state, {
        type: 'TAKE_NDT_EXAM',
        payload: {
          id: 'hasNdtLevel2',
        },
      });

      expect(result.resources.credits).toBe(500);
      expect(result.resources.experience).toBe(2000);
      expect(result.inventory.hasNdtLevel2).toBe(true);
    });
  });

  describe('TAKE_NDT_SUBTASK_EXAM', () => {
    it('should certify for HFEC', () => {
      const state = createProficiencyState({
        resources: { credits: 500, experience: 0, level: 1 },
        inventory: { ...createMinimalGameState().inventory, hasNdtLevel1: true, ndtCerts: [] },
      });

      const result = proficiencyReducer(state, {
        type: 'TAKE_NDT_SUBTASK_EXAM',
        payload: {
          id: 'hfec',
        },
      });

      expect(result.resources.credits).toBe(250);
      expect(result.resources.experience).toBe(500);
      expect(result.inventory.ndtCerts).toContain('hfec');
      expect(result.logs[0].text).toContain(
        'NDT QUALIFICATION: You are now certified for HFEC Cert'
      );
    });

    it('should certify for multiple NDT subtasks', () => {
      let state = createProficiencyState({
        resources: { credits: 1000, experience: 0, level: 1 },
        inventory: { ...createMinimalGameState().inventory, hasNdtLevel1: true, ndtCerts: [] },
      });

      // Certify HFEC
      state = proficiencyReducer(state, {
        type: 'TAKE_NDT_SUBTASK_EXAM',
        payload: { id: 'hfec' },
      });

      // Certify Eddy Current
      state = proficiencyReducer(state, {
        type: 'TAKE_NDT_SUBTASK_EXAM',
        payload: { id: 'eddy' },
      });

      // Certify Borescope
      state = proficiencyReducer(state, {
        type: 'TAKE_NDT_SUBTASK_EXAM',
        payload: { id: 'borescope' },
      });

      expect(state.inventory.ndtCerts).toEqual(['hfec', 'eddy', 'borescope']);
      expect(state.resources.credits).toBe(1000 - 250 - 200 - 150);
      expect(state.resources.experience).toBe(500 + 400 + 300);
    });
  });

  describe('TAKE_TYPE_RATING', () => {
    it('should complete 737 Familiarization', () => {
      const state = createProficiencyState({
        resources: { credits: 1000, experience: 0, level: 1 },
        inventory: { ...createMinimalGameState().inventory, hasAPLicense: true, typeRating737: 0 },
      });

      const result = proficiencyReducer(state, {
        type: 'TAKE_TYPE_RATING',
        payload: {
          id: 1,
          family: '737',
        },
      });

      expect(result.resources.credits).toBe(700);
      expect(result.resources.experience).toBe(500);
      expect(result.inventory.typeRating737).toBe(1);
      expect(result.logs[0].text).toContain('TYPE RATING ACHIEVED: 737 Familiarization');
    });

    it('should complete A330 type ratings', () => {
      const state = createProficiencyState({
        resources: { credits: 2000, experience: 0, level: 1 },
        inventory: { ...createMinimalGameState().inventory, hasAPLicense: true, typeRatingA330: 0 },
      });

      const result = proficiencyReducer(state, {
        type: 'TAKE_TYPE_RATING',
        payload: {
          id: 2,
          family: 'A330',
        },
      });

      expect(result.resources.credits).toBe(1200);
      expect(result.resources.experience).toBe(1200);
      expect(result.inventory.typeRatingA330).toBe(2);
    });

    it('should progress through 737 type ratings sequentially', () => {
      let state = createProficiencyState({
        resources: { credits: 5000, experience: 0, level: 1 },
        inventory: { ...createMinimalGameState().inventory, hasAPLicense: true, typeRating737: 0 },
      });

      // Level 1
      state = proficiencyReducer(state, {
        type: 'TAKE_TYPE_RATING',
        payload: {
          id: 1,
          family: '737',
        },
      });
      expect(state.inventory.typeRating737).toBe(1);

      // Level 2
      state = proficiencyReducer(state, {
        type: 'TAKE_TYPE_RATING',
        payload: { id: 2, family: '737' },
      });
      expect(state.inventory.typeRating737).toBe(2);

      // Level 3
      state = proficiencyReducer(state, {
        type: 'TAKE_TYPE_RATING',
        payload: { id: 3, family: '737' },
      });
      expect(state.inventory.typeRating737).toBe(3);
    });
  });

  describe('UNLOCK_SKILL', () => {
    it('should unlock a Tier 1 skill with no prerequisites', () => {
      const state = createProficiencyState({
        proficiency: {
          skillPoints: 1,
          unlocked: [],
          unlockedBonuses: [],
          easaModulesPassed: [],
        },
      });

      const result = proficiencyReducer(state, {
        type: 'UNLOCK_SKILL',
        payload: { id: 'scrapSavant' },
      });

      expect(result.proficiency.skillPoints).toBe(0);
      expect(result.proficiency.unlocked).toContain('scrapSavant');
      expect(result.logs[0].text).toContain('PROFICIENCY UNLOCKED: Scrap Savant');
      expect(result.logs[0].type).toBe('levelup');
    });

    it('should unlock a Tier 2 skill with prerequisites met', () => {
      const state = createProficiencyState({
        proficiency: {
          skillPoints: 1,
          unlocked: ['scrapSavant'], // Prerequisite for nightShiftSupervisor
          unlockedBonuses: [],
          easaModulesPassed: [],
        },
      });

      const result = proficiencyReducer(state, {
        type: 'UNLOCK_SKILL',
        payload: { id: 'nightShiftSupervisor' },
      });

      expect(result.proficiency.skillPoints).toBe(0);
      expect(result.proficiency.unlocked).toContain('nightShiftSupervisor');
      expect(result.logs[0].text).toContain('PROFICIENCY UNLOCKED: Night Shift Supervisor');
    });

    it('should not unlock a skill without prerequisites', () => {
      const state = createProficiencyState({
        proficiency: {
          skillPoints: 1,
          unlocked: [], // Missing prerequisite 'scrapSavant'
          unlockedBonuses: [],
          easaModulesPassed: [],
        },
      });

      const result = proficiencyReducer(state, {
        type: 'UNLOCK_SKILL',
        payload: { id: 'nightShiftSupervisor' },
      });

      expect(result.proficiency.skillPoints).toBe(1); // Should not deduct
      expect(result.proficiency.unlocked).not.toContain('nightShiftSupervisor');
      expect(result.logs).toHaveLength(0); // No log entry
    });

    it('should not unlock a skill without skill points', () => {
      const state = createProficiencyState({
        proficiency: {
          skillPoints: 0, // No points available
          unlocked: [],
          unlockedBonuses: [],
          easaModulesPassed: [],
        },
      });

      const result = proficiencyReducer(state, {
        type: 'UNLOCK_SKILL',
        payload: { id: 'scrapSavant' },
      });

      expect(result.proficiency.skillPoints).toBe(0);
      expect(result.proficiency.unlocked).not.toContain('scrapSavant');
      expect(result.logs).toHaveLength(0);
    });

    it('should not unlock an already unlocked skill', () => {
      const state = createProficiencyState({
        proficiency: {
          skillPoints: 1,
          unlocked: ['scrapSavant'], // Already unlocked
          unlockedBonuses: [],
          easaModulesPassed: [],
        },
      });

      const result = proficiencyReducer(state, {
        type: 'UNLOCK_SKILL',
        payload: { id: 'scrapSavant' },
      });

      expect(result.proficiency.skillPoints).toBe(1); // Should not deduct
      expect(result.proficiency.unlocked).toEqual(['scrapSavant']); // No duplicate
      expect(result.logs).toHaveLength(0);
    });

    it('should unlock multiple skills in sequence', () => {
      let state = createProficiencyState({
        proficiency: {
          skillPoints: 3,
          unlocked: [],
          unlockedBonuses: [],
          easaModulesPassed: [],
        },
      });

      // Unlock Tier 1
      state = proficiencyReducer(state, { type: 'UNLOCK_SKILL', payload: { id: 'scrapSavant' } });
      expect(state.proficiency.skillPoints).toBe(2);
      expect(state.proficiency.unlocked).toEqual(['scrapSavant']);

      // Unlock Tier 2 (requires scrapSavant)
      state = proficiencyReducer(state, {
        type: 'UNLOCK_SKILL',
        payload: { id: 'nightShiftSupervisor' },
      });
      expect(state.proficiency.skillPoints).toBe(1);
      expect(state.proficiency.unlocked).toEqual(['scrapSavant', 'nightShiftSupervisor']);

      // Unlock Tier 3 (requires nightShiftSupervisor)
      state = proficiencyReducer(state, {
        type: 'UNLOCK_SKILL',
        payload: { id: 'masterFabricator' },
      });
      expect(state.proficiency.skillPoints).toBe(0);
      expect(state.proficiency.unlocked).toEqual([
        'scrapSavant',
        'nightShiftSupervisor',
        'masterFabricator',
      ]);
    });
  });

  describe('ACKNOWLEDGE_LEVEL_UP', () => {
    it('should not mutate state (side-effect only action)', () => {
      const state = createProficiencyState({
        resources: { credits: 500, experience: 1000, level: 2 },
      });

      const result = proficiencyReducer(state, {
        type: 'ACKNOWLEDGE_LEVEL_UP',
        payload: { level: 2 },
      });

      // State should be unchanged (side effects handled in App.tsx)
      expect(result).toEqual(state);
    });
  });

  describe('Helper functions', () => {
    describe('hasSkillUnlocked', () => {
      it('should return true if skill is unlocked', () => {
        const state = createProficiencyState({
          proficiency: {
            skillPoints: 0,
            unlocked: ['scrapSavant', 'rivetDiscipline'],
            unlockedBonuses: [],
            easaModulesPassed: [],
          },
        });

        expect(hasSkillUnlocked(state, 'scrapSavant')).toBe(true);
        expect(hasSkillUnlocked(state, 'rivetDiscipline')).toBe(true);
      });

      it('should return false if skill is not unlocked', () => {
        const state = createProficiencyState({
          proficiency: {
            skillPoints: 0,
            unlocked: ['scrapSavant'],
            unlockedBonuses: [],
            easaModulesPassed: [],
          },
        });

        expect(hasSkillUnlocked(state, 'nightShiftSupervisor')).toBe(false);
      });
    });

    describe('getNextEasaModule', () => {
      it('should return the first module if none are passed', () => {
        const state = createProficiencyState({
          proficiency: {
            skillPoints: 0,
            unlocked: [],
            unlockedBonuses: [],
            easaModulesPassed: [],
          },
        });

        const nextModule = getNextEasaModule(state);
        expect(nextModule).toBeDefined();
        expect(nextModule?.id).toBe(1);
        expect(nextModule?.name).toBe('M1: Mathematics');
      });

      it('should return the next unpassed module', () => {
        const state = createProficiencyState({
          proficiency: {
            skillPoints: 0,
            unlocked: [],
            unlockedBonuses: [],
            easaModulesPassed: [1, 2, 3],
          },
        });

        const nextModule = getNextEasaModule(state);
        expect(nextModule?.id).toBe(4);
        expect(nextModule?.name).toBe('M4: Electronic Fundamentals');
      });

      it('should return undefined if all modules are passed', () => {
        const state = createProficiencyState({
          proficiency: {
            skillPoints: 0,
            unlocked: [],
            unlockedBonuses: [],
            easaModulesPassed: Array.from({ length: 17 }, (_, i) => i + 1),
          },
        });

        const nextModule = getNextEasaModule(state);
        expect(nextModule).toBeUndefined();
      });
    });

    describe('rollEasaExamPass', () => {
      it('should return true for pass (> 0.3)', () => {
        const originalRandom = Math.random;
        Math.random = () => 0.5; // > 0.3 = pass
        expect(rollEasaExamPass()).toBe(true);
        Math.random = originalRandom;
      });

      it('should return false for fail (<= 0.3)', () => {
        const originalRandom = Math.random;
        Math.random = () => 0.2; // <= 0.3 = fail
        expect(rollEasaExamPass()).toBe(false);
        Math.random = originalRandom;
      });
    });
  });

  describe('Immutability', () => {
    it('should not mutate original state', () => {
      const state = createProficiencyState({
        resources: { credits: 500, experience: 0, level: 1 },
        proficiency: {
          skillPoints: 1,
          unlocked: [],
          unlockedBonuses: [],
          easaModulesPassed: [],
        },
      });

      const originalState = JSON.parse(JSON.stringify(state));

      proficiencyReducer(state, {
        type: 'UNLOCK_SKILL',
        payload: { id: 'scrapSavant' },
      });

      expect(state).toEqual(originalState);
    });
  });
});
