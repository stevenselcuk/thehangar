import { describe, expect, it } from 'vitest';
import { ACTION_LOGS } from '@/data/flavor.ts';
import { complianceReducer, ComplianceSliceState } from '@/state/slices/complianceSlice.ts';
import { createMinimalGameState } from '@/utils/testHelpers.ts';

// ==================== TEST FIXTURES ====================

const createComplianceState = (
  overrides: Partial<ComplianceSliceState> = {}
): ComplianceSliceState => {
  const baseState = createMinimalGameState();
  return {
    resources: {
      ...baseState.resources,
      sanity: 100,
      suspicion: 0,
      focus: 100,
      credits: 1000,
      experience: 0,
      kardexFragments: 0,
    },
    flags: {
      ...baseState.flags,
      ndtFinding: null,
      onPerformanceImprovementPlan: false,
      isAfraid: false,
      venomSurgeActive: false,
    },
    hfStats: {
      ...baseState.hfStats,
      fearTimer: 0,
      compliancePressureTimer: 0,
      scheduleCompressionTimer: 0,
      sanityShieldTimer: 0,
      performanceReviewCooldown: 0,
      foundLoopholeTimer: 0,
      socialStress: 0,
    },
    stats: {
      ...baseState.stats,
      ndtScansPerformed: 0,
    },
    proficiency: {
      ...baseState.proficiency,
      unlocked: [],
    },
    logs: [],
    ...overrides,
  };
};

const mockTriggerEvent = () => {
  const calls: Array<{ type: string; id?: string }> = [];
  return {
    fn: (type: string, id?: string) => calls.push({ type, id }),
    calls,
  };
};

// ==================== ACTION TESTS ====================

