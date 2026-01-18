export interface AogStation {
  id: string;
  name: string;
  code: string;
  description: string;
  difficulty: 'routine' | 'challenging' | 'extreme';
}

export interface AogScenario {
  id: string;
  title: string;
  description: string;
  type:
    | 'runway_excursion'
    | 'bird_strike'
    | 'lightning_strike'
    | 'flat_tire'
    | 'hard_landing'
    | 'tail_strike'
    | 'engine_failure';
  actions: {
    id: string;
    label: string;
    cost: {
      resource: 'focus' | 'sanity' | 'alclad' | 'rivets' | 'skydrol' | 'sealant';
      amount: number;
    };
    consequence?: string;
  }[];
}

export const aogStations: AogStation[] = [
  {
    id: 'nordic_outpost',
    name: 'Svalbard Longyearbyen',
    code: 'LYR',
    description:
      'Frozen tundra. The wind cuts through thermal layers. Polar bears are a genuine FOD hazard.',
    difficulty: 'extreme',
  },
  {
    id: 'desert_boneyard',
    name: 'Mojave Air and Space Port',
    code: 'MHV',
    description:
      'Scorching heat. Dust gets into everything. The ghosts of retired aircraft watch your every move.',
    difficulty: 'challenging',
  },
  {
    id: 'island_hop',
    name: 'Princess Juliana',
    code: 'SXM',
    description:
      'Caribbean humidity. Salt air accelerating corrosion. Tourists blasting apart on the fence line.',
    difficulty: 'routine',
  },
  {
    id: 'high_altitude',
    name: 'El Alto International',
    code: 'LPB',
    description:
      'Thin air. Oxygen deprivation makes simple tasks exhausting. The view is dizzying.',
    difficulty: 'challenging',
  },
  {
    id: 'jungle_strip',
    name: 'Amazonas Outpost',
    code: 'AMZ',
    description:
      'Oppressive humidity. Insects the size of rivets. Nature is reclaiming the runway.',
    difficulty: 'extreme',
  },
];

export const aogScenarios: AogScenario[] = [
  {
    id: 'runway_excursion',
    title: 'Runway Excursion',
    description:
      'The aircraft slid off the runway into the mud. Gear is buried. Structure may be compromised.',
    type: 'runway_excursion',
    actions: [
      {
        id: 'dig_out_gear',
        label: 'Dig Out Gear',
        cost: { resource: 'focus', amount: 30 },
        consequence: 'Back-breaking labor.',
      },
      {
        id: 'inspect_struts',
        label: 'Inspect Struts',
        cost: { resource: 'focus', amount: 15 },
        consequence: 'Looking for cracks in the mud.',
      },
    ],
  },
  {
    id: 'bird_strike_engine',
    title: 'Massive Bird Strike',
    description:
      'Engine #1 ingested a flock of geese. Fan blades are shattered. The smell is... indescribable.',
    type: 'bird_strike',
    actions: [
      {
        id: 'replace_fan_blades',
        label: 'Replace Fan Blades',
        cost: { resource: 'focus', amount: 50 },
      },
      {
        id: 'clean_core',
        label: 'Clean Engine Core',
        cost: { resource: 'sanity', amount: 10 },
        consequence: 'You will never forget that smell.',
      },
    ],
  },
  {
    id: 'flat_tire_remote',
    title: 'Multiple Blown Tires',
    description:
      'Mains 1, 2, and 3 are shredded. Debris scattered everywhere. We have no jacks here.',
    type: 'flat_tire',
    actions: [
      {
        id: 'improvise_jacks',
        label: 'Improvise Jacking Point',
        cost: { resource: 'focus', amount: 40 },
        consequence: 'Risky, but necessary.',
      },
      {
        id: 'change_wheels',
        label: 'Change Wheels',
        cost: { resource: 'focus', amount: 25 },
      },
    ],
  },
  {
    id: 'lightning_damage',
    title: 'Severe Lightning Strike',
    description:
      'Entry hole on the radome, exit wound on the tail. Avionics are fried. Static wick burned off.',
    type: 'lightning_strike',
    actions: [
      {
        id: 'mapping_damage',
        label: 'Map Skin Damage',
        cost: { resource: 'focus', amount: 20 },
      },
      {
        id: 'replace_static_wicks',
        label: 'Replace Static Wicks',
        cost: { resource: 'rivets', amount: 10 },
      },
      {
        id: 'reset_computers',
        label: 'Hard Reset Avionics',
        cost: { resource: 'sanity', amount: 5 },
        consequence: 'Hoping the ghosts in the machine go away.',
      },
    ],
  },
];
