import { trainingData } from '../data/training.ts';
import { GameState, Inventory } from '../types.ts';

export const BASE_FOCUS_COSTS: Record<string, number> = {
  CLEAN_ULD: 40,
  XRAY_WELDS: 50,
  DECONSTRUCT_FDR: 100,

  TAKE_EXAM: 30,

  DESCEND_INTO_SLS3: 25,
  OBSERVE_CORROSION_CORNER: 10,
  SCAVENGE_CORROSION_CORNER: 40,

  PERFORM_HFEC_SCAN: 25,
  PERFORM_BORESCOPE_INSPECTION: 30,
  PERFORM_DYE_PENETRANT: 15,
  QUALIFY_DYE_PENETRANT: 10,
  CREATE_NON_ROUTINE_REPORT: 10,

  ARCHIVE_ACTION: 0,
  MAINTENANCE_ARCHIVE_ACTION: 0,

  REPORT_ANOMALOUS: 0,
  REPORT_MUNDANE: 10,
  FORGE_SAMPLE: 0,
  PERFORMANCE_REVIEW: 20,
  REQUEST_LEAVE: 0,
  ALTER_DOCUMENTS: 30,
  DESTROY_DOCUMENTS: 20,
  GIVE_URINE_SAMPLE: 5,
  REVIEW_COMPLIANCE: 15,

  WATCH_BOARDS: 5,
  GO_TERMINAL_RESTROOM: 0,
  EAT_TERMINAL_BURGER: 0,
  SLEEP_AT_GATE: 0,
  SMALL_TALK_PERSONNEL: 5,
  SMALL_TALK_CABIN: 5,
  OFFER_ASSISTANCE: 10,
  USE_PAYPHONE: 0,

  SMOKE_CIGARETTE: 0,
  DRINK_GALLEY_COFFEE: 0,
  SCAVENGE_GALLEYS: 5,
  WATCH_RUNWAY: 2,
  GET_NEW_AIRCRAFT_TASK: 2,
  SERVICE_LAVATORY: 15,

  AIRCRAFT_ACTION: 0,

  ANALYZE_ANOMALY: 60,
  OBSERVE_SEDAN: 10,
  JANITOR_INTERACTION: 0,

  UNLOCK_SKILL: 0,
  NAP_TABLE: 0,
  READ_MAGAZINE: 0,

  DIGITAL_STUDY: 5,
  SEARCH_MANUALS: 5,
  ASSEMBLE_PC: 20,
  UPGRADE_PC_GPU: 0,
  UPGRADE_PC_HDD: 0,
  BOEING_SUPPORT: 15,

  TOGGLE_NIGHT_CREW: 0,
  TOGGLE_TRANSIT_CHECK_DELEGATION: 0,
  TOGGLE_AUTO_SRF: 0,
  CHECK_INTERNAL_MAIL: 2,
  CROSS_REFERENCE_MANIFESTS: 50,
  MAINTAIN_LOW_PROFILE: 40,

  HARVEST_ROTABLE: 30,
  DISPOSE_ROTABLE: 0,
  ASK_MASTER_LORE: 2,
  START_CALIBRATION_MINIGAME: 20,
  GET_TOOLROOM_ITEM: 0,
  DISPENSE_CONSUMABLE: 5,
  REGISTER_ROTABLE: 20,
  MIX_PAINT: 15,
  SONIC_CLEAN: 10,
  TOOLROOM_MASTER_TALK: 0,
  REPAIR_TOOL: 15,
  REPAIR_ROTABLE: 10,

  LISTEN_RADIO: 0,
  FOD_SWEEP: 5,
  PERFORM_NDT: 20,
  ORBITAL_SAND: 10,
  TIGHTEN_BOLT: 3,
  COMPLETE_JOB: 15,
  // RESOLVE_EVENT deliberately has no registered cost. An event choice
  // declares its own price (EventChoice.cost) and eventsSlice deducts it, so
  // a registered cost here is charged *on top of* the advertised one and is
  // invisible to the player. resolveFocusSpend still surcharges whatever the
  // choice itself deducted, so fatigue and hazards keep biting; the figure on
  // the button is simply the truth again.
  CREATE_SRF: 10,
  STUDY_MODULE: 8,
  SLEEP_CAR: 0,
};

export const AIRCRAFT_ACTION_COSTS: Record<string, number> = {
  TRANSIT_CHECK: 12,
  DAILY_CHECK: 25,
  ETOPS_CHECK: 40,
  READ_FLIGHT_LOG: 5,
  READ_CABIN_LOG: 5,
};

/**
 * The focus price a training entry declares, or 0 if it declares none.
 * Entry shapes in trainingData are heterogeneous — a licence award carries no
 * cost at all — so the property is read off defensively rather than typed.
 */
