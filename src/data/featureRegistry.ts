/**
 * Feature Registry - Central inventory of all level-gated features
 *
 * This is the single source of truth for what is available at each level.
 * Used by LevelManager to determine feature accessibility.
 */

import { GameFlags, Inventory, TabType } from '../types.ts';

export type FeatureType = 'tab' | 'action' | 'event_category' | 'flag';

export interface FeatureDefinition {
  id: string;
  type: FeatureType;
  requiredLevel: number;
  description?: string; // For DevMode display
  requiredFlags?: (keyof GameFlags)[]; // Additional flag requirements
  requiredItems?: (keyof Inventory)[]; // Additional item requirements
}

/**
 * TAB_FEATURES - Level requirements for each game location
 */
export const TAB_FEATURES: Record<TabType, FeatureDefinition> = {
  [TabType.HANGAR]: {
    id: 'TAB_HANGAR',
    type: 'tab',
    requiredLevel: 0,
    description: 'Main hangar floor - entry level access',
  },
  [TabType.CANTEEN]: {
    id: 'TAB_CANTEEN',
    type: 'tab',
    requiredLevel: 0,
    description: 'Break room - vending machines and lost souls',
  },
  [TabType.TOOLROOM]: {
    id: 'TAB_TOOLROOM',
    type: 'tab',
    requiredLevel: 1,
    description: 'Tool checkout - the Master awaits',
  },
  [TabType.APRON_LINE]: {
    id: 'TAB_APRON',
    type: 'tab',
    requiredLevel: 2,
    description: 'Ramp access - watch for the sedan',
  },
  [TabType.OFFICE]: {
    id: 'TAB_OFFICE',
    type: 'tab',
    requiredLevel: 3,
    description: 'Office level - paperwork and paranoia',
    requiredFlags: ['officeUnlocked'],
  },
  [TabType.STRUCTURE_SHOP]: {
    id: 'TAB_STRUCTURE',
    type: 'tab',
    requiredLevel: 5,
    description: 'Structure shop - sheet metal and secrets',
  },
  [TabType.TERMINAL]: {
    id: 'TAB_TERMINAL',
    type: 'tab',
    requiredLevel: 8,
    description: 'Passenger terminal - lost and found',
  },
  [TabType.HR_FLOOR]: {
    id: 'TAB_HR',
    type: 'tab',
    requiredLevel: 10,
    description: 'Human Resources - the basement',
  },
  [TabType.TRAINING]: {
    id: 'TAB_TRAINING',
    type: 'tab',
    requiredLevel: 12,
    description: 'Training department - mandatory viewing',
  },
  [TabType.BACKSHOPS]: {
    id: 'TAB_BACKSHOPS',
    type: 'tab',
    requiredLevel: 15,
    description: 'Component overhaul - some things should stay closed',
  },
  [TabType.AOG_DEPLOYMENT]: {
    id: 'TAB_AOG',
    type: 'tab',
    requiredLevel: 25,
    description: 'AOG deployment - remote stations await',
  },
};

/**
 * ACTION_FEATURES - Level requirements for game actions
 * Only listing gated actions; ungated actions default to level 0
 */
