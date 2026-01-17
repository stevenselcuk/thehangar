import { produce } from 'immer';
import { anomaliesData } from '../../data/anomalies.ts';
import { ACTION_LOGS } from '../../data/flavor.ts';
import { itemsData } from '../../data/items.ts';
import { addLogToDraft } from '../../services/logService.ts';
import { Anomaly, GameState, RotableItem } from '../../types.ts';

/**
 * backshopSlice.ts - Backshop Operations Domain
 *
 * Handles:
 * - ULD cleaning and decontamination
 * - X-ray inspection of welds
 * - FDR deconstruction (high risk, high reward)
 * - SLS-3 sub-level exploration
 * - Anomaly analysis and retrofit job creation
 * - Corrosion Corner scavenging and observation
 *
 * State mutations:
 * - resources (sanity, suspicion, credits, experience, bioFilament, kardexFragments, crystallineResonators)
 * - flags (isAfraid, sls3Unlocked, storyFlags.fdrDeconstructed)
 * - hfStats (fearTimer)
 * - rotables array (push new untraceable parts)
 * - anomalies array (shift after analysis)
 * - stats (anomaliesAnalyzed, rotablesScavenged)
 * - activeJob (create retrofit jobs from anomaly analysis)
 * - logs array
 */

// ==================== TYPE DEFINITIONS ====================

export interface BackshopSliceState {
  resources: GameState['resources'];
  flags: GameState['flags'];
  hfStats: GameState['hfStats'];
  rotables: GameState['rotables'];
  anomalies: GameState['anomalies'];
  stats: GameState['stats'];
  activeJob: GameState['activeJob'];
  logs: GameState['logs'];
}

export type BackshopAction =
  | { type: 'CLEAN_ULD'; payload: { triggerEvent: (type: string, id?: string) => void } }
  | { type: 'XRAY_WELDS'; payload: Record<string, unknown> }
  | { type: 'DECONSTRUCT_FDR'; payload: { triggerEvent: (type: string, id?: string) => void } }
  | { type: 'DESCEND_INTO_SLS3'; payload: { triggerEvent: (type: string, id?: string) => void } }
  | { type: 'ANALYZE_ANOMALY'; payload: { triggerEvent: (type: string, id?: string) => void } }
  | { type: 'SCAVENGE_CORROSION_CORNER'; payload: Record<string, unknown> }
  | { type: 'OBSERVE_CORROSION_CORNER'; payload: Record<string, unknown> }
  | { type: 'WASH_CUSHIONS'; payload: Record<string, unknown> }
  | { type: 'RENEW_DATABUS'; payload: Record<string, unknown> };

// ==================== HELPER FUNCTIONS ====================

/**
 * Generates a random untraceable rotable from boneyard
 */
export const createUntraceableRotable = (conditionMax: number = 50): RotableItem => {
  const template = itemsData.rotables[Math.floor(Math.random() * itemsData.rotables.length)];
  return {
    id: Math.random().toString(36),
    label: template.label,
    pn: 'UNKNOWN',
    sn: 'UNTRACEABLE',
    condition: Math.random() * conditionMax,
    isInstalled: false,
    isUntraceable: true,
    isRedTagged: Math.random() < 0.3,
  };
};

/**
 * Rolls for SLS-3 descent outcome
 * Returns: 'encounter' | 'trapped' | 'clue' | 'scavenge'
 */
export const rollSls3Outcome = (): 'encounter' | 'trapped' | 'clue' | 'scavenge' => {
  const roll = Math.random();
  if (roll < 0.05) return 'encounter'; // 5%
  if (roll < 0.2) return 'trapped'; // 15%
  if (roll < 0.4) return 'clue'; // 20%
  return 'scavenge'; // 60%
};

/**
 * Creates a retrofit job from an analyzed anomaly
 */
export const createRetrofitJob = (anomaly: Anomaly, duration: number) => {
  const template = anomaliesData.find((a) => a.id === anomaly.templateId);
  if (!template) return null;

  return {
    ...template.retrofitJob,
    id: `retrofit_${Date.now()}`,
    timeLeft: duration,
    totalTime: duration,
  };
};

// ==================== REDUCER ====================

