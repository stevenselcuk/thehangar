import { produce } from 'immer';
import { ACTION_LOGS } from '../../data/flavor.ts';
import { skillsData } from '../../data/skills.ts';
import { trainingData } from '../../data/training.ts';
import { addLogToDraft } from '../../services/logService.ts';
import type { GameState, Inventory, ProficiencyState } from '../../types.ts';

// State subset managed by this slice
export interface ProficiencySliceState {
  proficiency: ProficiencyState;
  resources: Pick<GameState['resources'], 'credits' | 'experience' | 'level'>;
  inventory: Inventory;
  hfStats: Pick<GameState['hfStats'], 'hfRecurrentDueDate'>;
  logs: GameState['logs'];
}

// Action types
export type ProficiencyAction =
  | {
      type: 'TAKE_MANDATORY_COURSE';
      payload: {
        id: string;
      };
    }
  | {
      type: 'TAKE_AP_EXAM';
      payload: { id: string };
    }
  | { type: 'TAKE_AVIONICS_EXAM'; payload: Record<string, never> }
  | { type: 'TAKE_EASA_EXAM'; payload: Record<string, never> }
  | { type: 'CERTIFY_EASA_LICENSE'; payload: Record<string, never> }
  | {
      type: 'TAKE_NDT_EXAM';
      payload: { id: string };
    }
  | {
      type: 'TAKE_NDT_SUBTASK_EXAM';
      payload: {
        id: 'eddy' | 'hfec' | 'tap' | 'borescope' | 'dye';
      };
    }
  | {
      type: 'TAKE_TYPE_RATING';
      payload: {
        id: number;
        family: '737' | 'A330';
      };
    }
  | { type: 'UNLOCK_SKILL'; payload: { id: string } }
  | { type: 'ACKNOWLEDGE_LEVEL_UP'; payload: { level: number } };

export const PROFICIENCY_ACTIONS = [
  'TAKE_MANDATORY_COURSE',
  'TAKE_AP_EXAM',
  'TAKE_AVIONICS_EXAM',
  'TAKE_EASA_EXAM',
  'CERTIFY_EASA_LICENSE',
  'TAKE_NDT_EXAM',
  'TAKE_NDT_SUBTASK_EXAM',
  'TAKE_TYPE_RATING',
  'UNLOCK_SKILL',
  'ACKNOWLEDGE_LEVEL_UP',
] as const;

// Helper: Check if a skill has been unlocked
export const hasSkillUnlocked = (state: ProficiencySliceState, skillId: string): boolean => {
  return state.proficiency.unlocked.includes(skillId);
};

// Helper: Get next EASA module to take
export const getNextEasaModule = (state: ProficiencySliceState) => {
  return trainingData.easaLicense.modules.find(
    (m) => !state.proficiency.easaModulesPassed.includes(m.id)
  );
};

// Helper: Check EASA exam pass
export const rollEasaExamPass = (): boolean => {
  return Math.random() > 0.3; // 70% pass rate
};

