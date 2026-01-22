import { produce } from 'immer';

import { SYSTEM_LOGS } from '../data/flavor.ts';
import { mailData } from '../data/mail.ts';
import { getLevelUpLog, getXpForNextLevel } from '../logic/levels.ts';
import { GameState, Inventory, JobCard, LogMessage, MailMessage, TabType } from '../types.ts';
import { createJob } from './initialState.ts';

// Service layer imports
import { addLogToDraft } from '../services/logService.ts';
import { composeAction, composeTick } from './reducerComposer.ts';

// --- Logic from tickProcessor.ts ---
const processTick = (
  draft: GameState,
  delta: number,
  triggerEvent: (type: string, id?: string) => void,
  activeTab: TabType
): void => {
  const now = Date.now();

  // Helper function - uses centralized log service
  const addLog = (text: string, type: LogMessage['type'] = 'info') => {
    addLogToDraft(draft.logs, text, type, now);
  };

  const xpForNextLevel = getXpForNextLevel(draft.resources.level);
  if (draft.resources.experience >= xpForNextLevel) {
    draft.resources.level += 1;
    draft.resources.experience -= xpForNextLevel;
    draft.proficiency.skillPoints += 1;
    addLog(getLevelUpLog(draft.resources.level), 'levelup');
    // FIX: The onLevelUp callback is obsolete, side effects are handled in App.tsx
  }

  if (activeTab === TabType.BACKSHOPS) {
    draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 0.02 * (delta / 1000));
    if (Math.random() < 0.0005 * (delta / 1000)) {
      triggerEvent('eldritch_manifestation', 'THE_HUM');
    }
    if (Math.random() < 0.0003 * (delta / 1000) && draft.resources.suspicion > 40) {
      triggerEvent('audit', 'BACKSHOP_AUDIT_SUITS');
    }
    if (Math.random() < 0.0001 * (delta / 1000)) {
      triggerEvent('incident', 'CONTAINMENT_BREACH_ALERT');
    }
  }

  // Update rotables condition
  draft.rotables.forEach((r) => {
    r.condition = Math.max(0, r.condition - (0.005 * delta) / 1000);
  });

  const precisionTools = ['torquemeter', 'airDataTestBox', 'hfecDevice', 'rototestDevice'];
  precisionTools.forEach((t) => {
    if (draft.inventory[t as keyof Inventory] && draft.toolConditions[t] > 0) {
      draft.toolConditions[t] = Math.max(0, draft.toolConditions[t] - 0.05 * (delta / 1000));
    }
  });

  if (!draft.activeEvent) {
    if (draft.resources.suspicion > 30 && !draft.flags.suspicionEvent30Triggered) {
      triggerEvent('incident', 'SUS_MEMO');
      draft.flags.suspicionEvent30Triggered = true;
    } else if (draft.resources.suspicion > 60 && !draft.flags.suspicionEvent60Triggered) {
      triggerEvent('audit', 'AUDIT_INTERNAL');
      draft.flags.suspicionEvent60Triggered = true;
    } else if (draft.resources.suspicion > 90 && !draft.flags.suspicionEvent90Triggered) {
      triggerEvent('audit', 'AUDIT_SUITS');
      draft.flags.suspicionEvent90Triggered = true;
    }
    if (draft.resources.suspicion > 70 && Math.random() < 0.001 * (delta / 1000)) {
      triggerEvent('audit');
    }
    if (draft.resources.suspicion > 40 && Math.random() < 0.0001 * (delta / 1000)) {
      triggerEvent('audit', 'RANDOM_DRUG_TEST');
    }
    if (Math.random() < 0.00015 * (delta / 1000)) {
      triggerEvent('incident', 'OVERDUE_NDT_INSPECTION');
    }
    if (!draft.flags.activeComponentFailure) {
      for (const rotable of draft.rotables) {
        if (rotable.condition < 25 && Math.random() < 0.0005 * (delta / 1000)) {
          triggerEvent('component_failure', rotable.id);
          break;
        }
      }
    }
  }

  if (draft.flags.activeComponentFailure) {
    draft.resources.credits = Math.max(0, draft.resources.credits - 1.5 * (delta / 1000));
  }

  if (draft.flags.fuelContaminationRisk && Math.random() < 0.0002 * (delta / 1000)) {
    triggerEvent('accident', 'CATASTROPHIC_FAILURE');
    draft.flags.fuelContaminationRisk = false;
  }

  if (draft.hfStats.fearTimer > 0) {
    draft.hfStats.fearTimer -= delta;
    if (draft.hfStats.fearTimer <= 0) {
      draft.hfStats.fearTimer = 0;
      draft.flags.isAfraid = false;
      addLog(SYSTEM_LOGS.FEAR_RECEDE, 'info');
    }
  }

  if (draft.hfStats.scheduleCompressionTimer > 0) {
    draft.hfStats.scheduleCompressionTimer -= delta;
  }
  if (draft.hfStats.sanityShieldTimer > 0) {
    draft.hfStats.sanityShieldTimer -= delta;
  }
  if (draft.hfStats.foundLoopholeTimer > 0) {
    draft.hfStats.foundLoopholeTimer -= delta;
  }

  if (draft.hfStats.toolroomMasterCooldown > 0) {
    draft.hfStats.toolroomMasterCooldown -= delta;
    if (draft.hfStats.toolroomMasterCooldown <= 0) {
      draft.hfStats.toolroomMasterCooldown = 0;
      draft.flags.toolroomMasterPissed = false;
      addLog(SYSTEM_LOGS.MASTER_CALM, 'info');
    }
  }

  if (draft.hfStats.efficiencyBoost > 0) {
    draft.hfStats.efficiencyBoost -= delta;
    if (draft.hfStats.efficiencyBoost <= 0) {
      draft.hfStats.efficiencyBoost = 0;
      addLog('The efficiency boost from your precise calibration has worn off.', 'info');
    }
  }

  if (draft.hfStats.venomSurgeTimer > 0) {
    draft.hfStats.venomSurgeTimer -= delta;
    if (draft.hfStats.venomSurgeTimer <= 0) {
      draft.hfStats.venomSurgeTimer = 0;
      draft.flags.venomSurgeActive = false;
      addLog('The chemical enhancement from the Venom Surge has faded.', 'info');
    }
  }

  if (draft.flags.isHallucinating) {
    draft.resources.focus = Math.max(0, draft.resources.focus - 5.0 * (delta / 1000));
  }

  let sanityDrain = 0;
  if (draft.flags.isAfraid) sanityDrain += 0.5;
  if (draft.proficiency.unlocked.includes('steadyNerves')) sanityDrain *= 0.9;
  if (draft.hfStats.sanityShieldTimer > 0) sanityDrain = 0; // Sanity shield active
  draft.resources.sanity = Math.max(0, draft.resources.sanity - sanityDrain * (delta / 1000));

  if (draft.hfStats.janitorCooldown > 0) {
    draft.hfStats.janitorCooldown -= delta;
  } else if (!draft.flags.janitorPresent && Math.random() < 0.0002 * (delta / 1000)) {
    draft.flags.janitorPresent = true;
    addLog(SYSTEM_LOGS.JANITOR_APPEARS, 'story');
    draft.hfStats.janitorCooldown = 10 * 60 * 1000;
  }

  let focusRegen = (draft.flags.nightCrewActive ? 0.8 : 3.0) * (delta / 1000);
  if (draft.flags.isAfraid) focusRegen *= 0.5;
  if (draft.hfStats.efficiencyBoost > 0) focusRegen *= 1.2;
  draft.resources.focus = Math.min(100, draft.resources.focus + focusRegen);

  if (draft.flags.nightCrewActive) {
    let alcladGain = 4.0;
    let rivetGain = 9.0;
    let suspicionGain = 0.18;
    if (draft.proficiency.unlocked.includes('nightShiftSupervisor')) {
      alcladGain *= 1.1;
      rivetGain *= 1.1;
      suspicionGain *= 0.85;
    }
    draft.resources.alclad += alcladGain * (delta / 1000);
    draft.resources.rivets += rivetGain * (delta / 1000);
    draft.resources.suspicion = Math.min(
      100,
      draft.resources.suspicion + suspicionGain * (delta / 1000)
    );
  }

  if (draft.flags.transitCheckDelegationActive) {
    draft.resources.credits += 1.5 * (delta / 1000);
    draft.resources.experience += 5 * (delta / 1000);
    draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 0.05 * (delta / 1000));
  }

  if (draft.flags.autoSrfActive) {
    draft.resources.credits += 0.8 * (delta / 1000);
    draft.resources.experience += 2 * (delta / 1000);
    if (Math.random() < 0.0001 * (delta / 1000)) {
      addLog(
        'AUTOMATION ALERT: SRF form filed with a data discrepancy. An internal review has been triggered.',
        'warning'
      );
      triggerEvent('audit', 'AUDIT_INTERNAL');
    }
  }

  // Base passive income removed as per user request
  // draft.resources.credits += delta / 7000;
  // let baseXpGain = delta / 12000;
  // if (draft.proficiency.unlocked.includes('quickLearner')) baseXpGain *= 1.1;
  // draft.resources.experience += baseXpGain;

  if (draft.activeEvent && draft.activeEvent.type !== 'component_failure') {
    draft.activeEvent.timeLeft -= delta;
    if (draft.activeEvent.timeLeft <= 0) {
      if (draft.activeEvent.id === 'FUEL_CONTAM') {
        draft.flags.fuelContaminationRisk = true;
        addLog("You flushed the contaminated sample. Let's hope nobody finds out.", 'warning');
      }
      draft.resources.sanity -=
        draft.activeEvent.type === 'accident'
          ? 40
          : draft.activeEvent.suitType === 'THE_SUITS'
            ? 35
            : draft.activeEvent.type === 'eldritch_manifestation'
              ? 45
              : draft.activeEvent.type === 'canteen_incident'
                ? 25
                : 5;
      draft.resources.suspicion += draft.activeEvent.type === 'audit' ? 30 : 5;
      addLog(`SITUATION FAILED: ${draft.activeEvent.title}`, 'error');
      draft.activeEvent = null;
    }
  }

  if (draft.activeJob) {
    let timeDeduction = delta;
    if (draft.hfStats.scheduleCompressionTimer > 0) {
      timeDeduction *= 1.25; // Timer goes 25% faster
    }
    draft.activeJob.timeLeft -= timeDeduction;
    if (draft.activeJob.timeLeft <= 0) {
      addLog(`JOB EXPIRED: ${draft.activeJob.title}`, 'warning');
    }
  }

  const mailCooldown = 3 * 60 * 1000;
  if (
    draft.inventory.pcAssembled &&
    (!draft.eventTimestamps.lastMail || now - draft.eventTimestamps.lastMail > mailCooldown)
  ) {
    if (Math.random() < 0.05 * (delta / 1000)) {
      const unreadMailCount = draft.mail.filter((m) => !m.read).length;
      const availableMail = mailData.filter(
        (m) => !draft.mail.some((existing) => existing.subject === m.subject)
      );
      if (unreadMailCount < 5 && availableMail.length > 0) {
        const newMailTemplate = availableMail[Math.floor(Math.random() * availableMail.length)];
        const newMail: MailMessage = { ...newMailTemplate, id: `mail_${now}`, read: false };
        draft.mail.push(newMail);
        draft.eventTimestamps.lastMail = now;
      }
    }
  }

  draft.lastUpdate = now;
};

