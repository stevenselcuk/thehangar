import { produce } from 'immer';
import { PRICE_FLUCTUATION_LOGS } from '../../data/flavor.ts';
import { addLogToDraft } from '../../services/logService.ts';
import { GameState } from '../../types.ts';

/**
 * shopSlice.ts - Shop & Vending Operations Domain
 *
 * Handles:
 * - Shop item purchases (tools, equipment)
 * - Vending machine purchases (consumables)
 *
 * State mutations:
 * - resources (alclad, credits, sanity, focus)
 * - inventory (dynamic tool/item acquisition)
 * - toolConditions (new tool condition to 100)
 * - flags (venomSurgeActive)
 * - hfStats (venomSurgeTimer)
 * - vendingPrices (dynamic pricing)
 * - logs array
 */

// ==================== TYPE DEFINITIONS ====================

export interface ShopSliceState {
  resources: GameState['resources'];
  inventory: GameState['inventory'];
  personalInventory: Record<string, number>;
  toolConditions: GameState['toolConditions'];
  flags: GameState['flags'];
  hfStats: GameState['hfStats'];
  vendingPrices: GameState['vendingPrices'];
  logs: GameState['logs'];
}

export type ShopAction =
  | { type: 'BUY_SHOP_ITEM'; payload: { item: string; cost: number } }
  | {
      type: 'BUY_VENDING';
      payload: { id: string; cost: number; sanity: number; focus: number; msg: string };
    }
  | {
      type: 'BUY_VENDING_ITEM';
      payload: { item: Record<string, unknown> & { id: string; cost: number; label: string } };
    }
  | { type: 'RUMMAGE_SHELVES' }
  | { type: 'KICK_VENDING_MACHINE' }
  | { type: 'FLUCTUATE_PRICES'; payload?: Record<string, never> };

// ==================== REDUCER ====================

