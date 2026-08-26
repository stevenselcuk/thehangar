import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ActionPanel from '@/components/ActionPanel.tsx';
import { TabType, type GameState } from '@/types.ts';
import { createMinimalGameState } from '@/utils/testHelpers.ts';

const hangarState = (level: number, inventory: Partial<GameState['inventory']> = {}): GameState => {
  const base = createMinimalGameState();
  return createMinimalGameState({
    resources: { ...base.resources, level },
    inventory: { ...base.inventory, ...inventory },
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

/** The description a gated button carries is shown in its hover tooltip. */
const hoverText = (buttonName: RegExp | string): string => {
  const button = screen.getByRole('button', { name: buttonName });
  act(() => {
    fireEvent.mouseEnter(button.closest('div')!.parentElement!);
    vi.advanceTimersByTime(300);
  });
  return document.body.textContent || '';
};

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('ActionPanel - NDT gating', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('explains the level requirement below level 8', () => {
    renderHangar(hangarState(7, { hasNdtLevel1: true }));

    expect(screen.getByRole('button', { name: /NDT Ultrasonic Scan/i })).toBeDisabled();
    expect(hoverText(/NDT Ultrasonic Scan/i)).toContain('Requires Level 8');

    vi.useRealTimers();
  });

  it('explains the certification requirement at level 8 without it', () => {
    renderHangar(hangarState(8, { hasNdtLevel1: false }));

    expect(screen.getByRole('button', { name: /NDT Ultrasonic Scan/i })).toBeDisabled();
    expect(hoverText(/NDT Ultrasonic Scan/i)).toContain(
      '[LOCKED] Requires NDT Level I certification.'
    );

    vi.useRealTimers();
  });

  it('enables the scan once level and certification are both held', () => {
    renderHangar(hangarState(8, { hasNdtLevel1: true }));

    expect(screen.getByRole('button', { name: /NDT Ultrasonic Scan/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Borescope Inspection/i })).toBeEnabled();

    vi.useRealTimers();
  });

  it('explains the missing scanner and the missing certification for HFEC', () => {
    renderHangar(hangarState(8, { hasNdtLevel1: true, hfecDevice: false, ndtCerts: ['eddy'] }));

    expect(screen.getByRole('button', { name: /Perform HFEC Scan/i })).toBeDisabled();
    expect(hoverText(/Perform HFEC Scan/i)).toContain(
      '[LOCKED] Requires the HFEC Scanner from the toolroom.'
    );

    vi.useRealTimers();
  });

  it('enables HFEC with the scanner and an eddy current certification', () => {
    renderHangar(hangarState(8, { hasNdtLevel1: true, hfecDevice: true, ndtCerts: ['eddy'] }));

    expect(screen.getByRole('button', { name: /Perform HFEC Scan/i })).toBeEnabled();

    vi.useRealTimers();
  });

  it('explains the dye penetrant qualification requirement at level 8 without it', () => {
    renderHangar(hangarState(8, { hasNdtLevel1: false, ndtCerts: [] }));

    expect(screen.getByRole('button', { name: /Dye Penetrant Check/i })).toBeDisabled();
    expect(hoverText(/Dye Penetrant Check/i)).toContain(
      '[LOCKED] Requires a dye penetrant qualification.'
    );

    vi.useRealTimers();
  });

  it('enables the dye penetrant check on the floor qualification alone', () => {
    // No hasNdtLevel1: this is the fork the whole feature exists for.
    renderHangar(hangarState(8, { hasNdtLevel1: false, ndtCerts: ['dye'] }));

    expect(screen.getByRole('button', { name: /Dye Penetrant Check/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /NDT Ultrasonic Scan/i })).toBeDisabled();

    vi.useRealTimers();
  });

  it('offers the sign-off at level 8 to a technician who does not hold it', () => {
    renderHangar(hangarState(8, { ndtCerts: [] }));
    expect(screen.getByRole('button', { name: /Request Dye Penetrant Sign-Off/i })).toBeEnabled();

    vi.useRealTimers();
  });

  it('stops offering the sign-off once the qualification is held', () => {
    // The reducer refuses the second request but the composer still charges
    // the button's 10 focus, so a live button here is a focus leak.
    renderHangar(hangarState(8, { ndtCerts: ['dye'] }));

    expect(screen.getByRole('button', { name: /Request Dye Penetrant Sign-Off/i })).toBeDisabled();
    expect(hoverText(/Request Dye Penetrant Sign-Off/i)).toContain('Already signed off');

    vi.useRealTimers();
  });

  it('locks the sign-off below level 8', () => {
    renderHangar(hangarState(7, { ndtCerts: [] }));

    expect(screen.getByRole('button', { name: /Request Dye Penetrant Sign-Off/i })).toBeDisabled();
    expect(hoverText(/Request Dye Penetrant Sign-Off/i)).toContain('Requires Level 8');

    vi.useRealTimers();
  });

  it('disables HFEC when the scanner is held but no eddy current certification is', () => {
    renderHangar(hangarState(8, { hasNdtLevel1: true, hfecDevice: true, ndtCerts: [] }));

    expect(screen.getByRole('button', { name: /Perform HFEC Scan/i })).toBeDisabled();
    expect(hoverText(/Perform HFEC Scan/i)).toContain(
      '[LOCKED] Requires an Eddy Current or HFEC certification.'
    );

    vi.useRealTimers();
  });
});
