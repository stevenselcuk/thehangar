import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TabType, type GameState } from '../../types.ts';
import { createMinimalGameState } from '../../utils/testHelpers.ts';
import { useGameEngine } from '../useGameEngine.ts';

/**
 * The other half of the death path: once isDead is true the engine has to
 * stop driving TICKs, or the game-over screen would keep accumulating
 * penalties behind itself. deathPath.test.ts proves the reducer can reach the
 * lethal resource values; this proves the loop reacts to them.
 */
describe('useGameEngine halts on death', () => {
  let frames: FrameRequestCallback[];

  const runNextFrame = () => {
    const frame = frames.shift();
    if (!frame) throw new Error('No animation frame was scheduled');
    frame(0);
  };

  beforeEach(() => {
    frames = [];
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb));
    vi.stubGlobal('cancelAnimationFrame', () => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  const render = (state: GameState, dispatch: ReturnType<typeof vi.fn>) =>
    renderHook(({ s }: { s: GameState }) => useGameEngine(s, dispatch, TabType.HANGAR), {
      initialProps: { s: state },
    });

  it('dispatches TICK while the player is alive', () => {
    const dispatch = vi.fn();
    const alive = createMinimalGameState();
    alive.resources.health = 100;

    const { result } = render(alive, dispatch);
    expect(result.current.isDeadRef.current).toBe(false);

    vi.advanceTimersByTime(200);
    runNextFrame();

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'TICK' }));
  });

  it('stops dispatching TICK once a death condition is met', () => {
    const dispatch = vi.fn();
    const alive = createMinimalGameState();
    alive.resources.health = 100;

    const { result, rerender } = render(alive, dispatch);
    vi.advanceTimersByTime(200);
    runNextFrame();
    expect(dispatch).toHaveBeenCalled();

    const dead = createMinimalGameState();
    dead.resources.health = 0;
    dispatch.mockClear();
    rerender({ s: dead });

    expect(result.current.isDeadRef.current).toBe(true);

    vi.advanceTimersByTime(200);
    runNextFrame();

    expect(dispatch).not.toHaveBeenCalled();
  });
});
