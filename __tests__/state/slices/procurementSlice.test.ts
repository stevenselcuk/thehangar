import { describe, it, expect } from 'vitest';
import { procurementReducer, ProcurementSliceState } from '../../../src/state/slices/procurementSlice';
import { Inventory, LogMessage, ProcurementState, ResourceState } from '../../../src/types';

describe('procurementReducer', () => {
  const initialProcurement: ProcurementState = {
    orders: [],
  };

  const initialResources: ResourceState = {
    credits: 1000,
    level: 1,
    experience: 0,
    sanity: 100,
    focus: 100,
    suspicion: 0,
    rivets: 0,
    alclad: 0,
  };

  const initialInventory: Inventory = {
    pcAssembled: false,
  } as Inventory;

  const initialState: ProcurementSliceState = {
    procurement: initialProcurement,
    resources: initialResources,
    inventory: initialInventory,
    logs: [],
  };

  it('should place an order if sufficient credits', () => {
    const action = {
      type: 'PLACE_ORDER' as const,
      payload: {
        itemId: 'drill_press',
        itemLabel: 'Drill Press',
        cost: 500,
        etaSeconds: 60,
      },
    };

    const nextState = procurementReducer(initialState, action);

    expect(nextState.resources.credits).toBe(500);
    expect(nextState.procurement.orders).toHaveLength(1);
    expect(nextState.procurement.orders[0]).toMatchObject({
        itemId: 'drill_press',
        itemLabel: 'Drill Press',
        cost: 500,
        status: 'ORDERED',
    });
    expect(nextState.logs).toHaveLength(1);
    expect(nextState.logs[0].text).toContain('ORDER PLACED');
  });

  it('should not place an order if insufficient credits', () => {
    const action = {
      type: 'PLACE_ORDER' as const,
      payload: {
        itemId: 'expensive_thing',
        itemLabel: 'Expensive Thing',
        cost: 2000,
        etaSeconds: 60,
      },
    };

    const nextState = procurementReducer(initialState, action);

    expect(nextState.resources.credits).toBe(1000);
    expect(nextState.procurement.orders).toHaveLength(0);
    expect(nextState.logs).toHaveLength(1);
    expect(nextState.logs[0].text).toContain('INSUFFICIENT CREDITS');
  });

  it('should cancel an order and refund partial credits', () => {
      // First place an order
      const placeAction = {
          type: 'PLACE_ORDER' as const,
          payload: {
              itemId: 'drill_press',
              itemLabel: 'Drill Press',
              cost: 500,
              etaSeconds: 60,
          },
      };
      const stateWithOrder = procurementReducer(initialState, placeAction);
      const orderId = stateWithOrder.procurement.orders[0].id;

      // Then cancel it
      const cancelAction = {
          type: 'CANCEL_ORDER' as const,
          payload: { orderId },
      };

      const nextState = procurementReducer(stateWithOrder, cancelAction);

      expect(nextState.procurement.orders).toHaveLength(0);
      // Refund is 80% of 500 = 400. Initial 1000 -> 500 -> +400 = 900.
      expect(nextState.resources.credits).toBe(900);
      expect(nextState.logs).toHaveLength(2); // One for place, one for cancel
      expect(nextState.logs[0].text).toContain('ORDER CANCELLED');
  });

  it('should deliver an order manually', () => {
      const placeAction = {
          type: 'PLACE_ORDER' as const,
          payload: {
              itemId: 'drill_press',
              itemLabel: 'Drill Press',
              cost: 500,
              etaSeconds: 60,
          },
      };
      const stateWithOrder = procurementReducer(initialState, placeAction);
      const orderId = stateWithOrder.procurement.orders[0].id;

      const deliverAction = {
          type: 'DELIVER_ORDER' as const,
          payload: { orderId },
      };

      const nextState = procurementReducer(stateWithOrder, deliverAction);

      // Order is removed from list
      expect(nextState.procurement.orders).toHaveLength(0);
      // Item added to inventory
      expect((nextState.inventory as any).drill_press).toBe(true);
      expect(nextState.logs).toHaveLength(2);
      expect(nextState.logs[0].text).toContain('DELIVERY RECEIVED');
  });

  it('should check deliveries and deliver ripe orders', () => {
      const placeAction = {
          type: 'PLACE_ORDER' as const,
          payload: {
              itemId: 'fast_item',
              itemLabel: 'Fast Item',
              cost: 100,
              etaSeconds: 0, // Immediate
          },
      };
      const stateWithOrder = procurementReducer(initialState, placeAction);

      // Advance time beyond ETA (which was immediate)
      const checkAction = {
          type: 'CHECK_DELIVERIES' as const,
          payload: { currentTime: Date.now() + 1000 },
      };

      const nextState = procurementReducer(stateWithOrder, checkAction);

      expect(nextState.procurement.orders).toHaveLength(0);
      expect((nextState.inventory as any).fast_item).toBe(true);
      expect(nextState.logs).toHaveLength(2);
      expect(nextState.logs[0].text).toContain('DELIVERY: Fast Item has arrived');
  });
});
