import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EnvironmentalHazard, GameEvent, GameState } from '../../types.ts';
import { createMinimalGameState } from '../../utils/testHelpers.ts';
import { composeAction } from '../reducerComposer.ts';

/**
 * These tests run against composeAction — the function gameReducer's ACTION
 * case actually calls (see gameReducer.ts, `if (ROUTED_ACTIONS.has(type))`).
 * composeReducers is not on the dispatch path and is not exercised here.
 */

const stateWith = (overrides: {
  focus?: number;
  fatigue?: number;
  hazards?: EnvironmentalHazard[];
  activeEvent?: GameEvent | null;
}): GameState => {
  const base = createMinimalGameState();
  return createMinimalGameState({
    resources: {
      ...base.resources,
      focus: overrides.focus ?? 100,
      // High enough that nothing under test is level-gated.
      level: 25,
    },
    hfStats: { ...base.hfStats, fatigue: overrides.fatigue ?? 0 },
    activeHazards: overrides.hazards ?? [],
    activeEvent: overrides.activeEvent ?? null,
    // FOD_SWEEP hands out a one-time toolbox event on first use; keep it out
    // of these tests.
    flags: { ...base.flags, foundSnapon: true },
  });
};

const tarmacStorm: EnvironmentalHazard = {
  id: 'STORM',
  name: 'Lightning Warning',
  description: 'test',
  type: 'weather',
  effects: { tarmacActionsDisabled: true },
  duration: 10000,
};

const costlyAir: EnvironmentalHazard = {
  id: 'SMOKE',
  name: 'Smoke',
  description: 'test',
  type: 'containment',
  effects: { focusCostModifier: 2 },
  duration: 10000,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('composeAction focus charging', () => {
  it('charges the registered cost of an action no slice ever charged for', () => {
    // PERFORM_NDT is registered at 20 focus in BASE_FOCUS_COSTS and hangarSlice
    // deducts nothing.
    const next = composeAction(stateWith({ focus: 100 }), { type: 'PERFORM_NDT' });
    expect(next.resources.focus).toBe(80);
  });

  it('confirms the action still ran while being charged', () => {
    const next = composeAction(stateWith({ focus: 100 }), { type: 'PERFORM_NDT' });
    expect(next.stats.ndtScansPerformed).toBe(1);
  });

  it('does not double-charge an action whose slice already deducted the cost', () => {
    // FOD_SWEEP is registered at 5 and hangarSlice deducts exactly 5.
    const next = composeAction(stateWith({ focus: 100 }), { type: 'FOD_SWEEP' });
    expect(next.resources.focus).toBe(95);
  });

  it('leaves an action with no registered cost alone', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const next = composeAction(stateWith({ focus: 100 }), { type: 'LISTEN_RADIO' });
    expect(next.resources.focus).toBe(100);
  });

  it('does not claw back focus an action restored', () => {
    // NAP_TABLE sets focus to 100 and has no registered cost.
    const next = composeAction(stateWith({ focus: 20 }), { type: 'NAP_TABLE' });
    expect(next.resources.focus).toBe(100);
  });

  it('never drives focus below zero', () => {
    const next = composeAction(stateWith({ focus: 5 }), { type: 'PERFORM_NDT' });
    expect(next.resources.focus).toBe(0);
  });
});

describe('composeAction fatigue surcharge', () => {
  it('adds nothing while the technician is rested', () => {
    const next = composeAction(stateWith({ focus: 100, fatigue: 0 }), { type: 'PERFORM_NDT' });
    expect(next.resources.focus).toBe(80);
  });

  it('costs half again as much at full fatigue', () => {
    const next = composeAction(stateWith({ focus: 100, fatigue: 100 }), { type: 'PERFORM_NDT' });
    expect(next.resources.focus).toBeCloseTo(70);
  });

  it('surcharges a cost the slice deducted itself', () => {
    // FOD_SWEEP's own 5 focus, plus 50% of it.
    const next = composeAction(stateWith({ focus: 100, fatigue: 100 }), { type: 'FOD_SWEEP' });
    expect(next.resources.focus).toBeCloseTo(92.5);
  });

  it('surcharges nothing when the action was free', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const next = composeAction(stateWith({ focus: 100, fatigue: 100 }), { type: 'LISTEN_RADIO' });
    expect(next.resources.focus).toBe(100);
  });
});

