import { describe, expect, it } from 'vitest';
import { jobsData, selectJobPool, STANDARD_JOB_MIN_LEVEL } from '@/data/jobs.ts';
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
