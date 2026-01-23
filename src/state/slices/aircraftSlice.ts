import { produce } from 'immer';
import { aircraftData } from '../../data/aircraft.ts';
import { ACTION_LOGS } from '../../data/flavor.ts';
import { addLogToDraft } from '../../services/logService.ts';
import { ActiveAircraft, AircraftType, GameState } from '../../types.ts';

/**
 * aircraftSlice.ts - Aircraft Operations Domain
 *
 * Handles:
 * - Aircraft task assignment (TRANSIT_CHECK, DAILY_CHECK, ETOPS_CHECK)
 * - Aircraft-specific actions (checks, log reading)
 * - Lavatory servicing
 * - Cabin interactions (small talk, smoking, coffee, scavenging)
 * - Runway observation
 *
 * State mutations:
 * - activeAircraft (assign/clear tasks)
 * - resources (credits, experience, sanity, technicalLogbookHours, suspicion, focus)
 * - inventory (foundRetiredIDCard, metallicSphere)
 * - flags (ndtFinding, venomSurgeActive, isAfraid)
 * - hfStats (fearTimer, venomSurgeTimer)
 * - logs array
 */

// ==================== TYPE DEFINITIONS ====================

export interface AircraftSliceState {
  activeAircraft: GameState['activeAircraft'];
  resources: GameState['resources'];
  inventory: GameState['inventory'];
  personalInventory: Record<string, number>;
  flags: GameState['flags'];
  hfStats: GameState['hfStats'];
  logs: GameState['logs'];
}

export type AircraftAction =
  | { type: 'GET_NEW_AIRCRAFT_TASK'; payload: Record<string, unknown> }
  | {
      type: 'AIRCRAFT_ACTION';
      payload: {
        aircraftId: string;
        actionType: string;
        triggerEvent?: (type: string, id?: string) => void;
      };
    }
  | { type: 'SERVICE_LAVATORY'; payload: Record<string, unknown> }
  | { type: 'SMALL_TALK_CABIN'; payload: { triggerEvent?: (type: string, id?: string) => void } }
  | { type: 'SMOKE_CIGARETTE'; payload: { triggerEvent?: (type: string, id?: string) => void } }
  | { type: 'DRINK_GALLEY_COFFEE'; payload: { triggerEvent?: (type: string, id?: string) => void } }
  | { type: 'SCAVENGE_GALLEYS'; payload: { triggerEvent?: (type: string, id?: string) => void } }
  | { type: 'WATCH_RUNWAY'; payload: Record<string, unknown> };

// ==================== REDUCER ====================

