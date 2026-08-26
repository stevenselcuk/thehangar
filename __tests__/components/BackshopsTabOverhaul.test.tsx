import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BackshopsTab from '@/components/BackshopsTab.tsx';
import { itemsData } from '@/data/items.ts';
import { OVERHAUL_TARGETS } from '@/state/slices/backshopSlice.ts';
import type { GameState, RotableItem } from '@/types.ts';
import { createMinimalGameState } from '@/utils/testHelpers.ts';

/**
 * The four overhaul buttons carried their own copy of the reducer's target
 * check, matching part numbers that no in-game part has. Both copies agreed,
 * so review passed and the buttons stayed disabled forever.
 *
 * These render against a part built from itemsData in the shape the boneyard
 * drops one — label intact, pn 'UNKNOWN' — which is the case the old check
 * could not answer even with the strings spelled correctly.
 */

const scavengedRedTag = (templateId: string): RotableItem => {
  const template = itemsData.rotables.find((r) => r.id === templateId);
  if (!template) throw new Error(`No rotable template "${templateId}"`);
  return {
    id: `rot_${templateId}`,
    label: template.label,
    pn: 'UNKNOWN',
    sn: 'UNTRACEABLE',
    condition: 8,
    isInstalled: false,
    isUntraceable: true,
    isRedTagged: true,
    history: [],
    manufactureDate: 0,
  };
};

const renderBench = (rotables: RotableItem[]): void => {
  const state: GameState = createMinimalGameState({ rotables });
  render(<BackshopsTab state={state} onAction={vi.fn()} />);
};

const BUTTONS: Record<string, RegExp> = {
  OVERHAUL_IDG: /Overhaul IDG/i,
  REPAIR_HP_VALVE: /Repair HP Shutoff Valve/i,
  RECONFIGURE_ADIRS: /Reconfigure ADIRS/i,
  REPAIR_GALLEY_UNIT: /Repair Galley Unit/i,
};

beforeEach(() => {
  // The tab rolls for an ambient flavour line on mount.
  vi.spyOn(Math, 'random').mockReturnValue(0.99);
  Element.prototype.scrollIntoView = vi.fn();
});

describe('BackshopsTab overhaul buttons', () => {
  for (const [actionId, name] of Object.entries(BUTTONS)) {
    it(`disables ${actionId} with an empty bench`, () => {
      renderBench([]);

      expect(screen.getByRole('button', { name })).toBeDisabled();
    });

    it(`enables ${actionId} against a boneyard part with pn UNKNOWN`, () => {
      renderBench([scavengedRedTag(OVERHAUL_TARGETS[actionId].templateId)]);

      expect(screen.getByRole('button', { name })).toBeEnabled();
    });

    it(`leaves ${actionId} disabled when the part of its type is serviceable`, () => {
      const serviceable = {
        ...scavengedRedTag(OVERHAUL_TARGETS[actionId].templateId),
        isRedTagged: false,
        condition: 90,
      };
      renderBench([serviceable]);

      expect(screen.getByRole('button', { name })).toBeDisabled();
    });
  }

  it('does not let one red-tagged part enable another shop', () => {
    renderBench([scavengedRedTag(OVERHAUL_TARGETS.OVERHAUL_IDG.templateId)]);

    expect(screen.getByRole('button', { name: BUTTONS.OVERHAUL_IDG })).toBeEnabled();
    expect(screen.getByRole('button', { name: BUTTONS.RECONFIGURE_ADIRS })).toBeDisabled();
    expect(screen.getByRole('button', { name: BUTTONS.REPAIR_GALLEY_UNIT })).toBeDisabled();
    expect(screen.getByRole('button', { name: BUTTONS.REPAIR_HP_VALVE })).toBeDisabled();
  });
});
