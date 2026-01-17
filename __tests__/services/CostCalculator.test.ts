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
import { createMinimalGameState } from '@/utils/testHelpers';
import { describe, expect, it } from 'vitest';

describe('CostCalculator Service', () => {
  describe('BASE_FOCUS_COSTS', () => {
    it('should have cost entries for core actions', () => {
      expect(BASE_FOCUS_COSTS['TIGHTEN_BOLT']).toBe(3);
      expect(BASE_FOCUS_COSTS['COMPLETE_JOB']).toBe(15);
      expect(BASE_FOCUS_COSTS['PERFORM_NDT']).toBe(20);
      expect(BASE_FOCUS_COSTS['RESOLVE_EVENT']).toBe(30);
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

    it('should handle explicit costFocus in payload', () => {
      const state = createMinimalGameState();
      const cost = calculateFocusCost('CUSTOM_ACTION', state, { costFocus: 42 });

      expect(cost).toBe(42);
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
});
