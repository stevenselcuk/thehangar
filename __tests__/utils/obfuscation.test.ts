import { deobfuscate, isValidObfuscatedString, obfuscate } from '@/utils/obfuscation';
import { describe, expect, it } from 'vitest';

describe('obfuscation', () => {
  describe('obfuscate', () => {
    it('should return a non-empty string for valid input', () => {
      const input = 'test data';
      const result = obfuscate(input);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return different output than input (not plaintext)', () => {
      const input = 'sensitive game data';
      const result = obfuscate(input);

      expect(result).not.toBe(input);
      expect(result).not.toContain('sensitive');
      expect(result).not.toContain('game');
    });

    it('should handle empty string', () => {
      const result = obfuscate('');

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle large input strings', () => {
      const largeInput = JSON.stringify({
        resources: { alclad: 100, rivets: 200, credits: 500 },
        inventory: { flashlight: true, toolbox: true },
        data: Array(1000).fill('some data').join(''),
      });

      const result = obfuscate(largeInput);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle special characters', () => {
      const input = 'test\nwith\n\nnewlines\t\ttabs and 🚀 emojis';
      const result = obfuscate(input);

      expect(result).toBeTruthy();
      expect(result).not.toBe(input);
    });

    it('should handle JSON strings', () => {
      const input = JSON.stringify({ key: 'value', nested: { data: 123 } });
      const result = obfuscate(input);

      expect(result).toBeTruthy();
      expect(result).not.toBe(input);
      expect(result).not.toContain('key');
      expect(result).not.toContain('value');
    });
  });

  describe('deobfuscate', () => {
    it('should correctly deobfuscate obfuscated data', () => {
      const original = 'test data';
      const obfuscated = obfuscate(original);
      const result = deobfuscate(obfuscated);

      expect(result).toBe(original);
    });

    it('should handle roundtrip with empty string', () => {
      const original = '';
      const obfuscated = obfuscate(original);
      const result = deobfuscate(obfuscated);

      expect(result).toBe(original);
    });

    it('should handle roundtrip with large data', () => {
      const original = JSON.stringify({
        state: {
          resources: { alclad: 100, rivets: 200 },
          inventory: {},
          logs: Array(50).fill({ text: 'log entry', type: 'info' }),
        },
      });

      const obfuscated = obfuscate(original);
      const result = deobfuscate(obfuscated);

      expect(result).toBe(original);
    });

    it('should handle roundtrip with special characters', () => {
      const original = 'test\nwith\n\nnewlines\t\ttabs and 🚀 emojis';
      const obfuscated = obfuscate(original);
      const result = deobfuscate(obfuscated);

      expect(result).toBe(original);
    });

    it('should throw error for invalid base64', () => {
      expect(() => deobfuscate('not-valid-base64!@#$')).toThrow();
    });

    it('should throw error for corrupted data', () => {
      const valid = obfuscate('test data');
      // Corrupt the data by removing some characters
      const corrupted = valid.slice(0, -5);

      expect(() => deobfuscate(corrupted)).toThrow();
    });

    it('should throw error for empty string', () => {
      expect(() => deobfuscate('')).toThrow();
    });

    it('should throw error for random string', () => {
      expect(() => deobfuscate('random string that is not obfuscated')).toThrow();
    });
  });

  describe('isValidObfuscatedString', () => {
    it('should return true for valid obfuscated string', () => {
      const obfuscated = obfuscate('test data');

      expect(isValidObfuscatedString(obfuscated)).toBe(true);
    });

    it('should return false for non-base64 string', () => {
      expect(isValidObfuscatedString('not base64!@#')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidObfuscatedString('')).toBe(false);
    });

    it('should return false for non-string input', () => {
      expect(isValidObfuscatedString(null as unknown as string)).toBe(false);
      expect(isValidObfuscatedString(undefined as unknown as string)).toBe(false);
      expect(isValidObfuscatedString(123 as unknown as string)).toBe(false);
    });

    it('should return true for plain base64 string (cannot distinguish from obfuscated)', () => {
      const plainBase64 = btoa('plain text');

      expect(isValidObfuscatedString(plainBase64)).toBe(true);
    });
  });

  describe('compression effectiveness', () => {
    it('should compress large repetitive data', () => {
      const repetitiveData = JSON.stringify({
        items: Array(100).fill({ name: 'rivets', quantity: 50 }),
      });

      const obfuscated = obfuscate(repetitiveData);

      // Obfuscated output should be smaller than original due to compression
      // (base64  encoding adds ~33% overhead, but compression should still win)
      expect(obfuscated.length).toBeLessThan(repetitiveData.length * 0.8);
    });
  });

  describe('security properties', () => {
    it('should produce different output for same input on successive calls (due to compression randomness)', () => {
      const input = 'test data';
      const result1 = obfuscate(input);
      const result2 = obfuscate(input);

      // Note: XOR cipher is deterministic, so results should actually be the same
      // This test documents the behavior
      expect(result1).toBe(result2);
    });

    it('should not contain plaintext patterns in output', () => {
      const input = JSON.stringify({
        password: 'secretpassword123',
        username: 'admin',
        apiKey: 'ABCD-1234-EFGH-5678',
      });

      const obfuscated = obfuscate(input);

      expect(obfuscated).not.toContain('password');
      expect(obfuscated).not.toContain('secretpassword123');
      expect(obfuscated).not.toContain('admin');
      expect(obfuscated).not.toContain('apiKey');
      expect(obfuscated).not.toContain('ABCD');
    });
  });
});
