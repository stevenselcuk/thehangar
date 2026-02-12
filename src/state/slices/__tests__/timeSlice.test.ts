import { describe, expect, it } from 'vitest';
import { SHIFT_DURATION_MS, TIME_SCALE, initialTimeState, timeReducer } from '../timeSlice';

describe('timeSlice', () => {
  it('should return the initial state', () => {
    const result = timeReducer(undefined, { type: 'UNKNOWN', payload: { delta: 0 } });
    expect(result).toEqual(initialTimeState);
  });

  it('should accumulate time on TIME_TICK', () => {
    const delta = 1000;
    const now = Date.now();
    const action = {
      type: 'TIME_TICK',
      payload: { delta, now },
    };
    const result = timeReducer(initialTimeState, action);

    expect(result.totalPlayTime).toBe(1000);
    expect(result.sessionTime).toBe(1000);
    // Scaled time check
    expect(result.shiftTime).toBe(1000 * TIME_SCALE);
    expect(result.lastTick).toBe(now);
  });

  it('should increment shift cycle when scaled shift time exceeds limit', () => {
    // Start with time just before shift end
    const startState = {
      ...initialTimeState,
      shiftTime: SHIFT_DURATION_MS - 100 * TIME_SCALE,
    };

    const delta = 200; // 200ms real time * 24 = 4800ms game time > remaining time
    const action = {
      type: 'TIME_TICK',
      payload: { delta },
    };
    const result = timeReducer(startState, action);

    expect(result.shiftCycle).toBe(2);
    // 200 real ms * 24 = 4800 game ms.
    // Remaining needed = 100 * 24 = 2400 game ms.
    // Excess = 2400 game ms.
    expect(result.shiftTime).toBe(200 * TIME_SCALE - 100 * TIME_SCALE);
  });

  it('should reset session time', () => {
    const startState = {
      ...initialTimeState,
      sessionTime: 5000,
    };
    const action = { type: 'RESET_SESSION', payload: { delta: 0 } };
    const result = timeReducer(startState, action);

    expect(result.sessionTime).toBe(0);
    // Other times should remain
    expect(result.totalPlayTime).toBe(0);
  });
});
