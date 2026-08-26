import { Inventory } from '../types.ts';

/**
 * rookieTasks.ts - Apprentice task cards
 *
 * The work an unlicensed technician is actually given: short, supervised,
 * signed off by somebody else. Each card pays a little experience and a
 * little time in the technical logbook, which is the only currency the
 * licence examiners accept.
 *
 * All twelve are handled by the single parameterised PERFORM_ROOKIE_TASK
 * case in hangarSlice, keyed by id.
 */
export interface RookieTask {
  id: string;
  label: string;
  description: string;
  /** Technical logbook hours credited. Never multiplied by anything. */
  hours: number;
  xp: number;
  focus: number;
  /** Optional tool gate, checked against inventory at the point of use. */
  requires?: (keyof Inventory)[];
  log: string;
}

export const ROOKIE_TASKS: Record<string, RookieTask> = {
  ROOKIE_FOD_WALK: {
    id: 'ROOKIE_FOD_WALK',
    label: 'Walk the FOD Line',
    description: 'Line abreast across Bay 7, grid by grid, bucket in hand.',
    hours: 2,
    xp: 40,
    focus: 5,
    log: 'Lockwire, two washers, a shirt button. The button goes down as debris of unknown origin, which is the correct entry.',
  },
  ROOKIE_SHADOW_BOARD: {
    id: 'ROOKIE_SHADOW_BOARD',
    label: 'Return Tools to the Shadow Board',
    description: 'Every tool back to its own silhouette before the shift closes.',
    hours: 2,
    xp: 50,
    focus: 5,
    log: 'Board full, count agrees, sheet initialled. One outline has nothing to fill it and no stencil number under it. You leave it empty.',
  },
  ROOKIE_FUEL_STRAINER: {
    id: 'ROOKIE_FUEL_STRAINER',
    label: 'Clean Main Fuel Strainer',
    description: 'Bowl off, element out, wash, new O-ring, safety it.',
    hours: 4,
    xp: 90,
    focus: 10,
    requires: ['flashlight'],
    log: 'Element clean, seal renewed, no leaks at pressure. The sediment in the bowl is fine and grey and does not smell of anything at all.',
  },
  ROOKIE_NAV_LIGHT: {
    id: 'ROOKIE_NAV_LIGHT',
    label: 'Replace Port Nav Light Assembly',
    description: 'Four screws, one connector, new lens, continuity check.',
    hours: 3,
    xp: 80,
    focus: 10,
    requires: ['flashlight'],
    log: 'Fitted, bonded, tested serviceable. It was already burning red on the bench, before you connected it. You connected it anyway.',
  },
  ROOKIE_LOGBOOK: {
    id: 'ROOKIE_LOGBOOK',
    label: 'Transcribe the Shift Logbook',
    description: 'Copy the night entries into the day book in block capitals.',
    hours: 3,
    xp: 70,
    focus: 8,
    requires: ['pencil'],
    log: 'Fourteen entries carried across, no abbreviations, no erasures. Two of them are in your handwriting. You have never worked a night shift.',
  },
  ROOKIE_TYRE_PRESSURE: {
    id: 'ROOKIE_TYRE_PRESSURE',
    label: 'Check Tyre Pressures',
    description: 'Read cold, correct to the chart, record every wheel position.',
    hours: 3,
    xp: 70,
    focus: 8,
    log: 'Four mains and the nose, all within limits, two topped to spec. The nose tyre is warm. Nothing has moved this airframe in eleven days.',
  },
  ROOKIE_OIL_CHECK: {
    id: 'ROOKIE_OIL_CHECK',
    label: 'Check Engine Oil Levels',
    description: 'Sight glass on both engines, uplift if below the band.',
    hours: 2,
    xp: 60,
    focus: 6,
    log: 'Both within limits, no uplift required. The book says check within fifteen minutes of shutdown. Nothing has been shut down since Tuesday. The cowlings are warm.',
  },
  ROOKIE_SUMP_DRAIN: {
    id: 'ROOKIE_SUMP_DRAIN',
    label: 'Drain Fuel Tank Sumps',
    description: 'A cup from each drain point, checked for water and sediment.',
    hours: 3,
    xp: 75,
    focus: 10,
    requires: ['flashlight'],
    log: 'Nine drain points, nine cups, all clear and returned to the waste drum. The last cup was clear too, and heavier than the others.',
  },
  ROOKIE_STATIC_WICKS: {
    id: 'ROOKIE_STATIC_WICKS',
    label: 'Replace Static Discharge Wicks',
    description: 'Bases cleaned, wicks renewed, bonding resistance measured.',
    hours: 4,
    xp: 95,
    focus: 12,
    log: 'Eleven changed, all within resistance limits. The card says twelve. You walk the trailing edges twice and find eleven.',
  },
  ROOKIE_SEAT_TRACKS: {
    id: 'ROOKIE_SEAT_TRACKS',
    label: 'Clean and Lubricate Seat Tracks',
    description: 'Rows 14 to 22: vacuum, scrape, dry film, function check.',
    hours: 4,
    xp: 85,
    focus: 10,
    log: 'Coins, a pen, hair, and a boarding pass for a flight number the company does not operate. Standard yield. Bagged and handed to the lead.',
  },
  ROOKIE_PLACARDS: {
    id: 'ROOKIE_PLACARDS',
    label: 'Renew Cabin Placards',
    description: 'Faded exit and life-vest placards replaced to the IPC.',
    hours: 2,
    xp: 55,
    focus: 6,
    log: 'Nine placards renewed, part numbers checked against the catalogue. The old ones were correct too, in a typeface this manufacturer stopped using in 1971.',
  },
  ROOKIE_COCKPIT_GLASS: {
    id: 'ROOKIE_COCKPIT_GLASS',
    label: 'Clean Cockpit Windows',
    description: 'Approved cleaner, clean cloths, straight strokes, no circles.',
    hours: 2,
    xp: 50,
    focus: 5,
    log: "The captain's side clears. The first officer's side keeps one handprint on the outside, at forty feet, and you clean around it.",
  },
};

/** Display order for the apprentice task board. */
export const ROOKIE_TASK_LIST: RookieTask[] = Object.values(ROOKIE_TASKS);
