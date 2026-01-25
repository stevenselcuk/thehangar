import { produce } from 'immer';
import { anomaliesData } from '../../data/anomalies.ts';
import { eventsData } from '../../data/events.ts';
import { ACTION_LOGS, SYSTEM_LOGS } from '../../data/flavor.ts';
import { hasSkill } from '../../services/CostCalculator.ts';
import { addLogToDraft } from '../../services/logService.ts';
import { Anomaly, GameEvent, GameState, Inventory } from '../../types.ts';

/**
 * eventsSlice.ts - Job and Event Lifecycle Management
 *
 * Handles:
 * - Job completion with tool requirements and rewards
 * - Event resolution with choices and outcomes
 * - Event triggering (component failures, audits, incidents, etc.)
 * - Anomaly discovery (5% chance on non-retrofit job completion)
 *
 * State mutations:
 * - activeJob: JobCard | null
 * - activeEvent: GameEvent | null
 * - stats.jobsCompleted, stats.eventsResolved
 * - resources (credits, experience, technicalLogbookHours)
 * - anomalies array (push new anomalies)
 * - toolConditions (degrade on job completion)
 * - flags.activeComponentFailure
 * - logs array
 */

// ==================== TYPE DEFINITIONS ====================

export interface EventsSliceState {
  activeJob: GameState['activeJob'];
  activeEvent: GameState['activeEvent'];
  stats: GameState['stats'];
  resources: GameState['resources'];
  anomalies: GameState['anomalies'];
  toolConditions: GameState['toolConditions'];
  inventory: GameState['inventory'];
  flags: GameState['flags'];
  hfStats: GameState['hfStats'];
  logs: GameState['logs'];
  rotables: GameState['rotables'];
  proficiency: GameState['proficiency'];
}

export type EventsAction =
  | { type: 'COMPLETE_JOB'; payload: Record<string, unknown> }
  | { type: 'RESOLVE_EVENT'; payload: Record<string, unknown> }
  | { type: 'TRIGGER_EVENT'; payload: { type: string; id?: string } };

// ==================== HELPER FUNCTIONS ====================

/**
 * Checks if a tool is required and available
 */
export const hasRequiredTool = (inventory: Inventory, toolId: string): boolean => {
  return inventory[toolId as keyof Inventory] === true;
};

/**
 * Checks if a tool is serviceable (condition > 0)
 */
export const isToolServiceable = (
  toolConditions: Record<string, number>,
  toolId: string
): boolean => {
  return (toolConditions[toolId] || 0) > 0;
};

/**
 * Degrades tool condition after use
 * Returns the amount degraded (for testing)
 */
export const degradeToolCondition = (
  toolConditions: Record<string, number>,
  toolId: string,
  hasHighTorqueMethods: boolean
): number => {
  // 20% chance to preserve condition if skill unlocked
  if (hasHighTorqueMethods && Math.random() < 0.2) {
    return 0; // No degradation
  }

  const degradation = 5 + Math.random() * 5; // 5-10 condition loss
  toolConditions[toolId] = Math.max(0, (toolConditions[toolId] || 100) - degradation);
  return degradation;
};

/**
 * Calculates technical logbook hours from job duration
 */
export const calculateLogbookHours = (jobDurationMs: number): number => {
  return Math.round(jobDurationMs / 60000) || 2; // Default 2 hours minimum
};

/**
 * Rolls for anomaly discovery (5% chance on non-retrofit jobs)
 */
export const rollForAnomalyDiscovery = (isRetrofitJob: boolean): boolean => {
  if (isRetrofitJob) return false;
  return Math.random() < 0.05;
};

/**
 * Creates a new anomaly from a random template
 */
export const createAnomalyFromTemplate = (): Anomaly => {
  const template = anomaliesData[Math.floor(Math.random() * anomaliesData.length)];
  return {
    id: `anom_${Date.now()}`,
    name: template.name,
    description: template.description,
    templateId: template.id,
  };
};

/**
 * Creates a component failure event from a rotable
 */
export const createComponentFailureEvent = (rotableId: string, rotableLabel: string): GameEvent => {
  const template = eventsData.component_failure[0];
  return {
    id: `fail_${rotableId}`,
    type: 'component_failure',
    title: `${template.title}: ${rotableLabel.toUpperCase()}`,
    description: `The ${rotableLabel} ${template.description}`,
    timeLeft: template.totalTime,
    totalTime: template.totalTime,
    failureOutcome: template.failureOutcome,
    requiredAction: template.requiredAction,
  };
};

/**
 * Creates a standard event from templates
 */
export const createEventFromTemplate = (
  eventType: string,
  specificId?: string
): GameEvent | null => {
  const templates = eventsData[eventType as keyof typeof eventsData];
  if (!templates || templates.length === 0) return null;

  const template = specificId
    ? templates.find((t) => t.id === specificId)
    : templates[Math.floor(Math.random() * templates.length)];

  if (!template) return null;

  return {
    id: template.id,
    type: template.type,
    title: template.title,
    description: template.description,
    timeLeft: template.totalTime,
    totalTime: template.totalTime,
    choices: template.choices,
    requiredAction: template.requiredAction,
    successOutcome: template.successOutcome,
    failureOutcome: template.failureOutcome,
    suitType: template.suitType,
  };
};

// ==================== REDUCER ====================

