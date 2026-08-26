import { produce } from 'immer';
import { eventsData } from '../data/events.ts';
import { getAllUnlockedFlags } from '../data/levelMilestones.ts';
import { calculateFocusModifier, resolveFocusSpend } from '../logic/focusSurcharge.ts';
import { calculateFocusCost } from '../services/CostCalculator.ts';
import { getLockedFeatureMessage, isActionUnlocked } from '../services/LevelManager.ts';
import { GameEvent, GameState, TabType } from '../types.ts';
import { AircraftAction, aircraftReducer } from './slices/aircraftSlice.ts';
import { aogReducer } from './slices/aogSlice.ts';
import { BackshopAction, backshopReducer } from './slices/backshopSlice.ts';
import { BulletinBoardAction, bulletinBoardReducer } from './slices/bulletinBoardSlice.ts';
import { ComplianceAction, complianceReducer } from './slices/complianceSlice.ts';
import { EncountersAction, encountersReducer } from './slices/encountersSlice.ts';
import { EventsAction, eventsReducer } from './slices/eventsSlice.ts';
import { HangarAction, hangarReducer } from './slices/hangarSlice.ts';
import { InventoryAction, inventoryReducer } from './slices/inventorySlice.ts';
import { OfficeAction, officeReducer } from './slices/officeSlice.ts';
import { PetAction, petReducer } from './slices/petSlice.ts';
import { ProcurementAction, procurementReducer } from './slices/procurementSlice.ts'; // Added
import { ProficiencyAction, proficiencyReducer } from './slices/proficiencySlice.ts';
import { ResourcesAction, resourcesReducer } from './slices/resourcesSlice.ts';
import { ShopAction, shopReducer } from './slices/shopSlice.ts';
import { TerminalLocationAction, terminalLocationReducer } from './slices/terminalLocationSlice.ts';
import { terminalReducer } from './slices/terminalSlice.ts';
import { timeReducer } from './slices/timeSlice.ts';
import {
  ROUTED_ACTIONS,
  INVENTORY_ACTIONS,
  PROFICIENCY_ACTIONS,
  EVENT_ACTIONS,
  BACKSHOP_ACTIONS,
  COMPLIANCE_ACTIONS,
  AIRCRAFT_ACTIONS,
  TERMINAL_LOCATION_ACTIONS,
  OFFICE_ACTIONS,
  HANGAR_ACTIONS,
  SHOP_ACTIONS,
  ENCOUNTERS_ACTIONS,
  PROCUREMENT_ACTIONS,
  BULLETIN_BOARD_ACTIONS,
  RESOURCE_ACTIONS,
  PET_ACTIONS,
  TERMINAL_ACTIONS,
  AOG_ACTIONS,
} from './routedActions.ts';

/**
 * Reducer Composer Pattern
 * Routes TICK and ACTION events to appropriate domain slices
 *
 * This is the orchestration layer that:
 * 1. Routes tick events to resourcesSlice for passive state updates
 * 2. Will route specific actions to domain slices (inventory, proficiency, etc.)
 * 3. Maintains compatibility with existing gameReducer patterns
 */

interface ReducerAction {
  type: string;
  payload?: unknown;
}

/**
 * Compose reducers for TICK events
 * Routes to appropriate slices for passive state updates
 */
