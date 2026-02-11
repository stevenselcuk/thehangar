import { produce } from 'immer';
import { eventsData } from '../data/events.ts';
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

// Inventory action types handled by inventorySlice
const INVENTORY_ACTIONS = [
  'HARVEST_ROTABLE',
  'DISPOSE_ROTABLE',
  'REPAIR_ROTABLE',
  'GET_TOOLROOM_ITEM',
  'RETURN_TOOLROOM_ITEM',
  'DISPENSE_CONSUMABLE',
  'REGISTER_ROTABLE',
  'MIX_PAINT',
  'SONIC_CLEAN',
  'REPAIR_TOOL',
  'START_CALIBRATION_MINIGAME',
  'FINISH_CALIBRATION_MINIGAME',
  'ASK_MASTER_LORE',
  'TOOLROOM_MASTER_TALK',
  'SORT_HARDWARE',
] as const;

// Proficiency action types handled by proficiencySlice
const PROFICIENCY_ACTIONS = [
  'TAKE_MANDATORY_COURSE',
  'TAKE_AP_EXAM',
  'TAKE_AP_WRITTEN',
  'TAKE_AVIONICS_EXAM',
  'TAKE_EASA_EXAM',
  'START_EASA_MODULE',
  'CERTIFY_EASA_LICENSE',
  'TAKE_NDT_EXAM',
  'TAKE_NDT_SUBTASK_EXAM',
  'TAKE_TYPE_RATING',
  'UNLOCK_SKILL',
  'ACKNOWLEDGE_LEVEL_UP',
] as const;

// Event action types handled by eventsSlice
const EVENT_ACTIONS = ['COMPLETE_JOB', 'RESOLVE_EVENT', 'TRIGGER_EVENT'] as const;

// Backshop action types handled by backshopSlice
const BACKSHOP_ACTIONS = [
  'CLEAN_ULD',
  'XRAY_WELDS',
  'DECONSTRUCT_FDR',
  'DESCEND_INTO_SLS3',
  'ANALYZE_ANOMALY',
  'SCAVENGE_CORROSION_CORNER',
  'OBSERVE_CORROSION_CORNER',
  'WASH_CUSHIONS',
  'RENEW_DATABUS',
] as const;

// Compliance action types handled by complianceSlice
const COMPLIANCE_ACTIONS = [
  'CREATE_NON_ROUTINE_REPORT',
  'PERFORM_HFEC_SCAN',
  'PERFORM_BORESCOPE_INSPECTION',
  'REPORT_ANOMALOUS',
  'REPORT_MUNDANE',
  'FORGE_SAMPLE',
  'PERFORMANCE_REVIEW',
  'REQUEST_LEAVE',
  'ALTER_DOCUMENTS',
  'DESTROY_DOCUMENTS',
  'REVIEW_COMPLIANCE',
  'GIVE_URINE_SAMPLE',
  'MAINTAIN_LOW_PROFILE',
] as const;

// Aircraft action types handled by aircraftSlice
const AIRCRAFT_ACTIONS = [
  'GET_NEW_AIRCRAFT_TASK',
  'AIRCRAFT_ACTION',
  'SERVICE_LAVATORY',
  'SMALL_TALK_CABIN',
  'SMOKE_CIGARETTE',
  'DRINK_GALLEY_COFFEE',
  'SCAVENGE_GALLEYS',
  'WATCH_RUNWAY',
  'RESOLVE_SCENARIO', // Added
] as const;

// Terminal location action types handled by terminalLocationSlice
const TERMINAL_LOCATION_ACTIONS = [
  'WATCH_BOARDS',
  'GO_TERMINAL_RESTROOM',
  'EAT_TERMINAL_BURGER',
  'SLEEP_AT_GATE',
  'SMALL_TALK_PERSONNEL',
  'OFFER_ASSISTANCE',
  'USE_PAYPHONE',
  'TALK_TO_REGULAR',
  'RUMMAGE_LOST_FOUND',
  'CHECK_DELAYED_GATE',
  'INSPECT_VENDING_MACHINE',
] as const;

// Office action types handled by officeSlice
const OFFICE_ACTIONS = [
  'TOGGLE_AUTO_SRF',
  'CHECK_INTERNAL_MAIL',
  'CROSS_REFERENCE_MANIFESTS',
  'DIGITAL_STUDY',
  'CREATE_SRF',
  'SEARCH_MANUALS',
  'ASSEMBLE_PC',
  'UPGRADE_PC_GPU',
  'UPGRADE_PC_HDD',
  'NAP_TABLE',
  'READ_MAGAZINE',
  'REVIEW_SURVEILLANCE_LOGS',
  'DEEP_CLEAN_VENTS',
  'INSPECT_PRINTER',
  'READ_EMAIL',
  'TRIGGER_CRAZY_ENDING',
  'TRIGGER_GOVT_ENDING',
  'TRIGGER_ALIEN_ENDING',
] as const;

