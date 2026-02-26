import { produce } from 'immer';

import { GameState } from '../types.ts';
import { createJob } from './initialState.ts';

// Service layer imports
import { composeAction, composeTick } from './reducerComposer.ts';

// --- Logic from tickProcessor.ts ---
// --- Logic from tickProcessor.ts ---
import { processTick } from '../logic/tickLogic.ts';
import { JobCard, TabType } from '../types.ts';

// Legacy action handler - all actions now routed through domain slices
// This function remains as a fallback but should not be called in normal operation
const handleGameAction = (
  _draft: GameState,
  type: string,
  _payload: Record<string, unknown>,
  _createJob: () => JobCard,
  _triggerEvent: (type: string, id?: string) => void
): void => {
  console.warn(
    `[handleGameAction] Unhandled action type: ${type} - should be routed through a slice`
  );
};

export type GameReducerAction =
  | {
      type: 'TICK';
      payload: {
        delta: number;
        triggerEvent: (type: string, id?: string) => void;
        activeTab: TabType;
      };
    }
  | { type: 'ACTION'; payload: { type: string; payload?: Record<string, unknown> } }
  | { type: 'TRIGGER_EVENT'; payload: { type: string; id?: string } }
  // Dev Mode Actions
  | { type: 'UPDATE_RESOURCE'; payload: Partial<GameState['resources']> }
  | { type: 'UPDATE_INVENTORY'; payload: Partial<GameState['inventory']> }
  | { type: 'UPDATE_FLAGS'; payload: Partial<GameState['flags']> }
  | { type: 'UPDATE_HF_STATS'; payload: Partial<GameState['hfStats']> }
  | { type: 'UPDATE_PROFICIENCY'; payload: Partial<GameState['proficiency']> }
  | { type: 'UPDATE_STATS'; payload: Partial<GameState['stats']> }
  | { type: 'UPDATE_STATE'; payload: Partial<GameState> }
  // Import/Export Actions
  | { type: 'IMPORT_STATE'; payload: { state: GameState } }
  | { type: 'CLEAR_NOTIFICATIONS' };