export const ACTION_FEATURES: Record<string, FeatureDefinition> = {
  // Level 0 - Basic actions
  INSPECT_VENDING_MACHINE: { id: 'INSPECT_VENDING_MACHINE', type: 'action', requiredLevel: 0 },

  // Level 1 - Toolroom
  GET_TOOLROOM_ITEM: { id: 'GET_TOOLROOM_ITEM', type: 'action', requiredLevel: 1 },
  RETURN_TOOLROOM_ITEM: { id: 'RETURN_TOOLROOM_ITEM', type: 'action', requiredLevel: 1 },

  // Level 2 - Ramp
  RUMMAGE_LOST_FOUND: { id: 'RUMMAGE_LOST_FOUND', type: 'action', requiredLevel: 2 },

  // Level 3 - Office
  TALK_TO_REGULAR: { id: 'TALK_TO_REGULAR', type: 'action', requiredLevel: 3 },
  CHECK_INTERNAL_MAIL: { id: 'CHECK_INTERNAL_MAIL', type: 'action', requiredLevel: 3 },
  CREATE_SRF: { id: 'CREATE_SRF', type: 'action', requiredLevel: 3 },

  // Level 4 - Maintenance
  DEEP_CLEAN_VENTS: { id: 'DEEP_CLEAN_VENTS', type: 'action', requiredLevel: 4 },
  INSTALL_RIVETS: { id: 'INSTALL_RIVETS', type: 'action', requiredLevel: 4 },
  HARVEST_ROTABLE: { id: 'HARVEST_ROTABLE', type: 'action', requiredLevel: 4 },

  // Level 5 - Pet & exploration
  PET_CAT: { id: 'PET_CAT', type: 'action', requiredLevel: 5 },
  FEED_CAT: { id: 'FEED_CAT', type: 'action', requiredLevel: 5 },
  PLAY_WITH_CAT: { id: 'PLAY_WITH_CAT', type: 'action', requiredLevel: 5 },
  CHECK_DELAYED_GATE: { id: 'CHECK_DELAYED_GATE', type: 'action', requiredLevel: 5 },

  // Level 6 - Night shift
  DELEGATE_NIGHT_CREW: { id: 'DELEGATE_NIGHT_CREW', type: 'action', requiredLevel: 6 },

  // Level 8 - Terminal
  LISTEN_FUSELAGE: { id: 'LISTEN_FUSELAGE', type: 'action', requiredLevel: 8 },
  USE_PAYPHONE: { id: 'USE_PAYPHONE', type: 'action', requiredLevel: 8 },

  // Level 10 - HR
  SCAVENGE_CORROSION_CORNER: { id: 'SCAVENGE_CORROSION_CORNER', type: 'action', requiredLevel: 10 },
  PERFORMANCE_REVIEW: { id: 'PERFORMANCE_REVIEW', type: 'action', requiredLevel: 10 },

  // Level 12 - Training
  START_EASA_MODULE: { id: 'START_EASA_MODULE', type: 'action', requiredLevel: 12 },
  TAKE_AP_WRITTEN: { id: 'TAKE_AP_WRITTEN', type: 'action', requiredLevel: 12 },

  // Level 15 - Backshops
  CHECK_REDACTED_LOGS: { id: 'CHECK_REDACTED_LOGS', type: 'action', requiredLevel: 15 },
  ANALYZE_ANOMALY: { id: 'ANALYZE_ANOMALY', type: 'action', requiredLevel: 15 },

  // Level 18 - Night crew
  OBSERVE_SEDAN: { id: 'OBSERVE_SEDAN', type: 'action', requiredLevel: 18 },
  OBSERVE_CORROSION_CORNER: { id: 'OBSERVE_CORROSION_CORNER', type: 'action', requiredLevel: 18 },

  // Level 20 - Surveillance
  REVIEW_SURVEILLANCE_LOGS: { id: 'REVIEW_SURVEILLANCE_LOGS', type: 'action', requiredLevel: 20 },

  // Level 22 - Digital
  PRINT_FORBIDDEN_PAGE: { id: 'PRINT_FORBIDDEN_PAGE', type: 'action', requiredLevel: 22 },
  DECRYPT_AMM: { id: 'DECRYPT_AMM', type: 'action', requiredLevel: 22 },

  // Level 25 - AOG
  UPLOAD_CLEAN_PROTOCOL: { id: 'UPLOAD_CLEAN_PROTOCOL', type: 'action', requiredLevel: 25 },

  // Level 28 - KARDEX
  CROSS_REFERENCE_KARDEX: { id: 'CROSS_REFERENCE_KARDEX', type: 'action', requiredLevel: 28 },

  // Level 30 - Legacy
  CONSULT_LEGACY_ARCHIVES: { id: 'CONSULT_LEGACY_ARCHIVES', type: 'action', requiredLevel: 30 },

  // Level 35 - Black market
  CHECK_BLACK_MARKET: {
    id: 'CHECK_BLACK_MARKET',
    type: 'action',
    requiredLevel: 35,
    requiredItems: ['metallicSphere'],
  },

  // Level 49 - Endings
  TRIGGER_ALIEN_ENDING: {
    id: 'TRIGGER_ALIEN_ENDING',
    type: 'action',
    requiredLevel: 49,
    requiredItems: ['metallicSphere'],
    description: 'Alien conspiracy ending - they were never from here',
  },
  TRIGGER_GOVT_ENDING: {
    id: 'TRIGGER_GOVT_ENDING',
    type: 'action',
    requiredLevel: 49,
    description: 'Government conspiracy ending - they knew all along',
  },
  TRIGGER_CRAZY_ENDING: {
    id: 'TRIGGER_CRAZY_ENDING',
    type: 'action',
    requiredLevel: 49,
    description: 'Madness ending - perhaps it was you all along',
  },
  // Violation Management
  CLEAR_CACHE: { id: 'CLEAR_CACHE', type: 'action', requiredLevel: 0 },
  APPEAL_VIOLATION: { id: 'APPEAL_VIOLATION', type: 'action', requiredLevel: 0 },
  BRIBE_SYSADMIN: { id: 'BRIBE_SYSADMIN', type: 'action', requiredLevel: 0 },
  FORCE_OVERRIDE: { id: 'FORCE_OVERRIDE', type: 'action', requiredLevel: 0 },
  ACCEPT_REEDUCATION: { id: 'ACCEPT_REEDUCATION', type: 'action', requiredLevel: 0 },
};

