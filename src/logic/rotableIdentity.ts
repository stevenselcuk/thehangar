import { itemsData } from '../data/items.ts';
import { RotableItem } from '../types.ts';

/**
 * rotableIdentity.ts - "Is this part one of those?", in one place.
 *
 * Two unrelated features ask the same question of the rotables array: a
 * work order's `tools: ['idg']` line has to find a serviceable IDG, and a
 * Backshops overhaul has to find a red-tagged one. Both were answering it
 * themselves, and the Backshops copy answered it wrong for a year — it
 * matched on part number against strings (`'IDG-757-A'`, `'BREW-MASTER'`)
 * that are prefixes of the real template part numbers and equal to none of
 * them, so all four overhaul actions were dead content and the button that
 * fired them was permanently disabled. A second copy of the check in
 * BackshopsTab agreed with the reducer, which is exactly why review kept
 * passing over it. Hence one module, imported by every asker.
 *
 * **Identity is the label, never the part number.** `createUntraceableRotable`
 * (backshopSlice) stamps `pn: 'UNKNOWN'` on every part the boneyard hands
 * out, and the boneyard is the only in-game source of these components, so
 * a part-number match rejects 100% of live drops even when the string is
 * spelled correctly. The label survives both paths intact. All nine
 * `itemsData.rotables` labels are distinct, so a label cannot name two
 * templates; `rotableTemplateLabelsAreDistinct` is asserted in the tests.
 */

export interface RotableTemplate {
  id: string;
  label: string;
  pn: string;
}

const ROTABLE_TEMPLATES = new Map<string, RotableTemplate>(
  itemsData.rotables.map((r) => [r.id, { id: r.id, label: r.label, pn: r.pn }])
);

/** The authored template behind a rotable type id, or undefined. */
export const getRotableTemplate = (templateId: string): RotableTemplate | undefined =>
  ROTABLE_TEMPLATES.get(templateId);

/**
 * Whether this requirement line names a rotable type rather than a tool.
 *
 * An IDG is not a tool the technician checks out and hands back — it is a
 * rotable, and rotables are already modelled as instances in
 * state.rotables, with their own serial numbers, condition and red tags.
 * Satisfying `tools: ['idg']` from an inventory boolean would put the same
 * fact in two places and let them disagree, so a tool id that names one of
 * these templates is resolved against the rotables array instead.
 */
export const isRotableRequirement = (toolId: string): boolean => ROTABLE_TEMPLATES.has(toolId);

/** Whether `rotable` is an instance of the `templateId` type. */
export const isRotableOfType = (rotable: RotableItem, templateId: string): boolean => {
  const template = ROTABLE_TEMPLATES.get(templateId);
  return template !== undefined && rotable.label === template.label;
};

/**
 * Whether the technician is holding a serviceable rotable of this type.
 *
 * Red-tagged parts are excluded — a red tag is the paperwork for
 * "unserviceable" — as are parts worn to zero condition, which is the same
 * bar isToolServiceable holds tools to.
 */
export const hasServiceableRotable = (rotables: RotableItem[], templateId: string): boolean =>
  (rotables || []).some((r) => isRotableOfType(r, templateId) && r.condition > 0 && !r.isRedTagged);

/**
 * Where the red-tagged rotable an overhaul would work on sits, or -1.
 *
 * The exact inverse of hasServiceableRotable's red-tag clause: an overhaul
 * is the rescue path for a part a scavenge run red-tagged, so a serviceable
 * one is not a candidate. Condition is not consulted — a red-tagged part is
 * on the bench precisely because it is broken.
 */
export const findOverhaulCandidateIndex = (rotables: RotableItem[], templateId: string): number =>
  (rotables || []).findIndex((r) => isRotableOfType(r, templateId) && r.isRedTagged);

/** Whether the bench holds a red-tagged rotable this overhaul could restore. */
export const hasOverhaulCandidate = (rotables: RotableItem[], templateId: string): boolean =>
  findOverhaulCandidateIndex(rotables, templateId) !== -1;
