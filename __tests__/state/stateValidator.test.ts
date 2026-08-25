import { GAME_CONSTANTS } from '@/data/constants.ts';
import { createInitialState } from '@/state/initialState';
import { isValidGameState, sanitizeGameState } from '@/state/stateValidator';
import { describe, expect, it } from 'vitest';

describe('stateValidator', () => {
  describe('isValidGameState', () => {
    it('accepts a freshly created game state', () => {
      expect(isValidGameState(createInitialState())).toBe(true);
    });

    it('rejects a state missing required top-level properties', () => {
      expect(isValidGameState({})).toBe(false);
      expect(isValidGameState(null)).toBe(false);
      expect(isValidGameState('not an object')).toBe(false);
    });
  });

  describe('sanitizeGameState', () => {
    it('returns null for an invalid state', () => {
      expect(sanitizeGameState({})).toBeNull();
    });

    it('leaves a level-0 state at level 0 (lower bound, in range)', () => {
      const state = {
        ...createInitialState(),
        resources: { ...createInitialState().resources, level: 0 },
      };

      const sanitized = sanitizeGameState(state);

      expect(sanitized?.resources.level).toBe(0);
    });

    it('clamps a below-range level up to 0', () => {
      const state = {
        ...createInitialState(),
        resources: { ...createInitialState().resources, level: -5 },
      };

      const sanitized = sanitizeGameState(state);

      expect(sanitized?.resources.level).toBe(0);
    });

    it('leaves a level at MAX_LEVEL unchanged (upper bound, in range)', () => {
      const state = {
        ...createInitialState(),
        resources: { ...createInitialState().resources, level: GAME_CONSTANTS.MAX_LEVEL },
      };

      const sanitized = sanitizeGameState(state);

      expect(sanitized?.resources.level).toBe(GAME_CONSTANTS.MAX_LEVEL);
    });

    it('clamps an above-range level down to MAX_LEVEL', () => {
      const state = {
        ...createInitialState(),
        resources: { ...createInitialState().resources, level: GAME_CONSTANTS.MAX_LEVEL + 10 },
      };

      const sanitized = sanitizeGameState(state);

      expect(sanitized?.resources.level).toBe(GAME_CONSTANTS.MAX_LEVEL);
    });
  });
});
