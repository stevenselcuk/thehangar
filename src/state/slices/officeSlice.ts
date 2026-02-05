import { produce } from 'immer';
import {
  ACTION_LOGS,
  DIGITAL_AMM_FLAVOR,
  MAGAZINE_FLAVOR_TEXTS,
  SYSTEM_LOGS,
} from '../../data/flavor.ts';
import { hasSkill } from '../../services/CostCalculator.ts';
import { addLogToDraft } from '../../services/logService.ts';
import { GameState } from '../../types.ts';

/**
 * officeSlice.ts - Office & PC Operations Domain
 *
 * Handles:
 * - Auto-SRF toggle
 * - Internal mail checking
 * - Manifest cross-referencing
 * - Digital study
 * - SRF creation
 * - Manual searching
 * - PC assembly and upgrades
 * - Napping at table
 * - Reading magazines
 * - Reviewing surveillance logs
 * - Deep cleaning vents/server racks
 *
 * State mutations:
 * - flags (autoSrfActive)
 * - resources (credits, experience, sanity, focus)
 * - inventory (mainboard, graphicCard, cdRom, floppyDrive, pcAssembled, pcGpuUpgrade, pcHddUpgrade)
 * - hfStats (trainingProgress)
 * - stats (srfsFiled)
 * - logs array
 */

// ==================== TYPE DEFINITIONS ====================

export interface OfficeSliceState {
  flags: GameState['flags'];
  resources: GameState['resources'];
  inventory: GameState['inventory'];
  hfStats: GameState['hfStats'];
  stats: GameState['stats'];
  proficiency: GameState['proficiency'];
  logs: GameState['logs'];
  mail: GameState['mail'];
  activeEvent: GameState['activeEvent'];
}

export type OfficeAction =
  | { type: 'TOGGLE_AUTO_SRF'; payload: Record<string, unknown> }
  | { type: 'CHECK_INTERNAL_MAIL'; payload: Record<string, unknown> }
  | { type: 'CROSS_REFERENCE_MANIFESTS'; payload: Record<string, unknown> }
  | { type: 'DIGITAL_STUDY'; payload: Record<string, unknown> }
  | { type: 'CREATE_SRF'; payload: Record<string, unknown> }
  | {
      type: 'SEARCH_MANUALS';
      payload: { triggerEvent?: (type: string, id?: string) => void } & Record<string, unknown>;
    }
  | { type: 'ASSEMBLE_PC'; payload: { cost: number } }
  | { type: 'UPGRADE_PC_GPU'; payload: Record<string, unknown> }
  | { type: 'UPGRADE_PC_HDD'; payload: Record<string, unknown> }
  | {
      type: 'NAP_TABLE';
      payload?: { triggerEvent?: (type: string, id?: string) => void };
    }
  | { type: 'READ_MAGAZINE'; payload: Record<string, unknown> }
  | {
      type: 'REVIEW_SURVEILLANCE_LOGS';
      payload?: { triggerEvent?: (type: string, id?: string) => void };
    }
  | { type: 'DEEP_CLEAN_VENTS'; payload: Record<string, unknown> }
  | { type: 'INSPECT_PRINTER'; payload: Record<string, unknown> }
  | { type: 'READ_EMAIL'; payload: { id: string } }
  | { type: 'TRIGGER_CRAZY_ENDING'; payload: Record<string, unknown> }
  | { type: 'TRIGGER_GOVT_ENDING'; payload: Record<string, unknown> }
  | { type: 'TRIGGER_ALIEN_ENDING'; payload: Record<string, unknown> };

// ==================== REDUCER ====================

