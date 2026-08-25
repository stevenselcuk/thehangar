import { describe, expect, it } from 'vitest';
import { GAME_CONSTANTS } from '@/data/constants.ts';
import { getMilestoneForLevel, MILESTONE_DATA } from '@/data/levelMilestones.ts';

describe('milestone completeness', () => {
  it('names every level from 0 to the cap', () => {
    const missing: number[] = [];
    for (let level = 0; level <= GAME_CONSTANTS.MAX_LEVEL; level++) {
      const milestone = getMilestoneForLevel(level);
      if (!milestone || !milestone.name.trim()) missing.push(level);
    }
    expect(missing).toEqual([]);
  });

  it('defines no milestone above the cap', () => {
    const beyond = MILESTONE_DATA.filter((m) => m.level > GAME_CONSTANTS.MAX_LEVEL).map(
      (m) => m.level
    );
    expect(beyond).toEqual([]);
  });

  it('has no duplicate levels', () => {
    const levels = MILESTONE_DATA.map((m) => m.level);
    expect(new Set(levels).size).toBe(levels.length);
  });
});
