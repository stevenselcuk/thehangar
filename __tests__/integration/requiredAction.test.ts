import { beforeEach, describe, expect, it } from 'vitest';
import { gameReducer } from '@/state/gameReducer.ts';
import { createMinimalGameState } from '@/utils/testHelpers.ts';
import type { GameState } from '@/types.ts';

describe('requiredAction events', () => {
  let state: GameState;

  beforeEach(() => {
    state = createMinimalGameState();
    state.resources.level = 20;
    state.activeEvent = {
      id: 'TEST_REQUIRED',
      type: 'incident',
      title: 'Sweep The Ramp',
      description: 'test',
      timeLeft: 30000,
      totalTime: 30000,
      requiredAction: 'FOD_SWEEP',
      successOutcome: { log: 'The ramp is clear.', effects: { experience: 300 } },
      failureOutcome: { log: 'Debris ingested.' },
    };
  });

  it('resolves when the player performs the required action', () => {
    const next = gameReducer(state, {
      type: 'ACTION',
      payload: { type: 'FOD_SWEEP', payload: {} },
    });

    expect(next.activeEvent).toBeNull();
    expect(next.logs.some((l) => l.text === 'The ramp is clear.')).toBe(true);
  });

  it('does not resolve when an unrelated action is performed', () => {
    const next = gameReducer(state, {
      type: 'ACTION',
      payload: { type: 'PERFORM_NDT', payload: {} },
    });

    expect(next.activeEvent).not.toBeNull();
    expect(next.activeEvent?.id).toBe('TEST_REQUIRED');
  });

  it('does not resolve on a bare RESOLVE_EVENT with no choice', () => {
    const next = gameReducer(state, {
      type: 'ACTION',
      payload: { type: 'RESOLVE_EVENT', payload: {} },
    });

    expect(next.activeEvent).not.toBeNull();
  });

  it('applies the successOutcome effects and awards the standard resolution XP', () => {
    // Baseline: FOD_SWEEP itself grants +40 XP (hangarSlice); the
    // requiredAction success then grants the event's own +300 XP, plus the
    // flat +100 XP every RESOLVE_EVENT resolution awards. All three must
    // land, not just the routing.
    const next = gameReducer(state, {
      type: 'ACTION',
      payload: { type: 'FOD_SWEEP', payload: {} },
    });

    expect(next.resources.experience).toBe(0 + 40 + 300 + 100);
    expect(next.stats.eventsResolved).toBe(1);
  });

  it('chains an authored successor after the requiredAction resolves, without re-resolving it in the same dispatch', () => {
    // MARSHALLING_WRONG_GATE is a real, unrelated 'incident' event with no
    // requiredAction of its own, so a spurious re-resolution off the same
    // FOD_SWEEP dispatch would be caught by its shape, not just its id.
    state.activeEvent = {
      ...(state.activeEvent as NonNullable<GameState['activeEvent']>),
      successOutcome: {
        log: 'The ramp is clear.',
        effects: { experience: 300 },
        nextEventId: 'MARSHALLING_WRONG_GATE',
      },
    };

    const next = gameReducer(state, {
      type: 'ACTION',
      payload: { type: 'FOD_SWEEP', payload: {} },
    });

    expect(next.activeEvent).not.toBeNull();
    expect(next.activeEvent?.id).toBe('MARSHALLING_WRONG_GATE');
    expect(next.activeEvent?.requiredAction).toBeUndefined();
    expect(next.stats.eventsResolved).toBe(1);
  });
});
