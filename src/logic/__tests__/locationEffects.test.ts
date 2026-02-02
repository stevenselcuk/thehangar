import { describe, expect, it, vi } from 'vitest';
import { gameReducer } from '../../state/gameReducer';
import { createInitialState } from '../../state/initialState';
import { TabType } from '../../types';

describe('Location Effects in Game Reducer', () => {
  const triggerEvent = vi.fn();

  it('should increase suspicion in LOW noise locations (e.g. Canteen)', () => {
    const initialState = createInitialState();
    initialState.resources.suspicion = 0;

    // Canteen has LOW noise
    const action = {
      type: 'TICK' as const,
      payload: { delta: 1000, triggerEvent, activeTab: TabType.CANTEEN },
    };

    const nextState = gameReducer(initialState, action);

    // Low noise adds 0.5 per second (1000ms)
    expect(nextState.resources.suspicion).toBeGreaterThan(0);
    // 0.02 base suspicion from tick + 0.5 from location = 0.52 approx
    expect(nextState.resources.suspicion).toBeCloseTo(0.5, 1);
  });

  it('should increase social stress and decrease focus in EXTREME_HIGH noise locations (e.g. Apron)', () => {
    const initialState = createInitialState();
    initialState.hfStats.socialStress = 0;
    initialState.resources.focus = 100;

    // Apron has EXTREME_HIGH noise
    const action = {
      type: 'TICK' as const,
      payload: { delta: 1000, triggerEvent, activeTab: TabType.APRON_LINE },
    };

    const nextState = gameReducer(initialState, action);

    // Extreme high noise: Stress +1.5, Focus -2.0 -> Modified by difficulty 1.05: Drain 5.25, Regen 3.0 = Net -2.25
    expect(nextState.hfStats.socialStress).toBe(1.5);
    expect(nextState.resources.focus).toBe(97.75);
  });

  it('should increase social stress when an event is active', () => {
    const initialState = createInitialState();
    initialState.hfStats.socialStress = 0;
    initialState.activeEvent = {
      id: 'test',
      type: 'incident',
      title: 'Test Event',
      description: 'desc',
      timeLeft: 10000,
      totalTime: 10000,
      failureOutcome: { log: 'fail' },
    };

    // Hangar has MEDIUM noise (no direct stress effect from noise)
    const action = {
      type: 'TICK' as const,
      payload: { delta: 1000, triggerEvent, activeTab: TabType.HANGAR },
    };

    const nextState = gameReducer(initialState, action);

    // Event active adds 2.0 stress per second
    expect(nextState.hfStats.socialStress).toBe(2.0);
  });

  it('should adjust temperature towards location target', () => {
    const initialState = createInitialState();
    initialState.hfStats.temperature = 20; // Start at 20C

    // Apron has EXTREME_LOW temp (-10C)
    const action = {
      type: 'TICK' as const,
      payload: { delta: 1000, triggerEvent, activeTab: TabType.APRON_LINE },
    };

    const nextState = gameReducer(initialState, action);

    // Should decrease by 0.5 deg/sec towards -10
    expect(nextState.hfStats.temperature).toBe(19.5);
  });

  it('should accumulate fatigue according to location rate', () => {
    const initialState = createInitialState();
    initialState.hfStats.fatigue = 0;

    // Structure Shop has HIGH fatigue rate (1.2)
    const action = {
      type: 'TICK' as const,
      payload: { delta: 1000, triggerEvent, activeTab: TabType.STRUCTURE_SHOP },
    };

    const nextState = gameReducer(initialState, action);
    expect(nextState.hfStats.fatigue).toBe(1.2);
  });
});
