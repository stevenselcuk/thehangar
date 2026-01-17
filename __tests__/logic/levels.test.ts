import { getLevelUpLog, getXpForNextLevel } from '@/logic/levels';
import { describe, expect, it } from 'vitest';

describe('levels', () => {
  describe('getXpForNextLevel', () => {
    it('should calculate XP for level 1', () => {
      const xp = getXpForNextLevel(1);
      expect(xp).toBe(1000); // 1000 * 1^1.5 = 1000
    });

    it('should calculate XP for level 2', () => {
      const xp = getXpForNextLevel(2);
      expect(xp).toBe(2828); // 1000 * 2^1.5 ≈ 2828
    });

    it('should calculate XP for level 5', () => {
      const xp = getXpForNextLevel(5);
      expect(xp).toBe(11180); // 1000 * 5^1.5 ≈ 11180
    });

    it('should calculate XP for level 10', () => {
      const xp = getXpForNextLevel(10);
      expect(xp).toBe(31622); // 1000 * 10^1.5 ≈ 31622
    });

    it('should be exponentially increasing', () => {
      const xp1 = getXpForNextLevel(1);
      const xp2 = getXpForNextLevel(2);
      const xp5 = getXpForNextLevel(5);
      const xp10 = getXpForNextLevel(10);

      // Each level requires more XP than previous
      expect(xp2).toBeGreaterThan(xp1);
      expect(xp5).toBeGreaterThan(xp2);
      expect(xp10).toBeGreaterThan(xp5);

      // Growth rate increases (exponential)
      const growth2to5 = xp5 - xp2;
      const growth5to10 = xp10 - xp5;
      expect(growth5to10).toBeGreaterThan(growth2to5);
    });

    it('should return integer values', () => {
      for (let level = 1; level <= 20; level++) {
        const xp = getXpForNextLevel(level);
        expect(Number.isInteger(xp)).toBe(true);
      }
    });

    it('should handle level 0', () => {
      const xp = getXpForNextLevel(0);
      expect(xp).toBe(0); // 1000 * 0^1.5 = 0
    });

    it('should handle high levels', () => {
      const xp50 = getXpForNextLevel(50);
      expect(xp50).toBeGreaterThan(100000);
      expect(Number.isFinite(xp50)).toBe(true);
    });

    it('should match exponential formula 1000 * level^1.5', () => {
      for (let level = 1; level <= 10; level++) {
        const expected = Math.floor(1000 * Math.pow(level, 1.5));
        const actual = getXpForNextLevel(level);
        expect(actual).toBe(expected);
      }
    });
  });

  describe('getLevelUpLog', () => {
    describe('early game (levels 1-5)', () => {
      it('should return early game message for level 2', () => {
        const log = getLevelUpLog(2);
        expect(log).toContain('[LEVEL UP]');
        expect(log).toContain('routine');
        expect(log).toContain('getting the hang');
      });

      it('should return early game message for level 5', () => {
        const log = getLevelUpLog(5);
        expect(log).toContain('routine');
        expect(log.toLowerCase()).toContain('getting the hang');
      });

      it('should return same message for all early levels', () => {
        const log1 = getLevelUpLog(1);
        const log2 = getLevelUpLog(3);
        const log5 = getLevelUpLog(5);

        expect(log1).toBe(log2);
        expect(log2).toBe(log5);
      });
    });

    describe('mid game (levels 6-10)', () => {
      it('should return mid game message for level 6', () => {
        const log = getLevelUpLog(6);
        expect(log).toContain('[LEVEL UP]');
        expect(log).toContain('sounds');
        expect(log).toContain('hangar');
        expect(log).toContain('heartbeat');
      });

      it('should return mid game message for level 10', () => {
        const log = getLevelUpLog(10);
        expect(log).toContain('groans');
        expect(log).toContain('familiar');
      });

      it('should be different from early game message', () => {
        const earlyLog = getLevelUpLog(5);
        const midLog = getLevelUpLog(6);
        expect(midLog).not.toBe(earlyLog);
      });
    });

    describe('late game (levels 11-20)', () => {
      it('should return late game message for level 11', () => {
        const log = getLevelUpLog(11);
        expect(log).toContain('[LEVEL UP]');
        expect(log).toContain('metal');
        expect(log).toContain('flesh');
        expect(log).toContain('blurring');
      });

      it('should return late game message for level 20', () => {
        const log = getLevelUpLog(20);
        expect(log).toContain('distinction');
        expect(log).toContain('blurring');
      });

      it('should reflect horror theme', () => {
        const log = getLevelUpLog(15);
        expect(log.toLowerCase()).toContain('metal');
        expect(log.toLowerCase()).toContain('flesh');
      });
    });

    describe('end game (levels 21+)', () => {
      it('should return end game message for level 21', () => {
        const log = getLevelUpLog(21);
        expect(log).toContain('[LEVEL UP]');
        expect(log).toContain('hangar accepts you');
        expect(log).toContain('structure');
      });

      it('should return same message for very high levels', () => {
        const log50 = getLevelUpLog(50);
        const log100 = getLevelUpLog(100);
        expect(log50).toBe(log100);
      });

      it('should reflect cosmic horror theme', () => {
        const log = getLevelUpLog(30);
        expect(log.toLowerCase()).toContain('part');
        expect(log.toLowerCase()).toContain('structure');
      });
    });

    describe('progression and theming', () => {
      it('should all contain [LEVEL UP] prefix', () => {
        const levels = [1, 5, 6, 10, 11, 20, 21, 50];
        levels.forEach((level) => {
          const log = getLevelUpLog(level);
          expect(log).toMatch(/^\[LEVEL UP\]/);
        });
      });

      it('should show thematic progression from normal to horror', () => {
        const early = getLevelUpLog(2);
        const mid = getLevelUpLog(8);
        const late = getLevelUpLog(15);
        const end = getLevelUpLog(25);

        // Early: normal work language
        expect(early.toLowerCase()).toContain('routine');

        // Mid: familiarity but slight unease
        expect(mid.toLowerCase()).toContain('familiar');

        // Late: body horror
        expect(late.toLowerCase()).toContain('blurring');

        // End: cosmic acceptance
        expect(end.toLowerCase()).toContain('accepts');
      });

      it('should handle level 0 edge case', () => {
        const log = getLevelUpLog(0);
        expect(log).toContain('[LEVEL UP]');
        expect(log).toContain('routine');
      });

      it('should handle negative levels gracefully', () => {
        const log = getLevelUpLog(-5);
        expect(log).toContain('[LEVEL UP]');
        // Should fall through to early game message
        expect(log).toContain('routine');
      });
    });
  });

  describe('integration: XP to level progression', () => {
    it('should require increasing XP for consecutive levels', () => {
      let totalXP = 0;
      const xpByLevel = [getXpForNextLevel(1)];

      for (let level = 2; level <= 10; level++) {
        const xpNeeded = getXpForNextLevel(level);
        xpByLevel.push(xpNeeded);
        totalXP += xpNeeded;
      }

      // Verify ascending order
      for (let i = 1; i < xpByLevel.length; i++) {
        expect(xpByLevel[i]).toBeGreaterThan(xpByLevel[i - 1]);
      }

      // Total XP to reach level 10 should be substantial (actual is ~142k)
      expect(totalXP).toBeGreaterThan(140000);
    });

    it('should have appropriate log message transitions', () => {
      const level5Log = getLevelUpLog(5);
      const level6Log = getLevelUpLog(6);
      const level10Log = getLevelUpLog(10);
      const level11Log = getLevelUpLog(11);

      // Transitions happen at boundaries
      expect(level5Log).not.toBe(level6Log); // 5 to 6
      expect(level10Log).not.toBe(level11Log); // 10 to 11
    });
  });
});