// --- Logic from actionProcessor.ts ---
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

// --- Reducer ---
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
  // Import/Export Actions
  | { type: 'IMPORT_STATE'; payload: { state: GameState } };

export const gameReducer = (state: GameState, action: GameReducerAction): GameState => {
  return produce(state, (draft) => {
    const triggerEvent = (_type: string, _id?: string) => {
      // This is a placeholder; actual dispatch happens in the hook/component
    };

    switch (action.type) {
      case 'TICK': {
        const { delta, triggerEvent, activeTab } = action.payload;

        // Route tick to resource slice for passive updates (focus regen, passive income, etc.)
        // This is done before processTick to update resources first
        const updatedState = composeTick(draft as unknown as GameState, delta, activeTab);
        Object.assign(draft, updatedState);

        processTick(draft, delta, triggerEvent, activeTab);

        if (draft.activeJob && draft.activeJob.timeLeft <= 0) {
          draft.activeJob = createJob();
        }
        if (!draft.activeEvent && Math.random() < 0.0003) {
          const eventTypes = ['accident', 'incident', 'eldritch_manifestation'];
          triggerEvent(eventTypes[Math.floor(Math.random() * eventTypes.length)]);
        }
        if (!draft.activeEvent && Math.random() < 0.0001) {
          triggerEvent('incident', 'FUEL_CONTAM');
        }

        // Random price fluctuation (approx every 3-4 minutes)
        if (Math.random() < 0.005 * (delta / 1000)) {
          // We need to dispatch an action here.
          // Since we are inside the reducer, we can't dispatch via Redux directly.
          // But `triggerEvent` is for eventsSlice.
          // However, `gameReducer` recursively calls `composeAction` if we were to invoke it?
          // No, `processTick` generally just modifies draft directly.
          // We can't easily call `shopReducer` from here without routing.

          // Actually, we are in the TICK handler of gameReducer.
          // We can just rely on the fact that `composeTick` handles passive updates,
          // but for random triggers that need to run logic, we might need a different approach
          // OR we modify the draft directly here if we duplicate logic (bad)
          // OR we dispatch a new action type in the next tick? (Impossible here)

          // Ideally `processTick` should return actions to queue?
          // Current architecture seems to rely on `triggerEvent` callback which probably dispatches 'TRIGGER_EVENT'.

          // For now, let's duplicate the simple dispatch logic pattern used elsewhere if any?
          // Unfortuantely `processTick` is void return.
          // But we passed `triggerEvent`.

          // Wait, `processTick` modifies `draft`.
          // We can manually invoke the shop logic on the draft?
          // No, imports would be circular if we import shopReducer here?
          // `reducerComposer` imports `shopReducer`. `gameReducer` imports `reducerComposer`.
          // So `gameReducer` -> `reducerComposer` -> `shopReducer`.
          // `gameReducer` does NOT import `shopReducer` directly.

          // We can assume `triggerEvent` might be capable of generic actions?
          // Looking at `useGameLoop.ts` (not visible but assumed), triggerEvent probably dispatches.

          // Let's use `triggerEvent` with a special type if possible?
          // The signature is `(type: string, id?: string) => void`.
          // If we pass `type='FLUCTUATE_PRICES'`, acts as an event?
          // Events reducer handles `TRIGGER_EVENT`.

          // Check `eventsSlice.ts`: does it handle generic actions? Likely no.

          // Alternative: Just modify the `draft.shop` state directly here?
          // But state is flattened in `draft`. `draft.vendingPrices` is accessible.

          // Let's implement the logic directly here for now to avoid architecture refactor,
          // OR better: use `composeAction` on the current draft?
          // We can import `composeAction` from `reducerComposer`.
          // `gameReducer` already imports `composeAction`.

          const state = draft as unknown as GameState;
          const updated = composeAction(state, { type: 'FLUCTUATE_PRICES' });
          // composeAction returns a new state, but we are in Immer draft.
          // Object.assign(draft, updated) might work?
          // Caveat: composeAction takes State and returns State.
          // If we pass draft (as State), Immer might complain if we try to mutate it inside composeAction?
          // Actually `composeAction` uses `produce` internally!
          // `produce(draft, ...)` => nested produce is fine in Immer.

          Object.assign(draft, updated);
        }
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
          'RESOLVE_AOG_ACTION',
          'COMPLETE_AOG_DEPLOYMENT',
        ];

        if (composedActions.includes(type)) {
          const updatedState = composeAction(draft as unknown as GameState, { type, payload });
          Object.assign(draft, updatedState);
          break;
        }

        // Route all other actions through handleGameAction
        handleGameAction(draft, type, payload || {}, createJob, triggerEvent);
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
