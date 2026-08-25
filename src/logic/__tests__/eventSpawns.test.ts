import { beforeEach, describe, expect, it, vi } from 'vitest';
import { processTick } from '../tickLogic.ts';
import { TabType, type GameState } from '../../types.ts';
import { createMinimalGameState } from '../../utils/testHelpers.ts';

describe('event spawn coverage', () => {
  let state: GameState;
  const triggerEvent = vi.fn();

  beforeEach(() => {
    triggerEvent.mockClear();
    state = createMinimalGameState();
    state.resources.level = 30;
    state.activeEvent = null;
  });

  const categoriesTriggered = () => triggerEvent.mock.calls.map((c) => c[0]);

  it('can spawn union events in the backshops', () => {
    state.resources.suspicion = 10;
    // Force every probability gate open.
    vi.spyOn(Math, 'random').mockReturnValue(0);

    processTick(state, 1000, triggerEvent, TabType.BACKSHOPS);

    expect(categoriesTriggered()).toContain('union');
    vi.restoreAllMocks();
  });

  it('can spawn syndicate events when sanity is low', () => {
    state.resources.sanity = 30;
    vi.spyOn(Math, 'random').mockReturnValue(0);

    processTick(state, 1000, triggerEvent, TabType.HANGAR);

    expect(categoriesTriggered()).toContain('syndicate');
    vi.restoreAllMocks();
  });
});
