import { produce } from 'immer';
import { anomaliesData } from '../../data/anomalies.ts';
import { eventsData } from '../../data/events.ts';
import { ACTION_LOGS, SYSTEM_LOGS } from '../../data/flavor.ts';
import { jobsData } from '../../data/jobs.ts';
import { hasSkill } from '../../services/CostCalculator.ts';
import { canSpawnEventCategory } from '../../services/LevelManager.ts';
import { addLogToDraft } from '../../services/logService.ts';
import { Anomaly, GameEvent, GameState, Inventory, JobCard } from '../../types.ts';

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
  journal: GameState['journal'];
  rotables: GameState['rotables'];
  proficiency: GameState['proficiency'];
}

export type EventsAction =
  | { type: 'COMPLETE_JOB'; payload: Record<string, unknown> }
  | { type: 'RESOLVE_EVENT'; payload: Record<string, unknown> }
  | { type: 'TRIGGER_EVENT'; payload: { type: string; id?: string } }
  | { type: 'START_STANDARD_JOB'; payload: Record<string, unknown> };

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
    const timestamp = Date.now();
    addLogToDraft(draft.logs, text, type, timestamp);
    if (!draft.journal) draft.journal = [];
    draft.journal.unshift({ id: Math.random().toString(36), text, type, timestamp });
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

      // Check and Consume Resources
      const requirements = job.requirements;
      // We need to cast or carefully check keys to avoid type errors with 'tools'
      const resourceKeys = Object.keys(requirements).filter(
        (k) => k !== 'tools'
      ) as (keyof typeof requirements)[];

      // First pass: Check sufficiency
      for (const key of resourceKeys) {
        const reqValue = requirements[key];
        if (typeof reqValue === 'number' && reqValue > 0) {
          const resourceKey = key as keyof GameState['resources'];
          if ((draft.resources[resourceKey] || 0) < reqValue) {
            addLog(`ERROR: Insufficient material: ${key.toUpperCase()}`, 'error');
            return;
          }
        }
      }

      // Second pass: Consume
      for (const key of resourceKeys) {
        const reqValue = requirements[key];
        if (typeof reqValue === 'number' && reqValue > 0) {
          const resourceKey = key as keyof GameState['resources'];
          draft.resources[resourceKey] -= reqValue;
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

      const { choiceId } = action.payload as { choiceId?: string };
      const event = draft.activeEvent;

      // 1. Handle Choice Selection
      if (choiceId && event.choices) {
        const choice = event.choices.find((c) => c.id === choiceId);
        if (choice) {
          // Deduct Cost
          if (choice.cost) {
            const costResource = choice.cost.resource as keyof GameState['resources'];
            if (draft.resources[costResource] >= choice.cost.amount) {
              draft.resources[costResource] -= choice.cost.amount;
            } else {
              // Should have been disabled in UI, but safety check
              addLog(`Not enough ${choice.cost.resource} to ${choice.label}`, 'warning');
              return;
            }
          }

          // Apply Effects
          if (choice.effects) {
            Object.entries(choice.effects).forEach(([key, val]) => {
              const resKey = key as keyof GameState['resources'];
              if (typeof val === 'number') {
                // Check if resource exists on draft.resources to be safe
                if (draft.resources[resKey] !== undefined) {
                  draft.resources[resKey] += val;
                  // Clamp values
                  if (resKey === 'health')
                    draft.resources.health = Math.max(0, Math.min(100, draft.resources.health));
                  if (resKey === 'sanity')
                    draft.resources.sanity = Math.max(0, Math.min(100, draft.resources.sanity));
                  if (resKey === 'focus') draft.resources.focus = Math.max(0, 100); // Focus can go > 100? Assuming strictly managed elsewhere, but let's cap lower bound
                  if (resKey === 'suspicion')
                    draft.resources.suspicion = Math.max(
                      0,
                      Math.min(100, draft.resources.suspicion)
                    );
                }
              }
            });
          }

          // Log Result
          if (choice.log) {
            addLog(choice.log, 'story');
          }
        }
      }
      // 2. Handle Required Action Success (No choiceId)
      else if (event.requiredAction && event.successOutcome) {
        // Apply Success Effects
        if (event.successOutcome.effects) {
          Object.entries(event.successOutcome.effects).forEach(([key, val]) => {
            const resKey = key as keyof GameState['resources'];
            if (typeof val === 'number' && draft.resources[resKey] !== undefined) {
              draft.resources[resKey] += val;
              // Clamp
              if (resKey === 'health')
                draft.resources.health = Math.max(0, Math.min(100, draft.resources.health));
            }
          });
        }

        // Log Success
        if (event.successOutcome.log) {
          addLog(event.successOutcome.log, 'story');
        } else {
          // Fallback if no log
          addLog(`You successfully completed: ${event.title}`, 'story');
        }
      }

      // 3. Fallback / Legacy Handling (using generateResolutionLog for flavor if no explicit log)
      // If we didn't log yet (no choice log or success log), use generator
      // Actually, let's keep specific legacy handlers for now but move them to *after* generic handling
      // or integrate them.

      // Special Event Hooks (Legacy/Specific Logic)
      if (event.id === 'FUEL_CONTAM') {
        draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 35);
        addLog("A HAZMAT team is on its way. They'll be watching you closely.", 'warning');
      } else if (event.id === 'MGMT_PRESSURE') {
        draft.hfStats.compliancePressureTimer = 5 * 60 * 1000;
      }

      // Increment stats
      draft.stats.eventsResolved += 1;

      // Award generic XP if not specified in effects?
      // standard was +350. Let's add it if no effects defined to avoid double dipping?
      // Or just keep it as a bonus for resolving ANY event.
      // Let's reduce it to 50 if effects were applied, or keep 350. 350 is high.
      // Let's stick to 100 base for now + whatever effects gave.
      draft.resources.experience += 100;

      // Clear active event
      draft.activeEvent = null;
      break;
    }

    case 'TRIGGER_EVENT': {
      // Don't trigger if event already active
      if (draft.activeEvent) return;

      const { type: eventType, id: specificId } = action.payload;

      // Level gating check - don't spawn events if player level is too low
      // Create a minimal GameState-like object for the level check
      const stateForCheck = {
        resources: draft.resources,
        flags: draft.flags,
        inventory: draft.inventory,
      } as GameState;

      if (!canSpawnEventCategory(eventType, stateForCheck)) {
        // Event category is locked at this level - silently skip
        return;
      }

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

    case 'START_STANDARD_JOB': {
      if (draft.activeJob) {
        addLog('Existing work order still active. Complete or discard it first.', 'warning');
        return;
      }

      const template = jobsData[Math.floor(Math.random() * jobsData.length)];
      const duration = 120000 + Math.random() * 240000;

      draft.activeJob = {
        ...template,
        id: Math.random().toString(36).substr(2, 6),
        timeLeft: duration,
        totalTime: duration,
      } as JobCard;

      addLog(`Work Order ${draft.activeJob.id} initiated: ${draft.activeJob.title}`, 'info');
      break;
    }
  }
});
