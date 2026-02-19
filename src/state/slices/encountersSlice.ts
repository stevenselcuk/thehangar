import { produce } from 'immer';
import { ACTION_LOGS } from '../../data/flavor.ts';
import { addLogToDraft } from '../../services/logService.ts';
import { GameState } from '../../types.ts';
import { createEventFromTemplate } from './eventsSlice.ts';

/**
 * encountersSlice.ts - Special Encounters Domain
 *
 * Handles:
 * - Sedan observation (The Suits' vehicle)
 * - Janitor interactions
 *
 * State mutations:
 * - resources (experience, sanity, suspicion)
 * - inventory (foundRetiredIDCard)
 * - flags (isAfraid, janitorPresent)
 * - hfStats (fearTimer)
 * - logs array
 */

// ==================== TYPE DEFINITIONS ====================

export interface EncountersSliceState {
  resources: GameState['resources'];
  inventory: GameState['inventory'];
  flags: GameState['flags'];
  hfStats: GameState['hfStats'];
  logs: GameState['logs'];
  activeEvent: GameState['activeEvent'];
}

export type EncountersAction =
  | { type: 'OBSERVE_SEDAN'; payload: Record<string, unknown> }
  | { type: 'JANITOR_INTERACTION'; payload: Record<string, unknown> };

// ==================== REDUCER ====================

export const encountersReducer = (
  state: EncountersSliceState,
  action: EncountersAction
): EncountersSliceState => {
  return produce(state, (draft) => {
    const addLog = (
      text: string,
      type: 'info' | 'warning' | 'error' | 'story' | 'levelup' | 'vibration' | 'flavor' = 'info'
    ) => {
      addLogToDraft(draft.logs, text, type, Date.now());
    };

    switch (action.type) {
      case 'OBSERVE_SEDAN': {
        const event = createEventFromTemplate('story_event', 'EVENT_BLACK_SEDAN_OBSERVE');
        if (event) {
          draft.activeEvent = event;
          draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 5);
          draft.resources.experience += 150;
          addLog('You focus your lens on the black sedan...', 'story');
        } else {
          addLog('The sedan is gone.', 'info');
        }
        break;
      }

      case 'JANITOR_INTERACTION': {
        draft.flags.janitorPresent = false;
        const roll = Math.random();
        if (roll < 0.2) {
          addLog(ACTION_LOGS.JANITOR_STARES, 'vibration');
          draft.resources.sanity -= 25;
          draft.flags.isAfraid = true;
          draft.hfStats.fearTimer = 45000;
        } else if (roll < 0.4 && !draft.inventory.foundRetiredIDCard) {
          addLog(ACTION_LOGS.JANITOR_GIVES_ITEM, 'story');
          draft.inventory.foundRetiredIDCard = true;
        } else if (roll < 0.6) {
          addLog(ACTION_LOGS.JANITOR_GIVES_HINT, 'story');
        } else {
          addLog(ACTION_LOGS.JANITOR_IGNORES, 'info');
        }
        break;
      }
    }
  });
};
