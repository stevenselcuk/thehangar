/**
 * The action-type groups composeAction routes, and the set derived from them.
 *
 * This lives in its own leaf module (no imports) so that any layer can ask
 * "is this action type routable?" without depending on reducerComposer,
 * which imports every slice. eventsSlice needs exactly that question
 * answered and cannot import reducerComposer without creating a cycle.
 */

// Inventory action types handled by inventorySlice
export const INVENTORY_ACTIONS = [
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
export const PROFICIENCY_ACTIONS = [
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
export const EVENT_ACTIONS = [
  'COMPLETE_JOB',
  'RESOLVE_EVENT',
  'TRIGGER_EVENT',
  'START_STANDARD_JOB',
] as const;

// Backshop action types handled by backshopSlice
export const BACKSHOP_ACTIONS = [
  'CLEAN_ULD',
  'XRAY_WELDS',
  'DECONSTRUCT_FDR',
  'DESCEND_INTO_SLS3',
  'ANALYZE_ANOMALY',
  'SCAVENGE_CORROSION_CORNER',
  'OBSERVE_CORROSION_CORNER',
  'WASH_CUSHIONS',
  'RENEW_DATABUS',
  'OVERHAUL_IDG',
  'REPAIR_HP_VALVE',
  'RECONFIGURE_ADIRS',
  'REPAIR_GALLEY_UNIT',
] as const;

// Compliance action types handled by complianceSlice
export const COMPLIANCE_ACTIONS = [
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
export const AIRCRAFT_ACTIONS = [
  'GET_NEW_AIRCRAFT_TASK',
  'AIRCRAFT_ACTION',
  'SERVICE_LAVATORY',
  'SMALL_TALK_CABIN',
  'SMOKE_CIGARETTE',
  'DRINK_GALLEY_COFFEE',
  'SCAVENGE_GALLEYS',
  'WATCH_RUNWAY',
  'RESOLVE_SCENARIO', // Added
  'START_CHEMICAL_PROCESS',
  'PERFORM_CHEMICAL_STEP',
  'CHECK_CURE_PROGRESS',
  'RESEARCH_COMPONENT_HISTORY',
  'FABRICATE_PAPERWORK',
  'DOWNLOAD_DATA',
  'ANALYZE_DATA',
] as const;

// Terminal location action types handled by terminalLocationSlice
export const TERMINAL_LOCATION_ACTIONS = [
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
export const OFFICE_ACTIONS = [
  'TOGGLE_AUTO_SRF',
  'CHECK_INTERNAL_MAIL',
  'CROSS_REFERENCE_MANIFESTS',
  'DIGITAL_STUDY',
  'CREATE_SRF',
  'SEARCH_MANUALS',
  'DECRYPT_AMM',
  'ASSEMBLE_PC',
  'UPGRADE_PC_GPU',
  'UPGRADE_PC_HDD',
  'NAP_TABLE',
  'READ_MAGAZINE',
  'REVIEW_SURVEILLANCE_LOGS',
  'DEEP_CLEAN_VENTS',
  'INSPECT_PRINTER',
  'PRINT_FORBIDDEN_PAGE',
  'READ_EMAIL',
  'TRIGGER_CRAZY_ENDING',
  'TRIGGER_GOVT_ENDING',
  'TRIGGER_ALIEN_ENDING',
] as const;

// Hangar action types handled by hangarSlice
export const HANGAR_ACTIONS = [
  'LISTEN_RADIO',
  'FOD_SWEEP',
  'PERFORM_NDT',
  'ORBITAL_SAND',
  'TIGHTEN_BOLT',
  'INSTALL_RIVETS',
  'BOEING_SUPPORT',
  'TOGGLE_NIGHT_CREW',
  'TOGGLE_TRANSIT_CHECK_DELEGATION',
  'LISTEN_FUSELAGE',
  'CHECK_REDACTED_LOGS',
  'MARSHALLING',
] as const;

// Shop action types handled by shopSlice
export const SHOP_ACTIONS = [
  'BUY_SHOP_ITEM',
  'BUY_VENDING',
  'FLUCTUATE_PRICES',
  'BUY_VENDING_ITEM',
  'KICK_VENDING_MACHINE',
  'RUMMAGE_SHELVES',
] as const;

// Encounters action types handled by encountersSlice
export const ENCOUNTERS_ACTIONS = ['OBSERVE_SEDAN', 'JANITOR_INTERACTION'] as const;

// Procurement action types handled by procurementSlice
export const PROCUREMENT_ACTIONS = [
  'PLACE_ORDER',
  'CANCEL_ORDER',
  'DELIVER_ORDER',
  'CHECK_DELIVERIES',
  'UNLOCK_CATALOGUE_LEVEL',
] as const;

// Bulletin Board action types handled by bulletinBoardSlice
export const BULLETIN_BOARD_ACTIONS = ['ROTATE_BULLETIN'] as const;

// Resource action types handled by resourcesSlice
export const RESOURCE_ACTIONS = ['LOG_FLAVOR'] as const;

// Pet action types handled by petSlice
export const PET_ACTIONS = ['PET_CAT', 'FEED_CAT', 'PLAY_WITH_CAT', 'PET_RANDOM_MOVE'] as const;

// Terminal action types handled by terminalSlice
export const TERMINAL_ACTIONS = ['ARCHIVE_ACTION', 'MAINTENANCE_ARCHIVE_ACTION'] as const;

// AOG action types handled by aogSlice
export const AOG_ACTIONS = [
  'ACCEPT_AOG_DEPLOYMENT',
  'START_AOG_ACTION',
  'RESOLVE_AOG_ACTION',
  'COMPLETE_AOG_DEPLOYMENT',
] as const;

/**
 * Every action type composeAction knows how to route.
 *
 * Derived from the group consts above so that registering an action in
 * its slice group is the only step needed to make it routable. Do not
 * maintain a second copy of this list anywhere.
 */
export const ROUTED_ACTIONS: ReadonlySet<string> = new Set<string>([
  ...RESOURCE_ACTIONS,
  ...INVENTORY_ACTIONS,
  ...PROFICIENCY_ACTIONS,
  ...EVENT_ACTIONS,
  ...BACKSHOP_ACTIONS,
  ...COMPLIANCE_ACTIONS,
  ...AIRCRAFT_ACTIONS,
  ...TERMINAL_LOCATION_ACTIONS,
  ...TERMINAL_ACTIONS,
  ...OFFICE_ACTIONS,
  ...HANGAR_ACTIONS,
  ...SHOP_ACTIONS,
  ...ENCOUNTERS_ACTIONS,
  ...AOG_ACTIONS,
  ...PROCUREMENT_ACTIONS,
  ...BULLETIN_BOARD_ACTIONS,
  ...PET_ACTIONS,
]);
