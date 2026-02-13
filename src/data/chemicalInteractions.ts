import { ResourceState } from '../types';

export type ChemicalReactionType =
  | 'EXPLOSION'
  | 'FUMES'
  | 'FIRE'
  | 'SLUDGE'
  | 'CORROSION'
  | 'ELDRITCH_BIRTH';

export interface ChemicalReaction {
  id: string;
  ingredients: string[]; // Item IDs or Resource Keys
  result: ChemicalReactionType;
  severity: 'minor' | 'major' | 'critical' | 'catastrophic';
  description: string;
  effects: Partial<Record<keyof ResourceState | 'health', number>>;
  audio?: string;
}

export const chemicalReactions: ChemicalReaction[] = [
  {
    id: 'mek_sealant_reaction',
    ingredients: ['mek', 'sealant'],
    result: 'FUMES',
    severity: 'minor',
    description: 'The sealant reacts with the wet MEK, bubbling into a sticky, toxic foam.',
    effects: {
      sanity: -5,
      focus: -10,
    },
  },
  {
    id: 'skydrol_water',
    ingredients: ['skydrol', 'water'], // Assuming water might be added or implies high humidity
    result: 'SLUDGE',
    severity: 'major',
    description: 'The hydraulic fluid turns into a gelatinous, acidic sludge.',
    effects: {
      credits: -50, // Cost to clean up
    },
  },
  {
    id: 'bio_skydrol_mix',
    ingredients: ['skydrol', 'bioFilament'],
    result: 'ELDRITCH_BIRTH',
    severity: 'critical',
    description: 'The fluid writhes. It is no longer fluid. It is muscle.',
    effects: {
      sanity: -20,
      suspicion: +10,
    },
  },
  {
    id: 'primer_ignite',
    ingredients: ['primer', 'open_flame'], // Abstract ingredient
    result: 'FIRE',
    severity: 'major',
    description: 'The primer flash-cures into a fireball.',
    effects: {
      alclad: -20, // Damage to aircraft
      sanity: -10,
    },
  },
];

export const getReaction = (itemA: string, itemB: string): ChemicalReaction | null => {
  return (
    chemicalReactions.find((r) => r.ingredients.includes(itemA) && r.ingredients.includes(itemB)) ||
    null
  );
};
