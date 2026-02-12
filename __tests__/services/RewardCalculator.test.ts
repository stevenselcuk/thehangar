import {
  AIRCRAFT_BASE_REWARDS,
  NDT_FINDING_REWARDS,
  TRAINING_REWARDS,
  applyRewards,
  calculateAircraftRewards,
  calculateAutoSrfIncome,
  calculateBasePassiveIncome,
  calculateFocusRegen,
  calculateJobCredits,
  calculateNightCrewIncome,
  calculateTransitCheckIncome,
  calculateXpGain,
} from '@/services/RewardCalculator.ts';
import type { ResourceState } from '@/types';
import { createMinimalGameState } from '@/utils/testHelpers.ts';
import { describe, expect, it } from 'vitest';

describe('RewardCalculator Service', () => {
  describe('AIRCRAFT_BASE_REWARDS', () => {
    it('should have rewards for TRANSIT_CHECK', () => {
      expect(AIRCRAFT_BASE_REWARDS.TRANSIT_CHECK).toEqual({
        xp: 120,
        credits: 25,
        alclad: 5,
        hours: 1,
      });
    });

    it('should have rewards for DAILY_CHECK', () => {
      expect(AIRCRAFT_BASE_REWARDS.DAILY_CHECK).toEqual({
        xp: 250,
        credits: 60,
        alclad: 10,
        hours: 2,
      });
    });

    it('should have rewards for ETOPS_CHECK', () => {
      expect(AIRCRAFT_BASE_REWARDS.ETOPS_CHECK).toEqual({
        xp: 400,
        credits: 100,
        alclad: 0,
        suspicion: 5,
        hours: 4,
      });
    });
  });

  describe('TRAINING_REWARDS', () => {
    it('should have hfInitial training data', () => {
      expect(TRAINING_REWARDS.hfInitial).toBeDefined();
      expect(TRAINING_REWARDS.hfInitial.credits).toBe(-200);
      expect(TRAINING_REWARDS.hfInitial.xp).toBe(500);
    });

    it('should have A&P license exam data', () => {
      expect(TRAINING_REWARDS.apWritten).toBeDefined();
      expect(TRAINING_REWARDS.apPractical).toBeDefined();
    });

    it('should have NDT certification data', () => {
      expect(TRAINING_REWARDS.ndtLevel1).toBeDefined();
      expect(TRAINING_REWARDS.ndtLevel2).toBeDefined();
      expect(TRAINING_REWARDS.ndtLevel3).toBeDefined();
    });
  });

  describe('NDT_FINDING_REWARDS', () => {
    it('should have rewards for minor findings', () => {
      expect(NDT_FINDING_REWARDS.minor).toEqual({
        credits: 50,
        xp: 100,
      });
    });

    it('should have rewards for major findings', () => {
      expect(NDT_FINDING_REWARDS.major).toEqual({
        credits: 150,
        xp: 300,
      });
    });

    it('should have rewards for suspicious findings', () => {
      expect(NDT_FINDING_REWARDS.suspicious).toEqual({
        credits: 0,
        xp: 500,
        suspicion: 10,
      });
    });
  });

  describe('calculateAircraftRewards', () => {
    it('should return transit check rewards', () => {
      const state = createMinimalGameState();
      const rewards = calculateAircraftRewards('TRANSIT_CHECK', state);

      expect(rewards.experience).toBe(120);
      expect(rewards.credits).toBe(25);
      expect(rewards.alclad).toBe(5);
    });

    it('should return daily check rewards', () => {
      const state = createMinimalGameState();
      const rewards = calculateAircraftRewards('DAILY_CHECK', state);

      expect(rewards.experience).toBe(250);
      expect(rewards.credits).toBe(60);
      expect(rewards.alclad).toBe(10);
    });

    it('should return ETOPS check rewards with suspicion', () => {
      const state = createMinimalGameState();
      const rewards = calculateAircraftRewards('ETOPS_CHECK', state);

      expect(rewards.experience).toBe(400);
      expect(rewards.credits).toBe(100);
      expect(rewards.suspicion).toBe(5);
      expect(rewards.alclad).toBe(0);
    });

    it('should return empty object for unknown action', () => {
      const state = createMinimalGameState();
      const rewards = calculateAircraftRewards('UNKNOWN_ACTION', state);

      expect(rewards).toEqual({});
    });
  });

  describe('applyRewards', () => {
    it('should add credits and XP to resources', () => {
      const resources: ResourceState = {
        ...createMinimalGameState().resources,
        credits: 100,
        experience: 50,
      };

      applyRewards(resources, { credits: 25, experience: 120 });

      expect(resources.credits).toBe(125);
      expect(resources.experience).toBe(170);
    });

    it('should add materials (alclad, rivets)', () => {
      const resources: ResourceState = {
        ...createMinimalGameState().resources,
        alclad: 10,
        rivets: 20,
      };

      applyRewards(resources, { alclad: 5, rivets: 15 });

      expect(resources.alclad).toBe(15);
      expect(resources.rivets).toBe(35);
    });

    it('should handle suspicion increase', () => {
      const resources: ResourceState = {
        ...createMinimalGameState().resources,
        suspicion: 30,
      };

      applyRewards(resources, { suspicion: 10 });

      expect(resources.suspicion).toBe(40);
    });
  });

  describe('calculateFocusRegen', () => {
    it('should return base regen rate (3.0/s)', () => {
      const state = createMinimalGameState();
      const regen = calculateFocusRegen(state, 1);

      expect(regen).toBe(3.0);
    });

    it('should return reduced rate for night crew (0.8/s)', () => {
      const state = createMinimalGameState({
        flags: { ...createMinimalGameState().flags, nightCrewActive: true },
      });

      const regen = calculateFocusRegen(state, 1);

      expect(regen).toBe(0.8);
    });

    it('should halve regen when afraid', () => {
      const state = createMinimalGameState({
        flags: { ...createMinimalGameState().flags, isAfraid: true },
      });

      const regen = calculateFocusRegen(state, 1);

      expect(regen).toBe(1.5); // 3.0 * 0.5
    });

    it('should increase regen with efficiency boost', () => {
      const state = createMinimalGameState({
        hfStats: { ...createMinimalGameState().hfStats, efficiencyBoost: 30000 },
      });

      const regen = calculateFocusRegen(state, 1);

      expect(regen).toBeCloseTo(3.6, 1); // 3.0 * 1.2
    });

    it('should stack modifiers correctly', () => {
      const state = createMinimalGameState({
        flags: { ...createMinimalGameState().flags, isAfraid: true },
        hfStats: { ...createMinimalGameState().hfStats, efficiencyBoost: 30000 },
      });

      const regen = calculateFocusRegen(state, 1);

      expect(regen).toBeCloseTo(1.8, 1); // 3.0 * 0.5 (afraid) * 1.2 (efficiency) = 1.8
    });

    it('should scale with delta time', () => {
      const state = createMinimalGameState();
      const regen = calculateFocusRegen(state, 2);

      expect(regen).toBe(6.0); // 3.0 * 2 seconds
    });
  });

  describe('calculateNightCrewIncome', () => {
    it('should return base income rates', () => {
      const state = createMinimalGameState();
      const income = calculateNightCrewIncome(state, 1);

      expect(income.alclad).toBe(4.0);
      expect(income.rivets).toBe(9.0);
      expect(income.suspicion).toBe(0.18);
    });

    it('should apply night shift supervisor bonus (+10% materials, -15% suspicion)', () => {
      const state = createMinimalGameState({
        proficiency: {
          ...createMinimalGameState().proficiency,
          unlocked: ['nightShiftSupervisor'],
        },
      });

      const income = calculateNightCrewIncome(state, 1);

      expect(income.alclad).toBeCloseTo(4.4, 2); // 4.0 * 1.1
      expect(income.rivets).toBeCloseTo(9.9, 2); // 9.0 * 1.1
      expect(income.suspicion).toBeCloseTo(0.153, 3); // 0.18 * 0.85
    });

    it('should scale with delta time', () => {
      const state = createMinimalGameState();
      const income = calculateNightCrewIncome(state, 2);

      expect(income.alclad).toBe(8.0); // 4.0 * 2 seconds
      expect(income.rivets).toBe(18.0); // 9.0 * 2 seconds
      expect(income.suspicion).toBe(0.36); // 0.18 * 2 seconds
    });
  });

  describe('calculateTransitCheckIncome', () => {
    it('should return base income rates', () => {
      const income = calculateTransitCheckIncome(1);

      expect(income.credits).toBe(1.5);
      expect(income.xp).toBe(5);
      expect(income.suspicion).toBe(0.05);
    });

    it('should scale with delta time', () => {
      const income = calculateTransitCheckIncome(2);

      expect(income.credits).toBe(3.0); // 1.5 * 2 seconds
      expect(income.xp).toBe(10); // 5 * 2 seconds
      expect(income.suspicion).toBe(0.1); // 0.05 * 2 seconds
    });
  });

  describe('calculateAutoSrfIncome', () => {
    it('should return base income rates', () => {
      const income = calculateAutoSrfIncome(1);

      expect(income.credits).toBe(0.8);
      expect(income.xp).toBe(2);
    });

    it('should scale with delta time', () => {
      const income = calculateAutoSrfIncome(2);

      expect(income.credits).toBe(1.6); // 0.8 * 2 seconds
      expect(income.xp).toBe(4); // 2 * 2 seconds
    });
  });

  describe('calculateBasePassiveIncome', () => {
    it('should return base passive income', () => {
      const state = createMinimalGameState();
      const income = calculateBasePassiveIncome(state, 7000);

      expect(income.credits).toBe(49); // (7000 / 1000) * 7
      expect(income.xp).toBeGreaterThan(0);
    });

    it('should apply quickLearner bonus to XP (+10%)', () => {
      const state = createMinimalGameState({
        proficiency: {
          ...createMinimalGameState().proficiency,
          unlocked: ['quickLearner'],
        },
      });

      const baseIncome = calculateBasePassiveIncome(createMinimalGameState(), 12000);
      const bonusIncome = calculateBasePassiveIncome(state, 12000);

      expect(bonusIncome.xp).toBeGreaterThan(baseIncome.xp);
      expect(bonusIncome.xp).toBeCloseTo(baseIncome.xp * 1.1, 2);
    });
  });

  describe('calculateXpGain', () => {
    it('should return base XP without skill', () => {
      const state = createMinimalGameState();
      const xp = calculateXpGain(100, state);

      expect(xp).toBe(100);
    });

    it('should apply quickLearner bonus (+10%)', () => {
      const state = createMinimalGameState({
        proficiency: {
          ...createMinimalGameState().proficiency,
          unlocked: ['quickLearner'],
        },
      });

      const baseXp = calculateXpGain(100, createMinimalGameState());
      const bonusXp = calculateXpGain(100, state);

      expect(bonusXp).toBeCloseTo(110, 1); // 100 * 1.1
      expect(bonusXp).toBeCloseTo(baseXp * 1.1, 2);
    });
  });

  describe('calculateJobCredits', () => {
    it('should return half of job XP as credits', () => {
      const credits = calculateJobCredits(1000);

      expect(credits).toBe(500);
    });

    it('should handle decimal values', () => {
      const credits = calculateJobCredits(350);

      expect(credits).toBe(175);
    });
  });
});