const authoredFocusCost = (entry: unknown): number => {
  const cost = (entry as { costFocus?: unknown } | undefined)?.costFocus;
  return typeof cost === 'number' ? cost : 0;
};

/**
 * Resolve a training action's focus cost from trainingData.
 *
 * Training costs are authored in `src/data/training.ts` and were previously
 * read off `payload.costFocus`, which made the price a property of the
 * dispatch rather than of the action: TrainingTab passes the whole course
 * object and paid, while a caller passing only `{ id }` paid nothing. This
 * looks the entry up by action type and id — exactly how proficiencySlice
 * already resolves the credit cost — so the two shapes cannot diverge.
 *
 * @returns the authored cost, or null when the action is not a training action
 *          (0 is a real answer: an entry that authored no focus cost is free).
 */
const resolveTrainingFocusCost = (
  actionType: string,
  payload?: Record<string, unknown>
): number | null => {
  const id = payload?.id as string | number | undefined;
  const { mandatoryCourses, faaLicense, easaLicense, ndtCerts, typeRatings } = trainingData;

  switch (actionType) {
    case 'TAKE_MANDATORY_COURSE':
      return authoredFocusCost(mandatoryCourses.find((c) => c.id === id));

    case 'TAKE_AP_EXAM':
      if (id === 'apWritten') return authoredFocusCost(faaLicense.written);
      if (id === 'apPractical') return authoredFocusCost(faaLicense.practical);
      if (id === 'hasAPLicense') return authoredFocusCost(faaLicense.license);
      return 0;

    case 'TAKE_AP_WRITTEN':
      return authoredFocusCost(faaLicense.written);

    case 'TAKE_AVIONICS_EXAM':
      return authoredFocusCost(faaLicense.avionics);

    // Both dispatch the same handler and both pay for one exam sitting.
    case 'TAKE_EASA_EXAM':
    case 'START_EASA_MODULE':
      return authoredFocusCost(easaLicense.examCost);

    case 'CERTIFY_EASA_LICENSE':
      return authoredFocusCost(easaLicense.licenses.find((l) => l.id === id));

    case 'TAKE_NDT_EXAM':
      return authoredFocusCost(ndtCerts.levels.find((l) => l.id === id));

    case 'TAKE_NDT_SUBTASK_EXAM':
      return authoredFocusCost(ndtCerts.subtasks.find((sub) => sub.id === id));

    case 'TAKE_TYPE_RATING': {
      const family = payload?.family;
      const ratings =
        family === '737' ? typeRatings['737'] : family === 'A330' ? typeRatings.A330 : undefined;
      return authoredFocusCost(ratings?.find((r) => r.id === id));
    }

    default:
      return null;
  }
};

export const calculateFocusCost = (
  actionType: string,
  state: GameState,
  payload?: Record<string, unknown>
): number => {
  let cost: number;

  if (actionType === 'AIRCRAFT_ACTION' && payload?.actionType) {
    const subAction = payload.actionType as string;
    cost = AIRCRAFT_ACTION_COSTS[subAction] || 0;
  } else {
    // Training prices live in trainingData; everything else in BASE_FOCUS_COSTS.
    const trainingCost = resolveTrainingFocusCost(actionType, payload);
    cost = trainingCost !== null ? trainingCost : BASE_FOCUS_COSTS[actionType] || 0;
  }

  if (cost === 0) return 0;

  if (state.flags.isAfraid) {
    cost *= 1.5;
  }

  if (state.hfStats.efficiencyBoost > 0) {
    cost = Math.floor(cost * 0.9);
  }

  if (state.flags.onPerformanceImprovementPlan) {
    cost = Math.ceil(cost * 1.2);
  }

  if (actionType === 'TIGHTEN_BOLT' && hasSkill(state, 'rivetDiscipline')) {
    cost -= 1;
  }

  if (actionType === 'CREATE_SRF' && state.hfStats.foundLoopholeTimer > 0) {
    cost = 0;
  }

  return Math.max(0, cost);
};

export const hasSkill = (state: GameState, skillId: string): boolean => {
  return state.proficiency.unlocked.includes(skillId);
};

export const hasInventoryItem = (inventory: Inventory, itemKey: keyof Inventory): boolean => {
  return !!inventory[itemKey];
};

export const validateActionCost = (
  actionType: string,
  state: GameState,
  payload?: Record<string, unknown>
): { cost: number; canAfford: boolean; message?: string } => {
  const cost = calculateFocusCost(actionType, state, payload);

  if (cost === 0) {
    return { cost: 0, canAfford: true };
  }

  const canAfford = state.resources.focus >= cost;

  return {
    cost,
    canAfford,
    message: canAfford ? undefined : 'Insufficient focus',
  };
};
