import { produce } from 'immer';
import { clampFocus, clampSanity, clampSuspicion } from '../../services/ResourceValidator.ts';
import {
  applyRewards,
  calculateAutoSrfIncome,
  calculateFocusRegen,
  calculateNightCrewIncome,
  calculateTransitCheckIncome,
} from '../../services/RewardCalculator.ts';
import { GameState, ResourceState } from '../../types.ts';

/**
 * Resources Slice - Manages all resource state mutations
 * Handles: alclad, titanium, fiberglass, rivets, sanity, suspicion, focus, credits, XP, level
 *
 * Target: 150-200 lines
 * Extracted from gameReducer.ts lines handling resource mutations
 */

export interface ResourcesSliceState {
  resources: ResourceState;
  logs: Array<{ id: string; text: string; type: string; timestamp: number }>;
}

type ResourcesAction =
  | { type: 'RESOURCES_ADD'; payload: Partial<ResourceState> }
  | { type: 'RESOURCES_DEDUCT'; payload: Partial<ResourceState> }
  | { type: 'RESOURCES_SET'; payload: Partial<ResourceState> }
  | { type: 'RESOURCES_CLAMP_ALL' }
  | {
      type: 'RESOURCES_TICK';
      payload: {
        delta: number;
        flags: GameState['flags'];
        hfStats: GameState['hfStats'];
        proficiency: GameState['proficiency'];
      };
    };

/**
 * Resources reducer - handles all resource mutations
 */
export const resourcesReducer = (
  state: ResourcesSliceState,
  action: ResourcesAction
): ResourcesSliceState => {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'RESOURCES_ADD': {
        // Add resources (rewards, passive income, etc.)
        applyRewards(draft.resources, action.payload);
        break;
      }

      case 'RESOURCES_DEDUCT': {
        // Deduct resources (costs, penalties, etc.)
        Object.entries(action.payload).forEach(([key, value]) => {
          const resourceKey = key as keyof ResourceState;
          if (typeof value === 'number') {
            draft.resources[resourceKey] = Math.max(
              0,
              (draft.resources[resourceKey] as number) - value
            );
          }
        });
        break;
      }

      case 'RESOURCES_SET': {
        // Directly set resource values
        Object.entries(action.payload).forEach(([key, value]) => {
          const resourceKey = key as keyof ResourceState;
          if (typeof value === 'number') {
            draft.resources[resourceKey] = value as never;
          }
        });
        break;
      }

      case 'RESOURCES_CLAMP_ALL': {
        // Clamp all percentage-based resources to 0-100
        clampSanity(draft.resources);
        clampFocus(draft.resources);
        clampSuspicion(draft.resources);
        break;
      }

      case 'RESOURCES_TICK': {
        // Handle per-tick resource updates
        const { delta, flags, hfStats, proficiency } = action.payload;
        const deltaSeconds = delta / 1000;

        // Sanity drain (from tick processor lines 123-127)
        let sanityDrain = 0;
        if (flags.isAfraid) sanityDrain += 0.5;
        // Guard against missing proficiency state
        if (proficiency?.unlocked?.includes('steadyNerves')) sanityDrain *= 0.9;
        if (hfStats.sanityShieldTimer > 0) sanityDrain = 0; // Sanity shield active

        draft.resources.sanity = Math.max(0, draft.resources.sanity - sanityDrain * deltaSeconds);

        // Hallucination focus drain (from tick processor, lines 117-119)
        if (flags.isHallucinating) {
          draft.resources.focus = Math.max(0, draft.resources.focus - 5.0 * deltaSeconds);
        }

        // Focus regeneration (from tick processor, lines 136-140)
        const focusRegen = calculateFocusRegen(
          { flags, hfStats, proficiency } as GameState,
          deltaSeconds
        );
        draft.resources.focus = Math.min(100, draft.resources.focus + focusRegen);

        // Night crew passive income (from tick processor, lines 142-150)
        if (flags.nightCrewActive) {
          const nightCrewIncome = calculateNightCrewIncome(
            { flags, hfStats, proficiency } as GameState,
            deltaSeconds
          );
          draft.resources.alclad += nightCrewIncome.alclad;
          draft.resources.rivets += nightCrewIncome.rivets;
          draft.resources.suspicion = Math.min(
            100,
            draft.resources.suspicion + nightCrewIncome.suspicion
          );
        }

        // Transit check delegation passive income (from tick processor, lines 152-156)
        if (flags.transitCheckDelegationActive) {
          const transitIncome = calculateTransitCheckIncome(deltaSeconds);
          draft.resources.credits += transitIncome.credits;
          draft.resources.experience += transitIncome.xp;
          draft.resources.suspicion = Math.min(
            100,
            draft.resources.suspicion + transitIncome.suspicion
          );
        }

        // Auto-SRF passive income (from tick processor, lines 158-164)
        if (flags.autoSrfActive) {
          const autoSrfIncome = calculateAutoSrfIncome(deltaSeconds);
          draft.resources.credits += autoSrfIncome.credits;
          draft.resources.experience += autoSrfIncome.xp;
        }

        // Base passive income removed as per user request (XP/Money now tied to actions only)
        // const baseIncome = calculateBasePassiveIncome({ proficiency } as GameState, delta);
        // draft.resources.credits += baseIncome.credits;
        // draft.resources.experience += baseIncome.xp;

        // Component failure credit drain (from tick processor, lines 109-111)
        if (flags.activeComponentFailure) {
          draft.resources.credits = Math.max(0, draft.resources.credits - 1.5 * deltaSeconds);
        }

        // Clamp percentage-based resources
        clampSanity(draft.resources);
        clampFocus(draft.resources);
        clampSuspicion(draft.resources);

        break;
      }
    }
  });
};

/**
 * Helper: Add credits (common operation)
 */
export const addCredits = (state: ResourcesSliceState, amount: number): ResourcesSliceState => {
  return resourcesReducer(state, {
    type: 'RESOURCES_ADD',
    payload: { credits: amount },
  });
};

/**
 * Helper: Add experience (common operation)
 */
export const addExperience = (state: ResourcesSliceState, amount: number): ResourcesSliceState => {
  return resourcesReducer(state, {
    type: 'RESOURCES_ADD',
    payload: { experience: amount },
  });
};

/**
 * Helper: Deduct focus (common operation)
 */
export const deductFocus = (state: ResourcesSliceState, amount: number): ResourcesSliceState => {
  return resourcesReducer(state, {
    type: 'RESOURCES_DEDUCT',
    payload: { focus: amount },
  });
};

/**
 * Helper: Drain sanity (common operation)
 */
export const drainSanity = (state: ResourcesSliceState, amount: number): ResourcesSliceState => {
  return resourcesReducer(state, {
    type: 'RESOURCES_DEDUCT',
    payload: { sanity: amount },
  });
};

/**
 * Helper: Increase suspicion (common operation)
 */
export const increaseSuspicion = (
  state: ResourcesSliceState,
  amount: number
): ResourcesSliceState => {
  return resourcesReducer(state, {
    type: 'RESOURCES_ADD',
    payload: { suspicion: amount },
  });
};
