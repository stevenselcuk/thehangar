/**
 * LevelManager - Service for checking level-gated features
 *
 * Pure functions for determining what is accessible at each level.
 * No state mutations - this is a query service only.
 */

import {
  ACTION_FEATURES,
  getActionRequiredLevel,
  getEventCategoryRequiredLevel,
  getTabRequiredLevel,
  TAB_FEATURES,
} from '../data/featureRegistry.ts';
import {
  getAllUnlockedActions,
  getAllUnlockedEventCategories,
  getAllUnlockedFlags,
  getAllUnlockedTabs,
  getMilestoneForLevel,
  getNextMilestone,
  type LevelMilestone,
} from '../data/levelMilestones.ts';
import { GameState, TabType } from '../types.ts';

/**
 * isTabUnlocked - Check if a tab is accessible at the current player level
 */
export const isTabUnlocked = (tab: TabType, state: GameState): boolean => {
  const playerLevel = state.resources.level;
  const requiredLevel = getTabRequiredLevel(tab);

  // Check level requirement
  if (playerLevel < requiredLevel) {
    return false;
  }

  // Check additional flag requirements
  const feature = TAB_FEATURES[tab];
  if (feature.requiredFlags) {
    for (const flagKey of feature.requiredFlags) {
      if (!state.flags[flagKey as keyof typeof state.flags]) {
        return false;
      }
    }
  }

  return true;
};

/**
 * isActionUnlocked - Check if an action is accessible at the current player level
 */
export const isActionUnlocked = (actionId: string, state: GameState): boolean => {
  const playerLevel = state.resources.level;
  const requiredLevel = getActionRequiredLevel(actionId);

  // Check level requirement
  if (playerLevel < requiredLevel) {
    return false;
  }

  // Check additional requirements
  const feature = ACTION_FEATURES[actionId];
  if (feature) {
    // Check flag requirements
    if (feature.requiredFlags) {
      for (const flagKey of feature.requiredFlags) {
        if (!state.flags[flagKey as keyof typeof state.flags]) {
          return false;
        }
      }
    }

    // Check item requirements
    if (feature.requiredItems) {
      for (const itemKey of feature.requiredItems) {
        if (!state.inventory[itemKey as keyof typeof state.inventory]) {
          return false;
        }
      }
    }
  }

  return true;
};

/**
 * canSpawnEventCategory - Check if events of a category can spawn
 */
export const canSpawnEventCategory = (category: string, state: GameState): boolean => {
  const playerLevel = state.resources.level;
  const requiredLevel = getEventCategoryRequiredLevel(category);
  return playerLevel >= requiredLevel;
};

/**
 * getUnlockedTabs - Get all tabs currently accessible to the player
 */
export const getUnlockedTabs = (state: GameState): TabType[] => {
  return getAllUnlockedTabs(state.resources.level).filter((tab) => isTabUnlocked(tab, state));
};

/**
 * getUnlockedActions - Get all actions currently accessible to the player
 */
export const getUnlockedActions = (state: GameState): string[] => {
  return getAllUnlockedActions(state.resources.level).filter((action) =>
    isActionUnlocked(action, state)
  );
};

/**
 * getUnlockedEventCategories - Get all event categories that can spawn
 */
export const getUnlockedEventCategories = (state: GameState): string[] => {
  return getAllUnlockedEventCategories(state.resources.level);
};

/**
 * getCurrentMilestone - Get the milestone for the player's current level
 */
export const getCurrentMilestone = (state: GameState): LevelMilestone | undefined => {
  return getMilestoneForLevel(state.resources.level);
};

/**
 * getNextUnlockMilestone - Get the next milestone the player will reach
 */
export const getNextUnlockMilestone = (state: GameState): LevelMilestone | undefined => {
  return getNextMilestone(state.resources.level);
};

/**
 * getFlagsToSetForLevel - Get flags that should be enabled at a level
 * Used when leveling up to automatically set flags
 */
export const getFlagsToSetForLevel = (level: number): string[] => {
  return getAllUnlockedFlags(level);
};

/**
 * hasCompletedOnboarding - Check if player has completed the onboarding sequence
 * Player starts at level 0 and must complete NDA, offer, ID card to proceed
 */
export const hasCompletedOnboarding = (state: GameState): boolean => {
  return state.flags.storyFlags?.onboardingComplete === true;
};

/**
 * getLevelProgressInfo - Get information about progress to next level
 */
export const getLevelProgressInfo = (
  state: GameState
): {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  progressPercent: number;
  nextMilestone: LevelMilestone | undefined;
} => {
  const currentLevel = state.resources.level;
  const currentXP = state.resources.experience;

  // XP formula: Each level requires (level * 500) + 500 XP from the previous level
  // Level 1: 1000 XP, Level 2: 1500 XP, Level 3: 2000 XP, etc.
  const xpForCurrentLevel = currentLevel * 500 + 500;
  const xpToNextLevel = Math.max(0, xpForCurrentLevel - (currentXP % xpForCurrentLevel));
  const progressPercent = Math.min(
    100,
    ((currentXP % xpForCurrentLevel) / xpForCurrentLevel) * 100
  );

  return {
    currentLevel,
    currentXP,
    xpToNextLevel,
    progressPercent,
    nextMilestone: getNextMilestone(currentLevel),
  };
};

/**
 * getLockedFeatureMessage - Get a message explaining why a feature is locked
 * Used for UI feedback
 */
export const getLockedFeatureMessage = (
  featureType: 'tab' | 'action' | 'event',
  featureId: string,
  state: GameState
): string => {
  const playerLevel = state.resources.level;
  let requiredLevel = 0;

  switch (featureType) {
    case 'tab':
      requiredLevel = getTabRequiredLevel(featureId as TabType);
      break;
    case 'action':
      requiredLevel = getActionRequiredLevel(featureId);
      break;
    case 'event':
      requiredLevel = getEventCategoryRequiredLevel(featureId);
      break;
  }

  if (playerLevel < requiredLevel) {
    return `[CLEARANCE DENIED] Level ${requiredLevel} required. Current: ${playerLevel}.`;
  }

  return '[ACCESS RESTRICTED] Additional requirements not met.';
};
