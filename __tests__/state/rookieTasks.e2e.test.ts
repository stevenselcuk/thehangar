import { describe, expect, it } from 'vitest';
import { ROOKIE_TASKS } from '@/data/rookieTasks.ts';
import { composeAction } from '@/state/reducerComposer.ts';
import type { GameState } from '@/types.ts';
import { createMinimalGameState } from '@/utils/testHelpers.ts';

/**
 * These run against composeAction — the function gameReducer's ACTION case
 * actually calls. A slice-level test cannot see whether the state a case
 * reads was ever handed to the slice, nor whether what it wrote came back:
 * the NDT certification gates read inventory inside complianceSlice, which
 * had no inventory at all before this change.
 */
const stateAt = (level: number, overrides: Partial<GameState['inventory']> = {}): GameState => {
  const base = createMinimalGameState();
  return createMinimalGameState({
    resources: { ...base.resources, level, focus: 100, experience: 0, technicalLogbookHours: 0 },
    inventory: { ...base.inventory, flashlight: true, pencil: true, ...overrides },
    flags: { ...base.flags, ndtFinding: null },
  });
};

describe('PERFORM_ROOKIE_TASK end-to-end', () => {
  const task = ROOKIE_TASKS.ROOKIE_STATIC_WICKS; // 95 xp, 4 hours, 12 focus

  it('credits logbook hours to real game state at level 0', () => {
    const next = composeAction(stateAt(0), {
      type: 'PERFORM_ROOKIE_TASK',
      payload: { id: task.id },
    });

    expect(next.resources.technicalLogbookHours).toBe(task.hours);
    expect(next.resources.experience).toBe(task.xp);
    expect(next.resources.focus).toBe(100 - task.focus);
  });

  it('stays available at high level as low-value filler', () => {
    const next = composeAction(stateAt(30), {
      type: 'PERFORM_ROOKIE_TASK',
      payload: { id: task.id },
    });

    expect(next.resources.technicalLogbookHours).toBe(task.hours);
    expect(next.stats.accessViolations ?? 0).toBe(0);
  });

  it('accumulates hours across repeated cards', () => {
    let state = stateAt(0);
    for (const id of ['ROOKIE_FOD_WALK', 'ROOKIE_SHADOW_BOARD', 'ROOKIE_OIL_CHECK']) {
      state = composeAction(state, { type: 'PERFORM_ROOKIE_TASK', payload: { id } });
    }

    const expected =
      ROOKIE_TASKS.ROOKIE_FOD_WALK.hours +
      ROOKIE_TASKS.ROOKIE_SHADOW_BOARD.hours +
      ROOKIE_TASKS.ROOKIE_OIL_CHECK.hours;

    expect(state.resources.technicalLogbookHours).toBe(expected);
  });

  it('pays 1.5x xp, and identical hours, to a licensed technician', () => {
    const unlicensed = composeAction(stateAt(30), {
      type: 'PERFORM_ROOKIE_TASK',
      payload: { id: task.id },
    });
    const licensed = composeAction(stateAt(30, { hasAPLicense: true }), {
      type: 'PERFORM_ROOKIE_TASK',
      payload: { id: task.id },
    });

    expect(unlicensed.resources.experience).toBe(task.xp);
    expect(licensed.resources.experience).toBe(task.xp * 1.5);
    expect(licensed.resources.technicalLogbookHours).toBe(
      unlicensed.resources.technicalLogbookHours
    );
  });
});
