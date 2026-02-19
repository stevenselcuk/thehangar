/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { encountersReducer, EncountersSliceState } from '../encountersSlice';
import { hangarReducer, HangarSliceState } from '../hangarSlice';

describe('Photo Event System', () => {
  describe('encountersReducer - OBSERVE_SEDAN', () => {
    it('should trigger EVENT_BLACK_SEDAN_OBSERVE and set activeEvent', () => {
      const initialState: EncountersSliceState = {
        resources: { suspicion: 0, experience: 0 } as any,
        flags: {} as any,
        hfStats: {} as any,
        logs: [],
        activeEvent: null,
        inventory: {} as any,
      };

      const action = { type: 'OBSERVE_SEDAN', payload: {} };
      const nextState = encountersReducer(initialState, action as any);

      expect(nextState.activeEvent).toBeDefined();
      expect(nextState.activeEvent?.id).toBe('EVENT_BLACK_SEDAN_OBSERVE');
      expect(nextState.activeEvent?.imagePath).toBe('/images/apron_1.png');
      expect(nextState.resources.suspicion).toBe(5);
      expect(nextState.logs.length).toBeGreaterThan(0);
    });
  });

  describe('hangarReducer - MARSHALLING', () => {
    it('should trigger EVENT_VANISHING_MARSHALLER with correct rng', () => {
      // Mock Math.random to control two calls:
      // 1. roll < 0.1 (Trigger check) -> return 0.05
      // 2. event index selection -> return 0.99 (Selects last item in list)
      const restoreRandom = (() => {
        const original = Math.random;
        let callCount = 0;
        Math.random = () => {
          callCount++;
          if (callCount === 1) return 0.05;
          return 0.99;
        };
        return () => {
          Math.random = original;
        };
      })();

      const initialState: HangarSliceState = {
        resources: { focus: 100, experience: 0, credits: 0, sanity: 100 } as any,
        activeEvent: null,
        logs: [],
      } as any;

      const action = { type: 'MARSHALLING', payload: {} };

      const nextState = hangarReducer(initialState, action as any);

      expect(nextState.activeEvent).toBeDefined();
      expect(nextState.activeEvent?.id).toBe('EVENT_VANISHING_MARSHALLER');
      expect(nextState.activeEvent?.type).toBe('story_event');

      restoreRandom();
    });
  });
});
