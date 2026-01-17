import { produce } from 'immer';
import { ACTION_LOGS } from '../../data/flavor.ts';
import { addLogToDraft } from '../../services/logService.ts';
import { GameState } from '../../types.ts';

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
      type: 'info' | 'success' | 'warning' | 'error' | 'story' | 'levelup' | 'vibration' = 'info'
    ) => {
      addLogToDraft(draft.logs, text, type, Date.now());
    };

    switch (action.type) {
      case 'OBSERVE_SEDAN': {
        draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 5);
        draft.resources.experience += 150;
        const sedanRoll = Math.random();
        if (sedanRoll < 0.1) {
          addLog(
            'The license plate on the sedan shifts, the characters rearranging into impossible geometry before snapping back. You feel sick.',
            'vibration'
          );
          draft.resources.sanity -= 15;
          draft.flags.isAfraid = true;
          draft.hfStats.fearTimer = 20000;
        } else if (sedanRoll < 0.3) {
          addLog(
            'A rear door on the sedan opens a few inches, then clicks shut. No one gets in or out. The air smells like ozone.',
            'story'
          );
          draft.resources.sanity -= 8;
        } else {
          addLog(
            "The sedan is empty. You can't see the driver's seat through the windshield, just... darkness.",
            'info'
          );
          draft.resources.sanity -= 2;
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
