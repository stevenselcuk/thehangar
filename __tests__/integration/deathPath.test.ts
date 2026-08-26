import { describe, expect, it, vi } from 'vitest';
import { GAME_CONSTANTS } from '@/data/constants.ts';
import { isDead } from '@/logic/deathConditions.ts';
import { gameReducer } from '@/state/gameReducer.ts';
import { TabType, type GameEvent, type GameState } from '@/types.ts';
import { createMinimalGameState } from '@/utils/testHelpers.ts';

/**
 * Task 19 made health lethal alongside sanity and suspicion, which makes this
 * branch the first real death path the game has. `isDead` itself is unit
 * tested against hand-built resource objects; what was never exercised is
 * whether the reducer can actually *produce* those resource values, or
 * whether every writer clamps short of the threshold.
 *
 * Each condition is driven here through the real gameReducer, from a live
 * starting state, by the mechanism that would kill a player in play: an
 * authored failureOutcome landing on a timed-out event.
 */
describe('death conditions are reachable through the real reducer', () => {
  const triggerEvent = vi.fn();

  const stateWithTimedOutEvent = (
    effects: GameEvent['failureOutcome']['effects'],
    overrides: Partial<GameState['resources']> = {}
  ): GameState => {
    const state = createMinimalGameState();
    Object.assign(state.resources, overrides);
    state.activeEvent = {
      id: 'TEST_LETHAL_FAILURE',
      type: 'accident',
      title: 'Lethal Failure',
      description: 'test',
      timeLeft: 1,
      totalTime: 10000,
      failureOutcome: { log: 'It landed on you.', effects },
    };
    return state;
  };

  const tick = (state: GameState): GameState =>
    gameReducer(state, {
      type: 'TICK',
      payload: { delta: 100, triggerEvent, activeTab: TabType.HANGAR },
    });

  it('reaches game over when an authored failure empties sanity', () => {
    const next = tick(stateWithTimedOutEvent({ sanity: -50 }, { sanity: 40 }));

    expect(next.resources.sanity).toBe(0);
    expect(isDead(next.resources)).toBe(true);
  });

  it('does not reach game over when the same failure leaves sanity standing', () => {
    const next = tick(stateWithTimedOutEvent({ sanity: -50 }, { sanity: 60 }));

    expect(next.resources.sanity).toBe(10);
    expect(isDead(next.resources)).toBe(false);
  });

  it('reaches game over when an authored failure saturates suspicion', () => {
    const next = tick(stateWithTimedOutEvent({ suspicion: 60 }, { suspicion: 55 }));

    expect(next.resources.suspicion).toBe(GAME_CONSTANTS.MAX_SUSPICION);
    expect(isDead(next.resources)).toBe(true);
  });

  it('does not reach game over when suspicion stops one short', () => {
    const next = tick(stateWithTimedOutEvent({ suspicion: 60 }, { suspicion: 39 }));

    expect(next.resources.suspicion).toBe(99);
    expect(isDead(next.resources)).toBe(false);
  });

  it('reaches game over when an authored failure empties health', () => {
    const next = tick(stateWithTimedOutEvent({ health: -20 }, { health: 20 }));

    expect(next.resources.health).toBe(0);
    expect(isDead(next.resources)).toBe(true);
  });

  it('does not reach game over when health survives the same failure', () => {
    const next = tick(stateWithTimedOutEvent({ health: -20 }, { health: 30 }));

    expect(next.resources.health).toBe(10);
    expect(isDead(next.resources)).toBe(false);
  });

  it('kills on two forced failures in sequence, and not on one', () => {
    // The composed case the final review called out: back-to-back accidents
    // at authored suspicion penalties. Health has no passive regen and
    // suspicion never decays on its own, so the second one is terminal.
    const first = tick(stateWithTimedOutEvent({ suspicion: 60 }, { suspicion: 0 }));
    expect(isDead(first.resources)).toBe(false);

    const second: GameState = {
      ...first,
      activeEvent: {
        id: 'TEST_LETHAL_FAILURE_2',
        type: 'accident',
        title: 'Second Lethal Failure',
        description: 'test',
        timeLeft: 1,
        totalTime: 10000,
        failureOutcome: { log: 'And again.', effects: { suspicion: 40 } },
      },
    };

    expect(isDead(tick(second).resources)).toBe(true);
  });
});