export const backshopReducer = (
  state: BackshopSliceState,
  action: BackshopAction
): BackshopSliceState => {
  return produce(state, (draft) => {
    const addLog = (
      text: string,
      type: 'info' | 'warning' | 'error' | 'story' | 'levelup' | 'vibration' = 'info'
    ) => {
      addLogToDraft(draft.logs, text, type, Date.now());
    };

    switch (action.type) {
      case 'CLEAN_ULD': {
        const cleanRoll = Math.random();
        if (cleanRoll < 0.2) {
          // 20% exposure risk
          addLog(ACTION_LOGS.CLEAN_ULD_EXPOSURE, 'vibration');
          draft.resources.sanity = Math.max(0, draft.resources.sanity - 25);
          draft.flags.isAfraid = true;
          draft.hfStats.fearTimer = 60000;
        } else {
          // 80% success
          addLog(ACTION_LOGS.CLEAN_ULD_SUCCESS, 'story');
          draft.resources.bioFilament += 1;
          draft.resources.credits += 250;
        }
        break;
      }

      case 'XRAY_WELDS': {
        const xrayRoll = Math.random();
        if (xrayRoll < 0.15) {
          // 15% organic anomaly
          addLog(ACTION_LOGS.XRAY_WELDS_ANOMALY_ORGANIC, 'vibration');
          draft.resources.sanity -= 20;
          draft.flags.isAfraid = true;
          draft.hfStats.fearTimer = 45000;
        } else if (xrayRoll < 0.4) {
          // 25% KARDEX clue
          addLog(ACTION_LOGS.XRAY_WELDS_ANOMALY_WRITING, 'story');
          draft.resources.sanity -= 10;
          draft.resources.kardexFragments += 1;
        } else {
          // 60% normal
          addLog(ACTION_LOGS.XRAY_WELDS_NORMAL, 'info');
          draft.resources.experience += 150;
        }
        break;
      }

      case 'DECONSTRUCT_FDR': {
        // Validate requirements
        if (draft.resources.kardexFragments < 1 || draft.resources.sanity < 50) {
          addLog(
            'DECONSTRUCTION FAILED: Requires 1 Kardex Fragment and at least 50 Sanity.',
            'error'
          );
          break;
        }

        // Deduct costs
        draft.resources.kardexFragments -= 1;
        draft.resources.sanity -= 50;

        // Roll for outcome
        const fdrRoll = Math.random();
        if (fdrRoll < 0.1) {
          // 10% catastrophic mental damage
          addLog(ACTION_LOGS.DECONSTRUCT_FDR_FAIL_MIND, 'vibration');
          draft.resources.sanity = Math.max(0, draft.resources.sanity - 50); // double penalty
        } else if (fdrRoll < 0.3) {
          // 20% trigger suits audit
          addLog(ACTION_LOGS.DECONSTRUCT_FDR_FAIL_SUITS, 'error');
          action.payload.triggerEvent('audit', 'BACKSHOP_AUDIT_SUITS');
        } else {
          // 70% success
          addLog(ACTION_LOGS.DECONSTRUCT_FDR_SUCCESS, 'story');
          draft.resources.experience += 5000;
          draft.flags.storyFlags.fdrDeconstructed = true;
        }
        break;
      }

      case 'DESCEND_INTO_SLS3': {
        // Base costs
        draft.resources.sanity = Math.max(0, draft.resources.sanity - 5);
        draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 5);

        const outcome = rollSls3Outcome();

        switch (outcome) {
          case 'encounter': {
            // 5% - Terrifying encounter
            addLog(ACTION_LOGS.SLS3_DESCEND_ENCOUNTER, 'vibration');
            draft.resources.sanity = Math.max(0, draft.resources.sanity - 40);
            draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 25);
            draft.flags.isAfraid = true;
            draft.hfStats.fearTimer = 120000; // 2 minutes of fear
            break;
          }

          case 'trapped': {
            // 15% - Trapped event
            action.payload.triggerEvent('eldritch_manifestation', 'TRAPPED_IN_SLS3');
            break;
          }

          case 'clue': {
            // 20% - KARDEX clue
            addLog(ACTION_LOGS.SLS3_DESCEND_CLUE, 'story');
            draft.resources.kardexFragments += 1;
            draft.resources.experience += 500;
            break;
          }

          case 'scavenge': {
            // 60% - Find untraceable part
            addLog(ACTION_LOGS.SLS3_DESCEND_SCAVENGE, 'info');
            const newPart = createUntraceableRotable(40); // Poor condition (0-40)
            draft.rotables.push(newPart);
            draft.resources.experience += 150;
            draft.stats.rotablesScavenged += 1;
            break;
          }
        }
        break;
      }

      case 'ANALYZE_ANOMALY': {
        const anomalyToAnalyze = draft.anomalies[0];
        if (!anomalyToAnalyze) break; // No anomaly to analyze

        // Base sanity cost
        draft.resources.sanity -= 60;

        // 70% success, 30% catastrophic failure
        if (Math.random() > 0.3) {
          // Success - create retrofit job
          const template = anomaliesData.find((a) => a.id === anomalyToAnalyze.templateId);
          if (template) {
            // Grant required materials
            if (template.retrofitJob.requirements.crystallineResonators) {
              draft.resources.crystallineResonators += 5;
            }
            if (template.retrofitJob.requirements.bioFilament) {
              draft.resources.bioFilament += 10;
            }

            // Create retrofit job
            addLog(ACTION_LOGS.ANALYZE_ANOMALY_SUCCESS, 'story');
            draft.stats.anomaliesAnalyzed += 1;

            const duration = 300000 + Math.random() * 300000; // 5-10 minutes
            draft.activeJob = {
              ...template.retrofitJob,
              id: `retrofit_${Date.now()}`,
              timeLeft: duration,
              totalTime: duration,
            };

            // Remove analyzed anomaly
            draft.anomalies.shift();
          }
        } else {
          // Failure - trigger containment breach
          addLog(ACTION_LOGS.ANALYZE_ANOMALY_FAIL, 'error');
          draft.anomalies.shift(); // Anomaly is destroyed
          action.payload.triggerEvent('eldritch_manifestation', 'CONTAINMENT_BREACH');
        }
        break;
      }

      case 'SCAVENGE_CORROSION_CORNER': {
        // Increases suspicion
        draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 10);

        // Always succeeds - find untraceable part
        const newPart = createUntraceableRotable(50); // 0-50 condition
        draft.rotables.push(newPart);
        addLog(ACTION_LOGS.SCAVENGE_SUCCESS, 'story');
        draft.stats.rotablesScavenged += 1;
        break;
      }

      case 'OBSERVE_CORROSION_CORNER': {
        const obsRoll = Math.random();

        if (obsRoll < 0.08 && !draft.flags.sls3Unlocked) {
          // 8% chance to discover SLS-3 (only if not already unlocked)
          draft.flags.sls3Unlocked = true;
          addLog(ACTION_LOGS.SLS3_DISCOVERED, 'story');
        } else if (obsRoll < 0.2) {
          // 12% ghost sighting
          addLog(ACTION_LOGS.OBSERVE_GHOST, 'vibration');
          draft.resources.sanity -= 25;
          draft.flags.isAfraid = true;
          draft.hfStats.fearTimer = 40000;
        } else if (obsRoll < 0.5) {
          // 30% suits observation
          addLog(ACTION_LOGS.OBSERVE_SUITS, 'story');
          draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 5);
        } else {
          // 50% mundane weather observation
          addLog(ACTION_LOGS.OBSERVE_WEATHER, 'info');
        }
        break;
      }

      case 'WASH_CUSHIONS': {
        // Mind-numbing but stress-relieving work
        draft.resources.sanity = Math.min(100, draft.resources.sanity + 8);
        draft.resources.focus = Math.min(100, draft.resources.focus + 5);
        draft.resources.experience += 30;
        draft.resources.credits += 15;
        addLog(
          'You spend time washing and sanitizing seat cushions. The repetitive work is oddly calming.',
          'info'
        );
        break;
      }

      case 'RENEW_DATABUS': {
        // Check if player has steel wire
        if (draft.resources.steelWire < 5) {
          addLog('TASK FAILED: Requires 5 units of Steel Wire.', 'error');
          break;
        }

        // Consume steel wire
        draft.resources.steelWire -= 5;

        // Grant rewards
        draft.resources.credits += 80;
        draft.resources.experience += 120;
        addLog(
          'You carefully strip and replace the burnt ARINC 429 databus wiring. Tedious, but profitable.',
          'info'
        );
        break;
      }
    }
  });
};