export const gameReducer = (state: GameState, action: GameReducerAction): GameState => {
  return produce(state, (draft) => {
    // ...

    switch (action.type) {
      case 'CLEAR_NOTIFICATIONS': {
        draft.notificationQueue = [];
        break;
      }
      case 'TICK': {
        const { delta, triggerEvent, activeTab } = action.payload;

        const updatedState = composeTick(draft as unknown as GameState, delta, activeTab);
        Object.assign(draft, updatedState);

        // Delegate to extracted logic
        processTick(draft, delta, triggerEvent, activeTab);

        if (draft.activeJob && draft.activeJob.timeLeft <= 0) {
          // Already handled in processTick, but legacy safety?
          // processTick handles job replacement now.
        }
        if (!draft.activeEvent && Math.random() < 0.0003) {
          const eventTypes = ['accident', 'incident', 'eldritch_manifestation'];
          triggerEvent(eventTypes[Math.floor(Math.random() * eventTypes.length)]);
        }
        if (!draft.activeEvent && Math.random() < 0.0001) {
          triggerEvent('incident', 'FUEL_CONTAM');
        }

        // Random price fluctuation logic removed (handled in processTick)

        break;
      }

      case 'ACTION': {
        const { type, payload } = action.payload;

        // Handle IMPORT_STATE specially - it needs direct state replacement
        if (type === 'IMPORT_STATE' && payload?.state) {
          const importedState = payload.state as GameState;

          // Replace all state except runtime-specific fields
          Object.assign(draft, importedState);

          // Reset runtime-only fields that shouldn't persist
          draft.activeEvent = null;
          draft.activeHazards = [];
          draft.activeScenario = null;
          draft.calibrationMinigame = { active: false, toolId: null, toolLabel: null };
          draft.lastUpdate = Date.now();

          break;
        }

        // Handle Spam Penalty globally
        if (type === 'ACTION_SPAM_PENALTY') {
          draft.resources.health = Math.max(0, draft.resources.health - 25);
          draft.resources.focus = Math.max(0, draft.resources.focus - 50);
          draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 75);
          draft.notificationQueue.push({
            id: `spam-penalty-${Date.now()}`,
            title: 'SYSTEM OVERLOAD',
            message: 'Excessive rapid requests detected. Neural feedback loop engaged.',
            variant: 'hazard',
            duration: 8000,
          });
          break;
        }

        // Route actions through composer first
        const composedActions = [
          'ARCHIVE_ACTION',
          'MAINTENANCE_ARCHIVE_ACTION',
          'COMPLETE_JOB',
          'RESOLVE_EVENT',
          'TRIGGER_EVENT',
          'CLEAN_ULD',
          'XRAY_WELDS',
          'DECONSTRUCT_FDR',
          'DESCEND_INTO_SLS3',
          'ANALYZE_ANOMALY',
          'SCAVENGE_CORROSION_CORNER',
          'OBSERVE_CORROSION_CORNER',
          'WASH_CUSHIONS',
          'RENEW_DATABUS',
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
          'GET_NEW_AIRCRAFT_TASK',
          'AIRCRAFT_ACTION',
          'SERVICE_LAVATORY',
          'SMALL_TALK_CABIN',
          'SMOKE_CIGARETTE',
          'DRINK_GALLEY_COFFEE',
          'SCAVENGE_GALLEYS',
          'WATCH_RUNWAY',
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
          'BUY_SHOP_ITEM',
          'BUY_VENDING',
          'OBSERVE_SEDAN',
          'JANITOR_INTERACTION',
          'GET_TOOLROOM_ITEM',
          'ASK_MASTER_LORE',
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
          // Inventory actions (inventorySlice)
          'HARVEST_ROTABLE',
          'DISPOSE_ROTABLE',
          'REPAIR_ROTABLE',
          'DISPENSE_CONSUMABLE',
          'REGISTER_ROTABLE',
          'MIX_PAINT',
          'SONIC_CLEAN',
          'REPAIR_TOOL',
          'START_CALIBRATION_MINIGAME',
          'FINISH_CALIBRATION_MINIGAME',
          'TOOLROOM_MASTER_TALK',
          // AOG Actions
          'ACCEPT_AOG_DEPLOYMENT',
          'START_AOG_ACTION',
          'RESOLVE_AOG_ACTION',
          'COMPLETE_AOG_DEPLOYMENT',
          // Procurement Actions
          'PLACE_ORDER',
          'CANCEL_ORDER',
          'DELIVER_ORDER',
          'CHECK_DELIVERIES',
          'UNLOCK_CATALOGUE_LEVEL',
          // Backroom Actions
          'BUY_VENDING_ITEM',
          'RUMMAGE_SHELVES',
          'KICK_VENDING_MACHINE',
          // Office
          'READ_EMAIL',
          // Resources
          'LOG_FLAVOR',
          // Pet
          'PET_CAT',
          'FEED_CAT',
          'PLAY_WITH_CAT',
          'PET_RANDOM_MOVE',
          'SORT_HARDWARE',
          'RESOLVE_SCENARIO', // Added
          // Aircraft/Maintenance Additions
          'START_CHEMICAL_PROCESS',
          'PERFORM_CHEMICAL_STEP',
          'CHECK_CURE_PROGRESS',
          'RESEARCH_COMPONENT_HISTORY',
          'FABRICATE_PAPERWORK',
          'DOWNLOAD_DATA',
          'ANALYZE_DATA',
        ];

        if (composedActions.includes(type)) {
          const updatedState = composeAction(draft as unknown as GameState, { type, payload });
          Object.assign(draft, updatedState);
          break;
        }

        // Route all other actions through handleGameAction
        // triggerEvent is passed via payload from App.tsx onAction wrapper
        const triggerFn = (payload?.triggerEvent as (t: string, id?: string) => void) || (() => {});
        handleGameAction(draft, type, payload || {}, createJob, triggerFn);
        break;
      }
      case 'TRIGGER_EVENT': {
        // Route to eventsSlice via composer
        const updated = composeAction(draft as unknown as GameState, {
          type: 'TRIGGER_EVENT',
          payload: action.payload,
        });
        Object.assign(draft, updated);
        break;
      }
      // Dev Mode Actions - Direct state manipulation for debugging
      case 'UPDATE_RESOURCE': {
        Object.assign(draft.resources, action.payload);
        break;
      }
      case 'UPDATE_INVENTORY': {
        Object.assign(draft.inventory, action.payload);
        break;
      }
      case 'UPDATE_FLAGS': {
        Object.assign(draft.flags, action.payload);
        break;
      }
      case 'UPDATE_HF_STATS': {
        Object.assign(draft.hfStats, action.payload);
        break;
      }
      case 'UPDATE_PROFICIENCY': {
        Object.assign(draft.proficiency, action.payload);
        break;
      }
      case 'UPDATE_STATS': {
        Object.assign(draft.stats, action.payload);
        break;
      }
      case 'UPDATE_STATE': {
        // Generic state update for Dev Mode
        // BE CAREFUL: This does a shallow merge at the root level, so if you update 'pet',
        // you must provide the ENTIRE 'pet' object if you don't want to lose data.
        Object.assign(draft, action.payload);
        break;
      }
      // Import/Export Actions
      case 'IMPORT_STATE': {
        // Import a complete game state from import/export
        // Preserve runtime-only fields that shouldn't be imported
        const importedState = action.payload.state;

        // Replace all state except runtime-specific fields
        Object.assign(draft, importedState);

        // Reset runtime-only fields that shouldn't persist
        draft.activeEvent = null;
        draft.activeHazards = [];
        draft.activeScenario = null;
        draft.calibrationMinigame = { active: false, toolId: null, toolLabel: null };
        draft.lastUpdate = Date.now();

        break;
      }
    }
  });
};
