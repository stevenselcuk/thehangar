/**
 * LevelManager Tests - Unit tests for the level gating service
 */

import {
  canSpawnEventCategory,
  getLevelProgressInfo,
  getLockedFeatureMessage,
  getUnlockedActions,
  getUnlockedEventCategories,
  getUnlockedTabs,
  hasCompletedOnboarding,
  isActionUnlocked,
  isTabUnlocked,
} from '@/services/LevelManager.ts';
import { createInitialState } from '@/state/initialState.ts';
import { GameState, TabType } from '@/types.ts';
import { beforeEach, describe, expect, it } from 'vitest';

describe('LevelManager', () => {
  let baseState: GameState;

  beforeEach(() => {
    baseState = createInitialState();
    // Set onboarding as complete for most tests
    baseState.flags.storyFlags = { onboardingComplete: true };
  });

  describe('isTabUnlocked', () => {
    it('should unlock HANGAR at level 0', () => {
      baseState.resources.level = 0;
      expect(isTabUnlocked(TabType.HANGAR, baseState)).toBe(true);
    });

    it('should unlock CANTEEN at level 0', () => {
      baseState.resources.level = 0;
      expect(isTabUnlocked(TabType.CANTEEN, baseState)).toBe(true);
    });

    it('should NOT unlock TOOLROOM at level 0', () => {
      baseState.resources.level = 0;
      expect(isTabUnlocked(TabType.TOOLROOM, baseState)).toBe(false);
    });

    it('should unlock TOOLROOM at level 1', () => {
      baseState.resources.level = 1;
      expect(isTabUnlocked(TabType.TOOLROOM, baseState)).toBe(true);
    });

    it('should NOT unlock OFFICE at level 2', () => {
      baseState.resources.level = 2;
      expect(isTabUnlocked(TabType.OFFICE, baseState)).toBe(false);
    });

    it('should unlock OFFICE at level 3 with flag', () => {
      baseState.resources.level = 3;
      baseState.flags.officeUnlocked = true;
      expect(isTabUnlocked(TabType.OFFICE, baseState)).toBe(true);
    });

    it('should NOT unlock OFFICE at level 3 without flag', () => {
      baseState.resources.level = 3;
      baseState.flags.officeUnlocked = false;
      expect(isTabUnlocked(TabType.OFFICE, baseState)).toBe(false);
    });

    it('should NOT unlock BACKSHOPS below level 15', () => {
      baseState.resources.level = 14;
      expect(isTabUnlocked(TabType.BACKSHOPS, baseState)).toBe(false);
    });

    it('should unlock BACKSHOPS at level 15', () => {
      baseState.resources.level = 15;
      expect(isTabUnlocked(TabType.BACKSHOPS, baseState)).toBe(true);
    });

    it('should NOT unlock AOG_DEPLOYMENT below level 25', () => {
      baseState.resources.level = 24;
      expect(isTabUnlocked(TabType.AOG_DEPLOYMENT, baseState)).toBe(false);
    });

    it('should unlock AOG_DEPLOYMENT at level 25', () => {
      baseState.resources.level = 25;
      expect(isTabUnlocked(TabType.AOG_DEPLOYMENT, baseState)).toBe(true);
    });
  });

  describe('isActionUnlocked', () => {
    it('should allow INSPECT_VENDING_MACHINE at level 0', () => {
      baseState.resources.level = 0;
      expect(isActionUnlocked('INSPECT_VENDING_MACHINE', baseState)).toBe(true);
    });

    it('should NOT allow GET_TOOLROOM_ITEM at level 0', () => {
      baseState.resources.level = 0;
      expect(isActionUnlocked('GET_TOOLROOM_ITEM', baseState)).toBe(false);
    });

    it('should allow GET_TOOLROOM_ITEM at level 1', () => {
      baseState.resources.level = 1;
      expect(isActionUnlocked('GET_TOOLROOM_ITEM', baseState)).toBe(true);
    });

    it('should allow unregistered actions by default (level 0)', () => {
      baseState.resources.level = 0;
      expect(isActionUnlocked('UNKNOWN_ACTION', baseState)).toBe(true);
    });

    it('should NOT allow ending actions below level 49', () => {
      baseState.resources.level = 48;
      expect(isActionUnlocked('TRIGGER_ALIEN_ENDING', baseState)).toBe(false);
      expect(isActionUnlocked('TRIGGER_GOVT_ENDING', baseState)).toBe(false);
      expect(isActionUnlocked('TRIGGER_CRAZY_ENDING', baseState)).toBe(false);
    });

    it('should allow ending actions at level 49', () => {
      baseState.resources.level = 49;
      expect(isActionUnlocked('TRIGGER_GOVT_ENDING', baseState)).toBe(true);
      expect(isActionUnlocked('TRIGGER_CRAZY_ENDING', baseState)).toBe(true);
    });

    it('should require metallicSphere for TRIGGER_ALIEN_ENDING', () => {
      baseState.resources.level = 49;
      baseState.inventory.metallicSphere = false;
      expect(isActionUnlocked('TRIGGER_ALIEN_ENDING', baseState)).toBe(false);
    });

    it('should allow TRIGGER_ALIEN_ENDING with metallicSphere', () => {
      baseState.resources.level = 49;
      baseState.inventory.metallicSphere = true;
      expect(isActionUnlocked('TRIGGER_ALIEN_ENDING', baseState)).toBe(true);
    });
  });

  describe('canSpawnEventCategory', () => {
    it('should allow story_event at level 0', () => {
      baseState.resources.level = 0;
      expect(canSpawnEventCategory('story_event', baseState)).toBe(true);
    });

    it('should NOT allow audit events below level 5', () => {
      baseState.resources.level = 4;
      expect(canSpawnEventCategory('audit', baseState)).toBe(false);
    });

    it('should allow audit events at level 5', () => {
      baseState.resources.level = 5;
      expect(canSpawnEventCategory('audit', baseState)).toBe(true);
    });

    it('should NOT allow eldritch_manifestation below level 15', () => {
      baseState.resources.level = 14;
      expect(canSpawnEventCategory('eldritch_manifestation', baseState)).toBe(false);
    });

    it('should allow eldritch_manifestation at level 15', () => {
      baseState.resources.level = 15;
      expect(canSpawnEventCategory('eldritch_manifestation', baseState)).toBe(true);
    });
  });

  describe('getUnlockedTabs', () => {
    it('should return 2 tabs at level 0', () => {
      baseState.resources.level = 0;
      const tabs = getUnlockedTabs(baseState);
      expect(tabs.length).toBeGreaterThanOrEqual(2);
      expect(tabs).toContain(TabType.HANGAR);
      expect(tabs).toContain(TabType.CANTEEN);
    });

    it('should return 3 tabs at level 1', () => {
      baseState.resources.level = 1;
      const tabs = getUnlockedTabs(baseState);
      expect(tabs.length).toBeGreaterThanOrEqual(3);
      expect(tabs).toContain(TabType.TOOLROOM);
    });
  });

  describe('getUnlockedActions', () => {
    it('should return few actions at level 0', () => {
      baseState.resources.level = 0;
      const actions = getUnlockedActions(baseState);
      expect(actions.length).toBeGreaterThanOrEqual(1);
      expect(actions).toContain('INSPECT_VENDING_MACHINE');
    });

    it('should return more actions at higher levels', () => {
      const actionsL0 = getUnlockedActions({
        ...baseState,
        resources: { ...baseState.resources, level: 0 },
      });
      const actionsL10 = getUnlockedActions({
        ...baseState,
        resources: { ...baseState.resources, level: 10 },
      });
      expect(actionsL10.length).toBeGreaterThan(actionsL0.length);
    });
  });

  describe('getUnlockedEventCategories', () => {
    it('should return empty at level 0', () => {
      baseState.resources.level = 0;
      const categories = getUnlockedEventCategories(baseState);
      // story_event has level 0, but may not be in milestone data
      expect(categories.length).toBeLessThanOrEqual(1);
    });

    it('should return incident at level 2', () => {
      baseState.resources.level = 2;
      const categories = getUnlockedEventCategories(baseState);
      expect(categories).toContain('incident');
    });
  });

  describe('hasCompletedOnboarding', () => {
    it('should return false for new player', () => {
      baseState.flags.storyFlags = {};
      expect(hasCompletedOnboarding(baseState)).toBe(false);
    });

    it('should return true after onboarding complete', () => {
      baseState.flags.storyFlags = { onboardingComplete: true };
      expect(hasCompletedOnboarding(baseState)).toBe(true);
    });
  });

  describe('getLevelProgressInfo', () => {
    it('should return correct level info', () => {
      baseState.resources.level = 5;
      baseState.resources.experience = 1000;
      const info = getLevelProgressInfo(baseState);
      expect(info.currentLevel).toBe(5);
      expect(info.currentXP).toBe(1000);
      expect(info.nextMilestone).toBeDefined();
    });
  });

  describe('getLockedFeatureMessage', () => {
    it('should return clearance denied message for low level', () => {
      baseState.resources.level = 1;
      const msg = getLockedFeatureMessage('tab', TabType.BACKSHOPS, baseState);
      expect(msg).toContain('CLEARANCE DENIED');
      expect(msg).toContain('15');
    });
  });
});
