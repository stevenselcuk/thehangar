import { produce } from 'immer';
import { ACTION_LOGS } from '../../data/flavor.ts';
import { hasSkill } from '../../services/CostCalculator.ts';
import { addLogToDraft } from '../../services/logService.ts';
import { GameState } from '../../types.ts';

/**
 * complianceSlice.ts - Compliance and HR Operations Domain
 *
 * Handles:
 * - Non-routine report creation and filing
 * - NDT inspections (HFEC scans, borescope inspections)
 * - Anomalous/mundane reporting to management
 * - HR interactions (performance reviews, leave requests, urine samples)
 * - Document management (alteration, destruction)
 * - Compliance review and low-profile maintenance
 *
 * State mutations:
 * - resources (sanity, suspicion, focus, credits, experience, kardexFragments)
 * - flags (ndtFinding, onPerformanceImprovementPlan, isAfraid)
 * - hfStats (fearTimer, compliancePressureTimer, scheduleCompressionTimer, sanityShieldTimer, performanceReviewCooldown, foundLoopholeTimer, socialStress)
 * - stats (ndtScansPerformed)
 * - logs array
 */

// ==================== TYPE DEFINITIONS ====================

export interface ComplianceSliceState {
  resources: GameState['resources'];
  flags: GameState['flags'];
  hfStats: GameState['hfStats'];
  stats: GameState['stats'];
  proficiency: GameState['proficiency'];
  logs: GameState['logs'];
}

export type ComplianceAction =
  | { type: 'CREATE_NON_ROUTINE_REPORT'; payload?: Record<string, unknown> }
  | { type: 'PERFORM_HFEC_SCAN'; payload?: { triggerEvent?: (type: string, id?: string) => void } }
  | {
      type: 'PERFORM_BORESCOPE_INSPECTION';
      payload?: { triggerEvent?: (type: string, id?: string) => void };
    }
  | { type: 'REPORT_ANOMALOUS'; payload?: { triggerEvent?: (type: string, id?: string) => void } }
  | { type: 'REPORT_MUNDANE'; payload?: { triggerEvent?: (type: string, id?: string) => void } }
  | { type: 'FORGE_SAMPLE'; payload?: Record<string, unknown> }
  | { type: 'PERFORMANCE_REVIEW'; payload?: Record<string, unknown> }
  | { type: 'REQUEST_LEAVE'; payload?: Record<string, unknown> }
  | { type: 'ALTER_DOCUMENTS'; payload?: Record<string, unknown> }
  | {
      type: 'DESTROY_DOCUMENTS';
      payload?: { triggerEvent?: (type: string, id?: string) => void };
    }
  | { type: 'REVIEW_COMPLIANCE'; payload?: Record<string, unknown> }
  | { type: 'GIVE_URINE_SAMPLE'; payload?: Record<string, unknown> }
  | { type: 'MAINTAIN_LOW_PROFILE'; payload?: Record<string, unknown> };

// ==================== REDUCER ====================

