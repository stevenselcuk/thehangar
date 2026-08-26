import { describe, expect, it } from 'vitest';
import { composeAction } from '@/state/reducerComposer.ts';
import type { GameState } from '@/types.ts';
import { createMinimalGameState } from '@/utils/testHelpers.ts';

/**
 * These run against composeAction — the function gameReducer's ACTION case
 * actually calls. A slice-level test cannot see whether the state a case
 * reads was ever handed to the slice: the NDT certification gates read
 * inventory inside complianceSlice, which had no inventory at all before
 * this change.
 */
const stateAt = (level: number, overrides: Partial<GameState['inventory']> = {}): GameState => {
  const base = createMinimalGameState();
  return createMinimalGameState({
    resources: { ...base.resources, level, focus: 100, experience: 0 },
    inventory: { ...base.inventory, ...overrides },
    flags: { ...base.flags, ndtFinding: null },
  });
};

describe('NDT level gate end-to-end', () => {
  const certified = { hasNdtLevel1: true, hfecDevice: true, ndtCerts: ['eddy'] as const };

  it('refuses PERFORM_NDT below level 8, however certified', () => {
    const next = composeAction(stateAt(7, { ...certified, ndtCerts: ['eddy'] }), {
      type: 'PERFORM_NDT',
    });

    expect(next.stats.ndtScansPerformed).toBe(0);
    expect(next.stats.accessViolations).toBe(1);
  });

  it('permits PERFORM_NDT at level 8 with the certification', () => {
    const next = composeAction(stateAt(8, { ...certified, ndtCerts: ['eddy'] }), {
      type: 'PERFORM_NDT',
    });

    expect(next.stats.ndtScansPerformed).toBe(1);
  });

  it('refuses PERFORM_BORESCOPE_INSPECTION below level 8', () => {
    const next = composeAction(stateAt(7, { ...certified, ndtCerts: ['eddy'] }), {
      type: 'PERFORM_BORESCOPE_INSPECTION',
    });

    expect(next.stats.ndtScansPerformed).toBe(0);
    expect(next.stats.accessViolations).toBe(1);
  });

  it('refuses PERFORM_HFEC_SCAN below level 8', () => {
    const next = composeAction(stateAt(7, { ...certified, ndtCerts: ['eddy'] }), {
      type: 'PERFORM_HFEC_SCAN',
    });

    expect(next.stats.ndtScansPerformed).toBe(0);
    expect(next.stats.accessViolations).toBe(1);
  });
});

describe('NDT certification gate end-to-end', () => {
  it('refuses PERFORM_NDT at level 8 without NDT Level I', () => {
    const next = composeAction(stateAt(8, { hasNdtLevel1: false }), { type: 'PERFORM_NDT' });

    expect(next.stats.ndtScansPerformed).toBe(0);
    expect(next.logs.some((l) => l.text.includes('NDT Level I'))).toBe(true);
  });

  it('refuses the borescope at level 8 without NDT Level I', () => {
    // This is the one that proves inventory reaches complianceSlice: the
    // slice can only refuse what it can read.
    const next = composeAction(stateAt(8, { hasNdtLevel1: false }), {
      type: 'PERFORM_BORESCOPE_INSPECTION',
    });

    expect(next.stats.ndtScansPerformed).toBe(0);
    expect(next.logs.some((l) => l.text.includes('NDT Level I'))).toBe(true);
  });

  it('permits the borescope at level 8 with NDT Level I', () => {
    const next = composeAction(stateAt(8, { hasNdtLevel1: true }), {
      type: 'PERFORM_BORESCOPE_INSPECTION',
    });

    expect(next.stats.ndtScansPerformed).toBe(1);
  });

  it('refuses the HFEC scan without the scanner', () => {
    const next = composeAction(
      stateAt(8, { hasNdtLevel1: true, hfecDevice: false, ndtCerts: ['hfec'] }),
      {
        type: 'PERFORM_HFEC_SCAN',
      }
    );

    expect(next.stats.ndtScansPerformed).toBe(0);
    expect(next.logs.some((l) => l.text.includes('HFEC scanner'))).toBe(true);
  });

  it('refuses the HFEC scan with the scanner but no eddy current certification', () => {
    const next = composeAction(stateAt(8, { hasNdtLevel1: true, hfecDevice: true, ndtCerts: [] }), {
      type: 'PERFORM_HFEC_SCAN',
    });

    expect(next.stats.ndtScansPerformed).toBe(0);
    expect(next.logs.some((l) => l.text.includes('certification'))).toBe(true);
  });

  it('permits the HFEC scan with the scanner and an eddy current certification', () => {
    const next = composeAction(
      stateAt(8, { hasNdtLevel1: true, hfecDevice: true, ndtCerts: ['eddy'] }),
      {
        type: 'PERFORM_HFEC_SCAN',
      }
    );

    expect(next.stats.ndtScansPerformed).toBe(1);
  });

  it('permits the HFEC scan on an hfec certification alone', () => {
    const next = composeAction(
      stateAt(8, { hasNdtLevel1: true, hfecDevice: true, ndtCerts: ['hfec'] }),
      {
        type: 'PERFORM_HFEC_SCAN',
      }
    );

    expect(next.stats.ndtScansPerformed).toBe(1);
  });
});
