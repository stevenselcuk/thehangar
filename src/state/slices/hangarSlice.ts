import { produce } from 'immer';
import {
  ACTION_LOGS,
  BOEING_REPLIES,
  STANDARD_RADIO_CHATTER,
  SYSTEM_LOGS,
  VOID_BROADCASTS,
} from '../../data/flavor.ts';
import { addLogToDraft } from '../../services/logService.ts';
import { hasSkill } from '../../services/CostCalculator.ts';
import { GameState } from '../../types.ts';

/**
 * hangarSlice.ts - Hangar Operations Domain
 *
 * Handles:
 * - Radio listening (standard and void broadcasts)
 * - FOD sweep
 * - NDT scans
 * - Orbital sanding
 * - Bolt tightening (riveting)
 * - Boeing support calls
 * - Night crew toggle
 * - Transit check delegation toggle
 *
 * State mutations:
 * - resources (sanity, rivets, experience, alclad, suspicion)
 * - flags (isAfraid, nightCrewActive, transitCheckDelegationActive)
 * - hfStats (fearTimer, noiseExposure)
 * - stats (ndtScansPerformed)
 * - toolConditions (rivetGun degradation)
 * - inventory (orbital sander, rivet gun checks)
 * - logs array
 */

// ==================== TYPE DEFINITIONS ====================

export interface HangarSliceState {
  resources: GameState['resources'];
  flags: GameState['flags'];
  hfStats: GameState['hfStats'];
  stats: GameState['stats'];
  toolConditions: GameState['toolConditions'];
  inventory: GameState['inventory'];
  proficiency: GameState['proficiency'];
  logs: GameState['logs'];
}

export type HangarAction =
  | { type: 'LISTEN_RADIO'; payload: Record<string, unknown> }
  | { type: 'FOD_SWEEP'; payload: Record<string, unknown> }
  | { type: 'PERFORM_NDT'; payload: Record<string, unknown> }
  | { type: 'ORBITAL_SAND'; payload: Record<string, unknown> }
  | { type: 'TIGHTEN_BOLT'; payload: Record<string, unknown> }
  | { type: 'BOEING_SUPPORT'; payload: Record<string, unknown> }
  | { type: 'TOGGLE_NIGHT_CREW'; payload: Record<string, unknown> }
  | { type: 'TOGGLE_TRANSIT_CHECK_DELEGATION'; payload: Record<string, unknown> }
  | { type: 'LISTEN_FUSELAGE'; payload: Record<string, unknown> }
  | { type: 'CHECK_REDACTED_LOGS'; payload: Record<string, unknown> };

// ==================== REDUCER ====================

