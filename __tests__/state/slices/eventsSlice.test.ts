import { eventsData } from '@/data/events.ts';
import {
  calculateLogbookHours,
  createAnomalyFromTemplate,
  createComponentFailureEvent,
  createEventFromTemplate,
  degradeToolCondition,
  eventsReducer,
  EventsSliceState,
  hasRequiredTool,
  isToolServiceable,
  rollForAnomalyDiscovery,
} from '@/state/slices/eventsSlice.ts';
import { JobCard } from '@/types.ts';
import { createMinimalGameState } from '@/utils/testHelpers.ts';
import { describe, expect, it } from 'vitest';

describe('eventsSlice', () => {
  // ==================== HELPER FUNCTIONS ====================

  describe('Helper Functions', () => {
    it('hasRequiredTool() returns true when tool is owned', () => {
      const state = createMinimalGameState();
      state.inventory.torquemeter = true;
      expect(hasRequiredTool(state.inventory, 'torquemeter')).toBe(true);
    });

    it('hasRequiredTool() returns false when tool is not owned', () => {
      const state = createMinimalGameState();
      expect(hasRequiredTool(state.inventory, 'torquemeter')).toBe(false);
    });

    it('isToolServiceable() returns true when condition > 0', () => {
      const toolConditions = { torquemeter: 50 };
      expect(isToolServiceable(toolConditions, 'torquemeter')).toBe(true);
    });

    it('isToolServiceable() returns false when condition = 0', () => {
      const toolConditions = { torquemeter: 0 };
      expect(isToolServiceable(toolConditions, 'torquemeter')).toBe(false);
    });

    it('isToolServiceable() returns false when tool not in record', () => {
      const toolConditions = {};
      expect(isToolServiceable(toolConditions, 'torquemeter')).toBe(false);
    });

    it('degradeToolCondition() degrades by 5-10 without skill', () => {
      const toolConditions = { torquemeter: 100 };
      Math.random = () => 0.5; // 7.5 degradation

      const degradation = degradeToolCondition(toolConditions, 'torquemeter', false);

      expect(degradation).toBeCloseTo(7.5);
      expect(toolConditions.torquemeter).toBeCloseTo(92.5);
    });

    it('degradeToolCondition() has 20% chance to preserve with highTorqueMethods', () => {
      const toolConditions = { torquemeter: 100 };
      Math.random = () => 0.1; // < 0.2, should preserve

      const degradation = degradeToolCondition(toolConditions, 'torquemeter', true);

      expect(degradation).toBe(0);
      expect(toolConditions.torquemeter).toBe(100);
    });

    it('degradeToolCondition() still degrades 80% of the time with skill', () => {
      const toolConditions = { torquemeter: 100 };
      Math.random = () => 0.9; // > 0.2, should degrade

      const degradation = degradeToolCondition(toolConditions, 'torquemeter', true);

      expect(degradation).toBeGreaterThan(0);
      expect(toolConditions.torquemeter).toBeLessThan(100);
    });

    it('degradeToolCondition() clamps to 0 minimum', () => {
      const toolConditions = { torquemeter: 3 };
      Math.random = () => 1; // Max degradation (10)

      degradeToolCondition(toolConditions, 'torquemeter', false);

      expect(toolConditions.torquemeter).toBe(0);
    });

    it('calculateLogbookHours() converts milliseconds to hours', () => {
      expect(calculateLogbookHours(60000)).toBe(1); // 1 minute = 1 hour minimum
      expect(calculateLogbookHours(120000)).toBe(2); // 2 minutes = 2 hours
      expect(calculateLogbookHours(180000)).toBe(3); // 3 minutes = 3 hours
    });

    it('calculateLogbookHours() has minimum of 2 hours', () => {
      expect(calculateLogbookHours(0)).toBe(2);
      expect(calculateLogbookHours(10)).toBe(2);
    });

    it('rollForAnomalyDiscovery() returns false for retrofit jobs', () => {
      Math.random = () => 0.01; // Would succeed if not retrofit
      expect(rollForAnomalyDiscovery(true)).toBe(false);
    });

    it('rollForAnomalyDiscovery() has 5% success rate for normal jobs', () => {
      Math.random = () => 0.04; // < 0.05
      expect(rollForAnomalyDiscovery(false)).toBe(true);

      Math.random = () => 0.06; // > 0.05
      expect(rollForAnomalyDiscovery(false)).toBe(false);
    });

    it('createAnomalyFromTemplate() creates valid anomaly', () => {
      Math.random = () => 0.5; // Select middle template

      const anomaly = createAnomalyFromTemplate();

      expect(anomaly).toHaveProperty('id');
      expect(anomaly).toHaveProperty('name');
      expect(anomaly).toHaveProperty('description');
      expect(anomaly).toHaveProperty('templateId');
      expect(anomaly.id).toMatch(/^anom_\d+$/);
    });

    it('createComponentFailureEvent() creates component failure event', () => {
      const event = createComponentFailureEvent('rot-123', 'IDG');

      expect(event.type).toBe('component_failure');
      expect(event.id).toBe('fail_rot-123');
      expect(event.title).toContain('IDG');
      expect(event.description).toContain('IDG');
      expect(event.timeLeft).toBe(eventsData.component_failure[0].totalTime);
      expect(event.totalTime).toBe(eventsData.component_failure[0].totalTime);
    });

    it('createEventFromTemplate() creates event from type', () => {
      const event = createEventFromTemplate('audit');

      expect(event).not.toBeNull();
      expect(event!.type).toBe('audit');
      expect(event!.id).toBeDefined();
      expect(event!.title).toBeDefined();
    });

    it('createEventFromTemplate() selects specific event by id', () => {
      const event = createEventFromTemplate('audit', 'FAA_INSPECTOR');

      expect(event).not.toBeNull();
      expect(event!.id).toBe('FAA_INSPECTOR');
    });

    it('createEventFromTemplate() returns null for invalid type', () => {
      const event = createEventFromTemplate('invalid_type');
      expect(event).toBeNull();
    });

    it('createEventFromTemplate() returns null for invalid id', () => {
      const event = createEventFromTemplate('audit', 'NONEXISTENT_ID');
      expect(event).toBeNull();
    });
  });

  // ==================== COMPLETE_JOB ====================

  describe('COMPLETE_JOB', () => {
    it('completes job with no tools required', () => {
      const state = createMinimalGameState();
      const mockJob: JobCard = {
        id: 'JOB-001',
        title: 'Simple Repair',
        description: 'A basic task',
        requirements: { alclad: 10, rivets: 5 },
        rewardXP: 1000,
        timeLeft: 60000,
        totalTime: 180000,
      };
      state.activeJob = mockJob;
      state.resources.credits = 100;
      state.resources.experience = 500;
      state.resources.technicalLogbookHours = 10;

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'COMPLETE_JOB',
        payload: {},
      });

      expect(result.activeJob).toBeNull();
      expect(result.resources.credits).toBe(600); // 100 + 1000/2
      expect(result.resources.experience).toBe(1500); // 500 + 1000
      expect(result.resources.technicalLogbookHours).toBe(13); // 10 + 3 (180000ms = 3 hours)
      expect(result.stats.jobsCompleted).toBe(1);
      // Logs are in reverse order (newest first), so sign-off is at index 1
      expect(result.logs[1].text).toContain('Work Order JOB-001 Signed Off');
    });

    it('fails if required tool is missing', () => {
      const state = createMinimalGameState();
      const mockJob: JobCard = {
        id: 'JOB-002',
        title: 'Precision Work',
        description: 'Requires special tools',
        requirements: { tools: ['torquemeter'] },
        rewardXP: 2000,
        timeLeft: 60000,
        totalTime: 300000,
      };
      state.activeJob = mockJob;

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'COMPLETE_JOB',
        payload: {},
      });

      expect(result.activeJob).not.toBeNull(); // Job not completed
      expect(result.logs[0].text).toContain('ERROR: MISSING TOOL: TORQUEMETER');
      expect(result.stats.jobsCompleted).toBe(0);
    });

    it('fails if required tool is unserviceable (condition = 0)', () => {
      const state = createMinimalGameState();
      const mockJob: JobCard = {
        id: 'JOB-003',
        title: 'Precision Work',
        description: 'Requires special tools',
        requirements: { tools: ['torquemeter'] },
        rewardXP: 2000,
        timeLeft: 60000,
        totalTime: 300000,
      };
      state.activeJob = mockJob;
      state.inventory.torquemeter = true;
      state.toolConditions.torquemeter = 0;

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'COMPLETE_JOB',
        payload: {},
      });

      expect(result.activeJob).not.toBeNull(); // Job not completed
      expect(result.logs[0].text).toContain('ERROR: Tool TORQUEMETER Unserviceable');
      expect(result.stats.jobsCompleted).toBe(0);
    });

    it('degrades tool condition on completion', () => {
      const state = createMinimalGameState();
      const mockJob: JobCard = {
        id: 'JOB-004',
        title: 'Torque Job',
        description: 'Heavy work',
        requirements: { tools: ['torquemeter'] },
        rewardXP: 1500,
        timeLeft: 60000,
        totalTime: 240000,
      };
      state.activeJob = mockJob;
      state.inventory.torquemeter = true;
      state.toolConditions.torquemeter = 100;
      Math.random = () => 0.5; // 7.5 degradation, no skill preservation

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'COMPLETE_JOB',
        payload: {},
      });

      expect(result.activeJob).toBeNull();
      expect(result.toolConditions.torquemeter).toBeCloseTo(92.5);
    });

    it('has 20% chance to preserve tool condition with highTorqueMethods skill', () => {
      const state = createMinimalGameState();
      state.proficiency.unlocked.push('highTorqueMethods');
      const mockJob: JobCard = {
        id: 'JOB-005',
        title: 'Torque Job',
        description: 'Heavy work',
        requirements: { tools: ['torquemeter'] },
        rewardXP: 1500,
        timeLeft: 60000,
        totalTime: 240000,
      };
      state.activeJob = mockJob;
      state.inventory.torquemeter = true;
      state.toolConditions.torquemeter = 100;
      Math.random = () => 0.1; // < 0.2, preserve condition

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'COMPLETE_JOB',
        payload: {},
      });

      expect(result.activeJob).toBeNull();
      expect(result.toolConditions.torquemeter).toBe(100);
      // Logs are in reverse order (newest first), so preservation message is later in array
      expect(result.logs.some((log) => log.text.includes('[High-Torque Methods]'))).toBe(true);
    });

    it('discovers anomaly on 5% chance for non-retrofit jobs', () => {
      const state = createMinimalGameState();
      const mockJob: JobCard = {
        id: 'JOB-006',
        title: 'Standard Work',
        description: 'Regular task',
        requirements: {},
        rewardXP: 1000,
        timeLeft: 60000,
        totalTime: 180000,
        isRetrofit: false,
      };
      state.activeJob = mockJob;
      Math.random = () => 0.03; // < 0.05, discover anomaly

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'COMPLETE_JOB',
        payload: {},
      });

      expect(result.anomalies).toHaveLength(1);
      expect(result.anomalies[0].id).toMatch(/^anom_\d+$/);
      expect(result.logs.some((log) => log.type === 'vibration')).toBe(true);
    });

    it('does not discover anomaly on retrofit jobs', () => {
      const state = createMinimalGameState();
      const mockJob: JobCard = {
        id: 'JOB-007',
        title: 'Retrofit Work',
        description: 'Anomaly work',
        requirements: {},
        rewardXP: 3000,
        timeLeft: 60000,
        totalTime: 600000,
        isRetrofit: true,
      };
      state.activeJob = mockJob;
      Math.random = () => 0.01; // Would succeed if not retrofit

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'COMPLETE_JOB',
        payload: {},
      });

      expect(result.anomalies).toHaveLength(0);
    });

    it('does not complete job if activeJob is null', () => {
      const state = createMinimalGameState();
      state.activeJob = null;

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'COMPLETE_JOB',
        payload: {},
      });

      expect(result.stats.jobsCompleted).toBe(0);
    });

    it('logs technical hours correctly', () => {
      const state = createMinimalGameState();
      const mockJob: JobCard = {
        id: 'JOB-008',
        title: 'Long Job',
        description: 'Takes time',
        requirements: {},
        rewardXP: 2000,
        timeLeft: 60000,
        totalTime: 480000, // 8 minutes = 8 hours
      };
      state.activeJob = mockJob;

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'COMPLETE_JOB',
        payload: {},
      });

      expect(result.resources.technicalLogbookHours).toBe(8);
      expect(result.logs.some((log) => log.text.includes('Logged 8 technical hour'))).toBe(true);
    });
  });

  // ==================== RESOLVE_EVENT ====================

  describe('RESOLVE_EVENT', () => {
    it('resolves standard event and awards XP', () => {
      const state = createMinimalGameState();
      state.activeEvent = {
        id: 'GENERIC_EVENT',
        type: 'incident',
        title: 'Generic Incident',
        description: 'Something happened',
        timeLeft: 30000,
        totalTime: 60000,
        failureOutcome: { log: 'Failed' },
      };
      state.resources.experience = 1000;

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'RESOLVE_EVENT',
        payload: {},
      });

      expect(result.activeEvent).toBeNull();
      expect(result.resources.experience).toBe(1350); // 1000 + 350
      expect(result.stats.eventsResolved).toBe(1);
      expect(result.logs[0].text).toContain('Situation resolved');
    });

    it('handles FUEL_CONTAM special resolution', () => {
      const state = createMinimalGameState();
      state.activeEvent = {
        id: 'FUEL_CONTAM',
        type: 'incident',
        title: 'Fuel Contamination',
        description: 'Bad fuel',
        timeLeft: 30000,
        totalTime: 60000,
        failureOutcome: { log: 'Failed' },
      };
      state.resources.suspicion = 20;

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'RESOLVE_EVENT',
        payload: {},
      });

      expect(result.resources.suspicion).toBe(55); // 20 + 35
      expect(result.logs.some((log) => log.text.includes('HAZMAT team'))).toBe(true);
    });

    it('handles CATERING_INCIDENT special resolution', () => {
      const state = createMinimalGameState();
      state.activeEvent = {
        id: 'CATERING_INCIDENT',
        type: 'canteen_incident',
        title: 'Catering Issue',
        description: 'Food problem',
        timeLeft: 30000,
        totalTime: 60000,
        failureOutcome: { log: 'Failed' },
      };
      state.resources.credits = 100;

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'RESOLVE_EVENT',
        payload: {},
      });

      expect(result.resources.credits).toBe(50); // 100 - 50
    });

    it('handles MGMT_PRESSURE special resolution', () => {
      const state = createMinimalGameState();
      state.activeEvent = {
        id: 'MGMT_PRESSURE',
        type: 'incident',
        title: 'Management Pressure',
        description: 'Lead watching',
        timeLeft: 30000,
        totalTime: 60000,
        failureOutcome: { log: 'Failed' },
      };

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'RESOLVE_EVENT',
        payload: {},
      });

      expect(result.hfStats.compliancePressureTimer).toBe(5 * 60 * 1000);
    });

    it('handles PIP_WARNING special resolution', () => {
      const state = createMinimalGameState();
      state.activeEvent = {
        id: 'PIP_WARNING',
        type: 'incident',
        title: 'Performance Warning',
        description: 'Underperforming',
        timeLeft: 30000,
        totalTime: 60000,
        failureOutcome: { log: 'Failed' },
      };

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'RESOLVE_EVENT',
        payload: {},
      });

      expect(result.flags.onPerformanceImprovementPlan).toBe(true);
    });

    it('handles SCHEDULE_COMPRESSION special resolution', () => {
      const state = createMinimalGameState();
      state.activeEvent = {
        id: 'SCHEDULE_COMPRESSION',
        type: 'incident',
        title: 'Schedule Compressed',
        description: 'Time pressure',
        timeLeft: 30000,
        totalTime: 60000,
        failureOutcome: { log: 'Failed' },
      };

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'RESOLVE_EVENT',
        payload: {},
      });

      expect(result.hfStats.scheduleCompressionTimer).toBe(30 * 60 * 1000);
    });

    it('does not resolve component_failure events', () => {
      const state = createMinimalGameState();
      state.activeEvent = {
        id: 'fail_rot123',
        type: 'component_failure',
        title: 'Component Failure: IDG',
        description: 'IDG is failing',
        timeLeft: 60000,
        totalTime: 3600000,
        failureOutcome: { log: 'Failed' },
      };

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'RESOLVE_EVENT',
        payload: {},
      });

      expect(result.activeEvent).not.toBeNull(); // Still active
      expect(result.logs[0].text).toContain('toolroom');
      expect(result.stats.eventsResolved).toBe(0);
    });

    it('does nothing if activeEvent is null', () => {
      const state = createMinimalGameState();
      state.activeEvent = null;

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'RESOLVE_EVENT',
        payload: {},
      });

      expect(result.stats.eventsResolved).toBe(0);
    });
  });

  // ==================== TRIGGER_EVENT ====================

  describe('TRIGGER_EVENT', () => {
    it('triggers standard event from type', () => {
      const state = createMinimalGameState();
      state.activeEvent = null;
      state.resources.level = 10; // Audit events require level 5
      Math.random = () => 0.5; // Select middle template

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'TRIGGER_EVENT',
        payload: { type: 'audit' },
      });

      expect(result.activeEvent).not.toBeNull();
      expect(result.activeEvent!.type).toBe('audit');
      expect(result.logs[0].text).toContain('ALERT: SYSTEM DISRUPTION');
    });

    it('triggers specific event by id', () => {
      const state = createMinimalGameState();
      state.activeEvent = null;
      state.resources.level = 10; // Audit events require level 5

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'TRIGGER_EVENT',
        payload: { type: 'audit', id: 'FAA_INSPECTOR' },
      });

      expect(result.activeEvent).not.toBeNull();
      expect(result.activeEvent!.id).toBe('FAA_INSPECTOR');
    });

    it('triggers component_failure event from rotable', () => {
      const state = createMinimalGameState();
      state.activeEvent = null;
      state.resources.level = 10; // Component failure events require level 8
      state.rotables.push({
        id: 'rot-456',
        label: 'IDG',
        pn: 'IDG-757-A',
        sn: 'SN12345',
        condition: 10,
        isInstalled: false,
        isUntraceable: false,
      });

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'TRIGGER_EVENT',
        payload: { type: 'component_failure', id: 'rot-456' },
      });

      expect(result.activeEvent).not.toBeNull();
      expect(result.activeEvent!.type).toBe('component_failure');
      expect(result.activeEvent!.id).toBe('fail_rot-456');
      expect(result.flags.activeComponentFailure).toBe('rot-456');
      expect(result.logs[0].text).toContain('FAILURE DETECTED: IDG');
    });

    it('does not trigger if event already active', () => {
      const state = createMinimalGameState();
      state.activeEvent = {
        id: 'EXISTING_EVENT',
        type: 'incident',
        title: 'Active Event',
        description: 'Already active',
        timeLeft: 30000,
        totalTime: 60000,
        failureOutcome: { log: 'Failed' },
      };

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'TRIGGER_EVENT',
        payload: { type: 'audit' },
      });

      expect(result.activeEvent!.id).toBe('EXISTING_EVENT'); // Unchanged
    });

    it('does not trigger component_failure if rotable not found', () => {
      const state = createMinimalGameState();
      state.activeEvent = null;

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'TRIGGER_EVENT',
        payload: { type: 'component_failure', id: 'nonexistent-id' },
      });

      expect(result.activeEvent).toBeNull();
    });

    it('does not trigger if event type is invalid', () => {
      const state = createMinimalGameState();
      state.activeEvent = null;

      const result = eventsReducer(state as unknown as EventsSliceState, {
        type: 'TRIGGER_EVENT',
        payload: { type: 'invalid_type' },
      });

      expect(result.activeEvent).toBeNull();
    });
  });

  // ==================== IMMUTABILITY ====================

  describe('Immutability', () => {
    it('does not mutate original state on COMPLETE_JOB', () => {
      const state = createMinimalGameState();
      const mockJob: JobCard = {
        id: 'JOB-999',
        title: 'Test',
        description: 'Test',
        requirements: {},
        rewardXP: 1000,
        timeLeft: 60000,
        totalTime: 180000,
      };
      state.activeJob = mockJob;
      const original = { ...state };

      eventsReducer(state as unknown as EventsSliceState, {
        type: 'COMPLETE_JOB',
        payload: {},
      });

      expect(state.activeJob).toEqual(original.activeJob);
      expect(state.resources.credits).toBe(original.resources.credits);
    });

    it('does not mutate original state on RESOLVE_EVENT', () => {
      const state = createMinimalGameState();
      state.activeEvent = {
        id: 'TEST_EVENT',
        type: 'incident',
        title: 'Test',
        description: 'Test',
        timeLeft: 30000,
        totalTime: 60000,
        failureOutcome: { log: 'Failed' },
      };
      const original = { ...state };

      eventsReducer(state as unknown as EventsSliceState, {
        type: 'RESOLVE_EVENT',
        payload: {},
      });

      expect(state.activeEvent).toEqual(original.activeEvent);
    });

    it('does not mutate original state on TRIGGER_EVENT', () => {
      const state = createMinimalGameState();
      state.activeEvent = null;
      const original = { ...state, activeEvent: null };

      eventsReducer(state as unknown as EventsSliceState, {
        type: 'TRIGGER_EVENT',
        payload: { type: 'audit' },
      });

      expect(state.activeEvent).toEqual(original.activeEvent);
    });
  });
});
