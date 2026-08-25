import { describe, expect, it } from 'vitest';
import { calculateFocusModifier, resolveFocusSpend } from '../focusSurcharge.ts';
import type { EnvironmentalHazard } from '../../types.ts';

const hazard = (focusCostModifier: number): EnvironmentalHazard => ({
  id: 'TEST_HAZARD',
  name: 'Test Hazard',
  description: 'test',
  type: 'weather',
  effects: { focusCostModifier },
  duration: 10000,
});

describe('calculateFocusModifier', () => {
  it('is 1 when rested and unhindered', () => {
    expect(calculateFocusModifier(0, [])).toBe(1);
  });

  it('reaches 1.5 at full fatigue', () => {
    expect(calculateFocusModifier(100, [])).toBeCloseTo(1.5);
  });

  it('scales linearly between', () => {
    expect(calculateFocusModifier(50, [])).toBeCloseTo(1.25);
  });

  it('multiplies hazard modifiers together', () => {
    expect(calculateFocusModifier(0, [hazard(2), hazard(1.5)])).toBeCloseTo(3);
  });

  it('combines fatigue and hazards', () => {
    expect(calculateFocusModifier(100, [hazard(2)])).toBeCloseTo(3);
  });

  it('never returns below 1', () => {
    expect(calculateFocusModifier(0, [hazard(0.2)])).toBe(1);
  });

  it('clamps fatigue above 100 to the full surcharge', () => {
    expect(calculateFocusModifier(500, [])).toBeCloseTo(1.5);
  });

  it('ignores hazards that declare no focus modifier', () => {
    const drainOnly: EnvironmentalHazard = {
      id: 'DRAIN',
      name: 'Drain',
      description: 'test',
      type: 'containment',
      effects: { sanityDrain: 2 },
      duration: 1000,
    };
    expect(calculateFocusModifier(0, [drainOnly])).toBe(1);
  });

  it('survives missing fatigue and a missing hazard list', () => {
    expect(
      calculateFocusModifier(
        undefined as unknown as number,
        undefined as unknown as EnvironmentalHazard[]
      )
    ).toBe(1);
  });
});

describe('resolveFocusSpend', () => {
  describe('the top-up gate', () => {
    it('charges the whole registered cost when the slice charged nothing', () => {
      const spend = resolveFocusSpend(20, 100, 100, 1);
      expect(spend.deducted).toBe(0);
      expect(spend.topUp).toBe(20);
      expect(spend.total).toBe(20);
    });

    it('charges only the shortfall when the slice charged part of it', () => {
      const spend = resolveFocusSpend(20, 100, 95, 1);
      expect(spend.deducted).toBe(5);
      expect(spend.topUp).toBe(15);
      expect(spend.total).toBe(15);
    });

    it('does not double-charge a slice that already took the full cost', () => {
      const spend = resolveFocusSpend(5, 100, 95, 1);
      expect(spend.deducted).toBe(5);
      expect(spend.topUp).toBe(0);
      expect(spend.total).toBe(0);
    });

    it('does not refund a slice that charged more than the registered cost', () => {
      const spend = resolveFocusSpend(5, 100, 80, 1);
      expect(spend.deducted).toBe(20);
      expect(spend.topUp).toBe(0);
      expect(spend.total).toBe(0);
    });

    it('charges nothing at all for an action with no registered cost', () => {
      const spend = resolveFocusSpend(0, 100, 100, 1);
      expect(spend.topUp).toBe(0);
      expect(spend.surcharge).toBe(0);
      expect(spend.total).toBe(0);
    });

    it('treats a focus-restoring action as having spent nothing', () => {
      // NAP_TABLE-shaped: the slice handed focus back. The registered cost
      // still applies, but the grant must not inflate it.
      const spend = resolveFocusSpend(10, 40, 100, 1);
      expect(spend.deducted).toBe(0);
      expect(spend.topUp).toBe(10);
      expect(spend.total).toBe(10);
    });
  });

  describe('the surcharge gate', () => {
    it('adds nothing at a modifier of 1', () => {
      const spend = resolveFocusSpend(20, 100, 100, 1);
      expect(spend.surcharge).toBe(0);
      expect(spend.total).toBe(20);
    });

    it('scales the whole spend, slice deduction included', () => {
      // Slice took 5, top-up takes 15, so 20 is spent and 1.5x adds 10.
      const spend = resolveFocusSpend(20, 100, 95, 1.5);
      expect(spend.surcharge).toBeCloseTo(10);
      expect(spend.total).toBeCloseTo(25);
    });

    it('surcharges a slice-only deduction that has no registered cost', () => {
      const spend = resolveFocusSpend(0, 100, 80, 1.5);
      expect(spend.deducted).toBe(20);
      expect(spend.topUp).toBe(0);
      expect(spend.surcharge).toBeCloseTo(10);
      expect(spend.total).toBeCloseTo(10);
    });

    it('never turns a modifier below 1 into a refund', () => {
      const spend = resolveFocusSpend(20, 100, 100, 0.5);
      expect(spend.surcharge).toBe(0);
      expect(spend.total).toBe(20);
    });
  });

  it('spends nothing when the focus readings are not numbers', () => {
    const spend = resolveFocusSpend(
      20,
      undefined as unknown as number,
      undefined as unknown as number,
      1.5
    );
    expect(spend.deducted).toBe(0);
    expect(spend.topUp).toBe(20);
    expect(spend.surcharge).toBeCloseTo(10);
  });
});