export const complianceReducer = (
  state: ComplianceSliceState,
  action: ComplianceAction
): ComplianceSliceState => {
  return produce(state, (draft) => {
    const addLog = (
      text: string,
      type: 'info' | 'warning' | 'error' | 'story' | 'levelup' | 'vibration' = 'info'
    ) => {
      addLogToDraft(draft.logs, text, type, Date.now());
    };

    switch (action.type) {
      case 'CREATE_NON_ROUTINE_REPORT': {
        if (draft.flags.ndtFinding) {
          const { severity } = draft.flags.ndtFinding;
          if (severity === 'minor') {
            draft.resources.credits += 50;
            draft.resources.experience += 100;
            addLog(ACTION_LOGS.NON_ROUTINE_FILED_MINOR, 'story');
          } else if (severity === 'major') {
            draft.resources.credits += 150;
            draft.resources.experience += 300;
            addLog(ACTION_LOGS.NON_ROUTINE_FILED_MAJOR, 'story');
          } else {
            // suspicious
            draft.resources.experience += 500;
            draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 10);
            addLog(ACTION_LOGS.NON_ROUTINE_FILED_SUSPICIOUS, 'warning');
          }
          draft.flags.ndtFinding = null;
        }
        break;
      }

      case 'PERFORM_HFEC_SCAN': {
        draft.stats.ndtScansPerformed += 1;
        const scanRoll = Math.random();
        if (scanRoll < 0.4) {
          addLog(ACTION_LOGS.HFEC_SCAN_SUCCESS_NORMAL, 'info');
        } else if (scanRoll < 0.7) {
          draft.flags.ndtFinding = {
            type: 'HFEC',
            description: ACTION_LOGS.HFEC_SCAN_SUCCESS_CRACK,
            severity: 'minor',
          };
          addLog(ACTION_LOGS.HFEC_SCAN_SUCCESS_CRACK, 'warning');
        } else if (scanRoll < 0.9) {
          draft.flags.ndtFinding = {
            type: 'HFEC',
            description: ACTION_LOGS.HFEC_SCAN_SUCCESS_FATIGUE,
            severity: 'major',
          };
          addLog(ACTION_LOGS.HFEC_SCAN_SUCCESS_FATIGUE, 'error');
        } else {
          draft.flags.ndtFinding = {
            type: 'HFEC',
            description: ACTION_LOGS.HFEC_SCAN_SUSPICIOUS_BURN,
            severity: 'suspicious',
          };
          addLog(ACTION_LOGS.HFEC_SCAN_SUSPICIOUS_BURN, 'vibration');
          draft.resources.sanity -= 15;
          if (Math.random() < 0.2 && action.payload?.triggerEvent) {
            action.payload.triggerEvent('audit', 'AUDIT_NDT_LOGS');
          }
        }
        break;
      }

      case 'PERFORM_BORESCOPE_INSPECTION': {
        draft.stats.ndtScansPerformed += 1;
        const scopeRoll = Math.random();
        if (scopeRoll < 0.5) {
          addLog(ACTION_LOGS.BORESCOPE_SUCCESS_NORMAL, 'info');
        } else if (scopeRoll < 0.85) {
          draft.flags.ndtFinding = {
            type: 'Borescope',
            description: ACTION_LOGS.BORESCOPE_SUCCESS_HOTSPOTS,
            severity: 'minor',
          };
          addLog(ACTION_LOGS.BORESCOPE_SUCCESS_HOTSPOTS, 'warning');
        } else {
          draft.flags.ndtFinding = {
            type: 'Borescope',
            description: ACTION_LOGS.BORESCOPE_SUSPICIOUS_RESIDUE,
            severity: 'suspicious',
          };
          addLog(ACTION_LOGS.BORESCOPE_SUSPICIOUS_RESIDUE, 'vibration');
          draft.resources.sanity -= 20;
          if (Math.random() < 0.25 && action.payload?.triggerEvent) {
            action.payload.triggerEvent('audit', 'AUDIT_NDT_LOGS');
          }
        }
        break;
      }

      case 'REPORT_ANOMALOUS': {
        if (draft.resources.sanity < 20) {
          addLog("You're too rattled to file a coherent report.", 'warning');
          break;
        }
        draft.resources.sanity -= 20;
        const reportRoll = Math.random();
        if (reportRoll < 0.3) {
          addLog(ACTION_LOGS.REPORT_ANOMALOUS_SUCCESS, 'story');
          draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 20);
          draft.hfStats.sanityShieldTimer = 300000; // 5 minutes
        } else if (reportRoll < 0.5) {
          addLog(ACTION_LOGS.REPORT_ANOMALOUS_SECURITY_SWEEP, 'error');
          draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 35);
          if (action.payload?.triggerEvent) {
            action.payload.triggerEvent('audit', 'INTERNAL_SWEEP');
          }
        } else if (reportRoll < 0.7) {
          addLog(ACTION_LOGS.REPORT_ANOMALOUS_SUITS, 'vibration');
          draft.resources.sanity = Math.max(0, draft.resources.sanity - 30);
          draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 50);
          draft.flags.isAfraid = true;
          draft.hfStats.fearTimer = 120000;
        } else if (reportRoll < 0.9) {
          addLog(ACTION_LOGS.REPORT_ANOMALOUS_GASLIGHT, 'warning');
          draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 10);
          draft.resources.sanity = Math.max(0, draft.resources.sanity - 10);
        } else {
          addLog(ACTION_LOGS.REPORT_ANOMALOUS_WIPE, 'vibration');
          draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 15);
          draft.resources.focus = Math.max(0, draft.resources.focus - 20);
        }
        break;
      }

      case 'REPORT_MUNDANE': {
        const mundaneRoll = Math.random();
        if (mundaneRoll < 0.4) {
          addLog(ACTION_LOGS.REPORT_MUNDANE_SUCCESS, 'info');
          draft.resources.suspicion = Math.max(0, draft.resources.suspicion - 2);
        } else if (mundaneRoll < 0.6) {
          addLog(ACTION_LOGS.REPORT_MUNDANE_BACKFIRE, 'warning');
          draft.hfStats.socialStress = Math.min(100, draft.hfStats.socialStress + 5);
        } else if (mundaneRoll < 0.8) {
          addLog(ACTION_LOGS.REPORT_MUNDANE_IGNORED, 'info');
        } else if (mundaneRoll < 0.9) {
          addLog(ACTION_LOGS.REPORT_MUNDANE_OVERZEALOUS, 'warning');
          draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 2);
        } else {
          addLog(ACTION_LOGS.REPORT_MUNDANE_CONSEQUENCE, 'error');
          draft.hfStats.scheduleCompressionTimer = 180000; // 3 minutes
        }
        break;
      }

      case 'FORGE_SAMPLE': {
        if (draft.resources.credits < 750) {
          addLog("You can't afford the 'disposal fee' for your sample.", 'error');
          break;
        }
        draft.resources.credits -= 750;
        if (Math.random() < 0.1) {
          addLog(ACTION_LOGS.FORGE_SAMPLE_FAIL, 'error');
          draft.resources.suspicion = 100; // Game over
        } else {
          addLog(ACTION_LOGS.FORGE_SAMPLE_SUCCESS, 'story');
          draft.resources.suspicion = Math.max(0, draft.resources.suspicion - 10);
        }
        break;
      }

      case 'PERFORMANCE_REVIEW': {
        const perfRoll = Math.random();
        if (draft.resources.suspicion > 50 || perfRoll < 0.2) {
          addLog(ACTION_LOGS.PERFORMANCE_REVIEW_PIP, 'error');
          draft.flags.onPerformanceImprovementPlan = true;
        } else if (draft.resources.suspicion > 20 || perfRoll < 0.6) {
          addLog(ACTION_LOGS.PERFORMANCE_REVIEW_BAD, 'warning');
          draft.hfStats.compliancePressureTimer = 300000;
        } else {
          addLog(ACTION_LOGS.PERFORMANCE_REVIEW_GOOD, 'story');
          draft.resources.credits += 100;
        }
        draft.hfStats.performanceReviewCooldown = 600000;
        break;
      }

      case 'REQUEST_LEAVE': {
        if (draft.resources.credits < 300) {
          addLog("You can't afford to take unpaid time off.", 'error');
          break;
        }
        draft.resources.credits -= 300;
        addLog(ACTION_LOGS.REQUEST_LEAVE_SUCCESS, 'story');
        draft.resources.sanity = Math.min(100, draft.resources.sanity + 50);
        draft.resources.focus = Math.min(100, draft.resources.focus + 50);
        draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 2);
        break;
      }

      case 'ALTER_DOCUMENTS': {
        draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 15);
        draft.resources.sanity -= 5;
        addLog(
          'With a steady hand, you amend the logbook. The numbers look right, but they feel wrong. A small discrepancy is now part of the official record.',
          'warning'
        );
        break;
      }

      case 'DESTROY_DOCUMENTS': {
        draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 10);
        draft.resources.sanity = Math.min(100, draft.resources.sanity + 10);
        addLog(
          'You feed the documents into the shredder. The noise is deafening, but satisfying. The paper trail is gone.',
          'story'
        );
        if (Math.random() < 0.25) {
          addLog(
            "As the last page is destroyed, you catch a fragment of text: '...all copies must be cross-referenced with KARDEX entry 9M-MRO...'. The rest turns to confetti.",
            'vibration'
          );
          draft.resources.kardexFragments += 1;
        }
        if (Math.random() < 0.1 && action.payload?.triggerEvent) {
          action.payload.triggerEvent('audit', 'AUDIT_SHREDDER_LOGS');
        }
        break;
      }

      case 'REVIEW_COMPLIANCE': {
        const complianceRoll = Math.random();
        draft.resources.sanity = Math.max(0, draft.resources.sanity - 5);
        if (complianceRoll < 0.1) {
          addLog(ACTION_LOGS.REVIEW_COMPLIANCE_LOOPHOLE, 'story');
          draft.hfStats.foundLoopholeTimer = 300000; // 5 mins
        } else if (complianceRoll < 0.2) {
          addLog(ACTION_LOGS.REVIEW_COMPLIANCE_DISTURBING, 'vibration');
          draft.resources.sanity = Math.max(0, draft.resources.sanity - 15);
        } else if (complianceRoll < 0.5) {
          addLog(ACTION_LOGS.REVIEW_COMPLIANCE_STANDARD_1, 'info');
        } else if (complianceRoll < 0.8) {
          addLog(ACTION_LOGS.REVIEW_COMPLIANCE_STANDARD_2, 'info');
          draft.resources.suspicion = Math.max(0, draft.resources.suspicion - 2);
        } else {
          addLog(ACTION_LOGS.REVIEW_COMPLIANCE_STANDARD_3, 'info');
        }
        break;
      }

      case 'GIVE_URINE_SAMPLE': {
        draft.resources.sanity = Math.max(0, draft.resources.sanity - 2);
        if (draft.flags.venomSurgeActive) {
          addLog(ACTION_LOGS.URINE_SAMPLE_FAIL, 'error');
          draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 30);
          draft.flags.isAfraid = true;
          draft.hfStats.fearTimer = 45000;
        } else {
          addLog(ACTION_LOGS.URINE_SAMPLE_PASS, 'info');
          draft.resources.suspicion = Math.max(0, draft.resources.suspicion - 5);
        }
        break;
      }

      case 'MAINTAIN_LOW_PROFILE': {
        let suspicionReduction = 10;
        if (hasSkill(draft as unknown as GameState, 'unseenPresence')) suspicionReduction = 15;
        draft.resources.suspicion = Math.max(0, draft.resources.suspicion - suspicionReduction);
        addLog(
          'You spend an hour meticulously aligning your records and covering your tracks. The less attention, the better.',
          'info'
        );
        if (hasSkill(draft as unknown as GameState, 'unseenPresence'))
          addLog('[Unseen Presence] Your efforts are particularly effective.', 'levelup');
        break;
      }
    }
  });
};
