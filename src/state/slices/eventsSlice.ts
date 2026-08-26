import { produce } from 'immer';
import { anomaliesData } from '../../data/anomalies.ts';
import { eventsData } from '../../data/events.ts';
import { itemsData } from '../../data/items.ts';
import { ACTION_LOGS, EVENT_RESOLUTION_TEMPLATES, SYSTEM_LOGS } from '../../data/flavor.ts';
import { selectJobPool } from '../../data/jobs.ts';
import { hasSkill } from '../../services/CostCalculator.ts';
import { applySignoffReward } from '../../services/RewardCalculator.ts';
import { canSpawnEventCategory } from '../../services/LevelManager.ts';
import { addLogToDraft } from '../../services/logService.ts';
import { Anomaly, GameEvent, GameState, Inventory, JobCard, RotableItem } from '../../types.ts';
import { ROUTED_ACTIONS } from '../routedActions.ts';

/**
 * eventsSlice.ts - Job and Event Lifecycle Management
 *
 * Handles:
 * - Job completion with tool and rotable requirements, and rewards
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
  /**
   * Read-only here, but required: a work order can name a rotable type in
   * its `tools` line (the IDG swap does), and COMPLETE_JOB answers that
   * from the rotables the technician is actually holding.
   */
  rotables: GameState['rotables'];
  proficiency: GameState['proficiency'];
  eventTimestamps: GameState['eventTimestamps'];
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
 * The rotable types a work order's `tools` line is allowed to name.
 *
 * An IDG is not a tool the technician checks out and hands back — it is a
 * rotable, and rotables are already modelled as instances in
 * state.rotables, with their own serial numbers, condition and red tags.
 * Satisfying `tools: ['idg']` from an inventory boolean would put the same
 * fact in two places and let them disagree, so a tool id that names one of
 * these templates is resolved against the rotables array instead.
 */
const ROTABLE_TEMPLATES = new Map(itemsData.rotables.map((r) => [r.id, r]));

/** Whether this requirement line names a rotable type rather than a tool. */
export const isRotableRequirement = (toolId: string): boolean => ROTABLE_TEMPLATES.has(toolId);

/**
 * Whether the technician is holding a serviceable rotable of `toolId`'s type.
 *
 * Matched on label rather than part number: a scavenged or boneyard part
 * carries pn 'UNKNOWN' but keeps the template's label, and an untraceable
 * IDG still turns an engine. Red-tagged parts are excluded — a red tag is
 * the paperwork for "unserviceable" — as are parts worn to zero condition,
 * which is the same bar isToolServiceable holds tools to.
 */
export const hasServiceableRotable = (rotables: RotableItem[], toolId: string): boolean => {
  const template = ROTABLE_TEMPLATES.get(toolId);
  if (!template) return false;
  return (rotables || []).some(
    (r) => r.label === template.label && r.condition > 0 && !r.isRedTagged
  );
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
    requiredActionSubtypes: template.requiredActionSubtypes,
    requiredActionLabel: template.requiredActionLabel,
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

  if (!template) {
    if (import.meta.env.DEV && specificId) {
      console.error(
        `[eventsSlice] No event '${specificId}' in category '${eventType}'. ` +
          `This reference is dangling and will silently do nothing.`
      );
    }
    return null;
  }

  return {
    id: template.id,
    type: template.type,
    title: template.title,
    description: template.description,
    timeLeft: template.totalTime,
    totalTime: template.totalTime,
    choices: template.choices,
    requiredAction: template.requiredAction,
    requiredActionSubtypes: template.requiredActionSubtypes,
    requiredActionLabel: template.requiredActionLabel,
    successOutcome: template.successOutcome,
    failureOutcome: template.failureOutcome,
    suitType: template.suitType,
    imagePath: template.imagePath,
  };
};

/**
 * Resolves a successor id authored as either a bare id (looked up within
 * `fallbackType`, the category of the event being left) or a `category:id`
 * reference (looked up within the named category). The data authors use
 * the `category:id` form for most chain links (e.g. the SRF chain, and
 * LEAD_FAVOR -> RUSH_JOB_ACTIVE), since a successor commonly lives in a
 * different event category than its predecessor.
 */
const resolveSuccessorRef = (rawId: string, fallbackType: string): { type: string; id: string } => {
  const separatorIndex = rawId.indexOf(':');
  if (separatorIndex === -1) return { type: fallbackType, id: rawId };
  return { type: rawId.slice(0, separatorIndex), id: rawId.slice(separatorIndex + 1) };
};