// Hangar action types handled by hangarSlice
const HANGAR_ACTIONS = [
  'LISTEN_RADIO',
  'FOD_SWEEP',
  'PERFORM_NDT',
  'ORBITAL_SAND',
  'TIGHTEN_BOLT',
  'BOEING_SUPPORT',
  'TOGGLE_NIGHT_CREW',
  'TOGGLE_TRANSIT_CHECK_DELEGATION',
  'LISTEN_FUSELAGE',
  'CHECK_REDACTED_LOGS',
  'MARSHALLING',
] as const;

// Shop action types handled by shopSlice
const SHOP_ACTIONS = [
  'BUY_SHOP_ITEM',
  'BUY_VENDING',
  'FLUCTUATE_PRICES',
  'BUY_VENDING_ITEM',
  'KICK_VENDING_MACHINE',
] as const;

// Encounters action types handled by encountersSlice
const ENCOUNTERS_ACTIONS = ['OBSERVE_SEDAN', 'JANITOR_INTERACTION'] as const;

// Procurement action types handled by procurementSlice
const PROCUREMENT_ACTIONS = [
  'PLACE_ORDER',
  'CANCEL_ORDER',
  'DELIVER_ORDER',
  'CHECK_DELIVERIES',
  'UNLOCK_CATALOGUE_LEVEL',
  'UNLOCK_CATALOGUE_LEVEL',
] as const;

// Bulletin Board action types handled by bulletinBoardSlice
const BULLETIN_BOARD_ACTIONS = ['ROTATE_BULLETIN'] as const;

// Resource action types handled by resourcesSlice
const RESOURCE_ACTIONS = ['LOG_FLAVOR'] as const;

// Pet action types handled by petSlice
const PET_ACTIONS = ['PET_CAT', 'FEED_CAT', 'PLAY_WITH_CAT', 'PET_RANDOM_MOVE'] as const;

/**
 * Compose reducers for ACTION events
 * Routes specific actions to appropriate domain slices
 *
 * @param state - Current game state
 * @param action - Action to dispatch
 * @returns Updated game state
 */
export const composeAction = (state: GameState, action: ReducerAction): GameState => {
  // Level gating check - block actions if player doesn't meet level requirements
  // Skip check for system actions and events that are already active
  const systemActions = [
    'RESOURCES_TICK',
    'TIME_TICK',
    'AOG_TICK',
    'CHECK_DELIVERIES',
    'PET_RANDOM_MOVE',
    'UPDATE_TOOLROOM_STATUS',
    'ROTATE_BULLETIN',
  ];

  if (!systemActions.includes(action.type) && !isActionUnlocked(action.type, state)) {
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
        resources: {
          alclad: draft.resources.alclad,
          titanium: draft.resources.titanium,
          fiberglass: draft.resources.fiberglass,
          rivets: draft.resources.rivets,
          mek: draft.resources.mek,
          credits: draft.resources.credits,
          suspicion: draft.resources.suspicion,
          sanity: draft.resources.sanity,
          experience: draft.resources.experience,
          focus: draft.resources.focus,
        },
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
  if (action.type === 'ARCHIVE_ACTION' || action.type === 'MAINTENANCE_ARCHIVE_ACTION') {
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
        hfStats: draft.hfStats, // Added
        personalInventory: draft.personalInventory,
        flags: draft.flags,
        activeScenario: draft.activeScenario, // Added
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
    });
  }

  // Route AOG actions to aogSlice
  if (
    [
      'ACCEPT_AOG_DEPLOYMENT',
      'START_AOG_ACTION',
      'RESOLVE_AOG_ACTION',
      'COMPLETE_AOG_DEPLOYMENT',
    ].includes(action.type)
  ) {
    return produce(state, (draft) => {
      const aogState = {
        aog: draft.aog,
        resources: draft.resources,
        logs: draft.logs,
      };

      const updated = aogReducer(aogState, {
        type: action.type,
        payload: action.payload as Record<string, unknown>,
      });

      draft.aog = updated.aog;
      draft.resources = updated.resources;
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

/**
 * Main composer entry point
 * Determines action type and routes to appropriate composer
 */
export const composeReducers = (
  state: GameState,
  action: ReducerAction,
  activeTab: TabType
): GameState => {
  let nextState = state;

  if (action.type === 'TICK') {
    const { delta } = action.payload as { delta: number };
    nextState = composeTick(state, delta, activeTab);
  } else if (action.type === 'ACTION') {
    nextState = composeAction(state, action.payload as ReducerAction);
  }

  // Check ending conditions
  return produce(nextState, (draft) => {
    if (!draft.flags.endingTriggered) {
      if (draft.flags.endingAlienConspiracyProgress >= 100) {
        draft.flags.endingTriggered = 'ALIEN';
      } else if (draft.flags.endingGovtConspiracyProgress >= 100) {
        draft.flags.endingTriggered = 'GOVT';
      }
    }
  });
};
