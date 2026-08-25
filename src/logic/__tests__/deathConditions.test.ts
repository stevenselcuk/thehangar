import { describe, expect, it } from 'vitest';
import { isDead } from '../deathConditions.ts';
import { createMinimalGameState } from '../../utils/testHelpers.ts';

describe('isDead', () => {
  it('leaves a healthy technician alive', () => {
    const state = createMinimalGameState();
    expect(isDead(state.resources)).toBe(false);
  });

  it('counts sanity at 0 as death', () => {
    const state = createMinimalGameState();
    state.resources.sanity = 0;
    expect(isDead(state.resources)).toBe(true);
  });

  it('counts sanity below 0 as death', () => {
    const state = createMinimalGameState();
    state.resources.sanity = -5;
    expect(isDead(state.resources)).toBe(true);
  });

  it('does not count sanity just above 0 as death', () => {
    const state = createMinimalGameState();
    state.resources.sanity = 1;
    expect(isDead(state.resources)).toBe(false);
  });

  it('counts suspicion at 100 as death', () => {
    const state = createMinimalGameState();
    state.resources.suspicion = 100;
    expect(isDead(state.resources)).toBe(true);
  });

  it('counts suspicion above 100 as death', () => {
    const state = createMinimalGameState();
    state.resources.suspicion = 105;
    expect(isDead(state.resources)).toBe(true);
  });

  it('does not count suspicion just below 100 as death', () => {
    const state = createMinimalGameState();
    state.resources.suspicion = 99;
    expect(isDead(state.resources)).toBe(false);
  });

  it('counts health at 0 as death', () => {
    const state = createMinimalGameState();
    state.resources.health = 0;
    expect(isDead(state.resources)).toBe(true);
  });

  it('counts health below 0 as death', () => {
    const state = createMinimalGameState();
    state.resources.health = -1;
    expect(isDead(state.resources)).toBe(true);
  });

  it('does not count health just above 0 as death', () => {
    const state = createMinimalGameState();
    state.resources.health = 1;
    expect(isDead(state.resources)).toBe(false);
  });
});
