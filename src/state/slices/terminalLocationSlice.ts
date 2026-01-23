import { produce } from 'immer';
import { ACTION_LOGS, REGULAR_TALK_LOGS } from '../../data/flavor.ts';
import { hasSkill } from '../../services/CostCalculator.ts';
import { addLogToDraft } from '../../services/logService.ts';
import { GameState } from '../../types.ts';

/**
 * terminalLocationSlice.ts - Terminal Area Operations Domain
 *
 * Handles:
 * - Watching departure/arrival boards
 * - Terminal restroom visits
 * - Eating terminal burger
 * - Sleeping at gate
 * - Small talk with personnel
 * - Offering assistance to passengers
 * - Using payphone
 * - Talking to "The Regular" (mysterious pilot)
 * - Rummaging in Lost & Found
 * - Checking the perpetually delayed gate
 * - Inspecting broken vending machine
 *
 * State mutations:
 * - resources (experience, sanity, focus, suspicion, credits)
 * - flags (isAfraid)
 * - hfStats (fearTimer)
 * - logs array
 */

// ==================== TYPE DEFINITIONS ====================

export interface TerminalLocationSliceState {
  resources: GameState['resources'];
  flags: GameState['flags'];
  hfStats: GameState['hfStats'];
  proficiency: GameState['proficiency'];
  logs: GameState['logs'];
}

export type TerminalLocationAction =
  | { type: 'WATCH_BOARDS'; payload?: { triggerEvent?: (type: string, id?: string) => void } }
  | { type: 'GO_TERMINAL_RESTROOM'; payload?: Record<string, unknown> }
  | { type: 'EAT_TERMINAL_BURGER'; payload?: Record<string, unknown> }
  | {
      type: 'SLEEP_AT_GATE';
      payload?: {
        triggerEvent?: (type: string, id?: string) => void;
      };
    }
  | {
      type: 'SMALL_TALK_PERSONNEL';
      payload?: { triggerEvent?: (type: string, id?: string) => void };
    }
  | { type: 'OFFER_ASSISTANCE'; payload?: { triggerEvent?: (type: string, id?: string) => void } }
  | { type: 'USE_PAYPHONE'; payload?: Record<string, unknown> }
  | { type: 'TALK_TO_REGULAR'; payload?: Record<string, unknown> }
  | { type: 'RUMMAGE_LOST_FOUND'; payload?: Record<string, unknown> }
  | { type: 'CHECK_DELAYED_GATE'; payload?: Record<string, unknown> }
  | { type: 'INSPECT_VENDING_MACHINE'; payload?: Record<string, unknown> };

// ==================== REDUCER ====================