// Main reducer
export const proficiencyReducer = produce(
  (draft: ProficiencySliceState, action: ProficiencyAction) => {
    const now = Date.now();
    const addLog = (
      text: string,
      type: 'info' | 'warning' | 'error' | 'story' | 'vibration' | 'levelup' = 'info'
    ) => {
      addLogToDraft(draft.logs, text, type, now);
    };

    switch (action.type) {
      case 'TAKE_MANDATORY_COURSE': {
        const { id } = action.payload;

        const course = trainingData.mandatoryCourses.find((c) => c.id === id);
        if (!course) {
          addLog(`System Error: Course ${id} not found.`, 'error');
          break;
        }

        draft.resources.credits -= course.costCredits;
        draft.resources.experience += course.rewardXp;
        (draft.inventory as unknown as Record<string, unknown>)[course.inventoryFlag] = true;
        addLog(`TRAINING COMPLETE: ${course.label}. Your file has been updated.`, 'story');

        // Special handling for HF initial/recurrent courses
        if (id === 'hfInitial' || id === 'hfRecurrent') {
          draft.hfStats.hfRecurrentDueDate = Date.now() + 365 * 24 * 60 * 60 * 100; // Fake year in ms for game time
        }
        break;
      }

      case 'TAKE_AP_EXAM': {
        const { id } = action.payload;
        // Logic for lookup
        let examData;
        if (id === 'apWritten') examData = trainingData.faaLicense.written;
        else if (id === 'apPractical') examData = trainingData.faaLicense.practical;
        else if (id === 'hasAPLicense') examData = trainingData.faaLicense.license; // Wait, license has no cost usually?

        if (!examData) {
          // Fallback or error
          break;
        }

        if ('costCredits' in examData) {
          const data = examData as { costCredits: number };
          draft.resources.credits -= data.costCredits;
        }
        if ('rewardXp' in examData) {
          const data = examData as { rewardXp: number };
          draft.resources.experience += data.rewardXp;
        }

        if (id === 'apWritten') {
          draft.inventory.apWrittenPassed = true;
          addLog(
            'FAA EXAM PASSED: You have successfully passed the A&P Written Examination.',
            'levelup'
          );
        } else if (id === 'apPractical') {
          draft.inventory.apPracticalPassed = true;
          addLog(
            "FAA EXAM PASSED: The inspector signs off on your practical exam. You're one step closer.",
            'levelup'
          );
        } else if (id === 'hasAPLicense') {
          draft.inventory.hasAPLicense = true;
          addLog(ACTION_LOGS.EXAM_PASS, 'levelup');
        }
        break;
      }

      case 'TAKE_AVIONICS_EXAM': {
        draft.resources.credits -= trainingData.faaLicense.avionics.costCredits;
        draft.resources.experience += trainingData.faaLicense.avionics.rewardXp;
        draft.inventory.hasAvionicsCert = true;
        addLog('AVIONICS CERTIFIED: You are now qualified for advanced avionics work.', 'levelup');
        break;
      }

      case 'TAKE_EASA_EXAM': {
        draft.resources.credits -= trainingData.easaLicense.examCost.costCredits;

        const nextModule = getNextEasaModule(draft);
        if (nextModule) {
          if (rollEasaExamPass()) {
            draft.proficiency.easaModulesPassed.push(nextModule.id);
            draft.resources.experience += trainingData.easaLicense.examCost.rewardXp;
            addLog(`EASA MODULE PASSED: ${nextModule.name}`, 'story');
          } else {
            addLog(
              `EASA MODULE FAILED: ${nextModule.name}. Review your notes and try again.`,
              'warning'
            );
          }
        }
        break;
      }

      case 'CERTIFY_EASA_LICENSE': {
        draft.inventory.hasEasaB1_1 = true;
        addLog(
          'EASA B1.1 LICENSE GRANTED: Your logbook and exam results have been verified. You are now a certified EASA technician.',
          'levelup'
        );
        break;
      }

      case 'TAKE_NDT_EXAM': {
        const { id } = action.payload;

        const ndtLevel = trainingData.ndtCerts.levels.find((l) => l.id === id);
        if (!ndtLevel) {
          addLog(`Error: NDT Exam ${id} not found.`, 'error');
          break;
        }

        draft.resources.credits -= ndtLevel.costCredits;
        draft.resources.experience += ndtLevel.rewardXp;
        (draft.inventory as unknown as Record<string, unknown>)[id] = true;
        addLog(`NDT CERTIFICATION: You have achieved ${ndtLevel.label}.`, 'story');
        break;
      }

      case 'TAKE_NDT_SUBTASK_EXAM': {
        // Added for completeness, though unused in UI yet?
        const { id } = action.payload;
        const subtask = trainingData.ndtCerts.subtasks.find((s) => s.id === id);
        if (!subtask) break;

        draft.resources.credits -= subtask.costCredits;
        draft.resources.experience += subtask.rewardXp;
        draft.inventory.ndtCerts.push(id);
        addLog(`NDT QUALIFICATION: You are now certified for ${subtask.label}.`, 'info');
        break;
      }

      case 'TAKE_TYPE_RATING': {
        const { family, id } = action.payload; // id here is the Level (1, 2, 3...)

        // Lookup
        let ratingData;
        if (family === '737') ratingData = trainingData.typeRatings['737'].find((r) => r.id === id);
        else if (family === 'A330')
          ratingData = trainingData.typeRatings['A330'].find((r) => r.id === id);

        if (!ratingData) break;

        draft.resources.credits -= ratingData.costCredits;
        draft.resources.experience += ratingData.rewardXp;

        if (family === '737') {
          draft.inventory.typeRating737 = id;
        } else if (family === 'A330') {
          draft.inventory.typeRatingA330 = id;
        }

        addLog(`TYPE RATING ACHIEVED: ${ratingData.label}.`, 'story');
        break;
      }

      case 'UNLOCK_SKILL': {
        if (draft.proficiency.skillPoints > 0) {
          const skill = [...skillsData.mechanic, ...skillsData.watcher].find(
            (s) => s.id === action.payload.id
          );
          if (skill && !draft.proficiency.unlocked.includes(skill.id)) {
            const hasPrereqs = !skill.prereq || draft.proficiency.unlocked.includes(skill.prereq);
            if (hasPrereqs) {
              draft.proficiency.skillPoints -= 1;
              draft.proficiency.unlocked.push(skill.id);
              addLog(`PROFICIENCY UNLOCKED: ${skill.name}`, 'levelup');
            }
          }
        }
        break;
      }

      case 'ACKNOWLEDGE_LEVEL_UP': {
        // No state mutation needed - handled in App.tsx for UI notifications
        break;
      }
    }
  }
);