export const hangarReducer = (state: HangarSliceState, action: HangarAction): HangarSliceState => {
  return produce(state, (draft) => {
    const addLog = (
      text: string,
      type: 'info' | 'success' | 'warning' | 'error' | 'story' | 'levelup' | 'vibration' = 'info'
    ) => {
      addLogToDraft(draft.logs, text, type, Date.now());
    };

    switch (action.type) {
      case 'LISTEN_RADIO': {
        const rad = Math.random();
        if (rad < 0.1) {
          const msg = VOID_BROADCASTS[Math.floor(Math.random() * VOID_BROADCASTS.length)];
          let sanityDrain = 15;
          if (
            hasSkill({ proficiency: draft.proficiency } as GameState, 'voidWhisperer') &&
            Math.random() < 0.2
          ) {
            addLog(`The static resolves: "${msg}" You understand.`, 'levelup');
            draft.resources.experience += 1000;
            sanityDrain = 0;
          } else {
            addLog(msg, 'vibration');
          }
          draft.resources.sanity -= sanityDrain;
          if (sanityDrain > 0) {
            draft.flags.isAfraid = true;
            draft.hfStats.fearTimer = 30000;
          }
        } else if (rad < 0.8) {
          const msg =
            STANDARD_RADIO_CHATTER[Math.floor(Math.random() * STANDARD_RADIO_CHATTER.length)];
          addLog(msg, 'info');
          draft.resources.sanity = Math.min(100, draft.resources.sanity + 1);
        } else {
          addLog("Static and late-night jazz. It's calming.", 'info');
          draft.resources.sanity = Math.min(100, draft.resources.sanity + 5);
        }
        break;
      }

      case 'FOD_SWEEP':
        addLog('Sweeping the apron for debris. Found some stray fasteners.', 'info');
        draft.resources.rivets += 15;
        draft.resources.experience += 40;
        break;

      case 'PERFORM_NDT':
        addLog(SYSTEM_LOGS.NDT_SCAN, 'info');
        draft.resources.experience += 200;
        draft.resources.sanity -= 2;
        draft.stats.ndtScansPerformed += 1;
        break;

      case 'ORBITAL_SAND':
        if (draft.inventory.orbitalSander) {
          addLog('Sanding down a fuselage panel. The vibration is numbing.', 'info');
          draft.resources.alclad += 10;
          draft.hfStats.noiseExposure += 2;
        } else {
          addLog('ERROR: MISSING ORBITAL SANDER.', 'error');
        }
        break;

      case 'TIGHTEN_BOLT':
        if (draft.inventory.rivetGun) {
          draft.resources.rivets += 8;
          draft.toolConditions.rivetGun = Math.max(0, (draft.toolConditions.rivetGun || 100) - 0.5);
        } else {
          draft.resources.rivets += 1;
        }
        break;

      case 'BOEING_SUPPORT': {
        const bmsg = BOEING_REPLIES[Math.floor(Math.random() * BOEING_REPLIES.length)];
        addLog(`BOEING SUPPORT: "${bmsg}"`, 'vibration');
        draft.resources.experience += 500;
        draft.resources.sanity -= 10;
        let susGain = 5;
        if (hasSkill({ proficiency: draft.proficiency } as GameState, 'unseenPresence'))
          susGain *= 0.8;
        draft.resources.suspicion += susGain;
        break;
      }

      case 'TOGGLE_NIGHT_CREW':
        draft.flags.nightCrewActive = !draft.flags.nightCrewActive;
        addLog(
          draft.flags.nightCrewActive ? SYSTEM_LOGS.SHIFT_DELEGATED : SYSTEM_LOGS.SHIFT_DISMISSED
        );
        break;

      case 'TOGGLE_TRANSIT_CHECK_DELEGATION':
        draft.flags.transitCheckDelegationActive = !draft.flags.transitCheckDelegationActive;
        addLog(
          draft.flags.transitCheckDelegationActive
            ? SYSTEM_LOGS.TRANSIT_CHECK_DELEGATED
            : SYSTEM_LOGS.TRANSIT_CHECK_SUSPENDED
        );
        break;

      case 'LISTEN_FUSELAGE': {
        if (draft.resources.sanity < 20) {
          addLog("You're too on edge to listen closely to anything.", 'warning');
          return state;
        }
        draft.resources.sanity -= 20;
        const roll = Math.random();
        if (roll < 0.15) {
          addLog(ACTION_LOGS.LISTEN_FUSELAGE_HEARTBEAT, 'vibration');
          draft.flags.isAfraid = true;
          draft.hfStats.fearTimer = 60000;
        } else if (roll < 0.45) {
          addLog(ACTION_LOGS.LISTEN_FUSELAGE_WHISPERS, 'story');
          draft.resources.experience += 300;
        } else {
          addLog(ACTION_LOGS.LISTEN_FUSELAGE_NORMAL, 'info');
        }
        break;
      }

      case 'CHECK_REDACTED_LOGS': {
        draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 5);
        const roll = Math.random();
        if (roll < 0.1) {
          addLog(ACTION_LOGS.CHECK_REDACTED_SUITS, 'vibration');
          draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 15);
          draft.flags.isAfraid = true;
          draft.hfStats.fearTimer = 45000;
        } else if (roll < 0.4) {
          addLog(ACTION_LOGS.CHECK_REDACTED_SUCCESS, 'story');
          draft.resources.experience += 400;
          draft.resources.sanity -= 5;
        } else {
          addLog(ACTION_LOGS.CHECK_REDACTED_FAIL, 'warning');
        }
        break;
      }
    }
  });
};