/**
 * EVENT_CATEGORY_FEATURES - Level requirements for event categories
 */
export const EVENT_CATEGORY_FEATURES: Record<string, FeatureDefinition> = {
  incident: {
    id: 'EVENT_INCIDENT',
    type: 'event_category',
    requiredLevel: 2,
    description: 'Minor incidents and rush jobs',
  },
  accident: {
    id: 'EVENT_ACCIDENT',
    type: 'event_category',
    requiredLevel: 3,
    description: 'Electrical fires and failures',
  },
  audit: {
    id: 'EVENT_AUDIT',
    type: 'event_category',
    requiredLevel: 5,
    description: 'FAA, EASA, and The Suits',
  },
  canteen_incident: {
    id: 'EVENT_CANTEEN',
    type: 'event_category',
    requiredLevel: 5,
    description: 'Strange encounters in the break room',
  },
  component_failure: {
    id: 'EVENT_COMPONENT',
    type: 'event_category',
    requiredLevel: 8,
    description: 'Things breaking that should not break',
  },
  bureaucratic_horror: {
    id: 'EVENT_BUREAUCRATIC',
    type: 'event_category',
    requiredLevel: 10,
    description: 'Paperwork that fights back',
  },
  eldritch_manifestation: {
    id: 'EVENT_ELDRITCH',
    type: 'event_category',
    requiredLevel: 15,
    description: 'Things from beyond the maintenance manual',
  },
  union: {
    id: 'EVENT_UNION',
    type: 'event_category',
    requiredLevel: 18,
    description: 'The union knows things',
  },
  syndicate: {
    id: 'EVENT_SYNDICATE',
    type: 'event_category',
    requiredLevel: 20,
    description: 'The night crew has a side business',
  },
  story_event: {
    id: 'EVENT_STORY',
    type: 'event_category',
    requiredLevel: 0,
    description: 'Narrative events scale with player level',
  },
};

/**
 * getActionRequiredLevel - Get the required level for an action
 * Returns 0 for unregistered actions (allow by default)
 */
export const getActionRequiredLevel = (actionId: string): number => {
  return ACTION_FEATURES[actionId]?.requiredLevel ?? 0;
};

/**
 * getTabRequiredLevel - Get the required level for a tab
 */
export const getTabRequiredLevel = (tab: TabType): number => {
  return TAB_FEATURES[tab]?.requiredLevel ?? 0;
};

/**
 * getEventCategoryRequiredLevel - Get the required level for an event category
 */
export const getEventCategoryRequiredLevel = (category: string): number => {
  return EVENT_CATEGORY_FEATURES[category]?.requiredLevel ?? 0;
};

/**
 * getAllFeatures - Get all registered features for DevMode display
 */
export const getAllFeatures = (): FeatureDefinition[] => {
  return [
    ...Object.values(TAB_FEATURES),
    ...Object.values(ACTION_FEATURES),
    ...Object.values(EVENT_CATEGORY_FEATURES),
  ];
};
