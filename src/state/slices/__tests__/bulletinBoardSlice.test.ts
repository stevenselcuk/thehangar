import { describe, expect, it } from 'vitest';
import { MECHANIC_OF_THE_MONTH, TEAM_ROSTERS } from '../../../data/bulletinBoardData';
import { GameState } from '../../../types';
import { bulletinBoardReducer } from '../bulletinBoardSlice';

describe('bulletinBoardSlice', () => {
  it('should rotate indices correctly', () => {
    const initialState: GameState = {
      bulletinBoard: {
        activeIndices: {
          teamRosters: [0, 1, 2],
          companyNews: [0, 1, 2],
          deployments: [0, 1, 2],
          suitsIntel: [0, 1, 2],
          conspiracyTheories: [0, 1, 2],
        },
        mechanicOfTheMonthIndex: 0,
        lastUpdate: 0,
      },
    } as GameState;

    const nextState = bulletinBoardReducer(initialState, { type: 'ROTATE_BULLETIN' });
    const { activeIndices, mechanicOfTheMonthIndex, lastUpdate } = nextState.bulletinBoard;

    expect(activeIndices.teamRosters.length).toBe(3);
    expect(activeIndices.companyNews.length).toBe(3);
    expect(activeIndices.deployments.length).toBe(3);
    expect(activeIndices.suitsIntel.length).toBe(3);
    expect(activeIndices.conspiracyTheories.length).toBe(3);

    // Indices should be within bounds
    activeIndices.teamRosters.forEach((i) => expect(i).toBeGreaterThanOrEqual(0));
    activeIndices.teamRosters.forEach((i) => expect(i).toBeLessThan(TEAM_ROSTERS.length));

    expect(mechanicOfTheMonthIndex).toBeGreaterThanOrEqual(0);
    expect(mechanicOfTheMonthIndex).toBeLessThan(MECHANIC_OF_THE_MONTH.length);

    expect(lastUpdate).toBeGreaterThan(0);
  });
});
