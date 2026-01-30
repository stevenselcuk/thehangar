import { produce } from 'immer';
import { addLogToDraft } from '../../services/logService.ts';
import { Inventory, LogMessage, ProcurementState, ResourceState } from '../../types.ts';

/**
 * procurementSlice.ts - Equipment Procurement Logic
 */

export interface ProcurementSliceState {
  procurement: ProcurementState;
  resources: ResourceState;
  inventory: Inventory;
  logs: LogMessage[];
}

// ===== ACTION TYPES =====

export type ProcurementAction =
  | {
      type: 'PLACE_ORDER';
      payload: { itemId: string; itemLabel: string; cost: number; etaSeconds: number };
    }
  | { type: 'CANCEL_ORDER'; payload: { orderId: string } }
  | { type: 'DELIVER_ORDER'; payload: { orderId: string } }
  | { type: 'CHECK_DELIVERIES'; payload: { currentTime: number } }
  | { type: 'UNLOCK_CATALOGUE_LEVEL'; payload: { level: number } };

// ===== REDUCER =====

export const procurementReducer = produce(
  (draft: ProcurementSliceState, action: ProcurementAction) => {
    const addLog = (text: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
      // Type checking for log type to match LogMessage type which is narrower
      // Type checking for log type to match LogMessage type which is narrower
      const logType = type === 'success' ? 'info' : type;
      addLogToDraft(draft.logs, text, logType, Date.now());
    };

    switch (action.type) {
      case 'PLACE_ORDER': {
        const { itemId, itemLabel, cost, etaSeconds } = action.payload;

        if (draft.resources.credits >= cost) {
          draft.resources.credits -= cost;

          const newOrder = {
            id: Math.random().toString(36).substr(2, 9),
            itemId,
            itemLabel,
            orderTimestamp: Date.now(),
            deliveryEta: Date.now() + etaSeconds * 1000,
            status: 'ORDERED' as const,
            cost,
          };

          draft.procurement.orders.push(newOrder);
          addLog(`ORDER PLACED: ${itemLabel}. ETA: ${Math.ceil(etaSeconds / 60)}m.`, 'info');
        } else {
          addLog('INSUFFICIENT CREDITS for procurement.', 'error');
        }
        break;
      }

      case 'CANCEL_ORDER': {
        const { orderId } = action.payload;
        const orderIndex = draft.procurement.orders.findIndex((o) => o.id === orderId);
        if (orderIndex !== -1) {
          const order = draft.procurement.orders[orderIndex];
          if (order.status === 'ORDERED' || order.status === 'SHIPPED') {
            // Refund 80%
            const refund = Math.floor(order.cost * 0.8);
            draft.resources.credits += refund;
            draft.procurement.orders.splice(orderIndex, 1);
            addLog(`ORDER CANCELLED: ${order.itemLabel}. Refunded ${refund} credits.`, 'warning');
          }
        }
        break;
      }

      case 'DELIVER_ORDER': {
        const { orderId } = action.payload;
        const order = draft.procurement.orders.find((o) => o.id === orderId);

        if (order && order.status !== 'DELIVERED') {
          order.status = 'DELIVERED';
          // Add to inventory
          (draft.inventory as unknown as Record<string, boolean | number>)[order.itemId] = true;
          // Remove from active orders list after delivery or keep for history?
          // Let's remove it to keep array small.
          draft.procurement.orders = draft.procurement.orders.filter((o) => o.id !== orderId);

          addLog(`DELIVERY RECEIVED: ${order.itemLabel} has arrived at the toolroom.`, 'success');
        }
        break;
      }

      case 'CHECK_DELIVERIES': {
        const { currentTime } = action.payload;
        const ordersToDeliver = draft.procurement.orders.filter(
          (o) => o.status === 'ORDERED' && o.deliveryEta <= currentTime
        );

        ordersToDeliver.forEach((order) => {
          order.status = 'DELIVERED';
          (draft.inventory as unknown as Record<string, boolean | number>)[order.itemId] = true;
          addLog(`DELIVERY: ${order.itemLabel} has arrived.`, 'success');
        });

        // Remove delivered orders
        if (ordersToDeliver.length > 0) {
          draft.procurement.orders = draft.procurement.orders.filter(
            (o) => o.status !== 'DELIVERED'
          );
        }
        break;
      }
    }
  }
);
