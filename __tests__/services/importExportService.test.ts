import { exportGameData, getExportMetadata, importGameData } from '@/services/importExportService';
import { createInitialState } from '@/state/initialState';
import { GameState } from '@/types';
import { obfuscate } from '@/utils/obfuscation';
import { beforeEach, describe, expect, it } from 'vitest';

describe('importExportService', () => {
  let testState: GameState;

  beforeEach(() => {
    testState = createInitialState();
    // Modify state to have some progress
    testState.resources.level = 5;
    testState.resources.experience = 500;
    testState.resources.credits = 1000;
    testState.resources.alclad = 200;
    testState.inventory.hasAPLicense = true;
    testState.inventory.flashlight = true;
    testState.proficiency.unlocked = ['skill1', 'skill2'];
    testState.proficiency.skillPoints = 3;
  });

  describe('exportGameData', () => {
    it('should export a game state to an obfuscated string', () => {
      const exported = exportGameData(testState);

      expect(typeof exported).toBe('string');
      expect(exported.length).toBeGreaterThan(0);
    });

    it('should not contain plaintext game data', () => {
      const exported = exportGameData(testState);

      // Should not contain obvious game data in plaintext
      expect(exported).not.toContain('resources');
      expect(exported).not.toContain('inventory');
      expect(exported).not.toContain('credits');
      expect(exported).not.toContain('alclad');
    });

    it('should handle initial state export', () => {
      const initialState = createInitialState();
      const exported = exportGameData(initialState);

      expect(typeof exported).toBe('string');
      expect(exported.length).toBeGreaterThan(0);
    });

    it('should export state with complex data', () => {
      testState.logs = [
        { id: '1', text: 'Log entry 1', type: 'info', timestamp: Date.now() },
        { id: '2', text: 'Log entry 2', type: 'warning', timestamp: Date.now() },
      ];
      testState.rotables = [
        {
          id: 'R001',
          label: 'Test Rotable',
          pn: 'PN123',
          sn: 'SN456',
          condition: 75,
          isInstalled: false,
          isUntraceable: false,
        },
      ];

      const exported = exportGameData(testState);

      expect(typeof exported).toBe('string');
      expect(exported.length).toBeGreaterThan(0);
    });
  });

  describe('importGameData', () => {
    it('should import a previously exported state', () => {
      const exported = exportGameData(testState);
      const imported = importGameData(exported);

      expect(imported).not.toBeNull();
      expect(imported).toBeTruthy();
    });

    it('should preserve all data through export/import cycle', () => {
      const exported = exportGameData(testState);
      const imported = importGameData(exported);

      expect(imported).not.toBeNull();
      if (!imported) return;

      // Check critical fields are preserved
      expect(imported.resources.level).toBe(testState.resources.level);
      expect(imported.resources.credits).toBe(testState.resources.credits);
      expect(imported.resources.alclad).toBe(testState.resources.alclad);
      expect(imported.inventory.hasAPLicense).toBe(testState.inventory.hasAPLicense);
      expect(imported.proficiency.unlocked).toEqual(testState.proficiency.unlocked);
      expect(imported.proficiency.skillPoints).toBe(testState.proficiency.skillPoints);
    });

    it('should return null for invalid export string', () => {
      const result = importGameData('not-a-valid-export-string');

      expect(result).toBeNull();
    });

    it('should return null for corrupted export string', () => {
      const exported = exportGameData(testState);
      // Corrupt the export by modifying characters in the middle (not just slicing)
      // This ensures we corrupt the actual encoded data, not just truncate padding
      const corrupted = exported.slice(0, 50) + 'XXXXX' + exported.slice(55);

      const result = importGameData(corrupted);

      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = importGameData('');

      expect(result).toBeNull();
    });

    it('should return null for export with missing required properties', () => {
      // Export doesn't validate structure (it just serializes)
      // But import validation will catch invalid structures
      const invalidExport = JSON.stringify({
        metadata: { version: '1.0.0', exportedAt: Date.now() },
        state: { someInvalidKey: 'value' }, // Missing required GameState properties
      });

      // Manually create obfuscated string from invalid data
      const obfuscated = obfuscate(invalidExport);
      const result = importGameData(obfuscated);

      // Should return null because validation fails
      expect(result).toBeNull();
    });

    it('should validate GameState structure', () => {
      const exported = exportGameData(testState);
      const imported = importGameData(exported);

      expect(imported).not.toBeNull();
      if (!imported) return;

      // Validate structure
      expect(imported).toHaveProperty('resources');
      expect(imported).toHaveProperty('inventory');
      expect(imported).toHaveProperty('flags');
      expect(imported).toHaveProperty('logs');
      expect(imported).toHaveProperty('proficiency');
      expect(imported).toHaveProperty('stats');
    });

    it('should handle import of minimal state', () => {
      const minimalState = createInitialState();
      const exported = exportGameData(minimalState);
      const imported = importGameData(exported);

      expect(imported).not.toBeNull();
      expect(imported?.resources.sanity).toBe(100);
      expect(imported?.resources.suspicion).toBe(0);
    });
  });

  describe('getExportMetadata', () => {
    it('should extract metadata from export string', () => {
      const exported = exportGameData(testState);
      const metadata = getExportMetadata(exported);

      expect(metadata).not.toBeNull();
      expect(metadata).toHaveProperty('version');
      expect(metadata).toHaveProperty('exportedAt');
    });

    it('should return version 1.0.0', () => {
      const exported = exportGameData(testState);
      const metadata = getExportMetadata(exported);

      expect(metadata).not.toBeNull();
      expect(metadata?.version).toBe('1.0.0');
    });

    it('should return recent exportedAt timestamp', () => {
      const before = Date.now();
      const exported = exportGameData(testState);
      const after = Date.now();
      const metadata = getExportMetadata(exported);

      expect(metadata).not.toBeNull();
      expect(metadata?.exportedAt).toBeGreaterThanOrEqual(before);
      expect(metadata?.exportedAt).toBeLessThanOrEqual(after);
    });

    it('should return null for invalid export string', () => {
      const metadata = getExportMetadata('invalid-string');

      expect(metadata).toBeNull();
    });

    it('should return null for corrupted export string', () => {
      const exported = exportGameData(testState);
      const corrupted = exported.slice(0, -15);

      const metadata = getExportMetadata(corrupted);

      expect(metadata).toBeNull();
    });
  });

  describe('version compatibility', () => {
    it('should include version metadata in export', () => {
      const exported = exportGameData(testState);
      const metadata = getExportMetadata(exported);

      expect(metadata).not.toBeNull();
      expect(metadata?.version).toBeDefined();
      expect(typeof metadata?.version).toBe('string');
    });

    it('should successfully import export with version metadata', () => {
      const exported = exportGameData(testState);
      const imported = importGameData(exported);

      expect(imported).not.toBeNull();
      expect(imported?.resources.level).toBe(testState.resources.level);
    });
  });

  describe('data integrity', () => {
    it('should preserve arrays through export/import', () => {
      testState.proficiency.unlocked = ['skill1', 'skill2', 'skill3'];
      testState.proficiency.easaModulesPassed = [1, 2, 3, 4];

      const exported = exportGameData(testState);
      const imported = importGameData(exported);

      expect(imported).not.toBeNull();
      expect(imported?.proficiency.unlocked).toEqual(testState.proficiency.unlocked);
      expect(imported?.proficiency.easaModulesPassed).toEqual(
        testState.proficiency.easaModulesPassed
      );
    });

    it('should preserve nested objects through export/import', () => {
      testState.flags.storyFlags = { flag1: true, flag2: false, flag3: true };

      const exported = exportGameData(testState);
      const imported = importGameData(exported);

      expect(imported).not.toBeNull();
      expect(imported?.flags.storyFlags).toEqual(testState.flags.storyFlags);
    });

    it('should preserve numbers accurately', () => {
      testState.resources.experience = 1234.56;
      testState.resources.credits = 9999.99;
      testState.resources.sanity = 42.123;

      const exported = exportGameData(testState);
      const imported = importGameData(exported);

      expect(imported).not.toBeNull();
      expect(imported?.resources.experience).toBe(testState.resources.experience);
      expect(imported?.resources.credits).toBe(testState.resources.credits);
      expect(imported?.resources.sanity).toBe(testState.resources.sanity);
    });
  });
});