export const shopReducer = (state: ShopSliceState, action: ShopAction): ShopSliceState => {
  return produce(state, (draft) => {
    const addLog = (
      text: string,
      type: 'info' | 'warning' | 'error' | 'story' | 'levelup' | 'vibration' = 'info'
    ) => {
      addLogToDraft(draft.logs, text, type, Date.now());
    };

    switch (action.type) {
      case 'BUY_SHOP_ITEM':
        if (draft.resources.alclad >= action.payload.cost) {
          draft.resources.alclad -= action.payload.cost;
          (draft.inventory as unknown as Record<string, boolean | number>)[action.payload.item] =
            true;
          draft.toolConditions[action.payload.item] = 100;
          addLog(`PURCHASED: ${action.payload.item.toUpperCase()}`);
        } else {
          addLog('NOT ENOUGH ALCLAD SCRAP.', 'error');
        }
        break;

      case 'BUY_VENDING_ITEM': {
        const { item } = action.payload;
        const cost = item.cost;

        if (draft.resources.credits >= cost) {
          draft.resources.credits -= cost;
          // Handle consumables effects
          if (item.id === 'winston_pack') {
            draft.personalInventory['winston_pack'] =
              (draft.personalInventory['winston_pack'] || 0) + 1;
            addLog(`BOUGHT: ${item.label.toUpperCase()}`, 'info');
          } else if (item.id === 'skydrol') {
            // Skydrol effect? Maybe burn?
            draft.resources.sanity -= 5;
            addLog(`BOUGHT: ${item.label.toUpperCase()}. IT BURNS.`, 'warning');
          } else {
            addLog(`BOUGHT: ${item.label.toUpperCase()}`, 'info');
            // Generic inventory add if it's a resource (not defined in types yet, assuming abstract for now)
            // But consumables usually get used immediately or stored in specific fields.
            // Current game logic seems to handle winstons in personalInventory, others might be just resource changes?
            // Checking item.id matches resources keys?
            if (item.id in draft.resources) {
              (draft.resources as Record<string, number>)[item.id] =
                ((draft.resources as Record<string, number>)[item.id] || 0) + 1;
            }
          }
        } else {
          addLog('INSUFFICIENT CREDITS.', 'error');
        }
        break;
      }

      case 'RUMMAGE_SHELVES':
        if (draft.resources.focus >= 5) {
          draft.resources.focus -= 5;
          const rand = Math.random();
          if (rand < 0.1) {
            // Free item!
            addLog('You find a forgotten item in the dust.', 'info');
            draft.resources.sanity += 5;
          } else if (rand < 0.3) {
            addLog('You cut your hand on a rusty edge.', 'warning');
            draft.resources.sanity -= 2;
          } else {
            addLog('Just dust and spiders.', 'info');
          }
        } else {
          addLog('Not enough focus to search properly.', 'warning');
        }
        break;

      case 'KICK_VENDING_MACHINE':
        if (draft.resources.focus >= 5) {
          draft.resources.focus -= 5;
          const rand = Math.random();
          if (rand < 0.1) {
            // Free item!
            addLog('CLUNK. A stale chocolate bar falls out. Success.', 'info');
            draft.resources.sanity += 5;
          } else if (rand < 0.3) {
            addLog('OW. You hurt your foot.', 'warning');
            draft.resources.sanity -= 2;
          } else {
            addLog('The machine hums defiantly.', 'info');
          }
        } else {
          addLog('Not enough focus to kick properly.', 'warning');
        }
        break;

      case 'BUY_VENDING': {
        const basePrice =
          action.payload.cost === 0
            ? 0
            : draft.vendingPrices[action.payload.id] || action.payload.cost;
        let vPrice = basePrice;
        if (draft.resources.suspicion > 50) {
          vPrice = Math.floor(basePrice * 1.5);
          addLog(
            "The vending machine seems to charge you extra. It knows you're desperate.",
            'warning'
          );
        }
        if (draft.resources.credits >= vPrice) {
          draft.resources.credits -= vPrice;
          draft.resources.sanity = Math.min(100, draft.resources.sanity + action.payload.sanity);
          draft.resources.focus = Math.min(100, draft.resources.focus + action.payload.focus);
          addLog(action.payload.msg, action.payload.sanity < 0 ? 'warning' : 'info');
          if (action.payload.id === 'venom_surge') {
            draft.flags.venomSurgeActive = true;
            draft.hfStats.venomSurgeTimer = 60000;
          }
          if (action.payload.id === 'winston_pack') {
            draft.personalInventory['winston_pack'] =
              (draft.personalInventory['winston_pack'] || 0) + 1;
          } else if (action.payload.id in draft.resources) {
            // Check if it's a known resource (like canned_tuna) and increment it
            const resKey = action.payload.id as keyof GameState['resources'];
            draft.resources[resKey] = (draft.resources[resKey] || 0) + 1;
          }
        } else {
          addLog('INSUFFICIENT CREDITS.', 'error');
        }
        break;
      }
      case 'FLUCTUATE_PRICES': {
        // Find existing prices or default to hardcoded ones if missing
        // We need to iterate over known items. We can't import vendingData here easily without circular dep risk?
        // Actually shopSlice doesn't import data usually. But we need the IDs.
        // Let's rely on the existing keys in vendingPrices if possible, or we might need to be passed the list.
        // For now, let's assume we iterate over keys in draft.vendingPrices.
        // But wait, initially it might be empty if lazy loaded? No, initialized in initialState.

        Object.keys(draft.vendingPrices).forEach((id) => {
          const currentPrice = draft.vendingPrices[id];
          // If it's free, KEEP IT FREE.
          if (currentPrice === 0) return;

          // Fluctuate by +/- 20%
          const variance = Math.random() * 0.4 - 0.2;
          let newPrice = Math.floor(currentPrice * (1 + variance));

          // Clamp price reasonable bounds (e.g. 2 - 50)
          newPrice = Math.max(2, Math.min(50, newPrice));

          draft.vendingPrices[id] = newPrice;
        });

        // Add random flavor log
        const logMsg =
          PRICE_FLUCTUATION_LOGS[Math.floor(Math.random() * PRICE_FLUCTUATION_LOGS.length)];
        addLog(logMsg, 'vibration');
        break;
      }
    }
  });
};
