import { describe, expect, it } from 'vitest';
import { createInitialState } from '../../initialState';
import { shopReducer, ShopSliceState } from '../shopSlice';

describe('shopSlice', () => {
  const baseState = createInitialState();
  const initialState: ShopSliceState = {
    resources: { ...baseState.resources, credits: 100, sanity: 50, focus: 50, suspicion: 0 },
    inventory: baseState.inventory,
    personalInventory: {},
    toolConditions: baseState.toolConditions,
    flags: baseState.flags,
    hfStats: baseState.hfStats,
    vendingPrices: { winston_pack: 35, venom_surge: 25 },
    logs: [],
  };

  it('should handle BUY_VENDING for Winston Lights (success)', () => {
    const action = {
      type: 'BUY_VENDING' as const,
      payload: {
        id: 'winston_pack',
        cost: 35,
        sanity: 5,
        focus: -5,
        msg: 'Bought smokes',
      },
    };

    const nextState = shopReducer(initialState, action);

    expect(nextState.resources.credits).toBe(65); // 100 - 35
    expect(nextState.personalInventory['winston_pack']).toBe(1);
    expect(nextState.logs).toHaveLength(1);
    expect(nextState.logs[0].text).toBe('Bought smokes');
  });

  it('should handle BUY_VENDING insufficient credits', () => {
    const poorState = {
      ...initialState,
      resources: { ...initialState.resources, credits: 10 },
    };
    const action = {
      type: 'BUY_VENDING' as const,
      payload: {
        id: 'winston_pack',
        cost: 35,
        sanity: 5,
        focus: -5,
        msg: 'Bought smokes',
      },
    };

    const nextState = shopReducer(poorState, action);

    expect(nextState.resources.credits).toBe(10);
    expect(nextState.personalInventory['winston_pack']).toBeUndefined();
    expect(nextState.logs[0].text).toContain('INSUFFICIENT CREDITS');
  });

  it('should apply suspicion markup', () => {
    const susState = {
      ...initialState,
      resources: { ...initialState.resources, suspicion: 80, credits: 100 },
    };
    const action = {
      type: 'BUY_VENDING' as const,
      payload: {
        id: 'winston_pack',
        cost: 35,
        sanity: 5,
        focus: -5,
        msg: 'Bought smokes',
      },
    };

    // Base price 35. Suspicion > 50 -> * 1.5 = 52.5 -> floor(52)
    const expectedCost = Math.floor(35 * 1.5); // 52

    const nextState = shopReducer(susState, action);

    expect(nextState.resources.credits).toBe(100 - expectedCost);
    expect(nextState.personalInventory['winston_pack']).toBe(1);
    // Should have warning log about price + success log
    expect(nextState.logs.some((l) => l.text.includes('charge you extra'))).toBe(true);
  });
});