export const eventsReducer = produce((draft: EventsSliceState, action: EventsAction) => {
  const addLog = (
    text: string,
    type: 'info' | 'warning' | 'error' | 'story' | 'vibration' | 'levelup' = 'info'
  ) => {
    addLogToDraft(draft.logs, text, type, Date.now());
  };

  switch (action.type) {
    case 'COMPLETE_JOB': {
      if (!draft.activeJob) break;

      const job = draft.activeJob;
      const requiredTools = job.requirements.tools || [];

      // Check tool availability and serviceability
      for (const toolId of requiredTools) {
        if (!hasRequiredTool(draft.inventory, toolId)) {
          addLog(`ERROR: MISSING TOOL: ${toolId.toUpperCase()}`, 'error');
          return;
        }
        if (!isToolServiceable(draft.toolConditions, toolId)) {
          addLog(`ERROR: Tool ${toolId.toUpperCase()} Unserviceable.`, 'error');
          return;
        }
      }

      // Degrade tool conditions
      const hasHighTorque = hasSkill(draft as unknown as GameState, 'highTorqueMethods');
      for (const toolId of requiredTools) {
        const degradation = degradeToolCondition(draft.toolConditions, toolId, hasHighTorque);
        if (degradation === 0) {
          addLog(`[High-Torque Methods] Tool ${toolId.toUpperCase()} condition preserved.`, 'info');
        }
      }

      // Award rewards
      addLog(`Work Order ${job.id} Signed Off.`, 'story');
      draft.resources.credits += job.rewardXP / 2;
      draft.resources.experience += job.rewardXP;

      // Log technical hours
      const jobHours = calculateLogbookHours(job.totalTime);
      draft.resources.technicalLogbookHours += jobHours;
      addLog(`Logged ${jobHours} technical hour(s) for Work Order ${job.id}.`, 'info');

      // Increment stats
      draft.stats.jobsCompleted += 1;

      // Roll for anomaly discovery (5% chance on non-retrofit jobs)
      if (rollForAnomalyDiscovery(job.isRetrofit || false)) {
        const newAnomaly = createAnomalyFromTemplate();
        draft.anomalies.push(newAnomaly);
        addLog(ACTION_LOGS.ANOMALY_FOUND, 'vibration');
      }

      // Clear active job
      draft.activeJob = null;
      break;
    }

    case 'RESOLVE_EVENT': {
      if (!draft.activeEvent) break;

      const eventId = draft.activeEvent.id;

      // Handle special event resolutions
      if (eventId === 'FUEL_CONTAM') {
        draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 35);
        addLog(
          "You reported the fuel contamination. A HAZMAT team is on its way, and so is a full audit team. They'll be watching you closely.",
          'warning'
        );
      } else if (eventId === 'CATERING_INCIDENT') {
        draft.resources.credits -= 50;
        addLog(ACTION_LOGS.CATERING_INCIDENT_RESOLVED, 'info');
      } else if (eventId === 'GROUND_POWER_INOP') {
        addLog(ACTION_LOGS.GROUND_POWER_RESOLVED, 'info');
      } else if (eventId === 'BAGGAGE_LOADER_IMPACT') {
        addLog(ACTION_LOGS.BAGGAGE_IMPACT_LOGGED, 'info');
      } else if (eventId === 'FUELING_ERROR') {
        addLog(ACTION_LOGS.FUEL_LOG_CORRECTED, 'info');
      } else if (eventId === 'MGMT_PRESSURE') {
        draft.hfStats.compliancePressureTimer = 5 * 60 * 1000;
        addLog(
          "You can feel the lead's eyes on your back. Every move is being scrutinized.",
          'warning'
        );
      } else if (eventId === 'PIP_WARNING') {
        draft.flags.onPerformanceImprovementPlan = true;
        addLog(
          'Your file has been updated. All actions will require more focus until your performance improves.',
          'error'
        );
      } else if (eventId === 'SCHEDULE_COMPRESSION') {
        draft.hfStats.scheduleCompressionTimer = 30 * 60 * 1000;
        addLog('The pace is frantic. Clocks seem to spin faster.', 'warning');
      }

      // Component failures cannot be resolved here - must be repaired in toolroom
      if (draft.activeEvent.type === 'component_failure') {
        addLog(
          'This issue cannot be resolved through standard channels. The component must be repaired in the toolroom.',
          'error'
        );
        // Note: Focus cost was already deducted, so we don't refund here
        return;
      }

      // Award experience for resolution
      draft.resources.experience += 350;
      addLog(SYSTEM_LOGS.EVENT_RESOLVED, 'story');

      // Increment stats
      draft.stats.eventsResolved += 1;

      // Clear active event
      draft.activeEvent = null;
      break;
    }

    case 'TRIGGER_EVENT': {
      // Don't trigger if event already active
      if (draft.activeEvent) return;

      const { type: eventType, id: specificId } = action.payload;

      // Special handling for component failures
      if (eventType === 'component_failure') {
        const rotableId = specificId;
        const rotable = draft.rotables.find((r) => r.id === rotableId);
        if (!rotable) return;

        const failureEvent = createComponentFailureEvent(rotable.id, rotable.label);
        draft.activeEvent = failureEvent;
        draft.flags.activeComponentFailure = rotable.id;
        addLog(`FAILURE DETECTED: ${rotable.label.toUpperCase()} is failing.`, 'error');
        return;
      }

      // Standard event creation
      const newEvent = createEventFromTemplate(eventType, specificId);
      if (!newEvent) return;

      draft.activeEvent = newEvent;
      addLog(SYSTEM_LOGS.ALERT_DISRUPTION, 'warning');
      break;
    }
  }
});
