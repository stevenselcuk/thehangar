import { beforeEach, describe, expect, it, vi } from 'vitest';
import { aircraftEvents } from '@/data/aircraftEvents.ts';
import { gameReducer } from '@/state/gameReducer.ts';
import { createMinimalGameState } from '@/utils/testHelpers.ts';
import type { EnvironmentalHazard, GameEvent, GameState } from '@/types.ts';

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

/**
 * The synthetic FOD_SWEEP fixture above proves the wiring. These drive the
 * same path with an event exactly as authored in src/data/aircraftEvents.ts —
 * the shape that actually reaches players, and the one whose requiredAction
 * had never named a routable action.
 */
describe('requiredAction on a real authored event', () => {
  const authored = (id: string): GameEvent => {
    const template = aircraftEvents.accident.find((event) => event.id === id);
    if (!template) throw new Error(`No authored accident event ${id}`);
    return { ...template, timeLeft: template.totalTime } as GameEvent;
  };

  let state: GameState;

  beforeEach(() => {
    state = createMinimalGameState();
    state.resources.level = 25;
    // MD80_TAILSTRIKE_DAMAGE requires PERFORM_NDT and pays 350 XP, -18 sanity,
    // 12 suspicion and 8 alclad on success.
    state.activeEvent = authored('MD80_TAILSTRIKE_DAMAGE');
  });

  it('resolves when the player performs the authored required action', () => {
    const next = gameReducer(state, {
      type: 'ACTION',
      payload: { type: 'PERFORM_NDT', payload: {} },
    });

    expect(next.activeEvent).toBeNull();
    expect(next.logs.some((l) => l.text.startsWith('You perform dye penetrant'))).toBe(true);
    expect(next.stats.eventsResolved).toBe(1);
  });

  it('does not resolve when a different real action is performed', () => {
    const next = gameReducer(state, {
      type: 'ACTION',
      payload: { type: 'TIGHTEN_BOLT', payload: {} },
    });

    expect(next.activeEvent?.id).toBe('MD80_TAILSTRIKE_DAMAGE');
    expect(next.stats.eventsResolved).toBe(0);
  });
});

describe('an action that never ran does not satisfy a requiredAction', () => {
  const storm: EnvironmentalHazard = {
    id: 'STORM',
    name: 'Lightning Warning',
    description: 'test',
    type: 'weather',
    effects: { tarmacActionsDisabled: true },
    duration: 10000,
  };

  const timedTask = (requiredAction: string): GameEvent => ({
    id: 'TEST_GATED_TASK',
    type: 'incident',
    title: 'Gated task',
    description: 'test',
    timeLeft: 30000,
    totalTime: 30000,
    requiredAction,
    successOutcome: { log: 'Task complete.', effects: { experience: 999 } },
    failureOutcome: { log: 'Missed.' },
  });

  const withEvent = (event: GameEvent, level: number, hazards: EnvironmentalHazard[] = []) => {
    const state = createMinimalGameState();
    state.resources.level = level;
    state.activeEvent = event;
    state.activeHazards = hazards;
    state.flags.foundSnapon = true; // FOD_SWEEP hands out a one-time event otherwise
    return state;
  };

  it('does not resolve an action refused by the level gate', () => {
    // ANALYZE_ANOMALY requires level 15.
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const state = withEvent(timedTask('ANALYZE_ANOMALY'), 0);
    const before = state.resources.focus;

    const next = gameReducer(state, {
      type: 'ACTION',
      payload: { type: 'ANALYZE_ANOMALY', payload: {} },
    });

    expect(next.activeEvent?.id).toBe('TEST_GATED_TASK');
    expect(next.resources.experience).toBe(0);
    expect(next.resources.focus).toBe(before);
    expect(next.stats.accessViolations).toBe(1);
  });

  it('resolves the same action once the player is cleared for it', () => {
    const next = gameReducer(withEvent(timedTask('ANALYZE_ANOMALY'), 25), {
      type: 'ACTION',
      payload: { type: 'ANALYZE_ANOMALY', payload: {} },
    });

    expect(next.activeEvent).toBeNull();
    expect(next.resources.experience).toBeGreaterThanOrEqual(999);
  });

  it('does not resolve a tarmac action refused by a hazard', () => {
    const next = gameReducer(withEvent(timedTask('FOD_SWEEP'), 25, [storm]), {
      type: 'ACTION',
      payload: { type: 'FOD_SWEEP', payload: {} },
    });

    expect(next.activeEvent?.id).toBe('TEST_GATED_TASK');
    expect(next.resources.experience).toBe(0);
  });

  it('resolves the same tarmac action once the hazard clears', () => {
    const next = gameReducer(withEvent(timedTask('FOD_SWEEP'), 25, []), {
      type: 'ACTION',
      payload: { type: 'FOD_SWEEP', payload: {} },
    });

    expect(next.activeEvent).toBeNull();
    expect(next.resources.experience).toBeGreaterThanOrEqual(999);
  });
});

