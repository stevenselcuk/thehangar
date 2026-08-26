import { describe, expect, it } from 'vitest';
import { ACTION_FEATURES } from '@/data/featureRegistry.ts';
import {
  jobsData,
  ROTABLE_SOURCE_MIN_LEVEL,
  selectJobPool,
  STANDARD_JOB_MIN_LEVEL,
} from '@/data/jobs.ts';
import { isRotableRequirement } from '@/logic/rotableIdentity.ts';
import { eventsReducer, EventsSliceState } from '@/state/slices/eventsSlice.ts';
import { createMinimalGameState } from '@/utils/testHelpers.ts';
import type { JobCard } from '@/types.ts';

const createEventsState = (
  level: number,
  inventoryOverrides: Record<string, unknown> = {}
): EventsSliceState => {
  const base = createMinimalGameState();
  return {
    activeJob: null,
    activeEvent: null,
    stats: base.stats,
    resources: {
      ...base.resources,
      level,
      alclad: 1000,
      rivets: 1000,
      titanium: 1000,
      experience: 0,
      credits: 0,
      technicalLogbookHours: 0,
    },
    anomalies: [],
    toolConditions: base.toolConditions,
    inventory: { ...base.inventory, ...inventoryOverrides } as EventsSliceState['inventory'],
    flags: base.flags,
    hfStats: base.hfStats,
    logs: [],
    journal: [],
    rotables: [],
    proficiency: base.proficiency,
    eventTimestamps: {},
  };
};

const rookieCard = (): JobCard => ({
  id: 'ROOKIE1',
  title: 'Rookie Card',
  description: 'test',
  requirements: {},
  rewardXP: 100,
  tier: 'rookie',
  timeLeft: 0,
  totalTime: 180000, // 3 hours
});

const standardCard = (): JobCard => ({
  id: 'STD1',
  title: 'Standard Card',
  description: 'test',
  requirements: {},
  rewardXP: 100,
  tier: 'standard',
  timeLeft: 0,
  totalTime: 180000,
});

describe('job tiers', () => {
  it('tags every authored job with a tier', () => {
    for (const job of jobsData) {
      expect(['rookie', 'standard']).toContain(job.tier);
    }
    expect(jobsData.filter((j) => j.tier === 'rookie')).toHaveLength(8);
    expect(jobsData.filter((j) => j.tier === 'standard')).toHaveLength(6);
  });

  it('authors no tool requirement on a rookie card', () => {
    // A rookie owns a flashlight, a pencil and a notebook, none of which
    // carry a condition record — so any tool line would be unserviceable and
    // the card could never be closed.
    for (const job of jobsData.filter((j) => j.tier === 'rookie')) {
      expect((job.requirements as { tools?: string[] }).tools).toBeUndefined();
    }
  });

  it('offers only rookie cards below the threshold', () => {
    const pool = selectJobPool(STANDARD_JOB_MIN_LEVEL - 1);

    expect(pool.length).toBeGreaterThan(0);
    expect(pool.every((j) => j.tier === 'rookie')).toBe(true);
  });

  it('offers both tiers at and above the threshold', () => {
    const pool = selectJobPool(STANDARD_JOB_MIN_LEVEL);

    expect(pool.some((j) => j.tier === 'rookie')).toBe(true);
    expect(pool.some((j) => j.tier === 'standard')).toBe(true);
  });
});

