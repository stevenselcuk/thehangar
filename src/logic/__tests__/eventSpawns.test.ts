import { beforeEach, describe, expect, it, vi } from 'vitest';
import { processTick } from '../tickLogic.ts';
import { TabType, type GameState } from '../../types.ts';
import { createMinimalGameState } from '../../utils/testHelpers.ts';
import { canSpawnEventCategory } from '../../services/LevelManager.ts';

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

  it('does not spawn syndicate events at the sanity threshold, even with every roll forced open', () => {
    state.resources.sanity = 50;
    vi.spyOn(Math, 'random').mockReturnValue(0);

    processTick(state, 1000, triggerEvent, TabType.HANGAR);

    expect(categoriesTriggered()).not.toContain('syndicate');
    vi.restoreAllMocks();
  });

  it('does not spawn syndicate events at high sanity, even with every roll forced open', () => {
    state.resources.sanity = 80;
    vi.spyOn(Math, 'random').mockReturnValue(0);

    processTick(state, 1000, triggerEvent, TabType.HANGAR);

    expect(categoriesTriggered()).not.toContain('syndicate');
    vi.restoreAllMocks();
  });

  it.each(['management', 'canteen_incident', 'bureaucratic_horror'])(
    'can spawn %s events',
    (category) => {
      state.resources.level = 30;
      vi.spyOn(Math, 'random').mockReturnValue(0);

      processTick(state, 1000, triggerEvent, TabType.HANGAR);

      expect(categoriesTriggered()).toContain(category);
      vi.restoreAllMocks();
    }
  );

  it('blocks management events below the registered required level', () => {
    state.resources.level = 9;
    expect(canSpawnEventCategory('management', state)).toBe(false);
  });

  it('allows management events at the registered required level', () => {
    state.resources.level = 10;
    expect(canSpawnEventCategory('management', state)).toBe(true);
  });
});
