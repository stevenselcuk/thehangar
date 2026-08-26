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

  it('refuses PERFORM_DYE_PENETRANT at level 8 without the dye qualification', () => {
    const next = composeAction(stateAt(8, { hasNdtLevel1: true, ndtCerts: [] }), {
      type: 'PERFORM_DYE_PENETRANT',
    });

    expect(next.stats.ndtScansPerformed).toBe(0);
    expect(next.logs.some((l) => l.text.includes('dye penetrant qualification'))).toBe(true);
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

/**
 * The fork. NDT opens at level 8; every formal certification is bought in
 * TrainingTab, which opens at level 12. The on-the-floor dye penetrant
 * sign-off is the only thing bridging that window, and it must bridge it
 * *without* opening the rest of the ladder.
 */
describe('the on-the-floor dye penetrant qualification', () => {
  const withMek = (level: number, inventory: Partial<GameState['inventory']> = {}): GameState => {
    const base = stateAt(level, inventory);
    return { ...base, resources: { ...base.resources, mek: 5 } };
  };

  it('grants the dye entry without granting NDT Level I', () => {
    const next = composeAction(withMek(8, { hasNdtLevel1: false, ndtCerts: [] }), {
      type: 'QUALIFY_DYE_PENETRANT',
    });

    expect(next.inventory.ndtCerts).toContain('dye');
    expect(next.inventory.hasNdtLevel1).toBe(false);
  });

  it('is refused below level 8', () => {
    const next = composeAction(withMek(7, { hasNdtLevel1: false, ndtCerts: [] }), {
      type: 'QUALIFY_DYE_PENETRANT',
    });

    expect(next.inventory.ndtCerts).not.toContain('dye');
    expect(next.stats.accessViolations).toBe(1);
  });

  it('is a one-time sign-off: repeating it says so and does not duplicate the entry', () => {
    const once = composeAction(withMek(8, { hasNdtLevel1: false, ndtCerts: [] }), {
      type: 'QUALIFY_DYE_PENETRANT',
    });
    const twice = composeAction(once, { type: 'QUALIFY_DYE_PENETRANT' });

    expect(twice.inventory.ndtCerts.filter((c) => c === 'dye')).toHaveLength(1);
    expect(twice.logs[0].text).toContain('already against dye penetrant');
    expect(twice.resources.experience).toBe(once.resources.experience);
  });

  it('forks the ladder: dye penetrant runs, the ultrasonic scan is still refused', () => {
    const qualified = composeAction(withMek(8, { hasNdtLevel1: false, ndtCerts: [] }), {
      type: 'QUALIFY_DYE_PENETRANT',
    });
    expect(qualified.inventory.hasNdtLevel1).toBe(false);

    const dye = composeAction(qualified, { type: 'PERFORM_DYE_PENETRANT' });
    expect(dye.stats.ndtScansPerformed).toBe(1);

    const ultrasonic = composeAction(dye, { type: 'PERFORM_NDT' });
    expect(ultrasonic.stats.ndtScansPerformed).toBe(1);
    expect(ultrasonic.logs.some((l) => l.text.includes('NDT Level I'))).toBe(true);

    const borescope = composeAction(dye, { type: 'PERFORM_BORESCOPE_INSPECTION' });
    expect(borescope.stats.ndtScansPerformed).toBe(1);
    expect(borescope.logs.some((l) => l.text.includes('NDT Level I'))).toBe(true);
  });

  it('consumes one MEK per check and refuses when the kit is empty', () => {
    const qualified = composeAction(withMek(8, { hasNdtLevel1: false, ndtCerts: ['dye'] }), {
      type: 'PERFORM_DYE_PENETRANT',
    });
    expect(qualified.resources.mek).toBe(4);

    const base = stateAt(8, { hasNdtLevel1: false, ndtCerts: ['dye'] });
    const dry = composeAction(
      { ...base, resources: { ...base.resources, mek: 0 } },
      { type: 'PERFORM_DYE_PENETRANT' }
    );

    expect(dry.stats.ndtScansPerformed).toBe(0);
    expect(dry.logs.some((l) => l.text.includes('No MEK in the kit'))).toBe(true);
  });

  it('never returns a suspicious finding: it only reads the surface', () => {
    const severities = new Set<string>();

    for (let i = 0; i < 400; i++) {
      const next = composeAction(withMek(8, { hasNdtLevel1: false, ndtCerts: ['dye'] }), {
        type: 'PERFORM_DYE_PENETRANT',
      });
      if (next.flags.ndtFinding) {
        expect(next.flags.ndtFinding.type).toBe('Dye Penetrant');
        severities.add(next.flags.ndtFinding.severity);
      }
    }

    expect(severities.has('suspicious')).toBe(false);
    expect(severities.has('minor')).toBe(true);
    expect(severities.has('major')).toBe(true);
  });
});
