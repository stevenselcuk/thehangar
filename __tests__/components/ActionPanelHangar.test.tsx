import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ActionPanel from '@/components/ActionPanel.tsx';
import { ROOKIE_TASK_LIST, ROOKIE_TASKS } from '@/data/rookieTasks.ts';
import { TabType, type GameState } from '@/types.ts';
import { createMinimalGameState } from '@/utils/testHelpers.ts';

const hangarState = (level: number, inventory: Partial<GameState['inventory']> = {}): GameState => {
  const base = createMinimalGameState();
  return createMinimalGameState({
    resources: { ...base.resources, level },
    inventory: { ...base.inventory, flashlight: true, pencil: true, ...inventory },
    flags: { ...base.flags, ndtFinding: null },
    anomalies: [],
  });
};

const renderHangar = (state: GameState) => {
  const onAction = vi.fn();
  render(
    <ActionPanel
      activeTab={TabType.HANGAR}
      state={state}
      onAction={onAction}
      onOpenBulletinBoard={vi.fn()}
    />
  );
  return onAction;
};

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('ActionPanel - apprentice task cards', () => {
  it('offers every rookie card to a level-0 technician', () => {
    renderHangar(hangarState(0));

    for (const task of ROOKIE_TASK_LIST) {
      expect(screen.getByRole('button', { name: new RegExp(task.label, 'i') })).toBeEnabled();
    }
  });

  it('still offers them at high level as filler', () => {
    renderHangar(hangarState(30));

    expect(
      screen.getByRole('button', { name: new RegExp(ROOKIE_TASKS.ROOKIE_FOD_WALK.label, 'i') })
    ).toBeEnabled();
  });

  it('dispatches PERFORM_ROOKIE_TASK with the card id', () => {
    const onAction = renderHangar(hangarState(0));

    fireEvent.click(
      screen.getByRole('button', { name: new RegExp(ROOKIE_TASKS.ROOKIE_FOD_WALK.label, 'i') })
    );

    expect(onAction).toHaveBeenCalledWith('PERFORM_ROOKIE_TASK', { id: 'ROOKIE_FOD_WALK' });
  });

  it('disables a card whose tool the technician does not hold', () => {
    renderHangar(hangarState(0, { flashlight: false }));

    // ROOKIE_SUMP_DRAIN requires a flashlight.
    expect(
      screen.getByRole('button', { name: new RegExp(ROOKIE_TASKS.ROOKIE_SUMP_DRAIN.label, 'i') })
    ).toBeDisabled();
    // A card with no tool requirement is unaffected.
    expect(
      screen.getByRole('button', { name: new RegExp(ROOKIE_TASKS.ROOKIE_FOD_WALK.label, 'i') })
    ).toBeEnabled();
  });
});