describe('a card is never drawable before its requirement has a source', () => {
  /** Jobs whose `tools` line names a rotable rather than a tool. */
  const rotableJobs = jobsData.filter((job) =>
    ((job.requirements as { tools?: string[] }).tools || []).some(isRotableRequirement)
  );

  it('finds the rotable-requiring cards, so the rest of this suite has teeth', () => {
    expect(rotableJobs.length).toBeGreaterThan(0);
  });

  it('floors every rotable card at the level its part first becomes obtainable', () => {
    // The boneyard is the only producer of rotables, and it opens with
    // SCAVENGE_CORROSION_CORNER. If that action's level moves, this fails
    // rather than quietly reopening the gap.
    const source = ACTION_FEATURES.SCAVENGE_CORROSION_CORNER.requiredLevel;

    expect(ROTABLE_SOURCE_MIN_LEVEL).toBe(source);
    for (const job of rotableJobs) {
      const floor = (job as { minLevel?: number }).minLevel;
      expect(floor, `${job.title} can be raised before its part exists`).toBeGreaterThanOrEqual(
        source
      );
    }
  });

  it('withholds IDG Swap through the whole level-5-to-9 gap', () => {
    for (let level = STANDARD_JOB_MIN_LEVEL; level < ROTABLE_SOURCE_MIN_LEVEL; level++) {
      const pool = selectJobPool(level);

      expect(
        pool.some((j) => j.tier === 'standard'),
        `level ${level} lost the standard tier`
      ).toBe(true);
      expect(
        pool.some((j) => j.title === 'IDG Swap'),
        `level ${level} offers IDG Swap`
      ).toBe(false);
    }
  });

  it('adds IDG Swap once the boneyard opens', () => {
    const pool = selectJobPool(ROTABLE_SOURCE_MIN_LEVEL);

    expect(pool.some((j) => j.title === 'IDG Swap')).toBe(true);
  });
});

describe('eventsSlice - START_STANDARD_JOB tier filtering', () => {
  it('never hands a level-0 technician a standard work order', () => {
    for (let i = 0; i < 60; i++) {
      const result = eventsReducer(createEventsState(0), {
        type: 'START_STANDARD_JOB',
        payload: {},
      });
      expect(result.activeJob?.tier).toBe('rookie');
    }
  });

  it('never raises IDG Swap below the level its part exists at', () => {
    const titles = new Set<string | undefined>();
    for (let i = 0; i < 200; i++) {
      const result = eventsReducer(createEventsState(ROTABLE_SOURCE_MIN_LEVEL - 1), {
        type: 'START_STANDARD_JOB',
        payload: {},
      });
      titles.add(result.activeJob?.title);
    }

    expect(titles.has('IDG Swap')).toBe(false);
    expect(titles.size).toBeGreaterThan(1); // the draw is live, not stuck
  });

  it('raises IDG Swap once the boneyard opens', () => {
    const titles = new Set<string | undefined>();
    for (let i = 0; i < 400; i++) {
      const result = eventsReducer(createEventsState(ROTABLE_SOURCE_MIN_LEVEL), {
        type: 'START_STANDARD_JOB',
        payload: {},
      });
      titles.add(result.activeJob?.title);
    }

    expect(titles.has('IDG Swap')).toBe(true);
  });

  it('hands out standard work orders once the threshold is reached', () => {
    const tiers = new Set<string | undefined>();
    for (let i = 0; i < 120; i++) {
      const result = eventsReducer(createEventsState(STANDARD_JOB_MIN_LEVEL), {
        type: 'START_STANDARD_JOB',
        payload: {},
      });
      tiers.add(result.activeJob?.tier);
    }

    expect(tiers.has('standard')).toBe(true);
    expect(tiers.has('rookie')).toBe(true); // rookie cards stay in the pool
  });
});

describe('eventsSlice - COMPLETE_JOB sign-off reward', () => {
  it('pays a rookie card its authored xp and hours to an unlicensed technician', () => {
    const state = createEventsState(0);
    state.activeJob = rookieCard();

    const result = eventsReducer(state, { type: 'COMPLETE_JOB', payload: {} });

    expect(result.resources.experience).toBe(100);
    expect(result.resources.technicalLogbookHours).toBe(3);
  });

  it('pays a rookie card 1.5x xp, and the same hours, once the A&P is held', () => {
    const state = createEventsState(0, { hasAPLicense: true });
    state.activeJob = rookieCard();

    const result = eventsReducer(state, { type: 'COMPLETE_JOB', payload: {} });

    expect(result.resources.experience).toBe(150);
    expect(result.resources.technicalLogbookHours).toBe(3);
  });

  it('leaves standard work untouched by the licence', () => {
    const unlicensed = createEventsState(10);
    unlicensed.activeJob = standardCard();
    const licensed = createEventsState(10, { hasAPLicense: true });
    licensed.activeJob = standardCard();

    const a = eventsReducer(unlicensed, { type: 'COMPLETE_JOB', payload: {} });
    const b = eventsReducer(licensed, { type: 'COMPLETE_JOB', payload: {} });

    expect(a.resources.experience).toBe(100);
    expect(b.resources.experience).toBe(100);
  });
});