export const terminalLocationReducer = (
  state: TerminalLocationSliceState,
  action: TerminalLocationAction
): TerminalLocationSliceState => {
  return produce(state, (draft) => {
    const addLog = (
      text: string,
      type: 'info' | 'warning' | 'error' | 'story' | 'levelup' | 'vibration' = 'info'
    ) => {
      addLogToDraft(draft.logs, text, type, Date.now());
    };

    switch (action.type) {
      case 'WATCH_BOARDS': {
        draft.resources.experience += 80;
        draft.resources.sanity -= 3;
        const watchRoll = Math.random();
        if (watchRoll < 0.1) {
          addLog(ACTION_LOGS.WATCH_BOARDS_2, 'vibration');
          draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 5);
        } else if (watchRoll < 0.2) {
          addLog(ACTION_LOGS.WATCH_BOARDS_3, 'story');
          draft.resources.sanity -= 10;
        } else {
          addLog(ACTION_LOGS.WATCH_BOARDS_1, 'info');
        }
        if (Math.random() < 0.05 && action.payload?.triggerEvent) {
          action.payload.triggerEvent('incident', 'SUIT_SIGHTING_TERMINAL');
        }
        break;
      }

      case 'GO_TERMINAL_RESTROOM': {
        draft.resources.focus = Math.min(100, draft.resources.focus + 15);
        const restroomRoll = Math.random();
        if (restroomRoll < 0.1) {
          addLog(ACTION_LOGS.GO_RESTROOM_SUIT, 'vibration');
          draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 5);
          draft.resources.sanity -= 10;
          draft.flags.isAfraid = true;
          draft.hfStats.fearTimer = 15000;
        } else if (restroomRoll < 0.3) {
          addLog(ACTION_LOGS.TERMINAL_RESTROOM_2, 'vibration');
          draft.resources.sanity -= 5;
        } else {
          addLog(ACTION_LOGS.TERMINAL_RESTROOM_1, 'info');
        }
        break;
      }

      case 'EAT_TERMINAL_BURGER': {
        if (draft.resources.credits >= 12) {
          draft.resources.credits -= 12;
          draft.resources.focus = Math.min(100, draft.resources.focus + 40);
          draft.resources.sanity = Math.min(100, draft.resources.sanity + 15);
          addLog(ACTION_LOGS.EAT_BURGER, 'info');
        } else {
          addLog('NOT ENOUGH CREDITS FOR FOOD.', 'error');
        }
        break;
      }

      case 'SLEEP_AT_GATE': {
        addLog(ACTION_LOGS.SLEEP_GATE_1, 'info');
        draft.resources.focus = 100;
        draft.resources.sanity = 100;
        draft.hfStats.socialStress = 0;
        draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 20);

        if (Math.random() < 0.33) {
          const incidentRoll = Math.random();
          if (incidentRoll < 0.5 && action.payload?.triggerEvent) {
            addLog(ACTION_LOGS.SLEEP_GATE_3, 'warning');
            action.payload.triggerEvent('incident', 'SECURITY_WAKEUP');
          } else if (action.payload?.triggerEvent) {
            addLog('A suit-clad figure watches you from the boarding bridge.', 'warning');
            action.payload.triggerEvent('audit', 'AUDIT_INTERNAL');
          }
        }

        if (
          hasSkill({ proficiency: draft.proficiency } as GameState, 'dreamJournal') &&
          Math.random() < 0.35
        ) {
          addLog(ACTION_LOGS.SLEEP_GATE_2, 'vibration');
          draft.resources.experience += 600;
        }
        break;
      }

      case 'SMALL_TALK_PERSONNEL': {
        draft.resources.sanity = Math.min(100, draft.resources.sanity + 8);
        const talkRoll = Math.random();
        if (talkRoll < 0.15) {
          addLog(ACTION_LOGS.SMALL_TALK_PERSONNEL_1, 'story');
        } else if (talkRoll < 0.3) {
          addLog(ACTION_LOGS.SMALL_TALK_PERSONNEL_2, 'story');
          draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 2);
        } else {
          addLog(
            'You exchange pleasantries with a tired-looking gate agent. Nothing out of the ordinary.',
            'info'
          );
        }
        if (Math.random() < 0.1 && action.payload?.triggerEvent) {
          action.payload.triggerEvent('incident', 'RAMP_DELAY');
        }
        break;
      }

      case 'OFFER_ASSISTANCE': {
        draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 8);
        const assistRoll = Math.random();
        if (assistRoll < 0.1) {
          // Caught
          addLog(ACTION_LOGS.OFFER_ASSISTANCE_CAUGHT, 'warning');
          draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 10);
        } else if (assistRoll < 0.2) {
          // Trigger Event
          addLog(
            'You offer to help a frantic-looking passenger. They seem unusually distressed.',
            'story'
          );
          if (action.payload?.triggerEvent) {
            action.payload.triggerEvent('incident', 'LOST_PASSENGER_INCIDENT');
          }
        } else if (assistRoll < 0.4) {
          // Weird
          addLog(ACTION_LOGS.OFFER_ASSISTANCE_WEIRD, 'vibration');
          draft.resources.sanity -= 15;
        } else if (assistRoll < 0.6) {
          // Clue
          addLog(ACTION_LOGS.OFFER_ASSISTANCE_CLUE, 'story');
          draft.resources.sanity -= 5;
          draft.resources.experience += 100;
        } else if (assistRoll < 0.8) {
          // Suspicious
          addLog(ACTION_LOGS.OFFER_ASSISTANCE_SUSPICIOUS, 'warning');
          draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 5);
        } else {
          // Normal
          addLog(ACTION_LOGS.OFFER_ASSISTANCE_NORMAL, 'info');
          draft.resources.sanity = Math.min(100, draft.resources.sanity + 5);
          draft.resources.experience += 50;
          draft.resources.suspicion = Math.max(0, draft.resources.suspicion - 2);
        }
        break;
      }

      case 'USE_PAYPHONE': {
        if (draft.resources.credits < 5) {
          addLog("You don't have enough change for the payphone.", 'warning');
          break;
        }
        draft.resources.credits -= 5;
        const phoneRoll = Math.random();
        if (phoneRoll < 0.15) {
          addLog(ACTION_LOGS.PAYPHONE_NUMBERS, 'vibration');
          draft.resources.sanity -= 10;
          draft.resources.experience += 200;
        } else if (phoneRoll < 0.4) {
          addLog(ACTION_LOGS.PAYPHONE_CROSSED_LINE, 'story');
          draft.resources.suspicion += 5;
          draft.resources.sanity -= 5;
        } else if (phoneRoll < 0.7) {
          addLog(ACTION_LOGS.PAYPHONE_DIAL_TONE, 'info');
          draft.resources.sanity = Math.min(100, draft.resources.sanity + 10);
        } else {
          addLog(ACTION_LOGS.PAYPHONE_SILENCE, 'vibration');
          draft.resources.sanity -= 8;
        }
        break;
      }

      case 'TALK_TO_REGULAR': {
        const roll = Math.random();
        if (roll < 0.3) {
          const clue =
            REGULAR_TALK_LOGS.CLUES[Math.floor(Math.random() * REGULAR_TALK_LOGS.CLUES.length)];
          addLog(clue, 'story');
          draft.resources.experience += 250;
          draft.resources.sanity -= 5;
        } else if (roll < 0.6) {
          const warning =
            REGULAR_TALK_LOGS.WARNINGS[
              Math.floor(Math.random() * REGULAR_TALK_LOGS.WARNINGS.length)
            ];
          addLog(warning, 'vibration');
          draft.resources.sanity -= 10;
        } else {
          const ramble =
            REGULAR_TALK_LOGS.RAMBLES[Math.floor(Math.random() * REGULAR_TALK_LOGS.RAMBLES.length)];
          addLog(ramble, 'info');
          draft.resources.focus = Math.max(0, draft.resources.focus - 10);
        }
        break;
      }

      case 'RUMMAGE_LOST_FOUND': {
        const roll = Math.random();
        if (roll < 0.2) {
          addLog(ACTION_LOGS.RUMMAGE_LOST_FOUND_CREDITS, 'info');
          draft.resources.credits += Math.floor(Math.random() * 20) + 5;
        } else if (roll < 0.5) {
          addLog(ACTION_LOGS.RUMMAGE_LOST_FOUND_SANITY, 'story');
          draft.resources.sanity = Math.min(100, draft.resources.sanity + 10);
        } else {
          addLog(ACTION_LOGS.RUMMAGE_LOST_FOUND_WEIRD, 'vibration');
          draft.resources.sanity -= 5;
        }
        break;
      }

      case 'CHECK_DELAYED_GATE': {
        if (draft.resources.sanity < 25) {
          addLog("You can't bring yourself to go near that gate right now.", 'warning');
          break;
        }
        draft.resources.sanity -= 25;
        const roll = Math.random();
        if (roll < 0.2) {
          addLog(ACTION_LOGS.CHECK_DELAYED_GATE_COLD, 'vibration');
          draft.flags.isAfraid = true;
          draft.hfStats.fearTimer = 30000;
        } else if (roll < 0.5) {
          addLog(ACTION_LOGS.CHECK_DELAYED_GATE_SOUND, 'story');
          draft.resources.experience += 200;
        } else {
          addLog(ACTION_LOGS.CHECK_DELAYED_GATE_NORMAL, 'info');
        }
        break;
      }

      case 'INSPECT_VENDING_MACHINE': {
        const roll = Math.random();
        if (roll < 0.2) {
          addLog(ACTION_LOGS.INSPECT_VENDING_MACHINE_COIN, 'story');
          draft.resources.experience += 100;
        } else if (roll < 0.5) {
          addLog(ACTION_LOGS.INSPECT_VENDING_MACHINE_NOTE, 'vibration');
          draft.resources.sanity -= 5;
          draft.resources.experience += 150;
        } else {
          addLog(ACTION_LOGS.INSPECT_VENDING_MACHINE_NOTHING, 'info');
        }
        break;
      }
    }
  });
};