export const composeTick = (
  state: GameState,
  delta: number,
  _activeTab: TabType // Future use: for tab-specific passive effects
): GameState => {
  return produce(state, (draft) => {
    // Route to resourcesSlice for passive resource updates
    const resourcesState = {
      resources: draft.resources,
      logs: draft.logs,
    };

    const updatedResources = resourcesReducer(resourcesState, {
      type: 'RESOURCES_TICK',
      payload: {
        delta,
        flags: draft.flags,
        hfStats: draft.hfStats,
        proficiency: draft.proficiency,
      },
    });

    draft.resources = updatedResources.resources;
    // Cast logs to preserve Immer draft types
    draft.logs = updatedResources.logs;

    // AOG Tick Processing
    if (draft.aog.active) {
      const aogState = {
        aog: draft.aog,
        resources: draft.resources,
        inventory: draft.inventory,
        logs: draft.logs,
      };

      const updatedAog = aogReducer(aogState, {
        type: 'AOG_TICK',
        payload: { now: Date.now() },
      });

      draft.aog = updatedAog.aog;
      // We don't update resources here as tick usually doesn't consume them,
      // but if we added passive drain we would.
      draft.logs = updatedAog.logs;
    }

    // Procurement Delivery Check (1% chance per tick to check, or every tick? let's do every tick as it's cheap)
    // Actually, checking orders every tick (100ms) might be spammy if we log every time?
    // The reducer only logs on actual delivery.
    const procurementState = {
      procurement: draft.procurement,
      resources: draft.resources,
      inventory: draft.inventory,
      logs: draft.logs,
    };
    const updatedProcurement = procurementReducer(procurementState, {
      type: 'CHECK_DELIVERIES',
      payload: { currentTime: Date.now() },
    } as ProcurementAction); // Cast as ProcurementAction since it's imported

    draft.procurement = updatedProcurement.procurement;
    draft.inventory = updatedProcurement.inventory;
    draft.logs = updatedProcurement.logs;

    // Toolroom Status Update
    if (Date.now() >= draft.toolroom.nextStatusChange) {
      // Cycle status: OPEN -> LUNCH -> OPEN -> CLOSED -> OPEN (simplified cycle)
      // Or random? Let's do a simple cycle based on current status.
      let nextStatus: 'OPEN' | 'CLOSED' | 'AUDIT' | 'LUNCH' = 'OPEN';
      let duration = 1000 * 60 * 60 * 4; // 4 hours default

      switch (draft.toolroom.status) {
        case 'OPEN': {
          // 30% chance lunch, 10% audit, 60% closed (night)
          const rand = Math.random();
          if (rand < 0.3) {
            nextStatus = 'LUNCH';
            duration = 1000 * 60 * 30;
          } // 30 min lunch
          else if (rand < 0.4) {
            nextStatus = 'AUDIT';
            duration = 1000 * 60 * 60;
          } // 1 hr audit
          else {
            nextStatus = 'CLOSED';
            duration = 1000 * 60 * 60 * 8;
          } // 8 hr night
          break;
        }
        case 'LUNCH':
          nextStatus = 'OPEN';
          duration = 1000 * 60 * 60 * 4;
          break;
        case 'AUDIT':
          nextStatus = 'OPEN';
          duration = 1000 * 60 * 60 * 4;
          break;
        case 'CLOSED':
          nextStatus = 'OPEN';
          duration = 1000 * 60 * 60 * 4;
          break;
      }

      const inventoryState = {
        inventory: draft.inventory,
        personalInventory: draft.personalInventory,
        rotables: draft.rotables,
        toolConditions: draft.toolConditions,
        flags: draft.flags,
        resources: draft.resources,
        hfStats: draft.hfStats,
        calibrationMinigame: draft.calibrationMinigame,
        activeEvent: draft.activeEvent,
        stats: draft.stats,
        logs: draft.logs,
        toolroom: draft.toolroom,
      };

      const updatedInventory = inventoryReducer(inventoryState, {
        type: 'UPDATE_TOOLROOM_STATUS',
        payload: { status: nextStatus, nextChange: Date.now() + duration },
      } as InventoryAction);

      draft.toolroom = updatedInventory.toolroom;
      draft.logs = updatedInventory.logs;
    }

    // Time Tracking
    const oldShiftCycle = draft.time?.shiftCycle || 1;

    if (draft.time) {
      draft.time = timeReducer(draft.time, {
        type: 'TIME_TICK',
        payload: { delta, now: Date.now() },
      });
    } else {
      // Initialize if missing (should be handled by initial state but safe guard)
      draft.time = timeReducer(undefined, {
        type: 'TIME_TICK',
        payload: { delta, now: Date.now() },
      });
    }

    // Check for Shift Change
    if (draft.time.shiftCycle > oldShiftCycle) {
      // Cycle Bulletin Board
      const { bulletinBoard } = bulletinBoardReducer(
        { bulletinBoard: draft.bulletinBoard } as GameState,
        { type: 'ROTATE_BULLETIN' }
      );
      draft.bulletinBoard = bulletinBoard;
    }

    // Pet Tick (Hunger & Movement)
    // We dispatch a pseudo-action or direct update? reducerComposer typically uses reducers.
    // Let's use the reducer with a tick action or check if moved.
    if (Math.random() < 0.05) {
      // 5% chance per tick to potentially move
      const petState = {
        pet: draft.pet,
        inventory: draft.inventory,
        resources: draft.resources,
        logs: draft.logs,
        activeEvent: draft.activeEvent,
      };
      // We can reuse the reducer logic for movement
      const updatedPet = petReducer(petState, { type: 'PET_RANDOM_MOVE' });
      draft.pet = updatedPet.pet;
    }
    // Periodic hunger increase (every 100 ticks ~ 10s? No, tick delta is passed, but we don't have accumulation here easily without state.
    // We'll just decrement slightly every tick if we want, or rely on random chance.
    if (Math.random() < 0.1) {
      draft.pet.hunger = Math.min(100, draft.pet.hunger + 0.05);
    }

    // Future slice integrations will be added here:
    // - Tick-based flag updates (fear timer, cooldowns)
    // - Passive income calculations
    // - Environmental effects
  });
};

export { ROUTED_ACTIONS };

/**
 * After a routed action runs, an active event whose requiredAction names
 * that action is satisfied. This is what makes timed tasks real: the
 * player has to do the work, not press a button on the event panel.
 *
 * Guard against recursion is the first statement: this helper dispatches
 * RESOLVE_EVENT back through composeAction, and must never re-enter itself
 * off the back of that dispatch (whether the resolution clears the event
 * outright or chains a fresh successor into activeEvent).
 */
