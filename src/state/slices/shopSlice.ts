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
  | { type: 'FLUCTUATE_PRICES'; payload?: Record<string, never> };

// ==================== REDUCER ====================

export const shopReducer = (state: ShopSliceState, action: ShopAction): ShopSliceState => {
  return produce(state, (draft) => {
    const addLog = (
      text: string,
      type: 'info' | 'success' | 'warning' | 'error' | 'story' | 'levelup' | 'vibration' = 'info'
    ) => {
      addLogToDraft(draft.logs, text, type, Date.now());
    };

    switch (action.type) {
      case 'BUY_SHOP_ITEM':
        if (draft.resources.alclad >= action.payload.cost) {
          draft.resources.alclad -= action.payload.cost;
          (draft.inventory as unknown as Record<string, unknown>)[action.payload.item] = true;
          draft.toolConditions[action.payload.item] = 100;
          addLog(`PURCHASED: ${action.payload.item.toUpperCase()}`);
        } else {
          addLog('NOT ENOUGH ALCLAD SCRAP.', 'error');
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