/**
 * Generates a flavor log for event resolution based on state
 */
export const generateResolutionLog = (
  state: GameState | EventsSliceState,
  event: GameEvent
): string => {
  // Determine context
  const sanity = state.resources.sanity;
  const suspicion = state.resources.suspicion;
  let targetTone: 'MUNDANE' | 'BUREAUCRATIC' | 'ELDRITCH' = 'MUNDANE';

  if (sanity < 30) targetTone = 'ELDRITCH';
  else if (suspicion > 70) targetTone = 'BUREAUCRATIC';

  // Filter templates
  const validTemplates = EVENT_RESOLUTION_TEMPLATES.filter((t) => {
    // 1. Filter by Event Type if specified in template
    if (t.allowedEventTypes && !t.allowedEventTypes.includes(event.type)) {
      return false;
    }

    // 2. Check conditions
    if (t.conditions) {
      if (t.conditions.minSanity !== undefined && sanity < t.conditions.minSanity) return false;
      if (t.conditions.maxSanity !== undefined && sanity > t.conditions.maxSanity) return false;
      if (t.conditions.minSuspicion !== undefined && suspicion < t.conditions.minSuspicion)
        return false;
    }
    return true;
  });

  // Filter by tone if possible
  const toneTemplates = validTemplates.filter((t) => t.tone === targetTone);
  const pool = toneTemplates.length > 0 ? toneTemplates : validTemplates;

  if (pool.length === 0) return 'Event resolved.';

  const template = pool[Math.floor(Math.random() * pool.length)];
  return template.text;
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

      // Check tool availability and serviceability. A requirement naming a
      // rotable type is answered by the rotables array, not by inventory.
      for (const toolId of requiredTools) {
        if (isRotableRequirement(toolId)) {
          if (!hasServiceableRotable(draft.rotables, toolId)) {
            addLog(`ERROR: NO SERVICEABLE ${toolId.toUpperCase()} ON THE SHELF.`, 'error');
            return;
          }
          continue;
        }
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
        // Rotables wear through their own condition record; writing them a
        // toolConditions entry would invent the second source of truth this
        // check exists to avoid.
        if (isRotableRequirement(toolId)) continue;
        const degradation = degradeToolCondition(draft.toolConditions, toolId, hasHighTorque);
        if (degradation === 0) {
          addLog(`[High-Torque Methods] Tool ${toolId.toUpperCase()} condition preserved.`, 'info');
        }
      }

      // Award rewards. Rookie cards are apprentice work signed off by
      // somebody else, so their XP runs through applySignoffReward — the same
      // helper the instant task cards use. Standard cards come back untouched.
      const signoff = applySignoffReward(
        {
          xp: job.rewardXP,
          hours: calculateLogbookHours(job.totalTime),
          tier: job.tier,
        },
        draft.inventory
      );

      addLog(`Work Order ${job.id} Signed Off.`, 'story');
      draft.resources.credits += job.rewardXP / 2;
      draft.resources.experience += signoff.xp;

      // Log technical hours
      draft.resources.technicalLogbookHours += signoff.hours;
      addLog(`Logged ${signoff.hours} technical hour(s) for Work Order ${job.id}.`, 'info');

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
      let logAdded = false;
      let successor: { type: string; id: string } | null = null;

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
                  if (resKey === 'focus')
                    draft.resources.focus = Math.max(0, Math.min(100, draft.resources.focus));
                  if (resKey === 'suspicion')
                    draft.resources.suspicion = Math.max(
                      0,
                      Math.min(100, draft.resources.suspicion)
                    );
                }
              }
            });
          }

          // Persist narrative state
          if (choice.storyFlag) {
            draft.flags.storyFlags[choice.storyFlag.key] = choice.storyFlag.value;
          }

          // Capture the authored successor, if any, while the choice is in scope.
          if (choice.event) {
            successor = resolveSuccessorRef(choice.event.id, choice.event.type);
          } else if (choice.nextEventId) {
            successor = resolveSuccessorRef(choice.nextEventId, event.type);
          }

          // Log Result
          if (choice.log) {
            addLog(choice.log, 'story');
            logAdded = true;
          }
        }
      }
      // 2. Handle Required Action Success (No choiceId)
      else if (event.requiredAction && event.successOutcome && action.payload?.viaRequiredAction) {
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

        if (event.successOutcome.storyFlag) {
          draft.flags.storyFlags[event.successOutcome.storyFlag.key] =
            event.successOutcome.storyFlag.value;
        }

        // Capture the authored successor, if any.
        if (event.successOutcome.event) {
          successor = resolveSuccessorRef(
            event.successOutcome.event.id,
            event.successOutcome.event.type
          );
        } else if (event.successOutcome.nextEventId) {
          successor = resolveSuccessorRef(event.successOutcome.nextEventId, event.type);
        }

        // Log Success
        if (event.successOutcome.log) {
          addLog(event.successOutcome.log, 'story');
          logAdded = true;
        } else {
          addLog(`You successfully completed: ${event.title}`, 'story');
          logAdded = true;
        }
      }

      // A requiredAction event that wasn't resolved through a valid choice
      // or the internal viaRequiredAction dispatch is not actually
      // resolved: bare RESOLVE_EVENT clicks (or a stray dispatch with no
      // payload) must not fall through to the legacy fallback below and
      // clear it for free.
      //
      // The exception is an event whose requiredAction names something the
      // composer cannot route. There is then no action the player could
      // ever perform to satisfy it, so holding the event open would make it
      // an unwinnable, guaranteed timeout. Such an event falls through to
      // the legacy resolution instead, matching the DISCARD affordance
      // ActionPanel renders for it. This is a structural guard against bad
      // authoring, not a resolution path any correct event should take.
      if (event.requiredAction && ROUTED_ACTIONS.has(event.requiredAction) && !logAdded) {
        return;
      }

      // 3. Fallback / Legacy Handling
      //
      // A component failure is deliberately NOT cleared by this dispatch (see
      // the type check further down), so the generic "protocols were
      // effective, no further action required" line would flatly contradict
      // the "persists until rectified" warning the same dispatch is about to
      // add. The player dismissing the alert gets the warning only.
      if (!logAdded && event.type !== 'component_failure') {
        const resolutionLog = generateResolutionLog(draft as GameState, event);
        addLog(resolutionLog, 'story');
      }

      // Special Event Hooks (Legacy/Specific Logic)
      if (event.id === 'MGMT_PRESSURE') {
        draft.hfStats.compliancePressureTimer = 5 * 60 * 1000;
      } else if (event.id === 'CATERING_INCIDENT') {
        draft.resources.credits = Math.max(0, draft.resources.credits - 50);
        addLog('Refunds issued to hungry mechanics.', 'info');
      } else if (event.id === 'PIP_WARNING') {
        draft.flags.onPerformanceImprovementPlan = true;
        addLog('You have been placed on a Performance Improvement Plan.', 'error');
      } else if (event.id === 'SCHEDULE_COMPRESSION') {
        draft.hfStats.scheduleCompressionTimer = 30 * 60 * 1000;
        addLog('Schedule compressed. Efficiency targets increased.', 'warning');
      }

      // Clear active event UNLESS it is a component failure (which requires specific repair actions)
      // or if it explicitly says not to clear (not implemented yet, but safe default for failure)
      if (event.type !== 'component_failure') {
        // Increment stats & Award XP only if actually resolved
        draft.stats.eventsResolved += 1;
        draft.resources.experience += 100;

        // Chain to the authored successor, if any. activeEvent is a single
        // slot and a chain link is always an immediate successor, so no
        // queue is needed. Self-references are dropped to avoid a loop.
        let chained = null;
        if (successor && successor.id !== event.id) {
          chained = createEventFromTemplate(successor.type, successor.id);
          if (!chained && import.meta.env.DEV) {
            console.error(
              `[eventsSlice] Chain target '${successor.id}' (${successor.type}) does not exist.`
            );
          }
        }

        draft.activeEvent = chained;
        if (chained) {
          draft.eventTimestamps[chained.id] = Date.now();
        }
      } else {
        addLog(
          'Component failure persists until rectified. Check toolroom for replacement parts.',
          'warning'
        );
      }
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

      // Below STANDARD_JOB_MIN_LEVEL the standard pool is unworkable — every
      // card in it needs a tool the player has no source for — so a rookie
      // draws only rookie cards. Above it, both tiers are in the hat.
      const pool = selectJobPool(draft.resources.level);
      const template = pool[Math.floor(Math.random() * pool.length)];
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
