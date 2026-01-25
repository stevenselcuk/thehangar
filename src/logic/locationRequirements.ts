import { Inventory, TabType } from '../types.ts';

/**
 * requirements - Detailed requirements for each location
 */
export const LOCATION_REQUIREMENTS: Record<
  TabType,
  {
    requiredItems: { key: keyof Inventory; label: string; reason: string }[];
    softRequirements: { key: keyof Inventory; label: string; penalty: string }[];
  }
> = {
  [TabType.STRUCTURE_SHOP]: {
    requiredItems: [],
    softRequirements: [],
  },
  [TabType.OFFICE]: {
    requiredItems: [],
    softRequirements: [],
  },
  [TabType.HANGAR]: {
    requiredItems: [],
    softRequirements: [{ key: 'earmuffs', label: 'Earmuffs', penalty: 'High Noise Exposure' }],
  },
  [TabType.APRON_LINE]: {
    requiredItems: [],
    softRequirements: [
      { key: 'earmuffs', label: 'Earmuffs', penalty: 'High Noise Exposure' },
      { key: 'radio', label: 'Radio', penalty: "Can't hear dispatch" },
    ],
  },
  [TabType.TOOLROOM]: {
    requiredItems: [],
    softRequirements: [],
  },
  [TabType.CANTEEN]: {
    requiredItems: [],
    softRequirements: [],
  },
  [TabType.TERMINAL]: {
    requiredItems: [],
    softRequirements: [],
  },
  [TabType.HR_FLOOR]: {
    requiredItems: [],
    softRequirements: [],
  },
  [TabType.BACKSHOPS]: {
    requiredItems: [],
    softRequirements: [
      { key: 'flashlight', label: 'Flashlight', penalty: 'Area is Dark (Risk of Injury/Anxiety)' },
    ],
  },
  [TabType.TRAINING]: {
    requiredItems: [],
    softRequirements: [],
  },
  [TabType.AOG_DEPLOYMENT]: {
    requiredItems: [],
    softRequirements: [
      { key: 'technicianToolbox', label: 'Tech Toolbox', penalty: 'Limited Tool Access' },
    ],
  },
};

export interface LocationCheckResult {
  satisfied: boolean;
  missingRequired: { key: keyof Inventory; label: string; reason: string }[];
  missingSoft: { key: keyof Inventory; label: string; penalty: string }[];
}

/**
 * checkLocationRequirements
 * Checks if the player has the necessary items for a specific location.
 */
export const checkLocationRequirements = (
  location: TabType,
  inventory: Inventory
): LocationCheckResult => {
  const reqs = LOCATION_REQUIREMENTS[location];
  if (!reqs) {
    return { satisfied: true, missingRequired: [], missingSoft: [] };
  }

  const missingRequired = reqs.requiredItems.filter((item) => !inventory[item.key]);
  const missingSoft = reqs.softRequirements.filter((item) => !inventory[item.key]);

  return {
    satisfied: missingRequired.length === 0,
    missingRequired,
    missingSoft,
  };
};
