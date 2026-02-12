import { addLogImmutable, addLogToDraft, createLog } from '@/services/logService.ts';
import { LogMessage } from '@/types';
import { describe, expect, it } from 'vitest';

describe('LogService', () => {
  describe('createLog', () => {
    it('should create log with unique ID', () => {
      const log1 = createLog('Test 1', 'info', Date.now());
      const log2 = createLog('Test 2', 'info', Date.now());
      expect(log1.id).not.toBe(log2.id);
    });

    it('should create log with correct properties', () => {
      const text = 'Test message';
      const type = 'warning';
      const timestamp = 1234567890;

      const log = createLog(text, type, timestamp);

      expect(log.text).toBe(text);
      expect(log.type).toBe(type);
      expect(log.timestamp).toBe(timestamp);
      expect(typeof log.id).toBe('string');
      expect(log.id.length).toBeGreaterThan(0);
    });

    it('should support all log types', () => {
      const types: LogMessage['type'][] = [
        'info',
        'warning',
        'error',
        'story',
        'vibration',
        'levelup',
      ];

      types.forEach((type) => {
        const log = createLog('Test', type, Date.now());
        expect(log.type).toBe(type);
      });
    });

    it('should handle empty text', () => {
      const log = createLog('', 'info', Date.now());
      expect(log.text).toBe('');
    });

    it('should handle long text', () => {
      const longText = 'A'.repeat(1000);
      const log = createLog(longText, 'info', Date.now());
      expect(log.text).toBe(longText);
    });
  });

  describe('addLogToDraft', () => {
    it('should add log to beginning of array', () => {
      const logs: LogMessage[] = [createLog('Old log', 'info', 100)];

      addLogToDraft(logs, 'New log', 'info', 200);

      expect(logs).toHaveLength(2);
      expect(logs[0].text).toBe('New log');
      expect(logs[1].text).toBe('Old log');
    });

    it('should maintain max 50 entries', () => {
      const logs: LogMessage[] = Array(50)
        .fill(null)
        .map((_, i) => createLog(`Log ${i}`, 'info', i));

      addLogToDraft(logs, 'New log', 'info', Date.now());

      expect(logs).toHaveLength(50);
      expect(logs[0].text).toBe('New log');
      expect(logs[49].text).toBe('Log 48'); // Log 49 was removed (oldest)
    });

    it('should mutate the original array', () => {
      const logs: LogMessage[] = [createLog('Existing', 'info', 100)];
      const originalRef = logs;

      addLogToDraft(logs, 'New', 'info', 200);

      expect(logs).toBe(originalRef);
    });

    it('should work with empty array', () => {
      const logs: LogMessage[] = [];

      addLogToDraft(logs, 'First log', 'info', Date.now());

      expect(logs).toHaveLength(1);
      expect(logs[0].text).toBe('First log');
    });

    it('should maintain newest-first ordering', () => {
      const logs: LogMessage[] = [];

      addLogToDraft(logs, 'First', 'info', 100);
      addLogToDraft(logs, 'Second', 'info', 200);
      addLogToDraft(logs, 'Third', 'info', 300);

      expect(logs[0].text).toBe('Third');
      expect(logs[1].text).toBe('Second');
      expect(logs[2].text).toBe('First');
    });

    it('should create unique IDs for each log', () => {
      const logs: LogMessage[] = [];

      addLogToDraft(logs, 'Log 1', 'info', Date.now());
      addLogToDraft(logs, 'Log 2', 'info', Date.now());
      addLogToDraft(logs, 'Log 3', 'info', Date.now());

      const ids = logs.map((log) => log.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(3);
    });

    it('should preserve log type', () => {
      const logs: LogMessage[] = [];

      addLogToDraft(logs, 'Error log', 'error', Date.now());
      addLogToDraft(logs, 'Story log', 'story', Date.now());
      addLogToDraft(logs, 'Warning log', 'warning', Date.now());

      expect(logs[0].type).toBe('warning');
      expect(logs[1].type).toBe('story');
      expect(logs[2].type).toBe('error');
    });

    it('should preserve timestamps', () => {
      const logs: LogMessage[] = [];

      addLogToDraft(logs, 'Log 1', 'info', 1000);
      addLogToDraft(logs, 'Log 2', 'info', 2000);

      expect(logs[0].timestamp).toBe(2000);
      expect(logs[1].timestamp).toBe(1000);
    });
  });

  describe('addLogImmutable', () => {
    it('should return new array', () => {
      const logs: LogMessage[] = [createLog('Old log', 'info', 100)];

      const newLogs = addLogImmutable(logs, 'New log', 'info', 200);

      expect(newLogs).not.toBe(logs);
      expect(logs).toHaveLength(1); // Original unchanged
      expect(newLogs).toHaveLength(2);
    });

    it('should add log to beginning of new array', () => {
      const logs: LogMessage[] = [createLog('Old log', 'info', 100)];

      const newLogs = addLogImmutable(logs, 'New log', 'info', 200);

      expect(newLogs[0].text).toBe('New log');
      expect(newLogs[1].text).toBe('Old log');
    });

    it('should maintain max 50 entries', () => {
      const logs: LogMessage[] = Array(50)
        .fill(null)
        .map((_, i) => createLog(`Log ${i}`, 'info', i));

      const newLogs = addLogImmutable(logs, 'New log', 'info', Date.now());

      expect(newLogs).toHaveLength(50);
      expect(newLogs[0].text).toBe('New log');
      expect(newLogs[49].text).toBe('Log 48'); // Log 49 was removed (oldest)
    });

    it('should not mutate original array', () => {
      const logs: LogMessage[] = [createLog('Original', 'info', 100)];
      const originalLength = logs.length;

      addLogImmutable(logs, 'New', 'info', 200);

      expect(logs).toHaveLength(originalLength);
      expect(logs[0].text).toBe('Original');
    });

    it('should work with empty array', () => {
      const logs: LogMessage[] = [];

      const newLogs = addLogImmutable(logs, 'First log', 'info', Date.now());

      expect(newLogs).toHaveLength(1);
      expect(newLogs[0].text).toBe('First log');
      expect(logs).toHaveLength(0); // Original unchanged
    });

    it('should maintain newest-first ordering', () => {
      const logs: LogMessage[] = [];

      const logs1 = addLogImmutable(logs, 'First', 'info', 100);
      const logs2 = addLogImmutable(logs1, 'Second', 'info', 200);
      const logs3 = addLogImmutable(logs2, 'Third', 'info', 300);

      expect(logs3[0].text).toBe('Third');
      expect(logs3[1].text).toBe('Second');
      expect(logs3[2].text).toBe('First');
    });

    it('should create unique IDs for each log', () => {
      const logs: LogMessage[] = [];

      const logs1 = addLogImmutable(logs, 'Log 1', 'info', Date.now());
      const logs2 = addLogImmutable(logs1, 'Log 2', 'info', Date.now());
      const logs3 = addLogImmutable(logs2, 'Log 3', 'info', Date.now());

      const ids = logs3.map((log) => log.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(3);
    });

    it('should preserve all properties from original logs', () => {
      const logs: LogMessage[] = [
        createLog('Error log', 'error', 1000),
        createLog('Story log', 'story', 2000),
      ];

      const newLogs = addLogImmutable(logs, 'New log', 'info', 3000);

      expect(newLogs[1]).toEqual(logs[0]);
      expect(newLogs[2]).toEqual(logs[1]);
    });
  });
});
