import { afterEach, describe, expect, it, vi } from 'vitest';
import { itemsData } from '@/data/items.ts';
import { jobsData } from '@/data/jobs.ts';
import { composeAction } from '@/state/reducerComposer.ts';
import { createUntraceableRotable, OVERHAUL_TARGETS } from '@/state/slices/backshopSlice.ts';
import type { GameState, RotableItem } from '@/types.ts';
import { createMinimalGameState } from '@/utils/testHelpers.ts';

/**
 * All four Backshops overhauls were dead content.
 *
 * OVERHAUL_TARGETS matched on part numbers ('IDG-757-A', 'PRV-ENG-HP1',
 * 'ADIRS-HG2030', 'BREW-MASTER') that are each a proper prefix of the real
 * template part number and equal to none of them, and BackshopsTab carried
 * the same four wrong strings — so the buttons were permanently disabled and
 * the handlers could never find a target. A slice test hid it by building
 * its fixture with `pn: 'IDG-757-A'`, a value that exists nowhere in the
 * game.
 *
 * So this suite refuses to name a part: every rotable it uses comes from
 * itemsData.rotables or from createUntraceableRotable, the producer the game
 * actually drops parts from, and every overhaul runs through composeAction.
 */

/** The bench, at the level the boneyard opens, with these parts on it. */
const benchWith = (rotables: RotableItem[]): GameState => {
  const base = createMinimalGameState();
  return createMinimalGameState({
    resources: { ...base.resources, level: 10, focus: 100, titanium: 500 },
    rotables,
  });
};

/** A red-tagged part of `templateId`'s type, in the shape the boneyard drops. */
const scavengedRedTag = (templateId: string): RotableItem => {
  const template = itemsData.rotables.find((r) => r.id === templateId);
  if (!template) throw new Error(`No rotable template "${templateId}"`);
  return {
    id: `rot_${templateId}`,
    label: template.label,
    pn: 'UNKNOWN',
    sn: 'UNTRACEABLE',
    condition: 12,
    isInstalled: false,
    isUntraceable: true,
    isRedTagged: true,
    history: [],
    manufactureDate: 0,
  };
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('every overhaul target names a part the game can actually produce', () => {
  it('resolves each OVERHAUL_TARGETS templateId to a real rotable template', () => {
    const ids = new Set(itemsData.rotables.map((r) => r.id));

    expect(Object.keys(OVERHAUL_TARGETS)).toHaveLength(4);
    for (const [actionId, target] of Object.entries(OVERHAUL_TARGETS)) {
      expect(ids, `${actionId} targets an unknown rotable template`).toContain(target.templateId);
    }
  });

  it('keeps every rotable label distinct, because label is the identity', () => {
    // hasServiceableRotable and findOverhaulCandidateIndex both match on
    // label. Two templates sharing one would let the wrong part close a job.
    const labels = itemsData.rotables.map((r) => r.label);

    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe('the four overhauls fire against real scavenged parts', () => {
  for (const [actionId, target] of Object.entries(OVERHAUL_TARGETS)) {
    it(`${actionId} restores a red-tagged ${target.templateId}`, () => {
      const state = benchWith([scavengedRedTag(target.templateId)]);

      const next = composeAction(state, { type: actionId, payload: {} } as never);

      expect(next.rotables[0].isRedTagged).toBe(false);
      expect(next.rotables[0].condition).toBe(100);
      expect(next.resources.experience).toBe(state.resources.experience + target.xp);
      expect(next.resources.credits).toBe(state.resources.credits + target.credits);
      expect(next.stats.rotablesRepaired).toBe(state.stats.rotablesRepaired + 1);
    });

    it(`${actionId} refuses when the bench holds no red-tagged part of its type`, () => {
      const serviceable = { ...scavengedRedTag(target.templateId), isRedTagged: false };
      const state = benchWith([serviceable]);

      const next = composeAction(state, { type: actionId, payload: {} } as never);

      expect(next.resources.experience).toBe(state.resources.experience);
      expect(next.stats.rotablesRepaired).toBe(state.stats.rotablesRepaired);
      expect(next.logs.some((l) => l.text.includes('TASK REJECTED'))).toBe(true);
    });
  }

  it('routes each action to its own template and leaves the others alone', () => {
    // Every part on the bench is red-tagged; only the IDG may come back.
    const bench = Object.values(OVERHAUL_TARGETS).map((t) => scavengedRedTag(t.templateId));
    const state = benchWith(bench);

    const next = composeAction(state, { type: 'OVERHAUL_IDG', payload: {} } as never);

    const restored = next.rotables.filter((r) => !r.isRedTagged);
    expect(restored).toHaveLength(1);
    expect(restored[0].label).toBe(
      itemsData.rotables.find((r) => r.id === OVERHAUL_TARGETS.OVERHAUL_IDG.templateId)?.label
    );
  });
});

describe('the producer and the consumer agree', () => {
  /** createUntraceableRotable, forced to drop a red-tagged part of `index`. */
  const forceDrop = (index: number): RotableItem => {
    const sequence = [
      index / itemsData.rotables.length, // template pick
      0.5, // id
      0.4, // condition
      0.1, // isRedTagged (< 0.3)
    ];
    let call = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => sequence[call++] ?? 0.5);
    const part = createUntraceableRotable();
    vi.restoreAllMocks();
    return part;
  };

  it('overhauls a part straight out of createUntraceableRotable', () => {
    const idgIndex = itemsData.rotables.findIndex(
      (r) => r.id === OVERHAUL_TARGETS.OVERHAUL_IDG.templateId
    );
    const dropped = forceDrop(idgIndex);

    // The shape the boneyard actually hands out: the label survives, the
    // part number does not. A pn match would reject this part.
    expect(dropped.label).toBe(itemsData.rotables[idgIndex].label);
    expect(dropped.pn).toBe('UNKNOWN');
    expect(dropped.isRedTagged).toBe(true);

    const next = composeAction(benchWith([dropped]), {
      type: 'OVERHAUL_IDG',
      payload: {},
    } as never);

    expect(next.rotables[0].isRedTagged).toBe(false);
    expect(next.rotables[0].condition).toBe(100);
  });
});

describe('the overhaul is the rescue path for a red-tagged IDG Swap part', () => {
  const jobByTitle = (title: string) => {
    const template = jobsData.find((j) => j.title === title);
    if (!template) throw new Error(`No job template titled "${title}"`);
    return { ...template, id: 'job_idg', timeLeft: 0, totalTime: 120000 };
  };

  const raisedIdgSwap = (rotables: RotableItem[]): GameState => {
    const state = benchWith(rotables);
    return composeAction(
      createMinimalGameState({
        ...state,
        activeJob: jobByTitle('IDG Swap') as GameState['activeJob'],
      }),
      {
        type: 'GET_TOOLROOM_ITEM',
        payload: itemsData.toolroom.find((t) => t.key === 'torquemeter'),
      } as never
    );
  };

  it('turns an unclosable card into a closable one', () => {
    const state = raisedIdgSwap([scavengedRedTag(OVERHAUL_TARGETS.OVERHAUL_IDG.templateId)]);

    const refused = composeAction(state, { type: 'COMPLETE_JOB' });
    expect(refused.activeJob).not.toBeNull();
    expect(refused.stats.jobsCompleted).toBe(0);

    const overhauled = composeAction(state, { type: 'OVERHAUL_IDG', payload: {} } as never);
    const signedOff = composeAction(overhauled, { type: 'COMPLETE_JOB' });

    expect(signedOff.activeJob).toBeNull();
    expect(signedOff.stats.jobsCompleted).toBe(1);
  });
});
