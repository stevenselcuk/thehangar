import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useResourceSelectors } from '../useGameSelectors.ts';
import { isDead } from '../../logic/deathConditions.ts';
import { createMinimalGameState } from '../../utils/testHelpers.ts';

/**
 * No hook-testing convention exists in this repo yet (no other hook has a
 * test file). Rather than mount a full UI component, this exercises the
 * real useResourceSelectors hook directly via renderHook and reads back
 * its actual computed vitalsStatus.isDying, the same way
 * deathConditions.test.ts asserts against the real isDead rather than a
 * redefinition.
 */
const isDyingFor = (state: ReturnType<typeof createMinimalGameState>) => {
  const { result } = renderHook(() => useResourceSelectors(state));
  return result.current.vitalsStatus.isDying;
};

describe('useResourceSelectors vitalsStatus.isDying', () => {
  it('is false for a healthy technician', () => {
    const state = createMinimalGameState();
    expect(isDyingFor(state)).toBe(false);
  });

  it('flips true from low sanity alone', () => {
    const state = createMinimalGameState();
    state.resources.sanity = 10;
    expect(isDyingFor(state)).toBe(true);
  });

  it('flips true from high suspicion alone', () => {
    const state = createMinimalGameState();
    state.resources.suspicion = 95;
    expect(isDyingFor(state)).toBe(true);
  });

  it('flips true from low health alone', () => {
    const state = createMinimalGameState();
    state.resources.health = 15;
    expect(isDyingFor(state)).toBe(true);
  });

  it('does not flip on sanity just above the threshold', () => {
    const state = createMinimalGameState();
    state.resources.sanity = 11;
    expect(isDyingFor(state)).toBe(false);
  });

  it('does not flip on suspicion just below the threshold', () => {
    const state = createMinimalGameState();
    state.resources.suspicion = 94;
    expect(isDyingFor(state)).toBe(false);
  });

  describe('health leg boundary', () => {
    it('is true one below the threshold (14)', () => {
      const state = createMinimalGameState();
      state.resources.health = 14;
      expect(isDyingFor(state)).toBe(true);
    });

    it('is true exactly at the threshold (15)', () => {
      const state = createMinimalGameState();
      state.resources.health = 15;
      expect(isDyingFor(state)).toBe(true);
    });

    it('is false one above the threshold (16)', () => {
      const state = createMinimalGameState();
      state.resources.health = 16;
      expect(isDyingFor(state)).toBe(false);
    });
  });

  it('is a genuinely distinct, more permissive predicate than isDead', () => {
    const state = createMinimalGameState();
    state.resources.health = 15;

    expect(isDyingFor(state)).toBe(true);
    expect(isDead(state.resources)).toBe(false);
  });
});