describe('complianceSlice - Actions', () => {
  describe('CREATE_NON_ROUTINE_REPORT', () => {
    it('should do nothing if no ndtFinding exists', () => {
      const state = createComplianceState({
        flags: { ...createComplianceState().flags, ndtFinding: null },
      });

      const result = complianceReducer(state, {
        type: 'CREATE_NON_ROUTINE_REPORT',
        payload: {},
      });

      expect(result.resources.credits).toBe(1000); // unchanged
      expect(result.resources.experience).toBe(0); // unchanged
      expect(result.logs).toHaveLength(0);
    });

    it('should file minor finding (credits +50, xp +100)', () => {
      const state = createComplianceState({
        flags: {
          ...createComplianceState().flags,
          ndtFinding: { type: 'HFEC', description: 'Minor crack', severity: 'minor' },
        },
      });

      const result = complianceReducer(state, {
        type: 'CREATE_NON_ROUTINE_REPORT',
        payload: {},
      });

      expect(result.resources.credits).toBe(1050); // 1000 + 50
      expect(result.resources.experience).toBe(100);
      expect(result.flags.ndtFinding).toBeNull();
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('story');
    });

    it('should file major finding (credits +150, xp +300)', () => {
      const state = createComplianceState({
        flags: {
          ...createComplianceState().flags,
          ndtFinding: { type: 'HFEC', description: 'Major fatigue', severity: 'major' },
        },
      });

      const result = complianceReducer(state, {
        type: 'CREATE_NON_ROUTINE_REPORT',
        payload: {},
      });

      expect(result.resources.credits).toBe(1150); // 1000 + 150
      expect(result.resources.experience).toBe(300);
      expect(result.flags.ndtFinding).toBeNull();
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('story');
    });

    it('should file suspicious finding (xp +500, suspicion +10)', () => {
      const state = createComplianceState({
        flags: {
          ...createComplianceState().flags,
          ndtFinding: { type: 'Borescope', description: 'Organic residue', severity: 'suspicious' },
        },
      });

      const result = complianceReducer(state, {
        type: 'CREATE_NON_ROUTINE_REPORT',
        payload: {},
      });

      expect(result.resources.credits).toBe(1000); // no credits for suspicious
      expect(result.resources.experience).toBe(500);
      expect(result.resources.suspicion).toBe(10);
      expect(result.flags.ndtFinding).toBeNull();
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('warning');
    });

    it('should verify immutability', () => {
      const state = createComplianceState({
        flags: {
          ...createComplianceState().flags,
          ndtFinding: { type: 'HFEC', description: 'Minor crack', severity: 'minor' },
        },
      });

      const result = complianceReducer(state, {
        type: 'CREATE_NON_ROUTINE_REPORT',
        payload: {},
      });

      expect(result).not.toBe(state);
      expect(result.resources).not.toBe(state.resources);
      expect(result.flags).not.toBe(state.flags);
    });
  });

  describe('PERFORM_HFEC_SCAN', () => {
    it('should always increment ndtScansPerformed', () => {
      const state = createComplianceState();
      Math.random = () => 0.2; // any outcome
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'PERFORM_HFEC_SCAN',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.stats.ndtScansPerformed).toBe(1);
    });

    it('should find nothing on 40% roll', () => {
      const state = createComplianceState();
      Math.random = () => 0.3; // < 0.4, normal
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'PERFORM_HFEC_SCAN',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.flags.ndtFinding).toBeNull();
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('info');
      expect(result.logs[0].text).toBe(ACTION_LOGS.HFEC_SCAN_SUCCESS_NORMAL);
    });

    it('should find minor crack on 30% roll (sanity unchanged)', () => {
      const state = createComplianceState();
      Math.random = () => 0.5; // >= 0.4 and < 0.7, minor
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'PERFORM_HFEC_SCAN',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.flags.ndtFinding).toEqual({
        type: 'HFEC',
        description: ACTION_LOGS.HFEC_SCAN_SUCCESS_CRACK,
        severity: 'minor',
      });
      expect(result.resources.sanity).toBe(100); // unchanged
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('warning');
    });

    it('should find major fatigue on 20% roll (sanity unchanged)', () => {
      const state = createComplianceState();
      Math.random = () => 0.8; // >= 0.7 and < 0.9, major
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'PERFORM_HFEC_SCAN',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.flags.ndtFinding).toEqual({
        type: 'HFEC',
        description: ACTION_LOGS.HFEC_SCAN_SUCCESS_FATIGUE,
        severity: 'major',
      });
      expect(result.resources.sanity).toBe(100); // unchanged
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('error');
    });

    it('should find suspicious burn on 10% roll (sanity -15)', () => {
      const state = createComplianceState();
      Math.random = () => 0.95; // >= 0.9, suspicious
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'PERFORM_HFEC_SCAN',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.flags.ndtFinding).toEqual({
        type: 'HFEC',
        description: ACTION_LOGS.HFEC_SCAN_SUSPICIOUS_BURN,
        severity: 'suspicious',
      });
      expect(result.resources.sanity).toBe(85); // 100 - 15
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('vibration');
    });

    it('should trigger audit event 20% of the time on suspicious finding', () => {
      const state = createComplianceState();
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.95; // suspicious outcome
        return 0.1; // < 0.2, trigger event
      };
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'PERFORM_HFEC_SCAN',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.flags.ndtFinding?.severity).toBe('suspicious');
      expect(triggerEvent.calls).toHaveLength(1);
      expect(triggerEvent.calls[0]).toEqual({ type: 'audit', id: 'AUDIT_NDT_LOGS' });
    });

    it('should not trigger audit event 80% of the time on suspicious finding', () => {
      const state = createComplianceState();
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.95; // suspicious outcome
        return 0.5; // >= 0.2, no event
      };
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'PERFORM_HFEC_SCAN',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.flags.ndtFinding?.severity).toBe('suspicious');
      expect(triggerEvent.calls).toHaveLength(0);
    });

    it('should verify immutability', () => {
      const state = createComplianceState();
      Math.random = () => 0.5;
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'PERFORM_HFEC_SCAN',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result).not.toBe(state);
      expect(result.flags).not.toBe(state.flags);
      expect(result.stats).not.toBe(state.stats);
    });
  });

  describe('PERFORM_BORESCOPE_INSPECTION', () => {
    it('should always increment ndtScansPerformed', () => {
      const state = createComplianceState();
      Math.random = () => 0.3; // any outcome
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'PERFORM_BORESCOPE_INSPECTION',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.stats.ndtScansPerformed).toBe(1);
    });

    it('should find nothing on 50% roll', () => {
      const state = createComplianceState();
      Math.random = () => 0.4; // < 0.5, normal
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'PERFORM_BORESCOPE_INSPECTION',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.flags.ndtFinding).toBeNull();
      expect(result.resources.sanity).toBe(100); // unchanged
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('info');
    });

    it('should find minor hotspots on 35% roll', () => {
      const state = createComplianceState();
      Math.random = () => 0.7; // >= 0.5 and < 0.85, minor
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'PERFORM_BORESCOPE_INSPECTION',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.flags.ndtFinding).toEqual({
        type: 'Borescope',
        description: ACTION_LOGS.BORESCOPE_SUCCESS_HOTSPOTS,
        severity: 'minor',
      });
      expect(result.resources.sanity).toBe(100); // unchanged
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('warning');
    });

    it('should find suspicious residue on 15% roll (sanity -20)', () => {
      const state = createComplianceState();
      Math.random = () => 0.9; // >= 0.85, suspicious
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'PERFORM_BORESCOPE_INSPECTION',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.flags.ndtFinding).toEqual({
        type: 'Borescope',
        description: ACTION_LOGS.BORESCOPE_SUSPICIOUS_RESIDUE,
        severity: 'suspicious',
      });
      expect(result.resources.sanity).toBe(80); // 100 - 20
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('vibration');
    });

    it('should trigger audit event 25% of the time on suspicious finding', () => {
      const state = createComplianceState();
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.9; // suspicious outcome
        return 0.2; // < 0.25, trigger event
      };
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'PERFORM_BORESCOPE_INSPECTION',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.flags.ndtFinding?.severity).toBe('suspicious');
      expect(triggerEvent.calls).toHaveLength(1);
      expect(triggerEvent.calls[0]).toEqual({ type: 'audit', id: 'AUDIT_NDT_LOGS' });
    });

    it('should not trigger audit event 75% of the time on suspicious finding', () => {
      const state = createComplianceState();
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.9; // suspicious outcome
        return 0.5; // >= 0.25, no event
      };
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'PERFORM_BORESCOPE_INSPECTION',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.flags.ndtFinding?.severity).toBe('suspicious');
      expect(triggerEvent.calls).toHaveLength(0);
    });

    it('should verify immutability', () => {
      const state = createComplianceState();
      Math.random = () => 0.9;
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'PERFORM_BORESCOPE_INSPECTION',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result).not.toBe(state);
      expect(result.flags).not.toBe(state.flags);
      expect(result.resources).not.toBe(state.resources);
    });
  });

  describe('REPORT_ANOMALOUS', () => {
    it('should fail if sanity < 20', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, sanity: 15 },
      });
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'REPORT_ANOMALOUS',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.sanity).toBe(15); // unchanged
      expect(result.resources.suspicion).toBe(0); // unchanged
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('warning');
      expect(result.logs[0].text).toContain('too rattled');
    });

    it('should always cost sanity -20 when above threshold', () => {
      const state = createComplianceState();
      Math.random = () => 0.1; // any outcome
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'REPORT_ANOMALOUS',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.sanity).toBe(80); // 100 - 20
    });

    it('should succeed on 30% roll (suspicion +20, sanity shield 5min)', () => {
      const state = createComplianceState();
      Math.random = () => 0.2; // < 0.3, success
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'REPORT_ANOMALOUS',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.sanity).toBe(80); // 100 - 20
      expect(result.resources.suspicion).toBe(20);
      expect(result.hfStats.sanityShieldTimer).toBe(300000); // 5 minutes
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('story');
    });

    it('should trigger security sweep on 20% roll (suspicion +35)', () => {
      const state = createComplianceState();
      Math.random = () => 0.4; // >= 0.3 and < 0.5, security sweep
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'REPORT_ANOMALOUS',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.sanity).toBe(80); // 100 - 20
      expect(result.resources.suspicion).toBe(35);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('error');
      expect(triggerEvent.calls).toHaveLength(1);
      expect(triggerEvent.calls[0]).toEqual({ type: 'audit', id: 'INTERNAL_SWEEP' });
    });

    it('should trigger suits encounter on 20% roll (sanity -50 total, suspicion +50, fear)', () => {
      const state = createComplianceState();
      Math.random = () => 0.6; // >= 0.5 and < 0.7, suits
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'REPORT_ANOMALOUS',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.sanity).toBe(50); // 100 - 20 - 30
      expect(result.resources.suspicion).toBe(50);
      expect(result.flags.isAfraid).toBe(true);
      expect(result.hfStats.fearTimer).toBe(120000); // 2 minutes
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('vibration');
    });

    it('should gaslight on 20% roll (sanity -30 total, suspicion +10)', () => {
      const state = createComplianceState();
      Math.random = () => 0.8; // >= 0.7 and < 0.9, gaslight
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'REPORT_ANOMALOUS',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.sanity).toBe(70); // 100 - 20 - 10
      expect(result.resources.suspicion).toBe(10);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('warning');
    });

    it('should memory wipe on 10% roll (sanity -20, focus -20, suspicion +15)', () => {
      const state = createComplianceState();
      Math.random = () => 0.95; // >= 0.9, memory wipe
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'REPORT_ANOMALOUS',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.sanity).toBe(80); // 100 - 20
      expect(result.resources.focus).toBe(80); // 100 - 20
      expect(result.resources.suspicion).toBe(15);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('vibration');
    });

    it('should not reduce sanity below 0', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, sanity: 40 },
      });
      Math.random = () => 0.6; // suits outcome (-50 sanity)
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'REPORT_ANOMALOUS',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.sanity).toBe(0); // max(0, 40 - 20 - 30)
    });

    it('should not reduce focus below 0', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, focus: 10 },
      });
      Math.random = () => 0.95; // memory wipe (-20 focus)
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'REPORT_ANOMALOUS',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.focus).toBe(0); // max(0, 10 - 20)
    });

    it('should not increase suspicion above 100', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, suspicion: 60 },
      });
      Math.random = () => 0.6; // suits outcome (+50 suspicion)
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'REPORT_ANOMALOUS',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.suspicion).toBe(100); // min(100, 60 + 50)
    });

    it('should verify immutability', () => {
      const state = createComplianceState();
      Math.random = () => 0.2;
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'REPORT_ANOMALOUS',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result).not.toBe(state);
      expect(result.resources).not.toBe(state.resources);
      expect(result.hfStats).not.toBe(state.hfStats);
    });
  });

  describe('REPORT_MUNDANE', () => {
    it('should succeed on 40% roll (suspicion -2)', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, suspicion: 10 },
      });
      Math.random = () => 0.3; // < 0.4, success

      const result = complianceReducer(state, {
        type: 'REPORT_MUNDANE',
        payload: { triggerEvent: () => {} },
      });

      expect(result.resources.suspicion).toBe(8); // 10 - 2
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('info');
    });

    it('should not reduce suspicion below 0', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, suspicion: 1 },
      });
      Math.random = () => 0.3; // success

      const result = complianceReducer(state, {
        type: 'REPORT_MUNDANE',
        payload: { triggerEvent: () => {} },
      });

      expect(result.resources.suspicion).toBe(0); // max(0, 1 - 2)
    });

    it('should backfire on 20% roll (social stress +5)', () => {
      const state = createComplianceState();
      Math.random = () => 0.5; // >= 0.4 and < 0.6, backfire

      const result = complianceReducer(state, {
        type: 'REPORT_MUNDANE',
        payload: { triggerEvent: () => {} },
      });

      expect(result.hfStats.socialStress).toBe(5);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('warning');
    });

    it('should not increase social stress above 100', () => {
      const state = createComplianceState({
        hfStats: { ...createComplianceState().hfStats, socialStress: 98 },
      });
      Math.random = () => 0.5; // backfire

      const result = complianceReducer(state, {
        type: 'REPORT_MUNDANE',
        payload: { triggerEvent: () => {} },
      });

      expect(result.hfStats.socialStress).toBe(100);
    });

    it('should be ignored on 20% roll (no changes)', () => {
      const state = createComplianceState();
      Math.random = () => 0.7; // >= 0.6 and < 0.8, ignored

      const result = complianceReducer(state, {
        type: 'REPORT_MUNDANE',
        payload: { triggerEvent: () => {} },
      });

      expect(result.resources.suspicion).toBe(0); // unchanged
      expect(result.hfStats.socialStress).toBe(0); // unchanged
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('info');
    });

    it('should be overzealous on 10% roll (suspicion +2)', () => {
      const state = createComplianceState();
      Math.random = () => 0.85; // >= 0.8 and < 0.9, overzealous

      const result = complianceReducer(state, {
        type: 'REPORT_MUNDANE',
        payload: { triggerEvent: () => {} },
      });

      expect(result.resources.suspicion).toBe(2);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('warning');
    });

    it('should trigger consequence on 10% roll (schedule compression 3min)', () => {
      const state = createComplianceState();
      Math.random = () => 0.95; // >= 0.9, consequence

      const result = complianceReducer(state, {
        type: 'REPORT_MUNDANE',
        payload: { triggerEvent: () => {} },
      });

      expect(result.hfStats.scheduleCompressionTimer).toBe(180000); // 3 minutes
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('error');
    });

    it('should verify immutability', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, suspicion: 10 },
      });
      Math.random = () => 0.3; // success, modifies suspicion

      const result = complianceReducer(state, {
        type: 'REPORT_MUNDANE',
        payload: { triggerEvent: () => {} },
      });

      expect(result).not.toBe(state);
      expect(result.resources).not.toBe(state.resources);
    });
  });

  describe('FORGE_SAMPLE', () => {
    it('should fail if insufficient credits', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, credits: 500 },
      });

      const result = complianceReducer(state, {
        type: 'FORGE_SAMPLE',
        payload: {},
      });

      expect(result.resources.credits).toBe(500); // unchanged
      expect(result.resources.suspicion).toBe(0); // unchanged
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('error');
      expect(result.logs[0].text).toContain("can't afford");
    });

    it('should fail catastrophically on 10% roll (credits -750, suspicion = 100)', () => {
      const state = createComplianceState();
      Math.random = () => 0.05; // < 0.1, fail

      const result = complianceReducer(state, {
        type: 'FORGE_SAMPLE',
        payload: {},
      });

      expect(result.resources.credits).toBe(250); // 1000 - 750
      expect(result.resources.suspicion).toBe(100); // game over
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('error');
    });

    it('should succeed on 90% roll (credits -750, suspicion -10)', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, suspicion: 30 },
      });
      Math.random = () => 0.5; // >= 0.1, success

      const result = complianceReducer(state, {
        type: 'FORGE_SAMPLE',
        payload: {},
      });

      expect(result.resources.credits).toBe(250); // 1000 - 750
      expect(result.resources.suspicion).toBe(20); // 30 - 10
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('story');
    });

    it('should not reduce suspicion below 0', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, suspicion: 5 },
      });
      Math.random = () => 0.5; // success

      const result = complianceReducer(state, {
        type: 'FORGE_SAMPLE',
        payload: {},
      });

      expect(result.resources.suspicion).toBe(0); // max(0, 5 - 10)
    });

    it('should verify immutability', () => {
      const state = createComplianceState();
      Math.random = () => 0.5;

      const result = complianceReducer(state, {
        type: 'FORGE_SAMPLE',
        payload: {},
      });

      expect(result).not.toBe(state);
      expect(result.resources).not.toBe(state.resources);
    });
  });

  describe('PERFORMANCE_REVIEW', () => {
    it('should place on PIP if suspicion > 50', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, suspicion: 60 },
      });
      Math.random = () => 0.9; // any roll

      const result = complianceReducer(state, {
        type: 'PERFORMANCE_REVIEW',
        payload: {},
      });

      expect(result.flags.onPerformanceImprovementPlan).toBe(true);
      expect(result.hfStats.performanceReviewCooldown).toBe(600000);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('error');
    });

    it('should place on PIP on 20% roll even if low suspicion', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, suspicion: 10 },
      });
      Math.random = () => 0.1; // < 0.2, PIP

      const result = complianceReducer(state, {
        type: 'PERFORMANCE_REVIEW',
        payload: {},
      });

      expect(result.flags.onPerformanceImprovementPlan).toBe(true);
      expect(result.hfStats.performanceReviewCooldown).toBe(600000);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('error');
    });

    it('should get bad review if suspicion > 20', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, suspicion: 30 },
      });
      Math.random = () => 0.9; // any roll

      const result = complianceReducer(state, {
        type: 'PERFORMANCE_REVIEW',
        payload: {},
      });

      expect(result.flags.onPerformanceImprovementPlan).toBe(false); // not PIP
      expect(result.hfStats.compliancePressureTimer).toBe(300000);
      expect(result.hfStats.performanceReviewCooldown).toBe(600000);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('warning');
    });

    it('should get bad review on 40% roll (between 0.2 and 0.6)', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, suspicion: 10 },
      });
      Math.random = () => 0.4; // >= 0.2 and < 0.6, bad

      const result = complianceReducer(state, {
        type: 'PERFORMANCE_REVIEW',
        payload: {},
      });

      expect(result.flags.onPerformanceImprovementPlan).toBe(false);
      expect(result.hfStats.compliancePressureTimer).toBe(300000);
      expect(result.hfStats.performanceReviewCooldown).toBe(600000);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('warning');
    });

    it('should get good review on 40% roll with low suspicion (credits +100)', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, suspicion: 10 },
      });
      Math.random = () => 0.8; // >= 0.6, good

      const result = complianceReducer(state, {
        type: 'PERFORMANCE_REVIEW',
        payload: {},
      });

      expect(result.flags.onPerformanceImprovementPlan).toBe(false);
      expect(result.resources.credits).toBe(1100); // 1000 + 100
      expect(result.hfStats.compliancePressureTimer).toBe(0); // no pressure
      expect(result.hfStats.performanceReviewCooldown).toBe(600000);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('story');
    });

    it('should always set performanceReviewCooldown to 10 minutes', () => {
      const state = createComplianceState();
      Math.random = () => 0.8;

      const result = complianceReducer(state, {
        type: 'PERFORMANCE_REVIEW',
        payload: {},
      });

      expect(result.hfStats.performanceReviewCooldown).toBe(600000); // 10 minutes
    });

    it('should verify immutability', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, suspicion: 10 },
      });
      Math.random = () => 0.1; // PIP outcome, mutates flags.onPerformanceImprovementPlan

      const result = complianceReducer(state, {
        type: 'PERFORMANCE_REVIEW',
        payload: {},
      });

      expect(result).not.toBe(state);
      expect(result.flags).not.toBe(state.flags);
      expect(result.hfStats).not.toBe(state.hfStats);
    });
  });

  describe('REQUEST_LEAVE', () => {
    it('should fail if insufficient credits', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, credits: 200 },
      });

      const result = complianceReducer(state, {
        type: 'REQUEST_LEAVE',
        payload: {},
      });

      expect(result.resources.credits).toBe(200); // unchanged
      expect(result.resources.sanity).toBe(100); // unchanged
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('error');
      expect(result.logs[0].text).toContain("can't afford");
    });

    it('should succeed (credits -300, sanity +50, focus +50, suspicion +2)', () => {
      const state = createComplianceState({
        resources: {
          ...createComplianceState().resources,
          sanity: 40,
          focus: 30,
        },
      });

      const result = complianceReducer(state, {
        type: 'REQUEST_LEAVE',
        payload: {},
      });

      expect(result.resources.credits).toBe(700); // 1000 - 300
      expect(result.resources.sanity).toBe(90); // 40 + 50
      expect(result.resources.focus).toBe(80); // 30 + 50
      expect(result.resources.suspicion).toBe(2);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('story');
    });

    it('should not increase sanity above 100', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, sanity: 80 },
      });

      const result = complianceReducer(state, {
        type: 'REQUEST_LEAVE',
        payload: {},
      });

      expect(result.resources.sanity).toBe(100); // min(100, 80 + 50)
    });

    it('should not increase focus above 100', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, focus: 70 },
      });

      const result = complianceReducer(state, {
        type: 'REQUEST_LEAVE',
        payload: {},
      });

      expect(result.resources.focus).toBe(100); // min(100, 70 + 50)
    });

    it('should not increase suspicion above 100', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, suspicion: 99 },
      });

      const result = complianceReducer(state, {
        type: 'REQUEST_LEAVE',
        payload: {},
      });

      expect(result.resources.suspicion).toBe(100); // min(100, 99 + 2)
    });

    it('should verify immutability', () => {
      const state = createComplianceState();

      const result = complianceReducer(state, {
        type: 'REQUEST_LEAVE',
        payload: {},
      });

      expect(result).not.toBe(state);
      expect(result.resources).not.toBe(state.resources);
    });
  });

  describe('ALTER_DOCUMENTS', () => {
    it('should alter documents (suspicion +15, sanity -5)', () => {
      const state = createComplianceState();

      const result = complianceReducer(state, {
        type: 'ALTER_DOCUMENTS',
        payload: {},
      });

      expect(result.resources.suspicion).toBe(15);
      expect(result.resources.sanity).toBe(95); // 100 - 5
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('warning');
    });

    it('should not increase suspicion above 100', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, suspicion: 90 },
      });

      const result = complianceReducer(state, {
        type: 'ALTER_DOCUMENTS',
        payload: {},
      });

      expect(result.resources.suspicion).toBe(100); // min(100, 90 + 15)
    });

    it('should verify immutability', () => {
      const state = createComplianceState();

      const result = complianceReducer(state, {
        type: 'ALTER_DOCUMENTS',
        payload: {},
      });

      expect(result).not.toBe(state);
      expect(result.resources).not.toBe(state.resources);
    });
  });

  describe('DESTROY_DOCUMENTS', () => {
    it('should destroy documents (suspicion +10, sanity +10)', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, sanity: 80 },
      });
      Math.random = () => 0.5; // no kardex, no audit
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'DESTROY_DOCUMENTS',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.suspicion).toBe(10);
      expect(result.resources.sanity).toBe(90); // 80 + 10
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('story');
    });

    it('should find kardex fragment on 25% roll', () => {
      const state = createComplianceState();
      const calls: number[] = [];
      Math.random = () => {
        // Calls: log ID #1, kardex check, log ID #2, audit check
        const values = [0.5, 0.2, 0.5, 0.5]; // log ID, kardex (<0.25), log ID, no audit (>=0.1)
        const value = values[calls.length] || 0.5;
        calls.push(value);
        return value;
      };
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'DESTROY_DOCUMENTS',
        payload: { triggerEvent: triggerEvent.fn },
      });

      // Math.random is called: once for first log ID, once for kardex check, once for second log ID, once for audit check
      expect(calls.length).toBeGreaterThanOrEqual(4);
      expect(calls[1]).toBe(0.2); // kardex roll (after first log ID)

      expect(result.resources.kardexFragments).toBe(1);
      expect(result.logs).toHaveLength(2); // main log + kardex log
      expect(result.logs[1].type).toBe('story'); // first log (oldest, added first)
      expect(result.logs[0].type).toBe('vibration'); // kardex log (newest, added second)
    });

    it('should not find kardex fragment on 75% roll', () => {
      const state = createComplianceState();
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.5; // >= 0.25, no kardex
        return 0.5; // no audit
      };
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'DESTROY_DOCUMENTS',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.kardexFragments).toBe(0);
      expect(result.logs).toHaveLength(1); // only main log
    });

    it('should trigger audit on 10% roll', () => {
      const state = createComplianceState();
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.5; // no kardex
        return 0.05; // < 0.1, trigger audit
      };
      const triggerEvent = mockTriggerEvent();

      complianceReducer(state, {
        type: 'DESTROY_DOCUMENTS',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(triggerEvent.calls).toHaveLength(1);
      expect(triggerEvent.calls[0]).toEqual({ type: 'audit', id: 'AUDIT_SHREDDER_LOGS' });
    });

    it('should not trigger audit on 90% roll', () => {
      const state = createComplianceState();
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.5; // no kardex
        return 0.5; // >= 0.1, no audit
      };
      const triggerEvent = mockTriggerEvent();

      complianceReducer(state, {
        type: 'DESTROY_DOCUMENTS',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(triggerEvent.calls).toHaveLength(0);
    });

    it('should not increase sanity above 100', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, sanity: 95 },
      });
      Math.random = () => 0.5;
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'DESTROY_DOCUMENTS',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result.resources.sanity).toBe(100); // min(100, 95 + 10)
    });

    it('should verify immutability', () => {
      const state = createComplianceState();
      Math.random = () => 0.5;
      const triggerEvent = mockTriggerEvent();

      const result = complianceReducer(state, {
        type: 'DESTROY_DOCUMENTS',
        payload: { triggerEvent: triggerEvent.fn },
      });

      expect(result).not.toBe(state);
      expect(result.resources).not.toBe(state.resources);
    });
  });

  describe('REVIEW_COMPLIANCE', () => {
    it('should always cost sanity -5', () => {
      const state = createComplianceState();
      Math.random = () => 0.5; // any outcome

      const result = complianceReducer(state, {
        type: 'REVIEW_COMPLIANCE',
        payload: {},
      });

      expect(result.resources.sanity).toBe(95); // 100 - 5
    });

    it('should find loophole on 10% roll (sanity -5, loophole timer 5min)', () => {
      const state = createComplianceState();
      Math.random = () => 0.05; // < 0.1, loophole

      const result = complianceReducer(state, {
        type: 'REVIEW_COMPLIANCE',
        payload: {},
      });

      expect(result.resources.sanity).toBe(95); // 100 - 5
      expect(result.hfStats.foundLoopholeTimer).toBe(300000); // 5 minutes
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('story');
    });

    it('should find disturbing content on 10% roll (sanity -20 total)', () => {
      const state = createComplianceState();
      Math.random = () => 0.15; // >= 0.1 and < 0.2, disturbing

      const result = complianceReducer(state, {
        type: 'REVIEW_COMPLIANCE',
        payload: {},
      });

      expect(result.resources.sanity).toBe(80); // 100 - 5 - 15
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('vibration');
    });

    it('should find standard text on 30% roll (no extra effects)', () => {
      const state = createComplianceState();
      Math.random = () => 0.3; // >= 0.2 and < 0.5, standard 1

      const result = complianceReducer(state, {
        type: 'REVIEW_COMPLIANCE',
        payload: {},
      });

      expect(result.resources.sanity).toBe(95); // 100 - 5
      expect(result.resources.suspicion).toBe(0); // unchanged
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('info');
    });

    it('should find standard text 2 on 30% roll (sanity -5, suspicion -2)', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, suspicion: 10 },
      });
      Math.random = () => 0.6; // >= 0.5 and < 0.8, standard 2

      const result = complianceReducer(state, {
        type: 'REVIEW_COMPLIANCE',
        payload: {},
      });

      expect(result.resources.sanity).toBe(95); // 100 - 5
      expect(result.resources.suspicion).toBe(8); // 10 - 2
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('info');
    });

    it('should not reduce suspicion below 0', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, suspicion: 1 },
      });
      Math.random = () => 0.6; // standard 2

      const result = complianceReducer(state, {
        type: 'REVIEW_COMPLIANCE',
        payload: {},
      });

      expect(result.resources.suspicion).toBe(0); // max(0, 1 - 2)
    });

    it('should find standard text 3 on 20% roll (no extra effects)', () => {
      const state = createComplianceState();
      Math.random = () => 0.9; // >= 0.8, standard 3

      const result = complianceReducer(state, {
        type: 'REVIEW_COMPLIANCE',
        payload: {},
      });

      expect(result.resources.sanity).toBe(95); // 100 - 5
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('info');
    });

    it('should not reduce sanity below 0', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, sanity: 15 },
      });
      Math.random = () => 0.15; // disturbing (-20 total)

      const result = complianceReducer(state, {
        type: 'REVIEW_COMPLIANCE',
        payload: {},
      });

      expect(result.resources.sanity).toBe(0); // max(0, 15 - 5 - 15)
    });

    it('should verify immutability', () => {
      const state = createComplianceState();
      Math.random = () => 0.05;

      const result = complianceReducer(state, {
        type: 'REVIEW_COMPLIANCE',
        payload: {},
      });

      expect(result).not.toBe(state);
      expect(result.resources).not.toBe(state.resources);
      expect(result.hfStats).not.toBe(state.hfStats);
    });
  });

  describe('GIVE_URINE_SAMPLE', () => {
    it('should always cost sanity -2', () => {
      const state = createComplianceState();

      const result = complianceReducer(state, {
        type: 'GIVE_URINE_SAMPLE',
        payload: {},
      });

      expect(result.resources.sanity).toBe(98); // 100 - 2
    });

    it('should pass if venomSurgeActive is false (suspicion -5)', () => {
      const state = createComplianceState({
        flags: { ...createComplianceState().flags, venomSurgeActive: false },
        resources: { ...createComplianceState().resources, suspicion: 20 },
      });

      const result = complianceReducer(state, {
        type: 'GIVE_URINE_SAMPLE',
        payload: {},
      });

      expect(result.resources.sanity).toBe(98); // 100 - 2
      expect(result.resources.suspicion).toBe(15); // 20 - 5
      expect(result.flags.isAfraid).toBe(false);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('info');
    });

    it('should not reduce suspicion below 0 on pass', () => {
      const state = createComplianceState({
        flags: { ...createComplianceState().flags, venomSurgeActive: false },
        resources: { ...createComplianceState().resources, suspicion: 3 },
      });

      const result = complianceReducer(state, {
        type: 'GIVE_URINE_SAMPLE',
        payload: {},
      });

      expect(result.resources.suspicion).toBe(0); // max(0, 3 - 5)
    });

    it('should fail if venomSurgeActive is true (suspicion +30, fear)', () => {
      const state = createComplianceState({
        flags: { ...createComplianceState().flags, venomSurgeActive: true },
      });

      const result = complianceReducer(state, {
        type: 'GIVE_URINE_SAMPLE',
        payload: {},
      });

      expect(result.resources.sanity).toBe(98); // 100 - 2
      expect(result.resources.suspicion).toBe(30);
      expect(result.flags.isAfraid).toBe(true);
      expect(result.hfStats.fearTimer).toBe(45000);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('error');
    });

    it('should not increase suspicion above 100 on fail', () => {
      const state = createComplianceState({
        flags: { ...createComplianceState().flags, venomSurgeActive: true },
        resources: { ...createComplianceState().resources, suspicion: 80 },
      });

      const result = complianceReducer(state, {
        type: 'GIVE_URINE_SAMPLE',
        payload: {},
      });

      expect(result.resources.suspicion).toBe(100); // min(100, 80 + 30)
    });

    it('should verify immutability', () => {
      const state = createComplianceState();

      const result = complianceReducer(state, {
        type: 'GIVE_URINE_SAMPLE',
        payload: {},
      });

      expect(result).not.toBe(state);
      expect(result.resources).not.toBe(state.resources);
    });
  });

  describe('MAINTAIN_LOW_PROFILE', () => {
    it('should reduce suspicion by 10 without unseenPresence skill', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, suspicion: 30 },
        proficiency: { ...createComplianceState().proficiency, unlocked: [] },
      });

      const result = complianceReducer(state, {
        type: 'MAINTAIN_LOW_PROFILE',
        payload: {},
      });

      expect(result.resources.suspicion).toBe(20); // 30 - 10
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].type).toBe('info');
    });

    it('should reduce suspicion by 15 with unseenPresence skill', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, suspicion: 30 },
        proficiency: { ...createComplianceState().proficiency, unlocked: ['unseenPresence'] },
      });

      const result = complianceReducer(state, {
        type: 'MAINTAIN_LOW_PROFILE',
        payload: {},
      });

      expect(result.resources.suspicion).toBe(15); // 30 - 15
      expect(result.logs).toHaveLength(2);
      // Logs are added via unshift, so newest log is at index 0
      expect(result.logs[1].type).toBe('info'); // first log added
      expect(result.logs[0].type).toBe('levelup'); // second log added (most recent)
      expect(result.logs[0].text).toContain('[Unseen Presence]');
    });

    it('should not reduce suspicion below 0', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, suspicion: 5 },
        proficiency: { ...createComplianceState().proficiency, unlocked: ['unseenPresence'] },
      });

      const result = complianceReducer(state, {
        type: 'MAINTAIN_LOW_PROFILE',
        payload: {},
      });

      expect(result.resources.suspicion).toBe(0); // max(0, 5 - 15)
    });

    it('should verify immutability', () => {
      const state = createComplianceState({
        resources: { ...createComplianceState().resources, suspicion: 20 },
      });

      const result = complianceReducer(state, {
        type: 'MAINTAIN_LOW_PROFILE',
        payload: {},
      });

      expect(result).not.toBe(state);
      expect(result.resources).not.toBe(state.resources);
    });
  });
});
