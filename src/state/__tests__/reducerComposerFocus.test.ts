import { afterEach, describe, expect, it, vi } from 'vitest';
import { trainingData } from '../../data/training.ts';
import type { EnvironmentalHazard, GameEvent, GameState } from '../../types.ts';
import { createMinimalGameState } from '../../utils/testHelpers.ts';
import { composeAction } from '../reducerComposer.ts';

/**
 * These tests run against composeAction — the function gameReducer's ACTION
 * case actually calls (see gameReducer.ts, `if (ROUTED_ACTIONS.has(type))`).
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
    // NAP_TABLE restores +40 focus and has no registered cost.
    const next = composeAction(stateWith({ focus: 20 }), { type: 'NAP_TABLE' });
    expect(next.resources.focus).toBe(60);
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

  const chooseableEvent = (): GameEvent => ({
    id: 'TEST_CHOICE_EVENT',
    title: 'Pick one',
    description: 'test',
    type: 'incident',
    timeLeft: 5000,
    totalTime: 5000,
    choices: [
      {
        id: 'act',
        label: 'Act',
        cost: { resource: 'focus', amount: 20 },
        log: 'Done.',
        effects: { experience: 10 },
      },
    ],
    failureOutcome: { log: 'Missed.' },
  });

  it('charges a resolution the player dispatches at the price the choice advertises', () => {
    // The app always dispatches with a payload object, so match that shape.
    // RESOLVE_EVENT carries no registered cost: the choice's own 20 is the
    // whole price, deducted by eventsSlice, with no invisible top-up.
    const next = composeAction(stateWith({ focus: 100, activeEvent: chooseableEvent() }), {
      type: 'RESOLVE_EVENT',
      payload: { choiceId: 'act' },
    });

    expect(next.resources.focus).toBe(80);
    expect(next.activeEvent).toBeNull();
  });

  it('surcharges a player-dispatched resolution for fatigue, and exempts the internal one', () => {
    // Both sides of the viaRequiredAction exemption at the same modifier.
    // Player dispatch at fatigue 100 (x1.5): the choice's 20 plus a 10
    // surcharge = 30.
    const dispatched = composeAction(
      stateWith({ focus: 100, fatigue: 100, activeEvent: chooseableEvent() }),
      { type: 'RESOLVE_EVENT', payload: { choiceId: 'act' } }
    );
    expect(dispatched.resources.focus).toBe(70);

    // The resolution resolveRequiredAction fires internally is bookkeeping for
    // an action already paid for, so it adds nothing: PERFORM_NDT's 20 x 1.5
    // = 30, and not a point more.
    const internal = composeAction(
      stateWith({ focus: 100, fatigue: 100, activeEvent: timedTask() }),
      { type: 'PERFORM_NDT' }
    );
    expect(internal.resources.focus).toBe(70);
    expect(internal.activeEvent).toBeNull();
  });
});

describe('composeAction charges training by the action, not by the dispatch', () => {
  // TrainingTab spreads the whole authored course into the payload; other
  // callers send only an identifier. The cost used to come off
  // `payload.costFocus`, so the same course was free from the lean caller.
  const course = trainingData.mandatoryCourses.find((c) => c.id === 'hfInitial')!;

  it('charges the authored cost when the whole course object is dispatched', () => {
    const next = composeAction(stateWith({ focus: 100 }), {
      type: 'TAKE_MANDATORY_COURSE',
      payload: { ...course },
    });

    expect(next.resources.focus).toBe(100 - course.costFocus);
    expect(next.inventory.hasHfInitial).toBe(true);
  });

  it('charges the same when only the id is dispatched', () => {
    const next = composeAction(stateWith({ focus: 100 }), {
      type: 'TAKE_MANDATORY_COURSE',
      payload: { id: course.id },
    });

    expect(next.resources.focus).toBe(100 - course.costFocus);
    expect(next.inventory.hasHfInitial).toBe(true);
  });

  it('charges an NDT level the same both ways', () => {
    const level = trainingData.ndtCerts.levels.find((l) => l.id === 'hasNdtLevel1')!;

    const full = composeAction(stateWith({ focus: 100 }), {
      type: 'TAKE_NDT_EXAM',
      payload: { ...level },
    });
    const lean = composeAction(stateWith({ focus: 100 }), {
      type: 'TAKE_NDT_EXAM',
      payload: { id: level.id },
    });

    expect(full.resources.focus).toBe(lean.resources.focus);
    expect(full.resources.focus).toBe(100 - level.costFocus);
  });
});
