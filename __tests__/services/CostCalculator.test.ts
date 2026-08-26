/**
 * Tests for Cost Calculator service
 * Validates focus cost calculation with all modifiers
 */

import {
  BASE_FOCUS_COSTS,
  calculateFocusCost,
  hasSkill,
  validateActionCost,
} from '@/services/CostCalculator';
import { trainingData } from '@/data/training';
import { createMinimalGameState } from '@/utils/testHelpers';
import { describe, expect, it } from 'vitest';

describe('CostCalculator Service', () => {
  describe('BASE_FOCUS_COSTS', () => {
    it('should have cost entries for core actions', () => {
      expect(BASE_FOCUS_COSTS['TIGHTEN_BOLT']).toBe(3);
      expect(BASE_FOCUS_COSTS['COMPLETE_JOB']).toBe(15);
      expect(BASE_FOCUS_COSTS['PERFORM_NDT']).toBe(20);
    });

    it('registers no cost for RESOLVE_EVENT, whose price is authored per choice', () => {
      // An EventChoice declares its own cost and eventsSlice deducts it. A
      // registered cost here would be billed on top of the advertised one,
      // with nothing on screen to show it.
      expect(BASE_FOCUS_COSTS['RESOLVE_EVENT']).toBeUndefined();
      expect(calculateFocusCost('RESOLVE_EVENT', createMinimalGameState())).toBe(0);
    });

    it('should have 0 cost for free actions', () => {
      expect(BASE_FOCUS_COSTS['LISTEN_RADIO']).toBe(0);
      expect(BASE_FOCUS_COSTS['SMOKE_CIGARETTE']).toBe(0);
      expect(BASE_FOCUS_COSTS['GET_TOOLROOM_ITEM']).toBe(0);
    });
  });

  describe('calculateFocusCost', () => {
    it('should return base cost for simple action', () => {
      const state = createMinimalGameState();
      const cost = calculateFocusCost('TIGHTEN_BOLT', state);

      expect(cost).toBe(3);
    });

    it('should apply fear modifier (+50%)', () => {
      const state = createMinimalGameState({
        flags: { ...createMinimalGameState().flags, isAfraid: true },
      });
      const cost = calculateFocusCost('TIGHTEN_BOLT', state);

      expect(cost).toBe(4.5); // 3 * 1.5 = 4.5 (no flooring for fear)
    });

    it('should apply efficiency boost modifier (-10%)', () => {
      const state = createMinimalGameState({
        hfStats: { ...createMinimalGameState().hfStats, efficiencyBoost: 30000 },
      });
      const cost = calculateFocusCost('COMPLETE_JOB', state);

      expect(cost).toBe(13); // 15 * 0.9 = 13.5, floored to 13
    });

    it('should apply PIP penalty (+20%)', () => {
      const state = createMinimalGameState({
        flags: { ...createMinimalGameState().flags, onPerformanceImprovementPlan: true },
      });
      const cost = calculateFocusCost('TIGHTEN_BOLT', state);

      expect(cost).toBe(4); // 3 * 1.2 = 3.6, ceiled to 4
    });

    it('should apply skill bonus for rivetDiscipline', () => {
      const state = createMinimalGameState({
        proficiency: { ...createMinimalGameState().proficiency, unlocked: ['rivetDiscipline'] },
      });
      const cost = calculateFocusCost('TIGHTEN_BOLT', state);

      expect(cost).toBe(2); // 3 - 1 = 2
    });

    it('should return 0 for CREATE_SRF with loophole timer active', () => {
      const state = createMinimalGameState({
        hfStats: { ...createMinimalGameState().hfStats, foundLoopholeTimer: 120000 },
      });
      const cost = calculateFocusCost('CREATE_SRF', state);

      expect(cost).toBe(0);
    });

    it('should handle AIRCRAFT_ACTION with nested action type', () => {
      const state = createMinimalGameState();
      const cost = calculateFocusCost('AIRCRAFT_ACTION', state, { actionType: 'DAILY_CHECK' });

      expect(cost).toBe(25);
    });

    it('should ignore a costFocus smuggled in on the payload', () => {
      // The cost is a property of the action, not of whatever the dispatching
      // component happened to spread into the payload.
      const state = createMinimalGameState();

      expect(calculateFocusCost('CUSTOM_ACTION', state, { costFocus: 42 })).toBe(0);
      expect(calculateFocusCost('PERFORM_NDT', state, { costFocus: 42 })).toBe(20);
    });

    it('should stack multiple modifiers', () => {
      const state = createMinimalGameState({
        flags: {
          ...createMinimalGameState().flags,
          isAfraid: true,
          onPerformanceImprovementPlan: true,
        },
        hfStats: { ...createMinimalGameState().hfStats, efficiencyBoost: 0 },
      });
      const cost = calculateFocusCost('COMPLETE_JOB', state);

      // 15 * 1.5 (fear) = 22.5 -> 22
      // 22 * 1.2 (PIP) = 26.4 -> 27 (ceiled)
      expect(cost).toBe(27);
    });

    it('should never return negative cost', () => {
      const state = createMinimalGameState({
        proficiency: { ...createMinimalGameState().proficiency, unlocked: ['rivetDiscipline'] },
      });
      const cost = calculateFocusCost('LISTEN_RADIO', state); // 0 base cost

      expect(cost).toBe(0);
    });
  });

  describe('hasSkill', () => {
    it('should return true for unlocked skill', () => {
      const state = createMinimalGameState({
        proficiency: {
          ...createMinimalGameState().proficiency,
          unlocked: ['quickLearner', 'rivetDiscipline'],
        },
      });

      expect(hasSkill(state, 'quickLearner')).toBe(true);
      expect(hasSkill(state, 'rivetDiscipline')).toBe(true);
    });

    it('should return false for locked skill', () => {
      const state = createMinimalGameState();

      expect(hasSkill(state, 'quickLearner')).toBe(false);
    });
  });

  describe('validateActionCost', () => {
    it('should return valid for 0 cost action', () => {
      const state = createMinimalGameState({
        resources: { ...createMinimalGameState().resources, focus: 0 },
      });
      const result = validateActionCost('LISTEN_RADIO', state);

      expect(result.cost).toBe(0);
      expect(result.canAfford).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should return valid when player has enough focus', () => {
      const state = createMinimalGameState({
        resources: { ...createMinimalGameState().resources, focus: 100 },
      });
      const result = validateActionCost('TIGHTEN_BOLT', state);

      expect(result.cost).toBe(3);
      expect(result.canAfford).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should return invalid when player lacks focus', () => {
      const state = createMinimalGameState({
        resources: { ...createMinimalGameState().resources, focus: 2 },
      });
      const result = validateActionCost('TIGHTEN_BOLT', state);

      expect(result.cost).toBe(3);
      expect(result.canAfford).toBe(false);
      expect(result.message).toBe('Insufficient focus');
    });

    it('should apply all modifiers before validation', () => {
      const state = createMinimalGameState({
        resources: { ...createMinimalGameState().resources, focus: 25 },
        flags: { ...createMinimalGameState().flags, isAfraid: true },
      });
      const result = validateActionCost('COMPLETE_JOB', state); // 15 * 1.5 = 22.5

      expect(result.cost).toBe(22.5);
      expect(result.canAfford).toBe(true);
    });
  });

  describe('training costs resolve from trainingData, not from the payload', () => {
    // TrainingTab dispatches the whole authored object; other callers dispatch
    // only an identifier. Both must charge the same, or the price of a course
    // depends on which screen you bought it from.
    const bothShapesAgree = (
      actionType: string,
      full: Record<string, unknown>,
      lean: Record<string, unknown>,
      expected: number
    ) => {
      const state = createMinimalGameState();
      expect(calculateFocusCost(actionType, state, full)).toBe(expected);
      expect(calculateFocusCost(actionType, state, lean)).toBe(expected);
    };

    it('agrees on a mandatory course', () => {
      const course = trainingData.mandatoryCourses.find((c) => c.id === 'hfInitial')!;
      bothShapesAgree('TAKE_MANDATORY_COURSE', { ...course }, { id: 'hfInitial' }, 50);
    });

    it('agrees on every mandatory course', () => {
      for (const course of trainingData.mandatoryCourses) {
        bothShapesAgree(
          'TAKE_MANDATORY_COURSE',
          { ...course },
          { id: course.id },
          course.costFocus
        );
      }
    });

    it('agrees on the A&P written and practical exams', () => {
      bothShapesAgree(
        'TAKE_AP_EXAM',
        { ...trainingData.faaLicense.written },
        { id: 'apWritten' },
        100
      );
      bothShapesAgree(
        'TAKE_AP_EXAM',
        { ...trainingData.faaLicense.practical },
        { id: 'apPractical' },
        200
      );
    });

    it('charges nothing for the licence award, which authors no cost', () => {
      bothShapesAgree(
        'TAKE_AP_EXAM',
        { ...trainingData.faaLicense.license },
        { id: 'hasAPLicense' },
        0
      );
    });

    it('agrees on every NDT level and subtask', () => {
      for (const level of trainingData.ndtCerts.levels) {
        bothShapesAgree('TAKE_NDT_EXAM', { ...level }, { id: level.id }, level.costFocus);
      }
      for (const sub of trainingData.ndtCerts.subtasks) {
        bothShapesAgree('TAKE_NDT_SUBTASK_EXAM', { ...sub }, { id: sub.id }, sub.costFocus);
      }
    });

    it('agrees on every type rating in both families', () => {
      for (const family of ['737', 'A330'] as const) {
        for (const rating of trainingData.typeRatings[family]) {
          bothShapesAgree(
            'TAKE_TYPE_RATING',
            { family, ...rating },
            { family, id: rating.id },
            rating.costFocus
          );
        }
      }
    });

    it('resolves the fixed-price training actions with no id at all', () => {
      const state = createMinimalGameState();
      expect(calculateFocusCost('TAKE_AP_WRITTEN', state, {})).toBe(100);
      expect(calculateFocusCost('TAKE_AVIONICS_EXAM', state, {})).toBe(150);
      expect(calculateFocusCost('START_EASA_MODULE', state, {})).toBe(50);
      expect(calculateFocusCost('TAKE_EASA_EXAM', state, {})).toBe(50);
      expect(calculateFocusCost('TAKE_AVIONICS_EXAM', state, undefined)).toBe(150);
    });

    it('charges nothing for a training action whose entry authors no cost', () => {
      const state = createMinimalGameState();
      expect(calculateFocusCost('CERTIFY_EASA_LICENSE', state, { id: 'hasEasaB1_1' })).toBe(0);
    });

    it('charges nothing for an id that matches no authored entry', () => {
      const state = createMinimalGameState();
      expect(calculateFocusCost('TAKE_MANDATORY_COURSE', state, { id: 'nope' })).toBe(0);
      expect(calculateFocusCost('TAKE_NDT_EXAM', state, { id: 'nope' })).toBe(0);
      expect(calculateFocusCost('TAKE_TYPE_RATING', state, { family: 'Concorde', id: 1 })).toBe(0);
      expect(calculateFocusCost('TAKE_TYPE_RATING', state, { family: '737', id: 99 })).toBe(0);
    });

    it('leaves the authored values alone, above MAX_FOCUS or not', () => {
      const state = createMinimalGameState();
      // Balance is not this layer's call: a 300-focus cert stays 300.
      expect(calculateFocusCost('TAKE_NDT_EXAM', state, { id: 'hasNdtLevel3' })).toBe(300);
      expect(calculateFocusCost('TAKE_AP_EXAM', state, { id: 'apPractical' })).toBe(200);
    });
  });
});
