import { describe, expect, it, vi } from 'vitest';
import { createInitialState } from '../../initialState';
import { aircraftReducer, AircraftSliceState } from '../aircraftSlice';

describe('aircraftSlice', () => {
  const baseState = createInitialState();
  const initialState: AircraftSliceState = {
    activeAircraft: null,
    activeScenario: null,
    resources: { ...baseState.resources, sanity: 50, focus: 50 },
    inventory: baseState.inventory,
    personalInventory: { winston_pack: 1 },
    flags: baseState.flags,
    hfStats: { ...baseState.hfStats, socialStress: 80, fatigue: 60 },
    logs: [],
  };

  it('should handle SMOKE_CIGARETTE success', () => {
    const action = {
      type: 'SMOKE_CIGARETTE' as const,
      payload: { triggerEvent: vi.fn() },
    };

    const nextState = aircraftReducer(initialState, action);

    // Check inventory consumed
    expect(nextState.personalInventory['winston_pack']).toBe(0);

    // Check stats halved
    expect(nextState.hfStats.socialStress).toBe(40); // 80 / 2
    expect(nextState.hfStats.fatigue).toBe(30); // 60 / 2

    // Check resources gained
    expect(nextState.resources.sanity).toBe(55); // 50 + 5
    expect(nextState.resources.focus).toBe(55); // 50 + 5

    // Check logs
    expect(nextState.logs[0].text).toContain('You light up a Winston Light');
  });

  it('should fail SMOKE_CIGARETTE if no items', () => {
    const noSmokesState = {
      ...initialState,
      personalInventory: {},
    };
    const action = {
      type: 'SMOKE_CIGARETTE' as const,
      payload: { triggerEvent: vi.fn() },
    };

    const nextState = aircraftReducer(noSmokesState, action);

    // Check stats unchanged
    expect(nextState.hfStats.socialStress).toBe(80);
    expect(nextState.hfStats.fatigue).toBe(60);

    // Check logs
    expect(nextState.logs[0].text).toContain('out of smokes');
  });
});
