import { produce } from 'immer';
import {
  COMPANY_NEWS,
  CONSPIRACY_THEORIES,
  DEPLOYMENTS,
  MECHANIC_OF_THE_MONTH,
  SUITS_INTEL,
  TEAM_ROSTERS,
} from '../../data/bulletinBoardData.ts';
import { GameState } from '../../types.ts';

/**
 * bulletinBoardSlice.ts
 *
 * Handles rotation of bulletin board content.
 */

export interface BulletinBoardAction {
  type: 'ROTATE_BULLETIN';
}

const getRandomIndices = (total: number, count: number): number[] => {
  const indices = new Set<number>();
  while (indices.size < count) {
    indices.add(Math.floor(Math.random() * total));
  }
  return Array.from(indices);
};

export const bulletinBoardReducer = (state: GameState, action: BulletinBoardAction): GameState => {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'ROTATE_BULLETIN': {
        draft.bulletinBoard.activeIndices.teamRosters = getRandomIndices(TEAM_ROSTERS.length, 3);
        draft.bulletinBoard.activeIndices.companyNews = getRandomIndices(COMPANY_NEWS.length, 3);
        draft.bulletinBoard.activeIndices.deployments = getRandomIndices(DEPLOYMENTS.length, 3);
        draft.bulletinBoard.activeIndices.suitsIntel = getRandomIndices(SUITS_INTEL.length, 3);
        draft.bulletinBoard.activeIndices.conspiracyTheories = getRandomIndices(
          CONSPIRACY_THEORIES.length,
          3
        );

        draft.bulletinBoard.mechanicOfTheMonthIndex = Math.floor(
          Math.random() * MECHANIC_OF_THE_MONTH.length
        );
        draft.bulletinBoard.lastUpdate = Date.now();
        break;
      }
    }
  });
};
