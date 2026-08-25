import { GAME_CONSTANTS } from '../data/constants.ts';
import { EnvironmentalHazard } from '../types.ts';

/**
 * How much more focus an action costs right now.
 *
 * Fatigue scales the cost linearly up to FATIGUE_FOCUS_SURCHARGE at 100.
 * Active hazards that declare a focusCostModifier multiply on top. The
 * result is never below 1 — a hazard cannot make work cheaper.
 */
export const calculateFocusModifier = (fatigue: number, hazards: EnvironmentalHazard[]): number => {
  const clampedFatigue = Math.max(0, Math.min(100, fatigue || 0));
  const fatigueFactor = 1 + (clampedFatigue / 100) * GAME_CONSTANTS.FATIGUE_FOCUS_SURCHARGE;

  const hazardFactor = (hazards || []).reduce((acc, h) => {
    const modifier = h.effects?.focusCostModifier;
    return typeof modifier === 'number' ? acc * modifier : acc;
  }, 1);

  return Math.max(1, fatigueFactor * hazardFactor);
};

/**
 * The focus an action still owes after its slice has run.
 */
export interface FocusSpend {
  /** What the slice already took off. Never negative: a slice that hands
   *  focus back (a nap, a cigarette) has spent nothing. */
  deducted: number;
  /** The part of the registered cost the slice never charged. */
  topUp: number;
  /** Fatigue and hazard penalty on the whole spend. */
  surcharge: number;
  /** topUp + surcharge — what still has to come off the player. */
  total: number;
}

const finite = (value: number): number => (Number.isFinite(value) ? value : 0);

/**
 * Reconcile what an action actually cost against what it is registered to
 * cost, then price in the player's condition.
 *
 * Almost every costed action in the game has a price in BASE_FOCUS_COSTS
 * and a `[COST: n FOCUS]` label on its button, but only a handful of slices
 * deduct anything. This closes that gap without touching the slices: charge
 * the shortfall between the registered cost and whatever the slice took,
 * then surcharge the whole spend for fatigue and hazards.
 *
 * The top-up is a shortfall, not a replacement — a slice that already
 * charged the full cost is not charged twice, and a slice that charged more
 * than the registered cost is not refunded the difference.
 */
export const resolveFocusSpend = (
  registeredCost: number,
  focusBefore: number,
  focusAfter: number,
  modifier: number
): FocusSpend => {
  const deducted = Math.max(0, finite(focusBefore) - finite(focusAfter));
  const topUp = Math.max(0, finite(registeredCost) - deducted);
  const spent = deducted + topUp;
  const surcharge = Math.max(0, spent * (finite(modifier) - 1));

  return { deducted, topUp, surcharge, total: topUp + surcharge };
};
