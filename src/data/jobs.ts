/**
 * The level at which the standard pool opens.
 *
 * Most standard jobs are gated behind a tool the player cannot hold before
 * this point: snapOnWrenchSet, rivetGun and atlasCopcoDrill are only sold on
 * the Structure Shop shelves (TAB_STRUCTURE, level 5). The rest are gated by
 * the pool itself — the toolroom cards (malabar + greaseGun, inspectionMirror)
 * draw on level-1 stock, and the IDG swap needs a serviceable IDG rotable,
 * which comes off the boneyard paths at level 10 and above. Below level 5 a
 * standard work order would mostly be a card the player can raise and never
 * sign off, which is why the pool is split rather than merely weighted.
 */
export const STANDARD_JOB_MIN_LEVEL = 5;

export const jobsData = [
  // ==================== ROOKIE TIER ====================
  // Apprentice work orders. No tool requirements: a level-0 technician owns a
  // flashlight, a pencil and a notebook, and none of the three carry a
  // condition record, so any tool line here would be unserviceable by
  // definition and the card could never be closed.
  {
    title: 'Position Ground Support Equipment',
    description:
      'Set steps, chocks, cones and the ground power unit to the stand markings for the inbound. Supervised task. Sign-off by licensed staff.',
    requirements: {},
    rewardXP: 120,
    tier: 'rookie',
  },
  {
    title: 'Restock Bay 7 Consumables',
    description:
      'Draw lockwire, cotter pins, gloves and rags from stores and refill the bay trolley to the minimum stock card.',
    requirements: { rivets: 10 },
    rewardXP: 100,
    tier: 'rookie',
  },
  {
    title: 'Wheel Well Clean and Visual Check',
    description:
      'Wipe down the main gear bays and report any hydraulic weeping, chafing or loose bonding to the licensed technician.',
    requirements: {},
    rewardXP: 140,
    tier: 'rookie',
  },
  {
    title: 'Cabin Restraint Inspection',
    description:
      'Check every seat belt and shoulder harness for fraying, latch function and correct routing. Record findings row by row.',
    requirements: {},
    rewardXP: 110,
    tier: 'rookie',
  },
  {
    title: 'Access Panel Fastener Replacement',
    description:
      'Replace worn and missing fasteners on the lower fuselage access panels. Torque to the values on the card, not from memory.',
    requirements: { rivets: 15, alclad: 5 },
    rewardXP: 160,
    tier: 'rookie',
  },
  {
    title: 'Lower Fuselage Wash',
    description:
      'Wash the belly aft of the wing root with approved cleaner. Exhaust soot masks corrosion and nobody signs off what they cannot see.',
    requirements: {},
    rewardXP: 130,
    tier: 'rookie',
  },
  {
    title: 'Escape Slide Gauge Round',
    description:
      'Walk the doors and read every slide bottle gauge against the temperature-corrected chart. Report anything in the yellow band.',
    requirements: {},
    rewardXP: 150,
    tier: 'rookie',
  },
  {
    title: 'Toolbox Inventory Audit',
    description:
      'Count the bay toolbox against the inventory sheet, drawer by drawer, and account for every item before the shift closes.',
    requirements: {},
    rewardXP: 120,
    tier: 'rookie',
  },

  // ==================== STANDARD TIER ====================
  {
    title: 'Seal L2 Door Leak',
    description: 'Water ingress detected in main cabin door seal.',
    requirements: { alclad: 50, rivets: 100, tools: ['snapOnWrenchSet'] },
    rewardXP: 300,
    tier: 'standard',
  },
  {
    title: 'Emergency Wing Patch',
    description: 'Major abrasion on right-wing leading edge requires composite patch.',
    requirements: { alclad: 200, rivets: 50, tools: ['rivetGun', 'atlasCopcoDrill'] },
    rewardXP: 500,
    tier: 'standard',
  },
  {
    title: 'Landing Gear Lubrication',
    description: 'Requires Malabar Jack and Grease Gun for seasonal service.',
    requirements: { titanium: 40, rivets: 200, tools: ['malabar', 'greaseGun'] },
    rewardXP: 800,
    tier: 'standard',
  },
  {
    title: 'Cockpit Glass Polish',
    description: 'Surface micro-pitting reported by flight crew after sandstorm.',
    requirements: { alclad: 20, titanium: 10, tools: ['inspectionMirror'] },
    rewardXP: 250,
    tier: 'standard',
  },
  {
    // 'idg' names a rotable type, not a tool: eventsSlice resolves it against
    // the rotables the technician holds. See isRotableRequirement there.
    title: 'IDG Swap',
    description: 'Integrated Drive Generator replacement on Engine 2.',
    requirements: { titanium: 100, tools: ['torquemeter', 'idg'] },
    rewardXP: 1500,
    tier: 'standard',
  },
  {
    title: 'FOD Guard Replacement',
    description: 'Intake guard damaged during bird strike.',
    requirements: { alclad: 80, rivets: 120, tools: ['rivetGun'] },
    rewardXP: 400,
    tier: 'standard',
  },
];

/**
 * A job template as authored above: everything a JobCard needs except the
 * fields the engine stamps on when the work order is raised.
 */
export type JobTemplate = (typeof jobsData)[number];

/**
 * The pool a work order is drawn from at a given level.
 *
 * Rookie cards never leave the pool — they thin out into filler once the
 * standard tier opens, rather than disappearing.
 */
export const selectJobPool = (level: number): JobTemplate[] =>
  level >= STANDARD_JOB_MIN_LEVEL ? jobsData : jobsData.filter((job) => job.tier === 'rookie');
