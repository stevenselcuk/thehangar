import { describe, expect, it } from 'vitest';
import { itemsData } from '@/data/items.ts';
import { jobsData } from '@/data/jobs.ts';
import { composeAction } from '@/state/reducerComposer.ts';
import type { GameState, RotableItem } from '@/types.ts';
import { createMinimalGameState } from '@/utils/testHelpers.ts';

/**
 * Three standard work orders could be raised and never signed off, because
 * nothing in the game granted the tools they asked for:
 *
 *   Landing Gear Lubrication  malabar + greaseGun   (greaseGun: no source)
 *   Cockpit Glass Polish      inspectionMirror      (no source)
 *   IDG Swap                  torquemeter + idg     (inventory.idg never set)
 *
 * These run through composeAction rather than eventsReducer, because the
 * fix spans three layers — the toolroom catalogue the UI reads, the
 * GET_TOOLROOM_ITEM path that writes both inventory and toolConditions,
 * and the requirement check in the slice. A slice-level test proves none
 * of the first two.
 */

const jobByTitle = (title: string) => {
  const template = jobsData.find((j) => j.title === title);
  if (!template) throw new Error(`No job template titled "${title}"`);
  return {
    ...template,
    id: `job_${title}`,
    timeLeft: 0,
    totalTime: 120000,
  } as unknown as GameState['activeJob'];
};

/** A stocked, level-10 technician with the named work order already raised. */
const stateWithJob = (title: string, overrides: Partial<GameState> = {}): GameState => {
  const base = createMinimalGameState();
  return createMinimalGameState({
    resources: {
      ...base.resources,
      level: 10,
      focus: 100,
      alclad: 500,
      rivets: 500,
      titanium: 500,
    },
    activeJob: jobByTitle(title),
    ...overrides,
  });
};

/** Draw a toolroom item the way the Toolroom tab does. */
const checkOut = (state: GameState, key: string): GameState => {
  const item = itemsData.toolroom.find((t) => t.key === key);
  if (!item) throw new Error(`No toolroom item keyed "${key}"`);
  return composeAction(state, {
    type: 'GET_TOOLROOM_ITEM',
    payload: { key: item.key, label: item.label, pn: item.pn },
  });
};

const idgRotable = (overrides: Partial<RotableItem> = {}): RotableItem => ({
  id: 'rot_idg_1',
  label: 'Integrated Drive Gen',
  pn: 'IDG-757-PWR-A',
  sn: 'SN-TEST0001',
  condition: 100,
  isInstalled: false,
  isUntraceable: false,
  isRedTagged: false,
  history: [],
  manufactureDate: 0,
  ...overrides,
});

describe('the toolroom is a source for greaseGun and inspectionMirror', () => {
  it('checking out the grease gun grants it and stamps a condition', () => {
    const next = checkOut(createMinimalGameState(), 'greaseGun');

    expect(next.inventory.greaseGun).toBe(true);
    // Without this the tool reads unserviceable even while owned.
    expect(next.toolConditions.greaseGun).toBe(100);
  });

  it('checking out the inspection mirror grants it and stamps a condition', () => {
    const next = checkOut(createMinimalGameState(), 'inspectionMirror');

    expect(next.inventory.inspectionMirror).toBe(true);
    expect(next.toolConditions.inspectionMirror).toBe(100);
  });
});

describe('Landing Gear Lubrication is closeable', () => {
  it('refuses without the grease gun', () => {
    const state = checkOut(stateWithJob('Landing Gear Lubrication'), 'malabar');
    const next = composeAction(state, { type: 'COMPLETE_JOB' });

    expect(next.activeJob).not.toBeNull();
    expect(next.stats.jobsCompleted).toBe(0);
    expect(next.logs.some((l) => l.text.includes('MISSING TOOL: GREASEGUN'))).toBe(true);
  });

  it('signs off with both toolroom items drawn', () => {
    let state = stateWithJob('Landing Gear Lubrication');
    state = checkOut(state, 'malabar');
    state = checkOut(state, 'greaseGun');

    const next = composeAction(state, { type: 'COMPLETE_JOB' });

    expect(next.activeJob).toBeNull();
    expect(next.stats.jobsCompleted).toBe(1);
  });
});