/**
 * The structural guard. No authored event should ever reach this state — the
 * integrity test in eventIntegrity.test.ts fails the build if one does — but
 * if bad data lands anyway, the event must not become a guaranteed timeout at
 * its authored failure penalty. ActionPanel renders DISCARD instead of the
 * read-only placard for exactly this case, and eventsSlice lets that dispatch
 * through.
 */
describe('an event whose requiredAction names nothing routable', () => {
  const unroutable = (): GameEvent => ({
    id: 'TEST_UNROUTABLE',
    type: 'accident',
    title: 'Prose, not an action',
    description: 'test',
    timeLeft: 30000,
    totalTime: 30000,
    requiredAction: 'Isolate System B per AMM 29-11-00',
    successOutcome: { log: 'Never reachable.', effects: { experience: 999 } },
    failureOutcome: { log: 'Missed.' },
  });

  it('can be discarded with a bare RESOLVE_EVENT', () => {
    const state = createMinimalGameState();
    state.resources.level = 25;
    state.activeEvent = unroutable();

    const next = gameReducer(state, {
      type: 'ACTION',
      payload: { type: 'RESOLVE_EVENT', payload: {} },
    });

    expect(next.activeEvent).toBeNull();
    // Discarded, not won: the unreachable successOutcome is not paid out.
    expect(next.logs.some((l) => l.text === 'Never reachable.')).toBe(false);
  });

  it('still holds a routable requiredAction open against the same dispatch', () => {
    // The other side of the guard: PERFORM_NDT *is* routable, so bare
    // RESOLVE_EVENT must remain a no-op there.
    const state = createMinimalGameState();
    state.resources.level = 25;
    state.activeEvent = { ...unroutable(), requiredAction: 'PERFORM_NDT' };

    const next = gameReducer(state, {
      type: 'ACTION',
      payload: { type: 'RESOLVE_EVENT', payload: {} },
    });

    expect(next.activeEvent?.id).toBe('TEST_UNROUTABLE');
  });
});

/**
 * DevMode's "Force Resolve" is the last escape hatch from a stuck event. It
 * sends `viaRequiredAction: true` — the payload eventsSlice actually acts on,
 * and the one chargeFocus exempts, so the tool neither no-ops nor bills for a
 * no-op. This is the payload DevModeEvents.tsx dispatches.
 */
describe('DevMode force resolve payload', () => {
  const stuck = (): GameState => {
    const state = createMinimalGameState();
    state.resources.level = 25;
    state.resources.focus = 100;
    state.activeEvent = {
      id: 'TEST_STUCK',
      type: 'accident',
      title: 'Stuck',
      description: 'test',
      timeLeft: 30000,
      totalTime: 30000,
      requiredAction: 'PERFORM_NDT',
      successOutcome: { log: 'Forced clear.', effects: {} },
      failureOutcome: { log: 'Missed.' },
    };
    return state;
  };

  it('clears the event without charging focus', () => {
    const next = gameReducer(stuck(), {
      type: 'ACTION',
      payload: { type: 'RESOLVE_EVENT', payload: { viaRequiredAction: true } },
    });

    expect(next.activeEvent).toBeNull();
    expect(next.resources.focus).toBe(100);
  });

  it('is inert without that payload, which is why the old one did nothing', () => {
    const next = gameReducer(stuck(), {
      type: 'ACTION',
      payload: { type: 'RESOLVE_EVENT', payload: { forceResolve: true } },
    });

    expect(next.activeEvent?.id).toBe('TEST_STUCK');
  });
});
