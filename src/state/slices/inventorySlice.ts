import { produce } from 'immer';

import { ACTION_LOGS, MASTER_LORE, TOOLROOM_MASTER_DIALOUGE } from '../../data/flavor.ts';
import { addLogToDraft } from '../../services/logService.ts';
import { Inventory, LogMessage, RotableItem } from '../../types.ts';

/**
 * Inventory Slice - Manages toolroom, rotables, and equipment
 *
 * Handles:
 * - Rotable lifecycle (register, repair, harvest, dispose)
 * - Tool checkout and condition management
 * - Consumable dispensing
 * - Paint mixing and sonic cleaning
 * - Calibration minigame state
 * - Toolroom Master interactions
 */

// ===== STATE INTERFACE =====

export interface InventorySliceState {
  inventory: Inventory;
  personalInventory: Record<string, number>;
  rotables: RotableItem[];
  toolConditions: Record<string, number>;
  flags: {
    toolroomMasterPissed: boolean;
    activeComponentFailure: string | null;
  };
  resources: {
    alclad: number;
    titanium: number;
    fiberglass: number;
    rivets: number;
    mek: number;
    credits: number;
    suspicion: number;
    sanity: number;
    experience: number;
    focus: number;
  };
  hfStats: {
    noiseExposure: number;
    socialStress: number;
    efficiencyBoost: number;
    toolroomMasterCooldown: number;
  };
  calibrationMinigame: {
    active: boolean;
    toolId: string | null;
    toolLabel: string | null;
  };
  activeEvent: unknown | null;
  stats: {
    rotablesRepaired: number;
  };
  logs: LogMessage[];
}

// ===== ACTION TYPES =====

export type InventoryAction =
  | { type: 'HARVEST_ROTABLE'; payload: { rotableId: string } }
  | { type: 'DISPOSE_ROTABLE'; payload: { rotableId: string } }
  | { type: 'REPAIR_ROTABLE'; payload: { rotableId: string } }
  | { type: 'GET_TOOLROOM_ITEM'; payload: { key: string; label: string; pn: string } }
  | {
      type: 'DISPENSE_CONSUMABLE';
      payload: { id: string; label: string; unit: string; cost: number };
    }
  | { type: 'REGISTER_ROTABLE'; payload: { label: string; pn: string } }
  | { type: 'MIX_PAINT'; payload: Record<string, unknown> }
  | { type: 'SONIC_CLEAN'; payload: Record<string, unknown> }
  | { type: 'REPAIR_TOOL'; payload: { id: string; label: string } }
  | { type: 'START_CALIBRATION_MINIGAME'; payload: { key: string; label: string } }
  | {
      type: 'FINISH_CALIBRATION_MINIGAME';
      payload: { toolId: string; result: 'perfect' | 'good' | 'fail' };
    }
  | { type: 'ASK_MASTER_LORE'; payload: Record<string, unknown> }
  | { type: 'TOOLROOM_MASTER_TALK'; payload: Record<string, unknown> };

// ===== HELPER FUNCTIONS =====

/**
 * Generate a random serial number
 */
