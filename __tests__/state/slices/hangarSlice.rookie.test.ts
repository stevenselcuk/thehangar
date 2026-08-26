import { describe, expect, it } from 'vitest';
import { ROOKIE_TASKS, ROOKIE_TASK_LIST } from '@/data/rookieTasks.ts';
import { hangarReducer, HangarSliceState } from '@/state/slices/hangarSlice.ts';
import { createMinimalGameState } from '@/utils/testHelpers.ts';

/**
 * PERFORM_ROOKIE_TASK is one parameterised case serving all twelve cards, so
 * these tests are written against the data rather than against a hand-picked
 * id: a card added to rookieTasks.ts is covered the moment it is authored.
 */
const createHangarState = (overrides: Partial<HangarSliceState> = {}): HangarSliceState => {
  const base = createMinimalGameState();
  return {
    resources: { ...base.resources, focus: 100, experience: 0, technicalLogbookHours: 0 },
    flags: base.flags,
    hfStats: base.hfStats,
    stats: base.stats,
    toolConditions: base.toolConditions,
    inventory: { ...base.inventory, flashlight: true, pencil: true, notebook: true },
    proficiency: base.proficiency,
    logs: [],
    activeEvent: null,
    ...overrides,
  };
};

const perform = (state: HangarSliceState, id: string) =>
  hangarReducer(state, { type: 'PERFORM_ROOKIE_TASK', payload: { id } });

describe('hangarSlice - PERFORM_ROOKIE_TASK', () => {
  it('authors twelve task cards inside the specified bands', () => {
    expect(ROOKIE_TASK_LIST).toHaveLength(12);
    for (const task of ROOKIE_TASK_LIST) {
      expect(task.hours).toBeGreaterThanOrEqual(2);
      expect(task.hours).toBeLessThanOrEqual(6);
      expect(task.xp).toBeGreaterThanOrEqual(40);
      expect(task.xp).toBeLessThanOrEqual(120);
      expect(task.focus).toBeGreaterThanOrEqual(5);
      expect(task.focus).toBeLessThanOrEqual(15);
      expect(task.log.length).toBeGreaterThan(0);
    }
  });

  it('pays every card its authored hours, xp and focus', () => {
    for (const task of ROOKIE_TASK_LIST) {
      const result = perform(createHangarState(), task.id);

      expect(result.resources.technicalLogbookHours).toBe(task.hours);
      expect(result.resources.experience).toBe(task.xp);
      expect(result.resources.focus).toBe(100 - task.focus);
      expect(result.logs.map((l) => l.text)).toContain(task.log);
    }
  });

  it('routes each id to its own card and not to a shared default', () => {
    const fodWalk = perform(createHangarState(), 'ROOKIE_FOD_WALK');
    const staticWicks = perform(createHangarState(), 'ROOKIE_STATIC_WICKS');

    expect(fodWalk.resources.experience).toBe(ROOKIE_TASKS.ROOKIE_FOD_WALK.xp);
    expect(staticWicks.resources.experience).toBe(ROOKIE_TASKS.ROOKIE_STATIC_WICKS.xp);
    expect(fodWalk.resources.experience).not.toBe(staticWicks.resources.experience);
  });

  it('refuses a card that does not exist and pays nothing', () => {
    const result = perform(createHangarState(), 'ROOKIE_NOT_A_CARD');

    expect(result.resources.experience).toBe(0);
    expect(result.resources.technicalLogbookHours).toBe(0);
    expect(result.resources.focus).toBe(100);
    expect(result.logs[0].text).toContain('TASK REJECTED');
  });

  it('refuses a dispatch with no id at all', () => {
    const result = hangarReducer(createHangarState(), {
      type: 'PERFORM_ROOKIE_TASK',
      payload: {},
    });

    expect(result.resources.experience).toBe(0);
    expect(result.logs[0].text).toContain('TASK REJECTED');
  });

  describe('tool gate', () => {
    // ROOKIE_SUMP_DRAIN declares requires: ['flashlight'].
    const gated = ROOKIE_TASKS.ROOKIE_SUMP_DRAIN;

    it('permits the task when the tool is held', () => {
      const state = createHangarState({
        inventory: { ...createHangarState().inventory, flashlight: true },
      });

      const result = perform(state, gated.id);

      expect(result.resources.technicalLogbookHours).toBe(gated.hours);
      expect(result.resources.experience).toBe(gated.xp);
    });

    it('refuses the task when the tool is missing, and charges nothing', () => {
      const state = createHangarState({
        inventory: { ...createHangarState().inventory, flashlight: false },
      });

      const result = perform(state, gated.id);

      expect(result.resources.technicalLogbookHours).toBe(0);
      expect(result.resources.experience).toBe(0);
      expect(result.resources.focus).toBe(100);
      expect(result.logs[0].text).toContain('FLASHLIGHT');
    });
  });

  describe('focus gate', () => {
    const task = ROOKIE_TASKS.ROOKIE_STATIC_WICKS; // 12 focus

    it('permits the task with exactly enough focus', () => {
      const state = createHangarState();
      state.resources.focus = task.focus;

      const result = perform(state, task.id);

      expect(result.resources.experience).toBe(task.xp);
      expect(result.resources.focus).toBe(0);
    });

    it('defers the task one point short, and pays nothing', () => {
      const state = createHangarState();
      state.resources.focus = task.focus - 1;

      const result = perform(state, task.id);

      expect(result.resources.experience).toBe(0);
      expect(result.resources.technicalLogbookHours).toBe(0);
      expect(result.resources.focus).toBe(task.focus - 1);
      expect(result.logs[0].text).toContain('TASK DEFERRED');
    });
  });

  describe('A&P sign-off multiplier', () => {
    const task = ROOKIE_TASKS.ROOKIE_FUEL_STRAINER; // 90 xp, 4 hours

    it('pays the authored xp to an unlicensed apprentice', () => {
      const result = perform(createHangarState(), task.id);

      expect(result.resources.experience).toBe(task.xp);
    });

    it('pays 1.5x xp once the A&P licence is held', () => {
      const base = createHangarState();
      const state = createHangarState({
        inventory: { ...base.inventory, hasAPLicense: true },
      });

      const result = perform(state, task.id);

      expect(result.resources.experience).toBe(task.xp * 1.5);
    });

    it('never multiplies the logbook hours', () => {
      const base = createHangarState();
      const unlicensed = perform(createHangarState(), task.id);
      const licensed = perform(
        createHangarState({ inventory: { ...base.inventory, hasAPLicense: true } }),
        task.id
      );

      expect(unlicensed.resources.technicalLogbookHours).toBe(task.hours);
      expect(licensed.resources.technicalLogbookHours).toBe(task.hours);
    });
  });
});

describe('hangarSlice - PERFORM_NDT certification gate', () => {
  it('performs the scan when NDT Level I is held', () => {
    const base = createHangarState();
    const state = createHangarState({
      inventory: { ...base.inventory, hasNdtLevel1: true },
    });

    const result = hangarReducer(state, { type: 'PERFORM_NDT', payload: {} });

    expect(result.stats.ndtScansPerformed).toBe(1);
    expect(result.resources.experience).toBe(200);
  });

  it('refuses the scan without the certification', () => {
    const base = createHangarState();
    const state = createHangarState({
      inventory: { ...base.inventory, hasNdtLevel1: false },
    });

    const result = hangarReducer(state, { type: 'PERFORM_NDT', payload: {} });

    expect(result.stats.ndtScansPerformed).toBe(0);
    expect(result.resources.experience).toBe(0);
    expect(result.logs[0].text).toContain('NDT Level I');
  });
});