const resolveRequiredAction = (state: GameState, action: ReducerAction): GameState => {
  if (action.type === 'RESOLVE_EVENT') return state;

  const event = state.activeEvent;
  if (!event || event.requiredAction !== action.type || !event.successOutcome) {
    return state;
  }

  // An umbrella action type (AIRCRAFT_ACTION) covers work of wildly
  // different weight: a 40-focus ETOPS check and a 5-focus cabin log read
  // are the same action type with a different payload. Where the event
  // names the sub-actions that count, the payload has to be one of them, or
  // the cheapest button on the panel would clear an airframe emergency.
  const subtypes = event.requiredActionSubtypes;
  if (subtypes && subtypes.length > 0) {
    const payload = action.payload as Record<string, unknown> | undefined;
    const dispatched = payload?.actionType;
    if (typeof dispatched !== 'string' || !subtypes.includes(dispatched)) {
      return state;
    }
  }

  return composeAction(state, {
    type: 'RESOLVE_EVENT',
    payload: { viaRequiredAction: true },
  });
};

/**
 * Actions the engine dispatches at itself rather than the player pressing a
 * button. They are never level-gated.
 */
const SYSTEM_ACTIONS = [
  'RESOURCES_TICK',
  'TIME_TICK',
  'AOG_TICK',
  'CHECK_DELIVERIES',
  'PET_RANDOM_MOVE',
  'UPDATE_TOOLROOM_STATUS',
  'ROTATE_BULLETIN',
];

/**
 * Actions a hazard with `tarmacActionsDisabled` shuts down: everything that
 * puts the technician outside on the ramp.
 */
const TARMAC_ACTIONS = [
  'MARSHALLING',
  'FOD_SWEEP',
  'AIRCRAFT_ACTION', // General aircraft actions (daily checks, etc) on tarmac
  'SERVICE_LAVATORY',
  'SCAVENGE_GALLEYS',
  'WATCH_RUNWAY',
  'DEICING', // If we had it
];

/**
 * The two reasons a dispatched action never reaches its slice: a hazard has
 * closed the tarmac, or the player is not cleared for it.
 *
 * Kept out of routeAction so composeAction can tell refused work from work
 * that happened. Refused work must not be charged focus.
 *
 * @returns the refusal state, or null when the action may proceed.
 */
const getBlockedState = (state: GameState, action: ReducerAction): GameState | null => {
  const activeHazards = state.activeHazards || [];
  let blockedReason: string | null = null;

  for (const hazard of activeHazards) {
    if (hazard.effects.tarmacActionsDisabled && TARMAC_ACTIONS.includes(action.type)) {
      blockedReason = `${hazard.name}: Tarmac Closed`;
    }
  }

  if (blockedReason) {
    return produce(state, (draft) => {
      draft.notificationQueue.push({
        id: `blocked-hazard-${Date.now()}`,
        title: 'ACTION SUSPENDED',
        message: blockedReason || 'Hazardous Conditions',
        variant: 'hazard',
        duration: 3000,
      });
    });
  }

  if (!SYSTEM_ACTIONS.includes(action.type) && !isActionUnlocked(action.type, state)) {
    // Action is locked - return state unchanged but add notification
    // Note: UI should prevent this from being called, this is a safety check and feedback mechanism
    console.warn(`[LevelManager] Action '${action.type}' blocked - player level too low`);

    return produce(state, (draft) => {
      const message = getLockedFeatureMessage('action', action.type, state);

      // Increment access violations
      if (draft.stats.accessViolations === undefined) {
        draft.stats.accessViolations = 0;
      }
      draft.stats.accessViolations += 1;
      const violations = draft.stats.accessViolations;

      // Add toast notification
      draft.notificationQueue.push({
        id: `blocked-${action.type}-${Date.now()}`,
        title: 'ACCESS DENIED',
        message: message,
        variant: 'danger',
        duration: 4000,
      });

      // Consequence Logic
      // 1. Logs
      if (violations === 3) {
        draft.logs.unshift({
          id: `violation-${Date.now()}`,
          text: 'SYSTEM ALERT: Repeated unauthorized access attempts detected. This incident has been logged.',
          type: 'warning',
          timestamp: Date.now(),
        });
      } else if (violations === 5) {
        draft.logs.unshift({
          id: `violation-${Date.now()}`,
          text: 'SECURITY NOTICE: Your terminal ID has been flagged for suspicious activity. Cease attempts immediately.',
          type: 'error',
          timestamp: Date.now(),
        });
      } else if (violations === 8) {
        draft.logs.unshift({
          id: `violation-${Date.now()}`,
          text: 'Intrusion protocols initializing. Trace program active. They are watching.',
          type: 'vibration',
          timestamp: Date.now(),
        });
        draft.resources.suspicion += 5;
      } else if (violations === 15) {
        draft.logs.unshift({
          id: `violation-${Date.now()}`,
          text: "*** CRITICAL VIOLATION *** Pattern analysis complete. User profile matches 'SUBVERSIVE ELEMENT'. Dispatching response.",
          type: 'error',
          timestamp: Date.now(),
        });
        draft.resources.suspicion += 10;
        draft.resources.sanity -= 5;
      } else if (violations === 20) {
        draft.logs.unshift({
          id: `violation-${Date.now()}`,
          text: "There is a knock at the door. It's too specific to be random. Don't answer it.",
          type: 'story',
          timestamp: Date.now(),
        });
        draft.resources.sanity -= 10;
      }

      const tryTriggerEvent = (eventId: string) => {
        if (!draft.activeEvent) {
          // Flatten eventsData to find the event
          const allEvents = Object.values(eventsData).flat() as GameEvent[];
          const event = allEvents.find((e) => e.id === eventId);
          if (event) {
            draft.activeEvent = {
              ...event,
              timeLeft: event.totalTime,
              // Ensure suitType is set if missing (default to NONE or leave undefined if optional)
            } as typeof draft.activeEvent;
            draft.eventTimestamps[eventId] = Date.now();
          }
        }
      };

      if (violations === 10) {
        tryTriggerEvent('SECURITY_VIOLATION_SCAN');
      } else if (violations === 20) {
        tryTriggerEvent('SUIT_INTERROGATION');
      }
    });
  }

  return null;
};

