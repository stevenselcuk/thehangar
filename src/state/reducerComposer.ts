import { produce } from 'immer';
import { GameState, TabType } from '../types.ts';
import { AircraftAction, aircraftReducer } from './slices/aircraftSlice.ts';
import { BackshopAction, backshopReducer } from './slices/backshopSlice.ts';
import { ComplianceAction, complianceReducer } from './slices/complianceSlice.ts';
import { EncountersAction, encountersReducer } from './slices/encountersSlice.ts';
import { EventsAction, eventsReducer } from './slices/eventsSlice.ts';
import { HangarAction, hangarReducer } from './slices/hangarSlice.ts';
import { InventoryAction, inventoryReducer } from './slices/inventorySlice.ts';
import { OfficeAction, officeReducer } from './slices/officeSlice.ts';
import { ProficiencyAction, proficiencyReducer } from './slices/proficiencySlice.ts';
import { resourcesReducer } from './slices/resourcesSlice.ts';
import { ShopAction, shopReducer } from './slices/shopSlice.ts';
import { TerminalLocationAction, terminalLocationReducer } from './slices/terminalLocationSlice.ts';
import { terminalReducer } from './slices/terminalSlice.ts';

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
    draft.logs = updatedResources.logs as typeof draft.logs;

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
  'DISPENSE_CONSUMABLE',
  'REGISTER_ROTABLE',
  'MIX_PAINT',
  'SONIC_CLEAN',
  'REPAIR_TOOL',
  'START_CALIBRATION_MINIGAME',
  'FINISH_CALIBRATION_MINIGAME',
  'ASK_MASTER_LORE',
  'TOOLROOM_MASTER_TALK',
] as const;

// Proficiency action types handled by proficiencySlice
const PROFICIENCY_ACTIONS = [
  'TAKE_MANDATORY_COURSE',
  'TAKE_AP_EXAM',
  'TAKE_AVIONICS_EXAM',
  'TAKE_EASA_EXAM',
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
] as const;

// Shop action types handled by shopSlice
const SHOP_ACTIONS = ['BUY_SHOP_ITEM', 'BUY_VENDING'] as const;

// Encounters action types handled by encountersSlice
const ENCOUNTERS_ACTIONS = ['OBSERVE_SEDAN', 'JANITOR_INTERACTION'] as const;

/**
 * Compose reducers for ACTION events
 * Routes specific actions to appropriate domain slices
 *
 * @param state - Current game state
 * @param action - Action to dispatch
 * @returns Updated game state
 */
export const composeAction = (state: GameState, action: ReducerAction): GameState => {
  // Route inventory actions to inventorySlice
  if (INVENTORY_ACTIONS.includes(action.type as (typeof INVENTORY_ACTIONS)[number])) {
    return produce(state, (draft) => {
      const inventoryState = {
        inventory: draft.inventory,
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
      };

      const updated = inventoryReducer(inventoryState, {
        type: action.type,
        payload: action.payload as Record<string, unknown>,
      } as InventoryAction);

      // Map updated state back to draft
      draft.inventory = updated.inventory;
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
      draft.logs = updated.logs as typeof draft.logs;
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
      draft.logs = updated.logs as typeof draft.logs;
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
      draft.logs = updated.logs as typeof draft.logs;
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
      draft.logs = updated.logs as typeof draft.logs;
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
      draft.logs = updated.logs as typeof draft.logs;
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
      draft.logs = updated.logs as typeof draft.logs;
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
        stats: draft.stats,
        flags: draft.flags,
      };

      const updated = aircraftReducer(aircraftState, {
        type: action.type,
        payload: action.payload as Record<string, unknown>,
      } as AircraftAction);

      draft.activeAircraft = updated.activeAircraft;
      draft.resources = updated.resources as typeof draft.resources;
      draft.inventory = updated.inventory;
      draft.logs = updated.logs as typeof draft.logs;
      draft.stats = updated.stats as typeof draft.stats;
      draft.flags = updated.flags as typeof draft.flags;
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
      };

      const updated = terminalLocationReducer(terminalLocationState, {
        type: action.type,
        payload: action.payload as Record<string, unknown>,
      } as TerminalLocationAction);

      draft.resources = updated.resources as typeof draft.resources;
      draft.flags = updated.flags as typeof draft.flags;
      draft.hfStats = updated.hfStats as typeof draft.hfStats;
      draft.logs = updated.logs as typeof draft.logs;
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
      };

      const updated = officeReducer(officeState, {
        type: action.type,
        payload: action.payload as Record<string, unknown>,
      } as OfficeAction);

      draft.inventory = updated.inventory;
      draft.resources = updated.resources as typeof draft.resources;
      draft.mail = updated.mail as typeof draft.mail;
      draft.flags = updated.flags as typeof draft.flags;
      draft.hfStats = updated.hfStats as typeof draft.hfStats;
      draft.logs = updated.logs as typeof draft.logs;
      draft.proficiency = updated.proficiency as typeof draft.proficiency;
      draft.stats = updated.stats as typeof draft.stats;
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
      draft.logs = updated.logs as typeof draft.logs;
      draft.stats = updated.stats as typeof draft.stats;
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
      draft.logs = updated.logs as typeof draft.logs;
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
      draft.logs = updated.logs as typeof draft.logs;
      draft.inventory = updated.inventory;
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
  if (action.type === 'TICK') {
    const { delta } = action.payload as { delta: number };
    return composeTick(state, delta, activeTab);
  }

  if (action.type === 'ACTION') {
    return composeAction(state, action);
  }

  // For non-composed actions, return state unchanged
  // (they will be handled by the main gameReducer)
  return state;
};