export const aircraftReducer = (
  state: AircraftSliceState,
  action: AircraftAction
): AircraftSliceState => {
  return produce(state, (draft) => {
    const addLog = (
      text: string,
      type: 'info' | 'warning' | 'error' | 'story' | 'levelup' | 'vibration' = 'info'
    ) => {
      addLogToDraft(draft.logs, text, type, Date.now());
    };

    switch (action.type) {
      case 'GET_NEW_AIRCRAFT_TASK': {
        if (draft.activeAircraft) break;

        const selectedAircraft = aircraftData[Math.floor(Math.random() * aircraftData.length)];

        const possibleTasks: ActiveAircraft['task'][] = ['TRANSIT_CHECK', 'DAILY_CHECK'];
        if (
          selectedAircraft.id === AircraftType.A330 ||
          selectedAircraft.id === AircraftType.B777_200ER
        ) {
          possibleTasks.push('ETOPS_CHECK');
        }

        const selectedTask = possibleTasks[Math.floor(Math.random() * possibleTasks.length)];

        draft.activeAircraft = { id: selectedAircraft.id, task: selectedTask };
        addLog(
          `ASSIGNMENT: Report to the ${selectedAircraft.name} to perform a ${selectedTask.replace(/_/g, ' ')}.`,
          'story'
        );
        break;
      }

      case 'AIRCRAFT_ACTION': {
        const { aircraftId, actionType, triggerEvent } = action.payload || {};
        const aircraft = aircraftData.find((a) => a.id === aircraftId);
        if (!aircraft) break;

        const baseRewards = {
          TRANSIT_CHECK: { xp: 120, credits: 25, alclad: 5, hours: 1 },
          DAILY_CHECK: { xp: 250, credits: 60, alclad: 10, hours: 2 },
          ETOPS_CHECK: { xp: 400, credits: 100, alclad: 0, suspicion: 5, hours: 4 },
          READ_FLIGHT_LOG: { xp: 60, credits: 0, alclad: 0, hours: 0 },
          READ_CABIN_LOG: { xp: 50, credits: 0, alclad: 0, hours: 0 },
        };

        const rewards = baseRewards[actionType as keyof typeof baseRewards];
        if (rewards) {
          draft.resources.experience += rewards.xp;
          draft.resources.credits += rewards.credits;
          draft.resources.alclad += rewards.alclad;
          if (rewards.hours > 0) {
            draft.resources.technicalLogbookHours += rewards.hours;
            addLog(
              `Logged ${rewards.hours} technical hour(s) working on the ${aircraft.name}.`,
              'info'
            );
          }
          if ('suspicion' in rewards && rewards.suspicion) {
            draft.resources.suspicion = Math.min(
              100,
              draft.resources.suspicion + rewards.suspicion
            );
          }
        }

        addLog(`${aircraft.name}: ${actionType.replace(/_/g, ' ')} complete.`, 'info');

        if (actionType === 'READ_FLIGHT_LOG' && aircraft.flightLogEntries.length > 0) {
          const logEntry =
            aircraft.flightLogEntries[Math.floor(Math.random() * aircraft.flightLogEntries.length)];
          addLog(logEntry, 'story');
        }

        if (actionType === 'READ_CABIN_LOG' && aircraft.cabinLogEntries.length > 0) {
          const logEntry =
            aircraft.cabinLogEntries[Math.floor(Math.random() * aircraft.cabinLogEntries.length)];
          addLog(logEntry, 'story');
        }

        if (['TRANSIT_CHECK', 'DAILY_CHECK', 'ETOPS_CHECK'].includes(actionType)) {
          const findingRoll = Math.random();
          // 10% chance for a special finding on a daily check of a composite aircraft
          if (
            actionType === 'DAILY_CHECK' &&
            (aircraft.id === AircraftType.A330 || aircraft.id === AircraftType.B777_200ER) &&
            findingRoll < 0.1 &&
            !draft.flags.ndtFinding
          ) {
            addLog(ACTION_LOGS.DAILY_CHECK_FINDING_DELAMINATION, 'vibration');
            draft.flags.ndtFinding = {
              type: 'Visual',
              severity: 'suspicious',
              description:
                "Carbon-fibre aircraft don't fail like metal. On composite aircraft like this one, damage doesn't appear as sudden cracks. Instead, composites delaminate — individual layers separate internally under stress. This is detectable through NDT. Metal often fails by crack growth you can't see until it's critical. Composites fail by layer degradation you can track. This needs to be reported.",
            };
            draft.resources.sanity -= 10;
            draft.resources.experience += 200;
          } else if (Math.random() < 0.25 && triggerEvent) {
            // 25% chance of an event on a check
            const eventChoice =
              aircraft.eventPool[Math.floor(Math.random() * aircraft.eventPool.length)];
            if (eventChoice) {
              triggerEvent(eventChoice.type, eventChoice.id);
            }
          }
          draft.activeAircraft = null;
          addLog(
            `Task complete. The ${aircraft.name} is released. Report back for your next assignment.`,
            'story'
          );
        }

        if (aircraft.isSuspicious) {
          draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 2);
          addLog(
            'Working on this aircraft makes the hairs on your neck stand up. You feel watched.',
            'vibration'
          );
        }

        break;
      }

      case 'SERVICE_LAVATORY': {
        draft.resources.credits += 40;
        draft.resources.experience += 80;
        draft.resources.sanity -= 5;
        const lavRoll = Math.random();
        if (lavRoll < 0.05 && !draft.inventory.foundRetiredIDCard) {
          addLog(ACTION_LOGS.SERVICE_LAVATORY_FIND_ID, 'story');
          draft.inventory.foundRetiredIDCard = true;
        } else if (lavRoll < 0.1 && !draft.inventory.metallicSphere) {
          addLog(ACTION_LOGS.SERVICE_LAVATORY_FIND_SPHERE, 'vibration');
          draft.inventory.metallicSphere = true;
        } else {
          addLog(ACTION_LOGS.SERVICE_LAVATORY_SUCCESS, 'info');
        }
        break;
      }

      case 'SMALL_TALK_CABIN': {
        draft.resources.sanity = Math.min(100, draft.resources.sanity + 8);
        const cabinLogs = [
          'SMALL_TALK_CABIN_1',
          'SMALL_TALK_CABIN_2',
          'SMALL_TALK_CABIN_3',
          'SMALL_TALK_CABIN_4',
        ];
        const logKey = cabinLogs[Math.floor(Math.random() * cabinLogs.length)];
        addLog(ACTION_LOGS[logKey], 'story');

        if (Math.random() < 0.1 && action.payload?.triggerEvent) {
          action.payload.triggerEvent('incident', 'CABIN_LOG_DISCREPANCY');
        }
        break;
      }

      case 'SMOKE_CIGARETTE': {
        const packCount = draft.personalInventory['winston_pack'] || 0;
        if (packCount > 0) {
          draft.personalInventory['winston_pack'] -= 1;

          // Halve stress and fatigue
          draft.hfStats.socialStress = Math.floor(draft.hfStats.socialStress / 2);
          draft.hfStats.fatigue = Math.floor(draft.hfStats.fatigue / 2);

          draft.resources.sanity = Math.min(100, draft.resources.sanity + 5);
          draft.resources.focus = Math.min(100, draft.resources.focus + 5);

          addLog('You light up a Winston Light. The harsh smoke clears your head.', 'story');

          if (Math.random() < 0.05 && action.payload?.triggerEvent) {
            action.payload.triggerEvent('incident', 'SMOKING_VIOLATION');
          }
        } else {
          addLog('You pat your pockets, but you are out of smokes.', 'warning');
        }
        break;
      }

      case 'DRINK_GALLEY_COFFEE': {
        draft.resources.focus = Math.min(100, draft.resources.focus + 10);
        draft.resources.sanity = Math.max(0, draft.resources.sanity - 5);
        addLog(ACTION_LOGS.DRINK_COFFEE, 'info');
        if (Math.random() < 0.05 && action.payload?.triggerEvent) {
          action.payload.triggerEvent('incident', 'CONTAMINATED_COFFEE');
        }
        break;
      }

      case 'SCAVENGE_GALLEYS': {
        draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 5);
        if (Math.random() > 0.3) {
          // 70% success
          addLog(ACTION_LOGS.SCAVENGE_SUCCESS_SANDWICH, 'story');
          draft.resources.credits += 15;
        } else {
          addLog(ACTION_LOGS.SCAVENGE_FAIL, 'info');
        }
        if (Math.random() < 0.1 && action.payload?.triggerEvent) {
          action.payload.triggerEvent('incident', 'CAUGHT_SCAVENGING');
        }
        break;
      }

      case 'WATCH_RUNWAY': {
        draft.resources.experience += 20;
        draft.resources.focus = Math.min(100, draft.resources.focus + 5);
        const watchLogs = ['WATCH_RUNWAY_1', 'WATCH_RUNWAY_2', 'WATCH_RUNWAY_3', 'WATCH_RUNWAY_4'];
        const logKey = watchLogs[Math.floor(Math.random() * watchLogs.length)];
        addLog(ACTION_LOGS[logKey], 'info');
        break;
      }
    }
  });
};