/**
 * Make the action's registered focus cost real, then price in the player's
 * condition.
 *
 * Every costed action has a price in BASE_FOCUS_COSTS and a `[COST: n FOCUS]`
 * label on its button, but only a handful of slices ever deducted anything —
 * the cost table was written, tested and never wired up. Charging the
 * shortfall here makes those authored numbers take effect without touching
 * fifty slice handlers, and is the only place fatigue and hazards can scale
 * an arbitrary action's cost.
 *
 * @param before - state as the action was dispatched
 * @param after - state the slice returned
 */
const chargeFocus = (before: GameState, after: GameState, action: ReducerAction): GameState => {
  if (!Number.isFinite(after.resources?.focus)) return after;

  const payload = action.payload as Record<string, unknown> | undefined;

  // resolveRequiredAction dispatches RESOLVE_EVENT back through composeAction
  // when an action satisfies an active event. The player pressed one button and
  // has already been charged for it; the resolution that follows is bookkeeping,
  // not a second action. A resolution the player picks off the event panel is a
  // real dispatch and is charged normally.
  if (payload?.viaRequiredAction === true) return after;

  const registeredCost = calculateFocusCost(action.type, before, payload);

  const modifier = calculateFocusModifier(before.hfStats?.fatigue, before.activeHazards || []);
  const spend = resolveFocusSpend(
    registeredCost,
    before.resources.focus,
    after.resources.focus,
    modifier
  );

  if (spend.total <= 0) return after;

  return produce(after, (draft) => {
    draft.resources.focus = Math.max(0, draft.resources.focus - spend.total);
  });
};

/**
 * Compose reducers for ACTION events
 * Routes specific actions to appropriate domain slices
 *
 * @param state - Current game state
 * @param action - Action to dispatch
 * @returns Updated game state
 */
export const composeAction = (state: GameState, action: ReducerAction): GameState => {
  // A refused action never ran, so it cannot have satisfied an active
  // event's requiredAction. Returning early (rather than falling through to
  // resolveRequiredAction) is what stops a level-gated or tarmac-closed
  // action from resolving the event for free, with no focus paid.
  const blocked = getBlockedState(state, action);
  if (blocked) return blocked;

  const routed = routeAction(state, action);

  // Focus is settled before the required-action check so that an event
  // resolved by this action is charged as itself, not as part of the action
  // that satisfied it.
  const charged = chargeFocus(state, routed, action);

  return resolveRequiredAction(charged, action);
};

/**
 * The routing logic composeAction wraps. Kept as a separate, non-exported
 * function so composeAction can apply the focus charge and
 * resolveRequiredAction uniformly to every routed action's result without
 * duplicating the routing itself.
 *
 * Assumes getBlockedState has already cleared the action.
 */
