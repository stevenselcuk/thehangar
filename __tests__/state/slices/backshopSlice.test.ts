import { describe, expect, it } from 'vitest';
import { anomaliesData } from '@/data/anomalies.ts';
import { Anomaly } from '@/types.ts';
import {
  backshopReducer,
  BackshopSliceState,
  createRetrofitJob,
  createUntraceableRotable,
  rollSls3Outcome,
} from '@/state/slices/backshopSlice.ts';
import { createMinimalGameState } from '@/utils/testHelpers.ts';

// ==================== TEST FIXTURES ====================

const createBackshopState = (overrides: Partial<BackshopSliceState> = {}): BackshopSliceState => {
  const baseState = createMinimalGameState();
  return {
    resources: {
      ...baseState.resources,
      sanity: 100,
      suspicion: 0,
      credits: 1000,
      experience: 0,
      bioFilament: 0,
      kardexFragments: 2,
      crystallineResonators: 0,
    },
    flags: {
      ...baseState.flags,
      isAfraid: false,
      sls3Unlocked: false,
      storyFlags: {
        ...baseState.flags.storyFlags,
        fdrDeconstructed: false,
      },
    },
    hfStats: {
      ...baseState.hfStats,
      fearTimer: 0,
    },
    rotables: [],
    anomalies: [],
    stats: {
      ...baseState.stats,
      anomaliesAnalyzed: 0,
      rotablesScavenged: 0,
    },
    activeJob: null,
    logs: [],
    ...overrides,
  };
};

const createTestAnomaly = (templateId: string = 'ANOM_RESONATOR_1'): Anomaly => ({
  id: 'test-anomaly-1',
  name: 'Test Anomaly',
  description: 'A test anomaly for testing',
  templateId,
});

const mockTriggerEvent = () => {
  const calls: Array<{ type: string; id?: string }> = [];
  return {
    fn: (type: string, id?: string) => calls.push({ type, id }),
    calls,
  };
};

// ==================== HELPER FUNCTION TESTS ====================

describe('backshopSlice - Helper Functions', () => {
  describe('createUntraceableRotable', () => {
    it('should create rotable with UNKNOWN P/N and UNTRACEABLE S/N', () => {
      const rotable = createUntraceableRotable(50);

      expect(rotable.pn).toBe('UNKNOWN');
      expect(rotable.sn).toBe('UNTRACEABLE');
      expect(rotable.isUntraceable).toBe(true);
      expect(rotable.isInstalled).toBe(false);
    });

    it('should create rotable with condition within max range', () => {
      Math.random = () => 0.5;
      const rotable = createUntraceableRotable(50);

      expect(rotable.condition).toBe(25); // 0.5 * 50
    });

    it('should randomly set red-tagged status (30% chance)', () => {
      Math.random = () => 0.1; // < 0.3, should be red-tagged
      const rotable = createUntraceableRotable(50);

      expect(rotable.isRedTagged).toBe(true);
    });

    it('should randomly set not red-tagged (70% chance)', () => {
      Math.random = () => 0.5; // > 0.3, should not be red-tagged
      const rotable = createUntraceableRotable(50);

      expect(rotable.isRedTagged).toBe(false);
    });

    it('should generate IDs with expected format', () => {
      // Test that IDs follow the Math.random().toString(36) pattern
      const rotable = createUntraceableRotable(50);

      expect(rotable.id).toMatch(/^0\./); // toString(36) always starts with "0."
      expect(rotable.id.length).toBeGreaterThan(2);
    });
  });

  describe('rollSls3Outcome', () => {
    it('should return "encounter" for roll < 0.05 (5%)', () => {
      Math.random = () => 0.04;
      expect(rollSls3Outcome()).toBe('encounter');
    });

    it('should return "trapped" for roll < 0.2 (15%)', () => {
      Math.random = () => 0.15;
      expect(rollSls3Outcome()).toBe('trapped');
    });

    it('should return "clue" for roll < 0.4 (20%)', () => {
      Math.random = () => 0.35;
      expect(rollSls3Outcome()).toBe('clue');
    });

    it('should return "scavenge" for roll >= 0.4 (60%)', () => {
      Math.random = () => 0.8;
      expect(rollSls3Outcome()).toBe('scavenge');
    });
  });

  describe('createRetrofitJob', () => {
    it('should create retrofit job from anomaly template', () => {
      const anomaly = createTestAnomaly('ANOM_RESONATOR_1');
      const duration = 300000;

      const job = createRetrofitJob(anomaly, duration);

      expect(job).not.toBeNull();
      expect(job?.id).toMatch(/^retrofit_\d+$/);
      expect(job?.timeLeft).toBe(duration);
      expect(job?.totalTime).toBe(duration);
    });

    it('should return null if template not found', () => {
      const anomaly = createTestAnomaly('NONEXISTENT_TEMPLATE');
      const job = createRetrofitJob(anomaly, 300000);

      expect(job).toBeNull();
    });

    it('should copy all properties from template retrofitJob', () => {
      const anomaly = createTestAnomaly('ANOM_RESONATOR_1');
      const job = createRetrofitJob(anomaly, 300000);
      const template = anomaliesData.find((a) => a.id === 'ANOM_RESONATOR_1');

      expect(job?.requirements).toEqual(template?.retrofitJob.requirements);
      expect(job?.rewardXP).toEqual(template?.retrofitJob.rewardXP);
    });
  });
});

