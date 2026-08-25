import { describe, expect, it } from 'vitest';
import { gameReducer } from '@/state/gameReducer.ts';
import { createMinimalGameState } from '@/utils/testHelpers.ts';
import { getActionRequiredLevel } from '@/data/featureRegistry.ts';
import type { GameState } from '@/types.ts';

const ENDING_CASES = [
  { action: 'TRIGGER_CRAZY_ENDING', expected: 'CRAZY' },
  { action: 'TRIGGER_GOVT_ENDING', expected: 'GOVT' },
  { action: 'TRIGGER_ALIEN_ENDING', expected: 'ALIEN' },
] as const;

function endgameState(action: string): GameState {
  const state = createMinimalGameState();
  state.resources.level = getActionRequiredLevel(action);
  state.inventory.metallicSphere = true;
  return state;
}

describe('ending reachability', () => {
  it.each(ENDING_CASES)('$action sets endingTriggered to $expected', ({ action, expected }) => {
    const next = gameReducer(endgameState(action), {
      type: 'ACTION',
      payload: { type: action, payload: {} },
    });

    expect(next.flags.endingTriggered).toBe(expected);
  });
});
