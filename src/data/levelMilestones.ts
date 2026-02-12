/**
 * Level Milestones - Defines the 50-level progression (0-49) for The Hangar
 *
 * Each milestone represents a narrative beat in the player's descent into
 * the Lovecraftian horror of corporate aviation maintenance.
 *
 * Level 0: Fresh meat. Sign the papers. Get your badge.
 * Level 49: The truth awaits. Choose your ending.
 */

import { TabType } from '../types.ts';

export interface LevelMilestone {
  level: number;
  name: string;
  description: string; // Flavor text in the game's clinical-horror style
  unlocks: {
    tabs?: TabType[];
    actions?: string[];
    eventCategories?: string[];
    flags?: string[]; // Flag keys to enable
  };
  narrativeEvent?: string; // Story event ID to trigger on reaching this level
}

/**
 * MILESTONE_DATA - The progression arc from orientation to revelation
 *
 * Structure:
 * - Levels 0-5: Orientation. Learn the basics. Nothing is wrong.
 * - Levels 6-15: First anomalies. Strange noises. Odd deliveries.
 * - Levels 16-25: The pattern emerges. The Suits take notice.
 * - Levels 26-35: Deep lore. KARDEX access. The truth fractures.
 * - Levels 36-48: Preparation for the end. Gather what you need.
 * - Level 49: Truth reveal. Three paths. None of them real.
 */
export const MILESTONE_DATA: LevelMilestone[] = [
  // ==================== ORIENTATION (0-5) ====================
  {
    level: 0,
    name: 'ORIENTATION DAY',
    description:
      'Welcome to [REDACTED] Aerospace. Please sign the attached documentation. Your compliance is appreciated.',
    unlocks: {
      tabs: [TabType.CANTEEN, TabType.HANGAR],
      actions: ['INSPECT_VENDING_MACHINE', 'RUMMAGE_LOST_FOUND'],
      eventCategories: [],
    },
  },
  {
    level: 1,
    name: 'PROBATIONARY STATUS',
    description: 'Tool checkout privileges granted. The Toolroom Master is watching.',
    unlocks: {
      tabs: [TabType.TOOLROOM],
      actions: ['GET_TOOLROOM_ITEM', 'RETURN_TOOLROOM_ITEM'],
    },
  },
  {
    level: 2,
    name: 'RAMP ACCESS',
    description: 'High-visibility vest issued. Stay clear of jet blast. Stay clear of the sedan.',
    unlocks: {
      tabs: [TabType.APRON_LINE],
      actions: ['MARSHALLING'],
      eventCategories: ['incident'],
    },
  },
  {
    level: 3,
    name: 'OFFICE KEY',
    description:
      'Level 3 clearance. The filing cabinets contain answers. The answers contain questions.',
    unlocks: {
      tabs: [TabType.OFFICE],
      actions: ['TALK_TO_REGULAR', 'CHECK_INTERNAL_MAIL', 'CREATE_SRF'],
      flags: ['officeUnlocked'],
    },
  },
  {
    level: 4,
    name: 'MAINTENANCE CERTIFIED',
    description: 'Basic maintenance authorization. The rivets hold more than metal together.',
    unlocks: {
      actions: ['DEEP_CLEAN_VENTS', 'INSTALL_RIVETS', 'HARVEST_ROTABLE'],
    },
  },
  {
    level: 5,
    name: 'SHIFT INTEGRATION',
    description:
      'You are now part of the machine. A cat has started following you. It knows things.',
    unlocks: {
      tabs: [TabType.STRUCTURE_SHOP],
      actions: ['PET_CAT', 'FEED_CAT', 'PLAY_WITH_CAT', 'CHECK_DELAYED_GATE'],
      eventCategories: ['audit', 'canteen_incident'],
    },
  },

  // ==================== FIRST ANOMALIES (6-15) ====================
  {
    level: 6,
    name: 'NIGHT SHIFT ELIGIBLE',
    description:
      'The hangar is different after dark. The lights flicker. They have always flickered.',
    unlocks: {
      actions: ['DELEGATE_NIGHT_CREW'],
    },
  },
  {
    level: 8,
    name: 'TERMINAL ACCESS',
    description: 'The passenger terminal awaits. Lost luggage contains more than belongings.',
    unlocks: {
      tabs: [TabType.TERMINAL],
      actions: ['LISTEN_FUSELAGE', 'USE_PAYPHONE'],
      eventCategories: ['component_failure'],
    },
  },
  {
    level: 10,
    name: 'HR CLEARANCE',
    description: 'Human Resources. The basement floor. The fluorescent lights never stop humming.',
    unlocks: {
      tabs: [TabType.HR_FLOOR],
      actions: ['SCAVENGE_CORROSION_CORNER', 'PERFORMANCE_REVIEW'],
      eventCategories: ['bureaucratic_horror'],
    },
  },
  {
    level: 12,
    name: 'TRAINING DEPARTMENT',
    description:
      'Mandatory certifications. The training videos are old. The instructors are older.',
    unlocks: {
      tabs: [TabType.TRAINING],
      actions: ['START_EASA_MODULE', 'TAKE_AP_WRITTEN'],
    },
  },
  {
    level: 15,
    name: 'BACKSHOP AUTHORIZATION',
    description:
      'Component overhaul access. Some parts should not be opened. Some have already been opened.',
    unlocks: {
      tabs: [TabType.BACKSHOPS],
      actions: ['CHECK_REDACTED_LOGS', 'ANALYZE_ANOMALY'],
      eventCategories: ['eldritch_manifestation'],
    },
  },

  // ==================== THE PATTERN EMERGES (16-25) ====================
  {
    level: 18,
    name: 'NIGHT CREW LIAISON',
    description: 'The night crew trusts you. They should not. You should not trust them either.',
    unlocks: {
      actions: ['OBSERVE_SEDAN', 'OBSERVE_CORROSION_CORNER'],
      flags: ['nightCrewUnlocked'],
      eventCategories: ['union'],
    },
  },
  {
    level: 20,
    name: 'SURVEILLANCE AWARE',
    description: 'You have noticed the cameras. The cameras have always noticed you.',
    unlocks: {
      actions: ['REVIEW_SURVEILLANCE_LOGS'],
      eventCategories: ['syndicate'],
    },
  },
  {
    level: 22,
    name: 'DIGITAL CLEARANCE',
    description: 'The old PC boots. The AMM contains more than maintenance manuals.',
    unlocks: {
      actions: ['PRINT_FORBIDDEN_PAGE', 'DECRYPT_AMM'],
    },
  },
  {
    level: 25,
    name: 'AOG DEPLOYMENT',
    description:
      'Aircraft On Ground. They send you to the remote stations now. Some stations are very remote.',
    unlocks: {
      tabs: [TabType.AOG_DEPLOYMENT],
      actions: ['UPLOAD_CLEAN_PROTOCOL'],
    },
  },

  // ==================== DEEP LORE (26-35) ====================
  {
    level: 28,
    name: 'KARDEX INITIATED',
    description:
      'The physical archives. Index cards stained with decades of secrets. Some are still warm.',
    unlocks: {
      actions: ['CROSS_REFERENCE_KARDEX'],
      flags: ['kardexActive'],
    },
  },
  {
    level: 30,
    name: 'LEGACY ACCESS',
    description:
      'The 1970s database. Green phosphor glow. The terminal remembers what we have forgotten.',
    unlocks: {
      actions: ['CONSULT_LEGACY_ARCHIVES'],
    },
  },
  {
    level: 35,
    name: 'SLS-3 DISCOVERY',
    description:
      'You found the door. Behind the component cage. The lock is not meant for human hands.',
    unlocks: {
      actions: ['CHECK_BLACK_MARKET'],
      flags: ['sls3Unlocked'],
    },
  },

  // ==================== PREPARATION (36-48) ====================
  {
    level: 40,
    name: 'TRUTH PROXIMATE',
    description:
      'The pieces are assembling themselves. MH370 was not lost. It was taken. Returned. Changed.',
    unlocks: {
      actions: [],
    },
    narrativeEvent: 'TRUTH_PROXIMATE_REVELATION',
  },
  {
    level: 45,
    name: 'FINAL CLEARANCE',
    description:
      'They have stopped watching. Either they trust you, or they know it no longer matters.',
    unlocks: {
      actions: [],
    },
  },

  // ==================== TRUTH REVEAL (49) ====================
  {
    level: 49,
    name: 'TRUTH REVEAL',
    description:
      'The hangar door opens to the void. Three paths. Three lies. MH370 remains missing. You cannot prove anything. But you got close.',
    unlocks: {
      actions: ['TRIGGER_ALIEN_ENDING', 'TRIGGER_GOVT_ENDING', 'TRIGGER_CRAZY_ENDING'],
    },
    narrativeEvent: 'TRUTH_REVEAL',
  },
];

