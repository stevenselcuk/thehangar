import type { LogMessage } from '@/types';
import { addLogToArray, checkCost, clamp, createLog } from '@/utils/gameHelpers';
import { describe, expect, it } from 'vitest';

describe('gameHelpers', () => {
  describe('createLog', () => {
    it('should create a log with default info type and auto-generated timestamp', () => {
      const text = 'Test log message';
      const log = createLog(text);

      expect(log.text).toBe(text);
      expect(log.type).toBe('info');
      expect(log.timestamp).toBeGreaterThan(0);
      expect(log.id).toBeDefined();
      expect(typeof log.id).toBe('string');
    });

    it('should create a log with specified type', () => {
      const log = createLog('Warning message', 'warning');
      expect(log.type).toBe('warning');
    });

    it('should create a log with all types', () => {
      const types: LogMessage['type'][] = [
        'info',
        'warning',
        'error',
        'story',
        'vibration',
        'levelup',
      ];

      types.forEach((type) => {
        const log = createLog('Test', type);
        expect(log.type).toBe(type);
      });
    });

    it('should use custom timestamp when provided', () => {
      const customTimestamp = 1234567890;
      const log = createLog('Test', 'info', customTimestamp);
      expect(log.timestamp).toBe(customTimestamp);
    });

    it('should generate unique IDs for different logs', () => {
      const log1 = createLog('Message 1');
      const log2 = createLog('Message 2');
      expect(log1.id).not.toBe(log2.id);
    });
  });

  describe('addLogToArray', () => {
    it('should add a log to an empty array', () => {
      const result = addLogToArray([], 'First log');

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('First log');
      expect(result[0].type).toBe('info');
    });

    it('should add log to the beginning of array', () => {
      const existingLogs = [createLog('Old log')];
      const result = addLogToArray(existingLogs, 'New log');

      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('New log');
      expect(result[1].text).toBe('Old log');
    });

    it('should maintain max 50 logs', () => {
      // Create 50 logs
      const existingLogs: LogMessage[] = Array.from({ length: 50 }, (_, i) =>
        createLog(`Log ${i}`)
      );

      const result = addLogToArray(existingLogs, 'New log');

      expect(result).toHaveLength(50);
      expect(result[0].text).toBe('New log');
      expect(result[49].text).toBe('Log 48'); // Last item is index 48 (0-49), oldest dropped
    });

    it('should preserve log type when adding', () => {
      const result = addLogToArray([], 'Error message', 'error');
      expect(result[0].type).toBe('error');
    });

    it('should not mutate original array', () => {
      const original = [createLog('Original')];
      const originalLength = original.length;

      addLogToArray(original, 'New');

      expect(original).toHaveLength(originalLength);
      expect(original[0].text).toBe('Original');
    });
  });

  describe('checkCost', () => {
    it('should return canAfford true when resources are sufficient', () => {
      const result = checkCost(100, 50, 'alclad');

      expect(result.canAfford).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should return canAfford true when resources exactly meet requirement', () => {
      const result = checkCost(50, 50, 'rivets');

      expect(result.canAfford).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should return canAfford false when resources are insufficient', () => {
      const result = checkCost(30, 50, 'titanium');

      expect(result.canAfford).toBe(false);
      expect(result.message).toBe('Insufficient titanium. Need 50, have 30.');
    });

    it('should return canAfford true when required is 0', () => {
      const result = checkCost(0, 0, 'credits');

      expect(result.canAfford).toBe(true);
    });

    it('should return canAfford true when required is negative', () => {
      const result = checkCost(50, -10, 'sanity');

      expect(result.canAfford).toBe(true);
    });

    it('should handle edge case of 0 available and positive required', () => {
      const result = checkCost(0, 1, 'focus');

      expect(result.canAfford).toBe(false);
      expect(result.message).toContain('Insufficient focus');
    });

    it('should include resource name in error message', () => {
      const resourceName = 'kardexFragments';
      const result = checkCost(0, 5, resourceName);

      expect(result.message).toContain(resourceName);
    });

    it('should include required and available amounts in error message', () => {
      const result = checkCost(25, 100, 'alclad');

      expect(result.message).toContain('100');
      expect(result.message).toContain('25');
    });
  });

  describe('clamp', () => {
    it('should return value when within range', () => {
      expect(clamp(50, 0, 100)).toBe(50);
      expect(clamp(0, 0, 100)).toBe(0);
      expect(clamp(100, 0, 100)).toBe(100);
    });

    it('should clamp to min when value is below minimum', () => {
      expect(clamp(-10, 0, 100)).toBe(0);
      expect(clamp(-1, 0, 100)).toBe(0);
    });

    it('should clamp to max when value is above maximum', () => {
      expect(clamp(150, 0, 100)).toBe(100);
      expect(clamp(101, 0, 100)).toBe(100);
    });

    it('should work with negative ranges', () => {
      expect(clamp(-50, -100, -10)).toBe(-50);
      expect(clamp(-150, -100, -10)).toBe(-100);
      expect(clamp(0, -100, -10)).toBe(-10);
    });

    it('should work with decimal values', () => {
      expect(clamp(0.5, 0, 1)).toBe(0.5);
      expect(clamp(1.5, 0, 1)).toBe(1);
      expect(clamp(-0.5, 0, 1)).toBe(0);
    });

    it('should handle min === max', () => {
      expect(clamp(50, 100, 100)).toBe(100);
      expect(clamp(150, 100, 100)).toBe(100);
    });

    it('should work with sanity range (0-100)', () => {
      expect(clamp(50, 0, 100)).toBe(50);
      expect(clamp(-20, 0, 100)).toBe(0);
      expect(clamp(150, 0, 100)).toBe(100);
    });

    it('should work with suspicion range (0-100)', () => {
      expect(clamp(85, 0, 100)).toBe(85);
      expect(clamp(105, 0, 100)).toBe(100);
    });

    it('should handle very large numbers', () => {
      expect(clamp(Number.MAX_SAFE_INTEGER, 0, 100)).toBe(100);
      expect(clamp(Number.MIN_SAFE_INTEGER, 0, 100)).toBe(0);
    });
  });
});
