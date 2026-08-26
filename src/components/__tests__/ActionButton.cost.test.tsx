import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ActionButton from '../ActionButton.tsx';
import { FocusCostModifierProvider } from '../FocusCostContext.ts';

/**
 * HANGAR is a FatigueLevel.HIGH location, so fatigue saturates at 100 within
 * ~83 seconds and the focus modifier sits at a permanent 1.5x. A button that
 * renders its base cost is therefore wrong by 50% for most of a session.
 */
describe('ActionButton cost label', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  const showTooltip = (modifier: number, cost: { label: string; value: number }) => {
    render(
      <FocusCostModifierProvider value={modifier}>
        <ActionButton label="Perform NDT" onClick={() => {}} cost={cost} />
      </FocusCostModifierProvider>
    );
    fireEvent.mouseEnter(screen.getByRole('button').parentElement as HTMLElement);
    act(() => {
      vi.advanceTimersByTime(300);
    });
  };

  it('renders the base focus cost when nothing is modifying it', () => {
    showTooltip(1, { label: 'FOCUS', value: 20 });
    expect(screen.getByText(/\[COST: 20 FOCUS\]/)).toBeTruthy();
  });

  it('renders the surcharged focus cost the player will actually be charged', () => {
    showTooltip(1.5, { label: 'FOCUS', value: 20 });
    expect(screen.getByText(/\[COST: 30 FOCUS\]/)).toBeTruthy();
  });

  it('leaves a non-focus cost at face value', () => {
    // Credits and sanity are charged as authored; only focus is surcharged.
    showTooltip(1.5, { label: 'CREDITS', value: 500 });
    expect(screen.getByText(/\[COST: 500 CREDITS\]/)).toBeTruthy();
  });

  it('surcharges the abbreviated FOC label event choices use', () => {
    showTooltip(1.5, { label: 'FOC', value: 20 });
    expect(screen.getByText(/\[COST: 30 FOC\]/)).toBeTruthy();
  });
});