/**
 * getMilestoneForLevel - Get the milestone definition for a specific level
 */
export const getMilestoneForLevel = (level: number): LevelMilestone | undefined => {
  return MILESTONE_DATA.find((m) => m.level === level);
};

/**
 * getMilestonesUpToLevel - Get all milestones up to and including the specified level
 */
export const getMilestonesUpToLevel = (level: number): LevelMilestone[] => {
  return MILESTONE_DATA.filter((m) => m.level <= level);
};

/**
 * getNextMilestone - Get the next milestone after the current level
 */
export const getNextMilestone = (currentLevel: number): LevelMilestone | undefined => {
  return MILESTONE_DATA.find((m) => m.level > currentLevel);
};

/**
 * getAllUnlockedTabs - Get all tabs unlocked up to a given level
 */
export const getAllUnlockedTabs = (level: number): TabType[] => {
  const tabs: TabType[] = [];
  getMilestonesUpToLevel(level).forEach((m) => {
    if (m.unlocks.tabs) {
      tabs.push(...m.unlocks.tabs);
    }
  });
  return [...new Set(tabs)]; // Remove duplicates
};

/**
 * getAllUnlockedActions - Get all actions unlocked up to a given level
 */
export const getAllUnlockedActions = (level: number): string[] => {
  const actions: string[] = [];
  getMilestonesUpToLevel(level).forEach((m) => {
    if (m.unlocks.actions) {
      actions.push(...m.unlocks.actions);
    }
  });
  return [...new Set(actions)];
};

/**
 * getAllUnlockedEventCategories - Get all event categories unlocked up to a given level
 */
export const getAllUnlockedEventCategories = (level: number): string[] => {
  const categories: string[] = [];
  getMilestonesUpToLevel(level).forEach((m) => {
    if (m.unlocks.eventCategories) {
      categories.push(...m.unlocks.eventCategories);
    }
  });
  return [...new Set(categories)];
};

/**
 * getAllUnlockedFlags - Get all flags that should be enabled up to a given level
 */
export const getAllUnlockedFlags = (level: number): string[] => {
  const flags: string[] = [];
  getMilestonesUpToLevel(level).forEach((m) => {
    if (m.unlocks.flags) {
      flags.push(...m.unlocks.flags);
    }
  });
  return [...new Set(flags)];
};