describe('Cockpit Glass Polish is closeable', () => {
  it('refuses without the inspection mirror', () => {
    const next = composeAction(stateWithJob('Cockpit Glass Polish'), { type: 'COMPLETE_JOB' });

    expect(next.activeJob).not.toBeNull();
    expect(next.logs.some((l) => l.text.includes('MISSING TOOL: INSPECTIONMIRROR'))).toBe(true);
  });

  it('signs off with the inspection mirror drawn', () => {
    const state = checkOut(stateWithJob('Cockpit Glass Polish'), 'inspectionMirror');
    const next = composeAction(state, { type: 'COMPLETE_JOB' });

    expect(next.activeJob).toBeNull();
    expect(next.stats.jobsCompleted).toBe(1);
  });
});

describe('IDG Swap resolves its rotable line against state.rotables', () => {
  const withIdg = (rotables: RotableItem[]) =>
    checkOut(stateWithJob('IDG Swap', { rotables }), 'torquemeter');

  it('refuses with no IDG on the shelf', () => {
    const next = composeAction(withIdg([]), { type: 'COMPLETE_JOB' });

    expect(next.activeJob).not.toBeNull();
    expect(next.stats.jobsCompleted).toBe(0);
    expect(next.logs.some((l) => l.text.includes('NO SERVICEABLE IDG ON THE SHELF'))).toBe(true);
  });

  it('signs off with a serviceable IDG rotable held', () => {
    const next = composeAction(withIdg([idgRotable()]), { type: 'COMPLETE_JOB' });

    expect(next.activeJob).toBeNull();
    expect(next.stats.jobsCompleted).toBe(1);
  });

  it('is not satisfied by an inventory flag: rotables are the only source', () => {
    const base = stateWithJob('IDG Swap', { rotables: [] });
    const state = checkOut(
      createMinimalGameState({
        ...base,
        inventory: { ...base.inventory, idg: true } as GameState['inventory'],
        toolConditions: { ...base.toolConditions, idg: 100 },
      }),
      'torquemeter'
    );

    const next = composeAction(state, { type: 'COMPLETE_JOB' });

    expect(next.activeJob).not.toBeNull();
    expect(next.stats.jobsCompleted).toBe(0);
  });

  it('refuses a red-tagged IDG', () => {
    const next = composeAction(withIdg([idgRotable({ isRedTagged: true })]), {
      type: 'COMPLETE_JOB',
    });

    expect(next.activeJob).not.toBeNull();
    expect(next.stats.jobsCompleted).toBe(0);
  });

  it('refuses an IDG worn to zero condition', () => {
    const next = composeAction(withIdg([idgRotable({ condition: 0 })]), { type: 'COMPLETE_JOB' });

    expect(next.activeJob).not.toBeNull();
    expect(next.stats.jobsCompleted).toBe(0);
  });

  it('accepts an untraceable IDG, whose part number is UNKNOWN', () => {
    // Boneyard and scavenge paths keep the template label but stamp
    // pn 'UNKNOWN', so matching on part number would reject them.
    const next = composeAction(
      withIdg([idgRotable({ pn: 'UNKNOWN', sn: 'UNTRACEABLE', isUntraceable: true })]),
      { type: 'COMPLETE_JOB' }
    );

    expect(next.activeJob).toBeNull();
    expect(next.stats.jobsCompleted).toBe(1);
  });

  it('leaves the rotable on the shelf and writes it no toolConditions entry', () => {
    const next = composeAction(withIdg([idgRotable()]), { type: 'COMPLETE_JOB' });

    expect(next.rotables).toHaveLength(1);
    // A toolConditions row for a rotable is exactly the second source of
    // truth the rotable lookup exists to avoid.
    expect(next.toolConditions.idg).toBeUndefined();
  });
});
