/**
 * FeatureRegistry Tests - Validation tests for the feature registry
 */

import {
  ACTION_FEATURES,
  EVENT_CATEGORY_FEATURES,
  getActionRequiredLevel,
  getAllFeatures,
  getEventCategoryRequiredLevel,
  getTabRequiredLevel,
  TAB_FEATURES,
} from '@/data/featureRegistry.ts';
import { TabType } from '@/types.ts';
import { describe, expect, it } from 'vitest';

describe('FeatureRegistry', () => {
  describe('TAB_FEATURES', () => {
    it('should have entries for all TabType values', () => {
      const tabTypes = Object.values(TabType);
      for (const tab of tabTypes) {
        expect(TAB_FEATURES[tab]).toBeDefined();
        expect(TAB_FEATURES[tab].id).toBeDefined();
        expect(TAB_FEATURES[tab].type).toBe('tab');
        expect(typeof TAB_FEATURES[tab].requiredLevel).toBe('number');
      }
    });

    it('should have valid level requirements (0-49)', () => {
      for (const feature of Object.values(TAB_FEATURES)) {
        expect(feature.requiredLevel).toBeGreaterThanOrEqual(0);
        expect(feature.requiredLevel).toBeLessThanOrEqual(49);
      }
    });

    it('should have unique IDs', () => {
      const ids = Object.values(TAB_FEATURES).map((f) => f.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('ACTION_FEATURES', () => {
    it('should have string keys', () => {
      for (const key of Object.keys(ACTION_FEATURES)) {
        expect(typeof key).toBe('string');
        expect(key.length).toBeGreaterThan(0);
      }
    });

    it('should have valid level requirements (0-49)', () => {
      for (const feature of Object.values(ACTION_FEATURES)) {
        expect(feature.requiredLevel).toBeGreaterThanOrEqual(0);
        expect(feature.requiredLevel).toBeLessThanOrEqual(49);
      }
    });

    it('should include ending actions at level 49', () => {
      expect(ACTION_FEATURES.TRIGGER_ALIEN_ENDING).toBeDefined();
      expect(ACTION_FEATURES.TRIGGER_ALIEN_ENDING.requiredLevel).toBe(49);
      expect(ACTION_FEATURES.TRIGGER_GOVT_ENDING).toBeDefined();
      expect(ACTION_FEATURES.TRIGGER_GOVT_ENDING.requiredLevel).toBe(49);
      expect(ACTION_FEATURES.TRIGGER_CRAZY_ENDING).toBeDefined();
      expect(ACTION_FEATURES.TRIGGER_CRAZY_ENDING.requiredLevel).toBe(49);
    });

    it('should have metallicSphere requirement for alien ending', () => {
      expect(ACTION_FEATURES.TRIGGER_ALIEN_ENDING.requiredItems).toContain('metallicSphere');
    });
  });

  describe('EVENT_CATEGORY_FEATURES', () => {
    it('should have known event categories', () => {
      const expectedCategories = [
        'incident',
        'accident',
        'audit',
        'canteen_incident',
        'component_failure',
        'bureaucratic_horror',
        'eldritch_manifestation',
        'union',
        'syndicate',
        'story_event',
      ];

      for (const category of expectedCategories) {
        expect(EVENT_CATEGORY_FEATURES[category]).toBeDefined();
      }
    });

    it('should have valid level requirements (0-49)', () => {
      for (const feature of Object.values(EVENT_CATEGORY_FEATURES)) {
        expect(feature.requiredLevel).toBeGreaterThanOrEqual(0);
        expect(feature.requiredLevel).toBeLessThanOrEqual(49);
      }
    });

    it('should have eldritch_manifestation at level 15', () => {
      expect(EVENT_CATEGORY_FEATURES.eldritch_manifestation.requiredLevel).toBe(15);
    });
  });

  describe('Helper functions', () => {
    it('getActionRequiredLevel should return 0 for unknown actions', () => {
      expect(getActionRequiredLevel('UNKNOWN_ACTION_XYZ')).toBe(0);
    });

    it('getActionRequiredLevel should return correct level for known actions', () => {
      expect(getActionRequiredLevel('GET_TOOLROOM_ITEM')).toBe(1);
      expect(getActionRequiredLevel('TRIGGER_ALIEN_ENDING')).toBe(49);
    });

    it('getTabRequiredLevel should return correct levels', () => {
      expect(getTabRequiredLevel(TabType.HANGAR)).toBe(0);
      expect(getTabRequiredLevel(TabType.TOOLROOM)).toBe(1);
      expect(getTabRequiredLevel(TabType.AOG_DEPLOYMENT)).toBe(25);
    });

    it('getEventCategoryRequiredLevel should return correct levels', () => {
      expect(getEventCategoryRequiredLevel('story_event')).toBe(0);
      expect(getEventCategoryRequiredLevel('audit')).toBe(5);
      expect(getEventCategoryRequiredLevel('eldritch_manifestation')).toBe(15);
    });

    it('getAllFeatures should return all features', () => {
      const allFeatures = getAllFeatures();
      const tabCount = Object.keys(TAB_FEATURES).length;
      const actionCount = Object.keys(ACTION_FEATURES).length;
      const eventCount = Object.keys(EVENT_CATEGORY_FEATURES).length;
      expect(allFeatures.length).toBe(tabCount + actionCount + eventCount);
    });
  });
});