// ==================== ACTION TESTS ====================

describe('backshopSlice - Actions', () => {
  describe('CLEAN_ULD', () => {
    it('should cause exposure on 20% roll (sanity -25, fear trigger)', () => {
      const state = createBackshopState();
      Math.random = () => 0.15; // < 0.2, exposure
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'CLEAN_ULD',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.sanity).toBe(75); // 100 - 25
      expect(result.flags.isAfraid).toBe(true);
      expect(result.hfStats.fearTimer).toBe(60000);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('vibration');
    });

    it('should succeed on 80% roll (bioFilament +1, credits +250)', () => {
      const state = createBackshopState();
      Math.random = () => 0.5; // >= 0.2, success
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'CLEAN_ULD',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.bioFilament).toBe(1);
      expect(result.resources.credits).toBe(1250); // 1000 + 250
      expect(result.flags.isAfraid).toBe(false);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('story');
    });

    it('should not reduce sanity below 0 on exposure', () => {
      const state = createBackshopState({
        resources: { ...createBackshopState().resources, sanity: 10 },
      });
      Math.random = () => 0.1; // exposure
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'CLEAN_ULD',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.sanity).toBe(0);
    });

    it('should verify immutability', () => {
      const state = createBackshopState();
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'CLEAN_ULD',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result).not.toBe(state);
      expect(result.resources).not.toBe(state.resources);
      expect(result.flags).not.toBe(state.flags);
    });
  });

  describe('XRAY_WELDS', () => {
    it('should find organic anomaly on 15% roll (sanity -20, fear)', () => {
      const state = createBackshopState();
      Math.random = () => 0.1; // < 0.15, organic anomaly

      const result = backshopReducer(state, {
        type: 'XRAY_WELDS',
        payload: {},
      });

      expect(result.resources.sanity).toBe(80); // 100 - 20
      expect(result.flags.isAfraid).toBe(true);
      expect(result.hfStats.fearTimer).toBe(45000);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('vibration');
    });

    it('should find KARDEX clue on 25% roll (sanity -10, kardex +1)', () => {
      const state = createBackshopState();
      Math.random = () => 0.3; // >= 0.15 and < 0.4, KARDEX clue

      const result = backshopReducer(state, {
        type: 'XRAY_WELDS',
        payload: {},
      });

      expect(result.resources.sanity).toBe(90); // 100 - 10
      expect(result.resources.kardexFragments).toBe(3); // 2 + 1
      expect(result.flags.isAfraid).toBe(false);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('story');
    });

    it('should show normal results on 60% roll (xp +150)', () => {
      const state = createBackshopState();
      Math.random = () => 0.7; // >= 0.4, normal

      const result = backshopReducer(state, {
        type: 'XRAY_WELDS',
        payload: {},
      });

      expect(result.resources.experience).toBe(150);
      expect(result.resources.sanity).toBe(100); // no change
      expect(result.flags.isAfraid).toBe(false);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('info');
    });

    it('should verify immutability', () => {
      const state = createBackshopState();

      const result = backshopReducer(state, {
        type: 'XRAY_WELDS',
        payload: {},
      });

      expect(result).not.toBe(state);
      expect(result.resources).not.toBe(state.resources);
    });
  });

  describe('DECONSTRUCT_FDR', () => {
    it('should fail if insufficient kardex fragments', () => {
      const state = createBackshopState({
        resources: { ...createBackshopState().resources, kardexFragments: 0 },
      });
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'DECONSTRUCT_FDR',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('error');
      expect(result.logs[0].text).toContain('DECONSTRUCTION FAILED');
      expect(result.resources.kardexFragments).toBe(0); // unchanged
    });

    it('should fail if insufficient sanity', () => {
      const state = createBackshopState({
        resources: { ...createBackshopState().resources, sanity: 40 },
      });
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'DECONSTRUCT_FDR',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('error');
      expect(result.logs[0].text).toContain('at least 50 Sanity');
      expect(result.resources.sanity).toBe(40); // unchanged
    });

    it('should cause catastrophic mental damage on 10% roll', () => {
      const state = createBackshopState();
      Math.random = () => 0.05; // < 0.1, mind break
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'DECONSTRUCT_FDR',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.kardexFragments).toBe(1); // 2 - 1
      expect(result.resources.sanity).toBe(0); // 100 - 50 - 50 (double penalty)
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('vibration');
      expect(triggerEvent.calls).toHaveLength(0); // no event triggered
    });

    it('should trigger suits audit on 20% roll', () => {
      const state = createBackshopState();
      Math.random = () => 0.2; // >= 0.1 and < 0.3, suits
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'DECONSTRUCT_FDR',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.kardexFragments).toBe(1); // 2 - 1
      expect(result.resources.sanity).toBe(50); // 100 - 50
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('error');
      expect(triggerEvent.calls).toHaveLength(1);
      expect(triggerEvent.calls[0]).toEqual({ type: 'audit', id: 'BACKSHOP_AUDIT_SUITS' });
    });

    it('should succeed on 70% roll (xp +5000, flag set)', () => {
      const state = createBackshopState();
      Math.random = () => 0.8; // >= 0.3, success
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'DECONSTRUCT_FDR',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.kardexFragments).toBe(1); // 2 - 1
      expect(result.resources.sanity).toBe(50); // 100 - 50
      expect(result.resources.experience).toBe(5000);
      expect(result.flags.storyFlags.fdrDeconstructed).toBe(true);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('story');
    });

    it('should verify immutability', () => {
      const state = createBackshopState();
      Math.random = () => 0.8;
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'DECONSTRUCT_FDR',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result).not.toBe(state);
      expect(result.resources).not.toBe(state.resources);
      expect(result.flags).not.toBe(state.flags);
      expect(result.flags.storyFlags).not.toBe(state.flags.storyFlags);
    });
  });

  describe('DESCEND_INTO_SLS3', () => {
    it('should always cost sanity -5 and suspicion +5', () => {
      const state = createBackshopState();
      Math.random = () => 0.5; // scavenge outcome
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'DESCEND_INTO_SLS3',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.sanity).toBeLessThanOrEqual(95); // base cost applied
      expect(result.resources.suspicion).toBeGreaterThanOrEqual(5);
    });

    it('should handle encounter outcome (5% - sanity -45, suspicion +30, fear)', () => {
      const state = createBackshopState();
      Math.random = () => 0.02; // < 0.05, encounter
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'DESCEND_INTO_SLS3',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.sanity).toBe(55); // 100 - 5 - 40
      expect(result.resources.suspicion).toBe(30); // 0 + 5 + 25
      expect(result.flags.isAfraid).toBe(true);
      expect(result.hfStats.fearTimer).toBe(120000); // 2 minutes
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('vibration');
    });

    it('should handle trapped outcome (15% - trigger event)', () => {
      const state = createBackshopState();
      Math.random = () => 0.15; // >= 0.05 and < 0.2, trapped
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'DESCEND_INTO_SLS3',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.sanity).toBe(95); // 100 - 5
      expect(result.resources.suspicion).toBe(5); // 0 + 5
      expect(triggerEvent.calls).toHaveLength(1);
      expect(triggerEvent.calls[0]).toEqual({
        type: 'eldritch_manifestation',
        id: 'TRAPPED_IN_SLS3',
      });
    });

    it('should handle clue outcome (20% - kardex +1, xp +500)', () => {
      const state = createBackshopState();
      Math.random = () => 0.35; // >= 0.2 and < 0.4, clue
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'DESCEND_INTO_SLS3',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.sanity).toBe(95); // 100 - 5
      expect(result.resources.suspicion).toBe(5); // 0 + 5
      expect(result.resources.kardexFragments).toBe(3); // 2 + 1
      expect(result.resources.experience).toBe(500);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('story');
    });

    it('should handle scavenge outcome (60% - find untraceable part, xp +150)', () => {
      const state = createBackshopState();
      Math.random = () => 0.8; // >= 0.4, scavenge
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'DESCEND_INTO_SLS3',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.sanity).toBe(95); // 100 - 5
      expect(result.resources.suspicion).toBe(5); // 0 + 5
      expect(result.resources.experience).toBe(150);
      expect(result.rotables).toHaveLength(1);
      expect(result.rotables[0].isUntraceable).toBe(true);
      expect(result.rotables[0].condition).toBeLessThanOrEqual(40);
      expect(result.stats.rotablesScavenged).toBe(1);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('info');
    });

    it('should not reduce sanity below 0', () => {
      const state = createBackshopState({
        resources: { ...createBackshopState().resources, sanity: 3 },
      });
      Math.random = () => 0.02; // encounter outcome
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'DESCEND_INTO_SLS3',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.sanity).toBe(0);
    });

    it('should not increase suspicion above 100', () => {
      const state = createBackshopState({
        resources: { ...createBackshopState().resources, suspicion: 98 },
      });
      Math.random = () => 0.02; // encounter outcome
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'DESCEND_INTO_SLS3',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.suspicion).toBe(100);
    });

    it('should verify immutability', () => {
      const state = createBackshopState();
      Math.random = () => 0.8;
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'DESCEND_INTO_SLS3',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result).not.toBe(state);
      expect(result.resources).not.toBe(state.resources);
      expect(result.rotables).not.toBe(state.rotables);
    });
  });

  describe('ANALYZE_ANOMALY', () => {
    it('should do nothing if no anomaly exists', () => {
      const state = createBackshopState({ anomalies: [] });
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'ANALYZE_ANOMALY',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.sanity).toBe(100); // no cost
      expect(result.logs).toHaveLength(0);
    });

    it('should always cost sanity -60 when anomaly exists', () => {
      const anomaly = createTestAnomaly('ANOM_RESONATOR_1');
      const state = createBackshopState({ anomalies: [anomaly] });
      Math.random = () => 0.8; // success
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'ANALYZE_ANOMALY',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.sanity).toBe(40); // 100 - 60
    });

    it('should succeed on 70% roll (create retrofit job, remove anomaly)', () => {
      const anomaly = createTestAnomaly('ANOM_RESONATOR_1');
      const state = createBackshopState({ anomalies: [anomaly] });
      Math.random = () => 0.8; // > 0.3, success
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'ANALYZE_ANOMALY',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.sanity).toBe(40); // 100 - 60
      expect(result.anomalies).toHaveLength(0); // anomaly removed
      expect(result.stats.anomaliesAnalyzed).toBe(1);
      expect(result.activeJob).not.toBeNull();
      expect(result.activeJob?.id).toMatch(/^retrofit_\d+$/);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('story');
    });

    it('should grant crystalline resonators if required by template', () => {
      // Find an anomaly template that requires crystallineResonators
      const template = anomaliesData.find((a) => a.retrofitJob.requirements.crystallineResonators);
      if (!template) {
        // Skip if no such template exists
        expect(true).toBe(true);
        return;
      }

      const anomaly = createTestAnomaly(template.id);
      const state = createBackshopState({ anomalies: [anomaly] });
      Math.random = () => 0.8; // success
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'ANALYZE_ANOMALY',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.crystallineResonators).toBe(5);
    });

    it('should grant bioFilament if required by template', () => {
      // Find an anomaly template that requires bioFilament
      const template = anomaliesData.find((a) => a.retrofitJob.requirements.bioFilament);
      if (!template) {
        // Skip if no such template exists
        expect(true).toBe(true);
        return;
      }

      const anomaly = createTestAnomaly(template.id);
      const state = createBackshopState({ anomalies: [anomaly] });
      Math.random = () => 0.8; // success
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'ANALYZE_ANOMALY',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.bioFilament).toBe(10);
    });

    it('should fail on 30% roll (trigger containment breach, remove anomaly)', () => {
      const anomaly = createTestAnomaly('ANOM_RESONATOR_1');
      const state = createBackshopState({ anomalies: [anomaly] });
      Math.random = () => 0.1; // <= 0.3, failure
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'ANALYZE_ANOMALY',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.sanity).toBe(40); // 100 - 60
      expect(result.anomalies).toHaveLength(0); // anomaly destroyed
      expect(result.stats.anomaliesAnalyzed).toBe(0); // not incremented
      expect(result.activeJob).toBeNull(); // no job created
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('error');
      expect(triggerEvent.calls).toHaveLength(1);
      expect(triggerEvent.calls[0]).toEqual({
        type: 'eldritch_manifestation',
        id: 'CONTAINMENT_BREACH',
      });
    });

    it('should only analyze first anomaly in queue', () => {
      const anomaly1 = createTestAnomaly('ANOM_RESONATOR_1');
      const anomaly2 = createTestAnomaly('ANOM_RESONATOR_1');
      const state = createBackshopState({ anomalies: [anomaly1, anomaly2] });
      Math.random = () => 0.8; // success
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'ANALYZE_ANOMALY',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.anomalies).toHaveLength(1); // only first removed
      expect(result.anomalies[0]).toEqual(anomaly2);
    });

    it('should verify immutability', () => {
      const anomaly = createTestAnomaly('ANOM_RESONATOR_1');
      const state = createBackshopState({ anomalies: [anomaly] });
      Math.random = () => 0.8;
      const triggerEvent = mockTriggerEvent();

      const result = backshopReducer(state, {
        type: 'ANALYZE_ANOMALY',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result).not.toBe(state);
      expect(result.resources).not.toBe(state.resources);
      expect(result.anomalies).not.toBe(state.anomalies);
      expect(result.stats).not.toBe(state.stats);
    });
  });

  describe('SCAVENGE_CORROSION_CORNER', () => {
    it('should always increase suspicion by 10', () => {
      const state = createBackshopState();

      const result = backshopReducer(state, {
        type: 'SCAVENGE_CORROSION_CORNER',
        payload: {},
      });

      expect(result.resources.suspicion).toBe(10); // 0 + 10
    });

    it('should always find an untraceable rotable', () => {
      const state = createBackshopState();

      const result = backshopReducer(state, {
        type: 'SCAVENGE_CORROSION_CORNER',
        payload: {},
      });

      expect(result.rotables).toHaveLength(1);
      expect(result.rotables[0].pn).toBe('UNKNOWN');
      expect(result.rotables[0].sn).toBe('UNTRACEABLE');
      expect(result.rotables[0].isUntraceable).toBe(true);
      expect(result.rotables[0].condition).toBeLessThanOrEqual(50);
    });

    it('should increment rotablesScavenged stat', () => {
      const state = createBackshopState();

      const result = backshopReducer(state, {
        type: 'SCAVENGE_CORROSION_CORNER',
        payload: {},
      });

      expect(result.stats.rotablesScavenged).toBe(1);
    });

    it('should add log with story type', () => {
      const state = createBackshopState();

      const result = backshopReducer(state, {
        type: 'SCAVENGE_CORROSION_CORNER',
        payload: {},
      });

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('story');
    });

    it('should not increase suspicion above 100', () => {
      const state = createBackshopState({
        resources: { ...createBackshopState().resources, suspicion: 95 },
      });

      const result = backshopReducer(state, {
        type: 'SCAVENGE_CORROSION_CORNER',
        payload: {},
      });

      expect(result.resources.suspicion).toBe(100);
    });

    it('should verify immutability', () => {
      const state = createBackshopState();

      const result = backshopReducer(state, {
        type: 'SCAVENGE_CORROSION_CORNER',
        payload: {},
      });

      expect(result).not.toBe(state);
      expect(result.resources).not.toBe(state.resources);
      expect(result.rotables).not.toBe(state.rotables);
      expect(result.stats).not.toBe(state.stats);
    });
  });

  describe('OBSERVE_CORROSION_CORNER', () => {
    it('should discover SLS-3 on 8% roll if not already unlocked', () => {
      const state = createBackshopState({
        flags: { ...createBackshopState().flags, sls3Unlocked: false },
      });
      Math.random = () => 0.05; // < 0.08, discover

      const result = backshopReducer(state, {
        type: 'OBSERVE_CORROSION_CORNER',
        payload: {},
      });

      expect(result.flags.sls3Unlocked).toBe(true);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('story');
    });

    it('should not discover SLS-3 if already unlocked', () => {
      const state = createBackshopState({
        flags: { ...createBackshopState().flags, sls3Unlocked: true },
      });
      Math.random = () => 0.05; // < 0.08, would discover but already unlocked

      const result = backshopReducer(state, {
        type: 'OBSERVE_CORROSION_CORNER',
        payload: {},
      });

      // Should fall through to next outcome (ghost sighting)
      expect(result.flags.sls3Unlocked).toBe(true); // still true
      expect(result.resources.sanity).toBe(75); // ghost outcome
      expect(result.logs[0].type).toBe('vibration');
    });

    it('should handle ghost sighting on 12% roll (sanity -25, fear)', () => {
      const state = createBackshopState({
        flags: { ...createBackshopState().flags, sls3Unlocked: true },
      });
      Math.random = () => 0.15; // >= 0.08 and < 0.2, ghost

      const result = backshopReducer(state, {
        type: 'OBSERVE_CORROSION_CORNER',
        payload: {},
      });

      expect(result.resources.sanity).toBe(75); // 100 - 25
      expect(result.flags.isAfraid).toBe(true);
      expect(result.hfStats.fearTimer).toBe(40000);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('vibration');
    });

    it('should handle suits observation on 30% roll (suspicion +5)', () => {
      const state = createBackshopState({
        flags: { ...createBackshopState().flags, sls3Unlocked: true },
      });
      Math.random = () => 0.35; // >= 0.2 and < 0.5, suits

      const result = backshopReducer(state, {
        type: 'OBSERVE_CORROSION_CORNER',
        payload: {},
      });

      expect(result.resources.suspicion).toBe(5); // 0 + 5
      expect(result.resources.sanity).toBe(100); // unchanged
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('story');
    });

    it('should handle mundane weather on 50% roll', () => {
      const state = createBackshopState({
        flags: { ...createBackshopState().flags, sls3Unlocked: true },
      });
      Math.random = () => 0.8; // >= 0.5, weather

      const result = backshopReducer(state, {
        type: 'OBSERVE_CORROSION_CORNER',
        payload: {},
      });

      expect(result.resources.sanity).toBe(100); // unchanged
      expect(result.resources.suspicion).toBe(0); // unchanged
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('info');
    });

    it('should not increase suspicion above 100', () => {
      const state = createBackshopState({
        flags: { ...createBackshopState().flags, sls3Unlocked: true },
        resources: { ...createBackshopState().resources, suspicion: 98 },
      });
      Math.random = () => 0.35; // suits outcome

      const result = backshopReducer(state, {
        type: 'OBSERVE_CORROSION_CORNER',
        payload: {},
      });

      expect(result.resources.suspicion).toBe(100);
    });

    it('should verify immutability when mutation occurs', () => {
      const state = createBackshopState({
        flags: { ...createBackshopState().flags, sls3Unlocked: true },
      });
      Math.random = () => 0.35; // suits outcome - modifies suspicion

      const result = backshopReducer(state, {
        type: 'OBSERVE_CORROSION_CORNER',
        payload: {},
      });

      expect(result).not.toBe(state);
      expect(result.resources).not.toBe(state.resources);
      expect(result.logs).not.toBe(state.logs);
    });
  });
});