describe('composeAction hazard surcharge', () => {
  it('doubles the cost under a hazard that declares a focus modifier', () => {
    const next = composeAction(stateWith({ focus: 100, hazards: [costlyAir] }), {
      type: 'PERFORM_NDT',
    });
    expect(next.resources.focus).toBeCloseTo(60);
  });

  it('leaves the cost alone under a hazard that declares none', () => {
    const next = composeAction(stateWith({ focus: 100, hazards: [tarmacStorm] }), {
      type: 'PERFORM_NDT',
    });
    expect(next.resources.focus).toBe(80);
  });

  it('compounds with fatigue', () => {
    const next = composeAction(stateWith({ focus: 100, fatigue: 100, hazards: [costlyAir] }), {
      type: 'PERFORM_NDT',
    });
    // 20 base * 1.5 fatigue * 2 hazard = 60.
    expect(next.resources.focus).toBeCloseTo(40);
  });
});

describe('composeAction charges nothing for work that never happened', () => {
  it('charges no focus for an action a hazard blocked', () => {
    const next = composeAction(stateWith({ focus: 100, hazards: [tarmacStorm] }), {
      type: 'FOD_SWEEP',
    });
    expect(next.resources.focus).toBe(100);
    expect(next.notificationQueue[0].title).toBe('ACTION SUSPENDED');
  });

  it('charges the same action when no hazard blocks it', () => {
    const next = composeAction(stateWith({ focus: 100 }), { type: 'FOD_SWEEP' });
    expect(next.resources.focus).toBe(95);
    expect(next.notificationQueue).toHaveLength(0);
  });

  it('charges no focus for an action the player is not cleared for', () => {
    const locked = createMinimalGameState({
      resources: { ...createMinimalGameState().resources, focus: 100, level: 1 },
    });
    const next = composeAction(locked, { type: 'ANALYZE_ANOMALY' });
    expect(next.resources.focus).toBe(100);
    expect(next.notificationQueue[0].title).toBe('ACCESS DENIED');
  });

  it('charges the same action once the player is cleared for it', () => {
    const next = composeAction(stateWith({ focus: 100 }), { type: 'ANALYZE_ANOMALY' });
    expect(next.notificationQueue).toHaveLength(0);
    expect(next.resources.focus).toBeLessThan(100);
  });
});

describe('composeAction and event resolution', () => {
  const timedTask = (): GameEvent => ({
    id: 'TEST_TIMED_TASK',
    title: 'Scan the panel',
    description: 'test',
    type: 'incident',
    timeLeft: 5000,
    totalTime: 5000,
    requiredAction: 'PERFORM_NDT',
    successOutcome: { log: 'Cleared.', effects: { experience: 10 } },
    failureOutcome: { log: 'Missed.' },
  });

  it('charges the action, not the resolution it triggers', () => {
    const next = composeAction(stateWith({ focus: 100, activeEvent: timedTask() }), {
      type: 'PERFORM_NDT',
    });

    // PERFORM_NDT's 20 only. RESOLVE_EVENT's registered 30 is not added on top
    // of a resolution the player never dispatched.
    expect(next.resources.focus).toBe(80);
    expect(next.activeEvent).toBeNull();
  });

  it('charges a resolution the player dispatches', () => {
    // The app always dispatches with a payload object, so match that shape.
    const next = composeAction(stateWith({ focus: 100, activeEvent: timedTask() }), {
      type: 'RESOLVE_EVENT',
      payload: {},
    });

    expect(next.resources.focus).toBe(70);
  });
});
