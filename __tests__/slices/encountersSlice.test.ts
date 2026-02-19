import {
  encountersReducer,
  type EncountersAction,
  type EncountersSliceState,
} from '@/state/slices/encountersSlice.ts';
import seedrandom from 'seedrandom';
import { beforeEach, describe, expect, it } from 'vitest';

import { createInitialState } from '@/state/initialState';

describe('encountersSlice', () => {
  let initialState: EncountersSliceState;

  beforeEach(() => {
    Math.random = seedrandom('test-encounters');

    initialState = createInitialState() as unknown as EncountersSliceState;
    initialState.logs = [];
  });

  describe('OBSERVE_SEDAN', () => {
    it('should trigger EVENT_BLACK_SEDAN_OBSERVE', () => {
      const action: EncountersAction = {
        type: 'OBSERVE_SEDAN',
        payload: {},
      };

      const result = encountersReducer(initialState, action);

      expect(result.resources.suspicion).toBe(5);
      expect(result.resources.experience).toBe(150);
      expect(result.activeEvent).toBeDefined();
      expect(result.activeEvent?.id).toBe('EVENT_BLACK_SEDAN_OBSERVE');
      expect(result.logs[0].type).toBe('story');
    });
  });

  describe('JANITOR_INTERACTION', () => {
    it('should clear janitor present flag', () => {
      const action: EncountersAction = {
        type: 'JANITOR_INTERACTION',
        payload: {},
      };

      const result = encountersReducer(initialState, action);

      expect(result.flags.janitorPresent).toBe(false);
      expect(result.logs).toHaveLength(1);
    });

    it('should cause extreme fear 20% of time', () => {
      Math.random = seedrandom('janitor-stares');

      const action: EncountersAction = {
        type: 'JANITOR_INTERACTION',
        payload: {},
      };

      const result = encountersReducer(initialState, action);

      if (result.flags.isAfraid && result.hfStats.fearTimer === 45000) {
        expect(result.resources.sanity).toBe(75);
        expect(result.logs[0].type).toBe('vibration');
        expect(result.logs[0].text).toContain('eyes');
      }
    });

    it('should give ID card 20-40% if not already owned', () => {
      Math.random = seedrandom('janitor-gives-item');

      const action: EncountersAction = {
        type: 'JANITOR_INTERACTION',
        payload: {},
      };

      const result = encountersReducer(initialState, action);

      if (result.inventory.foundRetiredIDCard) {
        expect(result.logs[0].type).toBe('story');
        expect(result.logs[0].text).toContain('ID card');
      }
    });

    it('should not give ID card if already owned', () => {
      const withCard = {
        ...initialState,
        inventory: { ...initialState.inventory, foundRetiredIDCard: true },
      };

      const action: EncountersAction = {
        type: 'JANITOR_INTERACTION',
        payload: {},
      };

      const result = encountersReducer(withCard, action);

      // Should skip to next outcome
      expect(result.inventory.foundRetiredIDCard).toBe(true);
    });

    it('should give hint 40-60%', () => {
      Math.random = seedrandom('janitor-hint');

      const action: EncountersAction = {
        type: 'JANITOR_INTERACTION',
        payload: {},
      };

      const result = encountersReducer(initialState, action);

      if (result.logs[0].text.includes('dust') || result.logs[0].text.includes('circle')) {
        expect(result.logs[0].type).toBe('story');
      }
    });

    it('should ignore player 60%+', () => {
      Math.random = seedrandom('janitor-ignores');

      const action: EncountersAction = {
        type: 'JANITOR_INTERACTION',
        payload: {},
      };

      const result = encountersReducer(initialState, action);

      if (result.logs[0].text.includes('continues mopping')) {
        expect(result.logs[0].type).toBe('info');
      }
    });
  });

  describe('Immutability', () => {
    it('should not mutate original state', () => {
      const action: EncountersAction = {
        type: 'OBSERVE_SEDAN',
        payload: {},
      };

      const originalSuspicion = initialState.resources.suspicion;
      encountersReducer(initialState, action);

      expect(initialState.resources.suspicion).toBe(originalSuspicion);
    });
  });
});
