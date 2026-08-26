import { Inventory } from '../types.ts';

/**
 * ndtGating.ts - The NDT certification rule, in one place.
 *
 * All four NDT actions are also gated by a player level (requiredLevel: 8
 * in ACTION_FEATURES, enforced by isActionUnlocked / the composer) — that
 * gate is unrelated and lives in featureRegistry.ts. This module is only
 * the certification half: what it takes, at the point of use, to actually
 * run the scan once the tab is unlocked.
 *
 * Before this module existed the rule was written three times (the
 * PERFORM_NDT case in hangarSlice, the HFEC/borescope cases in
 * complianceSlice, and the button-locking logic in ActionPanel) and could
 * drift. Callers still own their own refusal wording — a reducer's
 * rejection log line reads differently from a locked button's tooltip —
 * but the yes/no and the reason code behind it now have one source.
 */

export type NdtAction =
  | 'PERFORM_NDT'
  | 'PERFORM_HFEC_SCAN'
  | 'PERFORM_BORESCOPE_INSPECTION'
  | 'PERFORM_DYE_PENETRANT';

/** Which half of the HFEC requirement is unmet, or the shared cert requirement. */
export type NdtGateReason = 'MISSING_SCANNER' | 'MISSING_CERT' | null;

/**
 * Whether the technician may run a dye penetrant check.
 *
 * Deliberately *not* hasNdtLevel1. Dye penetrant is the one method a
 * hangar signs off on the floor: a senior technician watches the process
 * on a scrap panel and initials the training record. The 'dye' entry in
 * ndtCerts can therefore arrive two ways — QUALIFY_DYE_PENETRANT at level
 * 8, or the formal sub-task exam in TrainingTab at level 12 — and this
 * predicate does not care which. That fork is the whole point: it is what
 * gives a level-8 technician something to do with the NDT bay before the
 * training department opens.
 */
export const hasDyePenetrantQualification = (inventory: Inventory): boolean =>
  (inventory.ndtCerts || []).includes('dye');

/**
 * Why `action` cannot be performed right now, or null if it can.
 *
 * - PERFORM_HFEC_SCAN needs the scanner in inventory first, then an 'eddy'
 *   or 'hfec' entry in ndtCerts.
 * - PERFORM_DYE_PENETRANT needs only the 'dye' entry in ndtCerts.
 * - PERFORM_NDT and PERFORM_BORESCOPE_INSPECTION both need hasNdtLevel1.
 */
export const missingNdtRequirement = (action: NdtAction, inventory: Inventory): NdtGateReason => {
  if (action === 'PERFORM_HFEC_SCAN') {
    if (!inventory.hfecDevice) return 'MISSING_SCANNER';
    const certs = inventory.ndtCerts || [];
    if (!certs.includes('eddy') && !certs.includes('hfec')) return 'MISSING_CERT';
    return null;
  }

  if (action === 'PERFORM_DYE_PENETRANT') {
    return hasDyePenetrantQualification(inventory) ? null : 'MISSING_CERT';
  }

  return inventory.hasNdtLevel1 ? null : 'MISSING_CERT';
};

/** Whether `action`'s certification requirement is satisfied. */
export const canPerformNdt = (action: NdtAction, inventory: Inventory): boolean =>
  missingNdtRequirement(action, inventory) === null;