export const generateSerialNumber = (): string => {
  return `SN-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
};

/**
 * Check if a rotable should be untraceable (5% chance)
 */
export const isUntraceableRotable = (): boolean => {
  return Math.random() < 0.05;
};

/**
 * Check if a rotable should be red-tagged (8% chance)
 */
export const isRedTaggedRotable = (): boolean => {
  return Math.random() < 0.08;
};

/**
 * Calculate random titanium yield from harvesting (10-24)
 */
export const calculateTitaniumYield = (): number => {
  return 10 + Math.floor(Math.random() * 15);
};

/**
 * Calculate random fiberglass yield from harvesting (5-14)
 */
export const calculateFiberglassYield = (): number => {
  return 5 + Math.floor(Math.random() * 10);
};

/**
 * Get random lore from Toolroom Master
 */
export const getRandomMasterLore = (): string => {
  return MASTER_LORE[Math.floor(Math.random() * MASTER_LORE.length)];
};

/**
 * Get random dialogue from Toolroom Master
 */
export const getRandomMasterDialogue = (): string => {
  return TOOLROOM_MASTER_DIALOUGE[Math.floor(Math.random() * TOOLROOM_MASTER_DIALOUGE.length)];
};

// ===== REDUCER =====

export const inventoryReducer = produce((draft: InventorySliceState, action: InventoryAction) => {
  const addLog = (
    text: string,
    type: 'info' | 'warning' | 'error' | 'story' | 'vibration' | 'levelup' = 'info'
  ) => {
    addLogToDraft(draft.logs, text, type, Date.now());
  };

  switch (action.type) {
    case 'HARVEST_ROTABLE': {
      const { rotableId } = action.payload;
      draft.rotables = draft.rotables.filter((r) => r.id !== rotableId);
      draft.resources.titanium += calculateTitaniumYield();
      draft.resources.fiberglass += calculateFiberglassYield();
      addLog(ACTION_LOGS.HARVEST_SUCCESS, 'story');
      break;
    }

    case 'DISPOSE_ROTABLE': {
      const { rotableId } = action.payload;
      if (draft.resources.credits >= 500) {
        draft.resources.credits -= 500;
        draft.rotables = draft.rotables.filter((r) => r.id !== rotableId);
        draft.resources.suspicion = Math.max(0, draft.resources.suspicion - 25);
        addLog(ACTION_LOGS.DISPOSE_SUCCESS, 'story');
      } else {
        addLog(
          "The Master scoffs. 'My services aren't cheap. Come back when you have the credits.'",
          'warning'
        );
      }
      break;
    }

    case 'REPAIR_ROTABLE': {
      const { rotableId } = action.payload;
      const rotableToRepair = draft.rotables.find((r) => r.id === rotableId);

      if (rotableToRepair && draft.resources.alclad >= 50 && draft.resources.credits >= 25) {
        draft.resources.alclad -= 50;
        draft.resources.credits -= 25;
        draft.rotables = draft.rotables.map((r) =>
          r.id === rotableId ? { ...r, condition: 100 } : r
        );
        addLog(`REPAIRED: ${rotableToRepair.label} brought back to optimal condition.`, 'story');

        // Clear component failure event if this was the failed component
        if (draft.flags.activeComponentFailure === rotableId) {
          draft.flags.activeComponentFailure = null;
          draft.activeEvent = null;
          addLog(`Operational drag on ${rotableToRepair.label} has been eliminated.`, 'info');
        }

        draft.stats.rotablesRepaired += 1;
      } else {
        addLog('REPAIR FAILED: Insufficient resources.', 'error');
        // Note: Focus refund handled by cost validation in caller
      }
      break;
    }

    case 'GET_TOOLROOM_ITEM': {
      const { key, label, pn } = action.payload;
      if (key) {
        (draft.inventory as unknown as Record<string, unknown>)[key] = true;
        draft.toolConditions[key] = 100;
        addLog(`CHECK-OUT: ${label}. (P/N: ${pn}). Master signed the tag.`, 'info');
      }
      break;
    }

    case 'DISPENSE_CONSUMABLE': {
      const { id, label, unit, cost } = action.payload;
      if (draft.resources.credits >= cost) {
        draft.resources.credits -= cost;
        const currentAmount =
          ((draft.resources as unknown as Record<string, unknown>)[id] as number) || 0;
        (draft.resources as unknown as Record<string, unknown>)[id] = currentAmount + 1;
        addLog(`DISPENSED: ${label}. 1 ${unit} added to kit.`, 'info');
      } else {
        addLog('CREDIT LIMIT EXCEEDED.', 'error');
        // Note: Focus refund handled by cost validation in caller
      }
      break;
    }

    case 'REGISTER_ROTABLE': {
      const { label, pn } = action.payload;
      const isSus = isUntraceableRotable();
      const isRed = isRedTaggedRotable();
      const newSN = isSus ? 'UNTRACEABLE' : generateSerialNumber();

      const newRotable: RotableItem = {
        id: Math.random().toString(36),
        label,
        pn,
        sn: newSN,
        condition: isRed ? 0 : 100,
        isInstalled: false,
        isUntraceable: isSus,
        isRedTagged: isRed,
      };

      draft.rotables.push(newRotable);

      if (isRed) {
        addLog(`RED TAG: ${label} acquired. It's beyond repair.`, 'error');
      } else if (isSus) {
        addLog(ACTION_LOGS.UNTRACEABLE_FOUND, 'vibration');
        draft.resources.suspicion += 15;
      } else {
        addLog(`REGISTERED: ${label} (S/N: ${newSN})`, 'info');
      }
      break;
    }

    case 'MIX_PAINT': {
      if (draft.resources.mek >= 1) {
        draft.resources.mek -= 1;
        draft.inventory.mixedTouchUpPaint = 100;
        addLog(ACTION_LOGS.MIX_PAINT, 'warning');
        draft.hfStats.noiseExposure += 5;
      } else {
        addLog('ERROR: MEK SOLVENT DEPLETED.', 'error');
      }
      break;
    }

    case 'SONIC_CLEAN': {
      if (draft.inventory.sonicCleaner) {
        addLog(ACTION_LOGS.SONIC_CLEAN, 'vibration');
        draft.hfStats.socialStress += 10;
        draft.resources.experience += 50;
      }
      break;
    }

    case 'REPAIR_TOOL': {
      const { id, label } = action.payload;
      if (draft.resources.alclad >= 30) {
        draft.resources.alclad -= 30;
        draft.toolConditions[id] = 100;
        addLog(`Serviced: ${label}. Calibration verified.`, 'info');
      }
      break;
    }

    case 'START_CALIBRATION_MINIGAME': {
      const { key, label } = action.payload;
      if (draft.resources.credits >= 40) {
        draft.resources.credits -= 40;
        draft.calibrationMinigame = {
          active: true,
          toolId: key,
          toolLabel: label,
        };
      }
      break;
    }

    case 'FINISH_CALIBRATION_MINIGAME': {
      const { toolId, result } = action.payload;
      draft.calibrationMinigame = {
        active: false,
        toolId: null,
        toolLabel: null,
      };

      if (result === 'perfect') {
        addLog(ACTION_LOGS.CALIBRATION_PERFECT, 'levelup');
        draft.toolConditions[toolId] = 100;
        draft.hfStats.efficiencyBoost = 30000;
      } else if (result === 'good') {
        addLog(ACTION_LOGS.CALIBRATION_GOOD, 'info');
        draft.toolConditions[toolId] = 100;
      } else {
        addLog(ACTION_LOGS.CALIBRATION_FAIL, 'error');
        draft.toolConditions[toolId] = Math.max(0, draft.toolConditions[toolId] - 25);
        draft.flags.toolroomMasterPissed = true;
        draft.hfStats.toolroomMasterCooldown = 300000; // 5 minutes
      }
      break;
    }

    case 'ASK_MASTER_LORE': {
      if (!draft.flags.toolroomMasterPissed) {
        const lore = getRandomMasterLore();
        addLog(lore, 'story');
      } else {
        addLog(
          'The Master just glares at you and goes back to polishing a wrench. Probably best to leave him be.',
          'info'
        );
        // Note: Focus refund handled by cost validation in caller
      }
      break;
    }

    case 'TOOLROOM_MASTER_TALK': {
      const dialogue = getRandomMasterDialogue();
      addLog(dialogue, 'info');
      draft.resources.sanity = Math.min(100, draft.resources.sanity + 2);
      break;
    }
  }
});