export const officeReducer = (state: OfficeSliceState, action: OfficeAction): OfficeSliceState => {
  return produce(state, (draft) => {
    const addLog = (
      text: string,
      type: 'info' | 'warning' | 'error' | 'story' | 'levelup' | 'vibration' | 'flavor' = 'info'
    ) => {
      addLogToDraft(draft.logs, text, type, Date.now());
    };

    switch (action.type) {
      case 'TOGGLE_AUTO_SRF':
        draft.flags.autoSrfActive = !draft.flags.autoSrfActive;
        addLog(
          draft.flags.autoSrfActive
            ? SYSTEM_LOGS.AUTO_SRF_DELEGATED
            : SYSTEM_LOGS.AUTO_SRF_SUSPENDED
        );
        break;

      case 'CHECK_INTERNAL_MAIL':
        if (
          draft.logs.length === 0 ||
          draft.logs[draft.logs.length - 1].text !== ACTION_LOGS.MAIL_ACCESS
        ) {
          addLog(ACTION_LOGS.MAIL_ACCESS, 'info');
        }
        break;

      case 'READ_EMAIL': {
        const { id } = action.payload;
        const email = draft.mail?.find((m) => m.id === id); // Guard in case mail is undefined yet
        if (email && !email.read) {
          email.read = true;
          // Apply effects if any
          if (email.effects) {
            if (email.effects.sanity)
              draft.resources.sanity = Math.max(0, draft.resources.sanity - email.effects.sanity);
            if (email.effects.suspicion)
              draft.resources.suspicion = Math.min(
                100,
                draft.resources.suspicion + email.effects.suspicion
              );
            if (email.effects.focus)
              draft.resources.focus = Math.min(100, draft.resources.focus + email.effects.focus);
          }
        }
        break;
      }

      case 'CROSS_REFERENCE_MANIFESTS':
        addLog(ACTION_LOGS.MANIFEST_CROSS_REF_SUCCESS, 'vibration');
        draft.resources.experience += 1500;
        draft.resources.sanity -= 30;
        draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 20);
        break;

      case 'DIGITAL_STUDY': {
        const studyText = DIGITAL_AMM_FLAVOR[Math.floor(Math.random() * DIGITAL_AMM_FLAVOR.length)];
        addLog(studyText, 'info');
        let studyGain = 20;
        if (draft.inventory.pcHddUpgrade) studyGain += 5;
        draft.hfStats.trainingProgress = Math.min(100, draft.hfStats.trainingProgress + studyGain);
        draft.resources.sanity -= 2;
        break;
      }

      case 'CREATE_SRF':
        addLog(ACTION_LOGS.SRF_FILED, 'info');
        draft.resources.credits += 35;
        draft.resources.experience += 120;
        draft.stats.srfsFiled += 1;
        break;

      case 'SEARCH_MANUALS': {
        addLog('Digging through the archive. The paper is brittle and yellowed.', 'info');
        // KARDEX Recovery Chance (Active Trigger Method 1)
        if (Math.random() < 0.05 && action.payload.triggerEvent) {
          action.payload.triggerEvent('eldritch_manifestation', 'KARDEX_RECOVERY');
          addLog('While looking for a part number, you find a file that shouldn\'t exist.', 'vibration');
          break;
        }

        let findRoll = Math.random();
        if (hasSkill(draft as unknown as GameState, 'keenEye')) findRoll += 0.1;
        if (findRoll < 0.1 && !draft.inventory.mainboard) {
          draft.inventory.mainboard = true;
          addLog('FOUND: Vintage ATX Mainboard.', 'story');
        } else if (findRoll < 0.15 && !draft.inventory.graphicCard) {
          draft.inventory.graphicCard = true;
          addLog('FOUND: VGA Card.', 'story');
        } else if (findRoll < 0.2 && !draft.inventory.cdRom) {
          draft.inventory.cdRom = true;
          addLog('FOUND: 52x CD-ROM Drive.', 'story');
        } else if (findRoll < 0.25 && !draft.inventory.floppyDrive) {
          draft.inventory.floppyDrive = true;
          addLog("FOUND: 3.5' Floppy Drive.", 'story');
        } else if (findRoll < 0.45) {
          draft.resources.experience += 100;
          addLog(ACTION_LOGS.SEARCH_MANUALS_NOTES, 'story');
        } else if (findRoll < 0.55) {
          addLog(ACTION_LOGS.SEARCH_MANUALS_KARDEX, 'vibration');
          draft.resources.sanity -= 5;
        } else {
          addLog('Nothing but dust and silverfish.', 'info');
        }
        break;
      }

      case 'ASSEMBLE_PC':
        if (
          draft.inventory.mainboard &&
          draft.inventory.graphicCard &&
          draft.inventory.cdRom &&
          draft.inventory.floppyDrive
        ) {
          draft.inventory.pcAssembled = true;
          addLog(ACTION_LOGS.PC_ASSEMBLED, 'story');
          draft.resources.experience += 500;
        } else {
          addLog('PC ASSEMBLY FAILED: MISSING HARDWARE COMPONENTS.', 'error');
          draft.resources.focus += action.payload.cost;
        }
        break;

      case 'UPGRADE_PC_GPU':
        if (draft.resources.credits >= 250) {
          draft.resources.credits -= 250;
          draft.inventory.pcGpuUpgrade = true;
          addLog(ACTION_LOGS.UPGRADE_GPU, 'story');
        }
        break;

      case 'UPGRADE_PC_HDD':
        if (draft.resources.credits >= 150) {
          draft.resources.credits -= 150;
          draft.inventory.pcHddUpgrade = true;
          addLog(ACTION_LOGS.UPGRADE_HDD, 'story');
        }
        break;

      case 'NAP_TABLE':
        addLog(ACTION_LOGS.NAP_TABLE, 'info');
        draft.resources.focus = 100;
        draft.resources.sanity = 100;
        draft.hfStats.socialStress = 0;
        draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 15);

        if (Math.random() < 0.33) {
          const incidentRoll = Math.random();
          if (incidentRoll < 0.5 && action.payload?.triggerEvent) {
            addLog('A suit-clad figure watches you from the shadows.', 'warning');
            action.payload.triggerEvent('incident', 'SUIT_SIGHTING_CANTEEN');
          } else if (action.payload?.triggerEvent) {
            addLog('You wake up to an urgent notification.', 'warning');
            action.payload.triggerEvent('audit', 'AUDIT_INTERNAL');
          }
        }

        if (
          hasSkill({ proficiency: draft.proficiency } as GameState, 'dreamJournal') &&
          Math.random() < 0.25
        ) {
          addLog(
            'You dream of a flight path that ends in a city of black glass under a dead star.',
            'vibration'
          );
          draft.resources.experience += 500;
        }
        break;

      case 'READ_MAGAZINE': {
        const magText =
          MAGAZINE_FLAVOR_TEXTS[Math.floor(Math.random() * MAGAZINE_FLAVOR_TEXTS.length)];
        addLog(magText, 'info');
        draft.resources.focus = Math.min(100, draft.resources.focus + 15);
        draft.resources.sanity = Math.max(0, draft.resources.sanity - 10);
        break;
      }

      case 'REVIEW_SURVEILLANCE_LOGS': {
        draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 15);

        // Surveillance Backfire (Active Trigger Method 2)
        if (
          draft.resources.suspicion > 75 &&
          draft.resources.sanity < 40 &&
          action.payload?.triggerEvent
        ) {
          action.payload.triggerEvent('eldritch_manifestation', 'THE_ARCHIVIST');
          addLog('You\'re watching them, but something starts watching you back.', 'vibration');
          break;
        }

        const roll = Math.random();
        if (roll < 0.15 && action.payload?.triggerEvent) {
          addLog(ACTION_LOGS.REVIEW_SURVEILLANCE_CAUGHT, 'error');
          action.payload.triggerEvent('audit', 'AUDIT_INTERNAL');
        } else if (roll < 0.4) {
          addLog(ACTION_LOGS.REVIEW_SURVEILLANCE_SUCCESS, 'vibration');
          draft.resources.sanity -= 15;
          draft.resources.experience += 500;
        } else {
          addLog(ACTION_LOGS.REVIEW_SURVEILLANCE_NOTHING, 'info');
        }
        break;
      }

      case 'DEEP_CLEAN_VENTS': {
        const roll = Math.random();
        if (roll < 0.1) {
          addLog(ACTION_LOGS.DEEP_CLEAN_VENTS_DEVICE, 'story');
          draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 10);
          draft.resources.experience += 300;
        } else if (roll < 0.3) {
          addLog(ACTION_LOGS.DEEP_CLEAN_VENTS_STATIC, 'vibration');
          draft.resources.sanity -= 5;
        } else {
          addLog(ACTION_LOGS.DEEP_CLEAN_VENTS_NORMAL, 'info');
          draft.resources.experience += 50;
        }
        break;
      }

      case 'INSPECT_PRINTER': {
        const roll = Math.random();
        addLog('The laser printer hums, warming up...', 'info');

        if (roll < 0.3) {
          addLog('ERROR: PC LOAD LETTER.', 'error');
          draft.resources.sanity -= 2;
        } else if (roll < 0.7) {
          addLog('Printed a mundane memo regarding lunch theft policy.', 'info');
          draft.resources.focus += 5;
        } else if (roll < 0.9) {
          addLog('FOUND: A crumpled flyer demanding "WORKER SOLIDARITY".', 'flavor');
          draft.resources.unionReputation = Math.min(
            100,
            (draft.resources.unionReputation || 0) + 2
          );
          draft.resources.suspicion += 2;
        } else {
          addLog('FOUND: A printout of binary code that hurts your eyes.', 'flavor');
          draft.resources.syndicateReputation = Math.min(
            100,
            (draft.resources.syndicateReputation || 0) + 2
          );
          draft.resources.sanity -= 5;
          draft.resources.experience += 100;
        }
        break;
      }

      case 'TRIGGER_CRAZY_ENDING':
        addLog('You stop fighting the noise. It welcomes you.', 'story');
        draft.flags.endingTriggered = 'CRAZY';
        break;

      case 'TRIGGER_GOVT_ENDING':
        addLog('You shake the hand of the man in the suit. His skin is cold.', 'story');
        draft.flags.endingTriggered = 'GOVT';
        break;

      case 'TRIGGER_ALIEN_ENDING':
        addLog('The sphere opens. It is not empty.', 'story');
        draft.flags.endingTriggered = 'ALIEN';
        break;
    }
  });
};
