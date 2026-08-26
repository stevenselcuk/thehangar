import { Inventory } from '../types.ts';

/**
 * ndtGating.ts - The NDT certification rule, in one place.
 *
 * All three NDT actions are also gated by a player level (requiredLevel: 8
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

export type NdtAction = 'PERFORM_NDT' | 'PERFORM_HFEC_SCAN' | 'PERFORM_BORESCOPE_INSPECTION';

/** Which half of the HFEC requirement is unmet, or the shared cert requirement. */
export type NdtGateReason = 'MISSING_SCANNER' | 'MISSING_CERT' | null;

/**
 * Why `action` cannot be performed right now, or null if it can.
 *
 * - PERFORM_HFEC_SCAN needs the scanner in inventory first, then an 'eddy'
 *   or 'hfec' entry in ndtCerts.
 * - PERFORM_NDT and PERFORM_BORESCOPE_INSPECTION both need hasNdtLevel1.
 */
export const missingNdtRequirement = (action: NdtAction, inventory: Inventory): NdtGateReason => {
  if (action === 'PERFORM_HFEC_SCAN') {
    if (!inventory.hfecDevice) return 'MISSING_SCANNER';
    const certs = inventory.ndtCerts || [];
    if (!certs.includes('eddy') && !certs.includes('hfec')) return 'MISSING_CERT';
    return null;
  }

  return inventory.hasNdtLevel1 ? null : 'MISSING_CERT';
};

/** Whether `action`'s certification requirement is satisfied. */
export const canPerformNdt = (action: NdtAction, inventory: Inventory): boolean =>
  missingNdtRequirement(action, inventory) === null;