const routeAction = (state: GameState, action: ReducerAction): GameState => {
  // Route resource actions to resourcesSlice
  if (RESOURCE_ACTIONS.includes(action.type as (typeof RESOURCE_ACTIONS)[number])) {
    return produce(state, (draft) => {
      const resourcesState = {
        resources: draft.resources,
        logs: draft.logs,
      };

      const updated = resourcesReducer(resourcesState, {
        type: action.type,
        payload: action.payload,
      } as ResourcesAction); // Cast because we know it's a valid action in our slice due to the includes check

      draft.resources = updated.resources;
      draft.logs = updated.logs;
    });
  }
  // Route inventory actions to inventorySlice
  if (INVENTORY_ACTIONS.includes(action.type as (typeof INVENTORY_ACTIONS)[number])) {
    return produce(state, (draft) => {
      const inventoryState = {
        inventory: draft.inventory,
        personalInventory: draft.personalInventory,
        rotables: draft.rotables,
        toolConditions: draft.toolConditions,
        flags: {
          toolroomMasterPissed: draft.flags.toolroomMasterPissed,
          activeComponentFailure: draft.flags.activeComponentFailure,
        },
        resources: draft.resources,
        hfStats: {
          noiseExposure: draft.hfStats.noiseExposure,
          socialStress: draft.hfStats.socialStress,
          efficiencyBoost: draft.hfStats.efficiencyBoost,
          toolroomMasterCooldown: draft.hfStats.toolroomMasterCooldown,
        },
        calibrationMinigame: draft.calibrationMinigame,
        activeEvent: draft.activeEvent,
        stats: {
          rotablesRepaired: draft.stats.rotablesRepaired,
        },
        logs: draft.logs,
        toolroom: draft.toolroom, // Added toolroom state
      };

      const updated = inventoryReducer(inventoryState, {
        type: action.type,
        payload: action.payload as Record<string, unknown>,
      } as InventoryAction);

      // Map updated state back to draft
      draft.inventory = updated.inventory;
      draft.personalInventory = updated.personalInventory;
      draft.rotables = updated.rotables;
      draft.toolConditions = updated.toolConditions;
      draft.flags.toolroomMasterPissed = updated.flags.toolroomMasterPissed;
      draft.flags.activeComponentFailure = updated.flags.activeComponentFailure;
      draft.resources.alclad = updated.resources.alclad;
      draft.resources.titanium = updated.resources.titanium;
      draft.resources.fiberglass = updated.resources.fiberglass;
      draft.resources.rivets = updated.resources.rivets;
      draft.resources.mek = updated.resources.mek;
      draft.resources.credits = updated.resources.credits;
      draft.resources.suspicion = updated.resources.suspicion;
      draft.resources.sanity = updated.resources.sanity;
      draft.resources.experience = updated.resources.experience;
      draft.resources.focus = updated.resources.focus;
      draft.hfStats.noiseExposure = updated.hfStats.noiseExposure;
      draft.hfStats.socialStress = updated.hfStats.socialStress;
      draft.hfStats.efficiencyBoost = updated.hfStats.efficiencyBoost;
      draft.hfStats.toolroomMasterCooldown = updated.hfStats.toolroomMasterCooldown;
      draft.calibrationMinigame = updated.calibrationMinigame;
      if (updated.activeEvent !== undefined) {
        draft.activeEvent = updated.activeEvent as typeof draft.activeEvent;
      }
      draft.stats.rotablesRepaired = updated.stats.rotablesRepaired;
      draft.logs = updated.logs;
      draft.toolroom = updated.toolroom as typeof draft.toolroom; // Added
    });
  }

  // Route terminal commands to terminalSlice
  if (TERMINAL_ACTIONS.includes(action.type as (typeof TERMINAL_ACTIONS)[number])) {
    return produce(state, (draft) => {
      const terminalState = {
        archiveTerminal: draft.archiveTerminal,
        maintenanceTerminal: draft.maintenanceTerminal,
        resources: {
          suspicion: draft.resources.suspicion,
          sanity: draft.resources.sanity,
          experience: draft.resources.experience,
          kardexFragments: draft.resources.kardexFragments,
        },
        hfStats: {
          clearanceLevel: draft.hfStats.clearanceLevel,
        },
        logs: draft.logs,
        activeAircraft: draft.activeAircraft,
        flags: draft.flags, // Added
      };

      const terminalAction =
        action.type === 'ARCHIVE_ACTION'
          ? {
              type: 'ARCHIVE_COMMAND' as const,
              payload: action.payload as {
                command: string;
                triggerEvent: (type: string, id?: string) => void;
              },
            }
          : {
              type: 'MAINTENANCE_COMMAND' as const,
              payload: action.payload as { command: string },
            };

      const updated = terminalReducer(terminalState, terminalAction);

      draft.archiveTerminal = updated.archiveTerminal;
      draft.maintenanceTerminal = updated.maintenanceTerminal;
      draft.resources.suspicion = updated.resources.suspicion;
      draft.resources.sanity = updated.resources.sanity;
      draft.resources.experience = updated.resources.experience;
      draft.resources.kardexFragments = updated.resources.kardexFragments;
      draft.logs = updated.logs;
    });
  }

  // Route proficiency actions to proficiencySlice
  if (PROFICIENCY_ACTIONS.includes(action.type as (typeof PROFICIENCY_ACTIONS)[number])) {
    return produce(state, (draft) => {
      const proficiencyState = {
        proficiency: draft.proficiency,
        resources: {
          credits: draft.resources.credits,
          experience: draft.resources.experience,
          level: draft.resources.level,
        },
        inventory: draft.inventory,
        hfStats: {
          hfRecurrentDueDate: draft.hfStats.hfRecurrentDueDate,
        },
        logs: draft.logs,
      };

      const updated = proficiencyReducer(proficiencyState, {
        type: action.type,
        payload: action.payload as Record<string, unknown>,
      } as ProficiencyAction);

      // Map updated state back to draft
      draft.proficiency = updated.proficiency;
      draft.resources.credits = updated.resources.credits;
      draft.resources.experience = updated.resources.experience;
      draft.resources.level = updated.resources.level;
      draft.inventory = updated.inventory;
      draft.hfStats.hfRecurrentDueDate = updated.hfStats.hfRecurrentDueDate;
      draft.logs = updated.logs;

      // Apply milestone flags for ACKNOWLEDGE_LEVEL_UP
      // When a player confirms a level-up, ensure all flags unlocked up to
      // their current level are set in state (e.g., officeUnlocked at level 3).
      if (action.type === 'ACKNOWLEDGE_LEVEL_UP') {
        const flagsToUnlock = getAllUnlockedFlags(draft.resources.level);
        for (const flag of flagsToUnlock) {
          (draft.flags as unknown as Record<string, unknown>)[flag] = true;
        }
      }
    });
  }

  // Route event actions to eventsSlice
  if (EVENT_ACTIONS.includes(action.type as (typeof EVENT_ACTIONS)[number])) {
    return produce(state, (draft) => {
      const eventsState = {
        activeJob: draft.activeJob,
        activeEvent: draft.activeEvent,
        stats: draft.stats,
        resources: draft.resources, // Pass entire resources object
        anomalies: draft.anomalies,
        toolConditions: draft.toolConditions,
        inventory: draft.inventory,
        flags: draft.flags, // Pass entire flags object
        hfStats: draft.hfStats, // Pass entire hfStats object
        logs: draft.logs,
        rotables: draft.rotables,
        proficiency: draft.proficiency,
        journal: draft.journal,
        eventTimestamps: draft.eventTimestamps,
      };

      const updated = eventsReducer(eventsState, {
        type: action.type,
        payload: action.payload as Record<string, unknown>,
      } as EventsAction);

      // Map updated state back to draft
      draft.activeJob = updated.activeJob;
      draft.activeEvent = updated.activeEvent as typeof draft.activeEvent;
      draft.stats = updated.stats as typeof draft.stats;
      draft.resources = updated.resources as typeof draft.resources;
      draft.anomalies = updated.anomalies;
      draft.toolConditions = updated.toolConditions as typeof draft.toolConditions;
      draft.flags = updated.flags as typeof draft.flags;
      draft.hfStats = updated.hfStats as typeof draft.hfStats;
      draft.logs = updated.logs;
      draft.journal = updated.journal;
      draft.eventTimestamps = updated.eventTimestamps;
    });
  }

  // Route backshop actions to backshopSlice
  if (BACKSHOP_ACTIONS.includes(action.type as (typeof BACKSHOP_ACTIONS)[number])) {
    return produce(state, (draft) => {
      const backshopState = {
        resources: draft.resources,
        rotables: draft.rotables,
        anomalies: draft.anomalies,
        flags: draft.flags,
        hfStats: draft.hfStats,
        logs: draft.logs,
        stats: draft.stats,
        activeJob: draft.activeJob,
        activeEvent: draft.activeEvent,
      };

      const updated = backshopReducer(backshopState, {
        type: action.type,
        payload: action.payload as Record<string, unknown>,
      } as BackshopAction);

      // Map updated state back to draft
      draft.resources = updated.resources as typeof draft.resources;
      draft.rotables = updated.rotables;
      draft.anomalies = updated.anomalies;
      draft.flags = updated.flags as typeof draft.flags;
      draft.hfStats = updated.hfStats as typeof draft.hfStats;
      draft.logs = updated.logs;
      draft.stats = updated.stats as typeof draft.stats;
      draft.activeJob = updated.activeJob;
      if (updated.activeEvent !== undefined) {
        draft.activeEvent = updated.activeEvent as typeof draft.activeEvent;
      }
    });
  }

  // Route compliance actions to complianceSlice
  if (COMPLIANCE_ACTIONS.includes(action.type as (typeof COMPLIANCE_ACTIONS)[number])) {
    return produce(state, (draft) => {
      const complianceState = {
        resources: draft.resources,
        flags: draft.flags,
        hfStats: draft.hfStats,
        logs: draft.logs,
        stats: draft.stats,
        proficiency: draft.proficiency,
      };

      const updated = complianceReducer(complianceState, {
        type: action.type,
        payload: action.payload as Record<string, unknown>,
      } as ComplianceAction);

      // Map updated state back to draft
      draft.resources = updated.resources as typeof draft.resources;
      draft.flags = updated.flags as typeof draft.flags;
      draft.hfStats = updated.hfStats as typeof draft.hfStats;
      draft.logs = updated.logs;
      draft.stats = updated.stats as typeof draft.stats;
    });
  }

  // Route aircraft actions to aircraftSlice
  if (AIRCRAFT_ACTIONS.includes(action.type as (typeof AIRCRAFT_ACTIONS)[number])) {
    return produce(state, (draft) => {
      const aircraftState = {
        activeAircraft: draft.activeAircraft,
        resources: draft.resources,
        inventory: draft.inventory,
        logs: draft.logs,
        hfStats: draft.hfStats,
        personalInventory: draft.personalInventory,
        flags: draft.flags,
        activeScenario: draft.activeScenario,
        activeChemicalProcess: draft.activeChemicalProcess, // Added
        rotables: draft.rotables, // Added
      };

      const updated = aircraftReducer(aircraftState, {
        type: action.type,
        payload: action.payload as Record<string, unknown>,
      } as AircraftAction);

      draft.activeAircraft = updated.activeAircraft;
      draft.resources = updated.resources as typeof draft.resources;
      draft.inventory = updated.inventory;
      draft.logs = updated.logs;
      // draft.hfStats = updated.hfStats; // Aircraft reducer doesn't modify hfStats but needs it for state shape?
      // Actually aircraftReducer CAN modify hfStats (fearTimer, venomSurgeTimer)
      draft.hfStats = updated.hfStats as typeof draft.hfStats;
      draft.personalInventory = updated.personalInventory;
      draft.flags = updated.flags as typeof draft.flags;
      draft.activeScenario = updated.activeScenario; // Map back
    });
  }

  // Route terminal location actions to terminalLocationSlice
  if (
    TERMINAL_LOCATION_ACTIONS.includes(action.type as (typeof TERMINAL_LOCATION_ACTIONS)[number])
  ) {
    return produce(state, (draft) => {
      const terminalLocationState = {
        resources: draft.resources,
        flags: draft.flags,
        hfStats: draft.hfStats,
        logs: draft.logs,
        proficiency: draft.proficiency, // Added
      };

      const updated = terminalLocationReducer(terminalLocationState, {
        type: action.type,
        payload: action.payload as Record<string, unknown>,
      } as TerminalLocationAction);

      draft.resources = updated.resources as typeof draft.resources;
      draft.flags = updated.flags as typeof draft.flags;
      draft.hfStats = updated.hfStats as typeof draft.hfStats;
      draft.logs = updated.logs;
      draft.proficiency = updated.proficiency as typeof draft.proficiency; // Map back
    });
  }

  // Route office actions to officeSlice
  if (OFFICE_ACTIONS.includes(action.type as (typeof OFFICE_ACTIONS)[number])) {
    return produce(state, (draft) => {
      const officeState = {
        inventory: draft.inventory,
        resources: draft.resources,
        mail: draft.mail,
        flags: draft.flags,
        hfStats: draft.hfStats,
        logs: draft.logs,
        proficiency: draft.proficiency,
        stats: draft.stats,
        activeEvent: draft.activeEvent,
      };

      const updated = officeReducer(officeState, {
        type: action.type,
        payload: action.payload as Record<string, unknown>,
      } as OfficeAction);

      draft.inventory = updated.inventory;
      draft.resources = updated.resources as typeof draft.resources;
      draft.mail = updated.mail;
      draft.flags = updated.flags as typeof draft.flags;
      draft.hfStats = updated.hfStats as typeof draft.hfStats;
      draft.logs = updated.logs;
      draft.proficiency = updated.proficiency as typeof draft.proficiency;
      draft.stats = updated.stats as typeof draft.stats;
      if (updated.activeEvent !== undefined) {
        draft.activeEvent = updated.activeEvent as typeof draft.activeEvent;
      }
    });
  }

  // Route hangar actions to hangarSlice
  if (HANGAR_ACTIONS.includes(action.type as (typeof HANGAR_ACTIONS)[number])) {
    return produce(state, (draft) => {
      const hangarState = {
        resources: draft.resources,
        inventory: draft.inventory,
        toolConditions: draft.toolConditions,
        flags: draft.flags,
        hfStats: draft.hfStats,
        logs: draft.logs,
        stats: draft.stats,
        proficiency: draft.proficiency,
        activeEvent: draft.activeEvent,
      };

      const updated = hangarReducer(hangarState, {
        type: action.type,
        payload: action.payload as Record<string, unknown>,
      } as HangarAction);

      draft.resources = updated.resources as typeof draft.resources;
      draft.inventory = updated.inventory;
      draft.toolConditions = updated.toolConditions as typeof draft.toolConditions;
      draft.flags = updated.flags as typeof draft.flags;
      draft.hfStats = updated.hfStats as typeof draft.hfStats;
      draft.logs = updated.logs;
      draft.stats = updated.stats as typeof draft.stats;
      draft.proficiency = updated.proficiency as typeof draft.proficiency;
      if (updated.activeEvent !== undefined) {
        draft.activeEvent = updated.activeEvent as typeof draft.activeEvent;
      }
    });
  }

  // Route shop actions to shopSlice
  if (SHOP_ACTIONS.includes(action.type as (typeof SHOP_ACTIONS)[number])) {
    return produce(state, (draft) => {
      const shopState = {
        inventory: draft.inventory,
        toolConditions: draft.toolConditions,
        resources: draft.resources,
        vendingPrices: draft.vendingPrices,
        flags: draft.flags,
        personalInventory: draft.personalInventory,
        hfStats: draft.hfStats, // Added
        logs: draft.logs,
      };

      const updated = shopReducer(shopState, {
        type: action.type,
        payload: action.payload as Record<string, unknown>,
      } as ShopAction);

      draft.inventory = updated.inventory;
      draft.toolConditions = updated.toolConditions as typeof draft.toolConditions;
      draft.resources = updated.resources as typeof draft.resources;
      draft.vendingPrices = updated.vendingPrices as typeof draft.vendingPrices;
      draft.flags = updated.flags as typeof draft.flags;
      draft.personalInventory = updated.personalInventory;
      draft.hfStats = updated.hfStats as typeof draft.hfStats; // Map back
      draft.logs = updated.logs;
    });
  }

  // Route pet actions to petSlice
  if (PET_ACTIONS.includes(action.type as (typeof PET_ACTIONS)[number])) {
    return produce(state, (draft) => {
      const petState = {
        pet: draft.pet,
        inventory: draft.inventory,
        resources: draft.resources,
        logs: draft.logs,
        activeEvent: draft.activeEvent,
      };

      const updated = petReducer(petState, {
        type: action.type,
        payload: action.payload as Record<string, unknown>,
      } as PetAction);

      draft.pet = updated.pet;
      draft.inventory = updated.inventory;
      draft.resources = updated.resources;
      draft.logs = updated.logs;
      if (updated.activeEvent !== undefined) {
        draft.activeEvent = updated.activeEvent as typeof draft.activeEvent;
      }
    });
  }

  // Route encounters actions to encountersSlice
  if (ENCOUNTERS_ACTIONS.includes(action.type as (typeof ENCOUNTERS_ACTIONS)[number])) {
    return produce(state, (draft) => {
      const encountersState = {
        resources: draft.resources,
        flags: draft.flags,
        hfStats: draft.hfStats,
        logs: draft.logs,
        inventory: draft.inventory,
        activeEvent: draft.activeEvent,
      };

      const updated = encountersReducer(encountersState, {
        type: action.type,
        payload: action.payload as Record<string, unknown>,
      } as EncountersAction);

      draft.resources = updated.resources as typeof draft.resources;
      draft.flags = updated.flags as typeof draft.flags;
      draft.hfStats = updated.hfStats as typeof draft.hfStats;
      draft.logs = updated.logs;
      draft.inventory = updated.inventory;
      if (updated.activeEvent !== undefined) {
        draft.activeEvent = updated.activeEvent as typeof draft.activeEvent;
      }
    });
  }

  // Route AOG actions to aogSlice
  if (AOG_ACTIONS.includes(action.type as (typeof AOG_ACTIONS)[number])) {
    return produce(state, (draft) => {
      const aogState = {
        aog: draft.aog,
        resources: draft.resources,
        inventory: draft.inventory,
        logs: draft.logs,
      };

      const updated = aogReducer(aogState, {
        type: action.type,
        payload: action.payload as Record<string, unknown>,
      });

      draft.aog = updated.aog;
      draft.resources = updated.resources;
      draft.logs = updated.logs;
    });
  }

  // Route procurement actions to procurementSlice
  if (PROCUREMENT_ACTIONS.includes(action.type as (typeof PROCUREMENT_ACTIONS)[number])) {
    return produce(state, (draft) => {
      const procurementState = {
        procurement: draft.procurement,
        resources: draft.resources,
        inventory: draft.inventory,
        logs: draft.logs,
      };

      const updated = procurementReducer(procurementState, {
        type: action.type,
        payload: action.payload as Record<string, unknown>,
      } as ProcurementAction);

      draft.procurement = updated.procurement;
      draft.resources = updated.resources;
      draft.inventory = updated.inventory;
      draft.logs = updated.logs;
    });
  }

  // Route bulletin board actions to bulletinBoardSlice
  if (BULLETIN_BOARD_ACTIONS.includes(action.type as (typeof BULLETIN_BOARD_ACTIONS)[number])) {
    return produce(state, (draft) => {
      // Actually, let's look at the slice implementation again.
      // It uses produce(state, (draft) => ...).
      // So if I pass 'draft' here it might be double-drafting if I'm not careful,
      // but produce() handles nested drafts fine or I can just call the reducer logic directly if not using produce in the producer.
      // My slice USES produce. So I should probably pass the state, not the draft, OR simple call:

      const updated = bulletinBoardReducer(
        draft as unknown as GameState,
        {
          type: action.type,
          payload: action.payload,
        } as BulletinBoardAction
      );

      // Map updated state back.
      draft.bulletinBoard = updated.bulletinBoard;
    });
  }

  return state;
};
