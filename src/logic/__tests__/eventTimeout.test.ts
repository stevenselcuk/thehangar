import { beforeEach, describe, expect, it, vi } from 'vitest';
import { processTick } from '../tickLogic.ts';
import { TabType, type GameState } from '../../types.ts';
import { createMinimalGameState } from '../../utils/testHelpers.ts';

describe('event timeout', () => {
  let state: GameState;
  const triggerEvent = vi.fn();

  beforeEach(() => {
    triggerEvent.mockClear();
    state = createMinimalGameState();
    state.resources.sanity = 80;
    state.resources.credits = 500;
  });

  it('applies the authored failureOutcome when one exists', () => {
    state.activeEvent = {
      id: 'TEST_TIMEOUT_AUTHORED',
      type: 'incident',
      title: 'Authored Failure',
      description: 'test',
      timeLeft: 1,
      totalTime: 10000,
      failureOutcome: {
        log: 'The specific authored consequence.',
        effects: { credits: -200, sanity: -5 },
      },
    };

    processTick(state, 100, triggerEvent, TabType.HANGAR);

    expect(state.resources.credits).toBe(300);
    expect(state.resources.sanity).toBe(75);
    expect(state.logs.some((l) => l.text === 'The specific authored consequence.')).toBe(true);
    expect(state.activeEvent).toBeNull();
  });

  it('floors credits at 0 rather than leaving the player in debt', () => {
    // Authored failure penalties are airline-scale: MD80_HYDRAULIC_LEAK bills
    // -47,000 against a 500-credit balance. Credits accrue at ~1.5/s, so an
    // unclamped debt is a multi-hour lockout from first-aid kits — and
    // sanitizeGameState silently erases it on the next reload.
    state.activeEvent = {
      id: 'TEST_TIMEOUT_RUINOUS',
      type: 'accident',
      title: 'Ruinous Failure',
      description: 'test',
      timeLeft: 1,
      totalTime: 10000,
      failureOutcome: {
        log: 'Cost: $47,000.',
        effects: { credits: -47000 },
      },
    };

    processTick(state, 100, triggerEvent, TabType.HANGAR);

    expect(state.resources.credits).toBe(0);
  });

  it('does not floor a failure the player can afford', () => {
    // The other side of the clamp: a survivable bill is still charged in full.
    state.activeEvent = {
      id: 'TEST_TIMEOUT_AFFORDABLE',
      type: 'accident',
      title: 'Affordable Failure',
      description: 'test',
      timeLeft: 1,
      totalTime: 10000,
      failureOutcome: {
        log: 'A manageable bill.',
        effects: { credits: -120 },
      },
    };

    processTick(state, 100, triggerEvent, TabType.HANGAR);

    expect(state.resources.credits).toBe(380);
  });

  it('falls back to the generic penalty when failureOutcome has no effects', () => {
    state.activeEvent = {
      id: 'TEST_TIMEOUT_BARE',
      type: 'accident',
      title: 'Bare Failure',
      description: 'test',
      timeLeft: 1,
      totalTime: 10000,
      failureOutcome: { log: 'Something went wrong.' },
    };

    processTick(state, 100, triggerEvent, TabType.HANGAR);

    // accident carries a 40-point generic sanity penalty
    expect(state.resources.sanity).toBe(40);
    expect(state.logs.some((l) => l.text === 'Something went wrong.')).toBe(true);
  });
});
