import { produce } from 'immer';
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
    };

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
        const basePrice = draft.vendingPrices[action.payload.id] || action.payload.cost;
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
    }
  });
};
