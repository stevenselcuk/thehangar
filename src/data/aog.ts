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
    | 'engine_failure'
    | 'unknown_interference';
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
      "The sun hasn't risen in three weeks. The wind screams across the tundra like a dying turbine. Shadows stretch and twist on the ice. Something watches from the perimeter fence, its eyes reflecting the strobe lights.",
    difficulty: 'extreme',
  },
  {
    id: 'desert_boneyard',
    name: 'Mojave Air and Space Port',
    code: 'MHV',
    description:
      'A graveyard of aluminium giants. The heat creates shimmering mirages that look like people walking between the rows of dead aircraft. The silence is absolute, until the metal groans in the cooling dusk.',
    difficulty: 'challenging',
  },
  {
    id: 'island_hop',
    name: 'Princess Juliana',
    code: 'SXM',
    description:
      'The air is thick with salt and jet fuel. Tourists line the fence, oblivious to the corrosion eating away at the spar. The waves crash with a rhythm that matches your pounding headache.',
    difficulty: 'routine',
  },
  {
    id: 'high_altitude',
    name: 'El Alto International',
    code: 'LPB',
    description:
      'The air is too thin. Thoughts come slowly, like molasses in a hydraulic line. The sky is a bruising shade of purple. You swear you can see the curvature of the earth bending incorrectly.',
    difficulty: 'challenging',
  },
  {
    id: 'jungle_strip',
    name: 'Amazonas Outpost',
    code: 'AMZ',
    description:
      'The humidity is a physical weight. Moss grows on the landing gear overnight. The forest canopy is a wall of screaming insects and unseen movement. The locals refuse to approach the aircraft after dark.',
    difficulty: 'extreme',
  },
];

export const aogScenarios: AogScenario[] = [
  {
    id: 'runway_excursion',
    title: 'Runway Excursion',
    description:
      'The aircraft overran the threshold and settled into the unstable earth. The gear is swallowed by the mud. It looks less like an accident and more like the ground is trying to digest the machine.',
    type: 'runway_excursion',
    actions: [
      {
        id: 'dig_out_gear',
        label: 'Excavate Landing Gear',
        cost: { resource: 'focus', amount: 30 },
        consequence:
          'The mud smells ancient and metallic. You find bone fragments mixed with the soil.',
      },
      {
        id: 'inspect_struts',
        label: 'Inspect Oleo Struts',
        cost: { resource: 'focus', amount: 15 },
        consequence: 'Micro-fractures spiderweb across the chrome. They Pulse when you look away.',
      },
    ],
  },
  {
    id: 'bird_strike_engine',
    title: 'Biologic Ingestion Event',
    description:
      "Engine #1 ingested… something. It’s not just birds. The fan blades are twisted like claws, and the bypass duct is coated in a slurry that shouldn't exist in local taxonomy. The smell creates a phantom taste of copper.",
    type: 'bird_strike',
    actions: [
      {
        id: 'replace_fan_blades',
        label: 'Harvest & Replace Blades',
        cost: { resource: 'focus', amount: 50 },
        consequence:
          'The damaged blades seem to fight back as you remove them. Sharp edges bite your gloves.',
      },
      {
        id: 'clean_core',
        label: 'Purge Engine Core',
        cost: { resource: 'sanity', amount: 15 },
        consequence:
          'The fluid hisses as you wash it away. You hear faint chittering from the compressor stage.',
      },
    ],
  },
  {
    id: 'flat_tire_remote',
    title: 'Catastrophic Wheel Failure',
    description:
      "Mains 1, 2, and 3 have disintegrated. The rubber hasn't just burst; it's melted and fused with the tarmac. The wheel hubs are glowing with a low, sick light.",
    type: 'flat_tire',
    actions: [
      {
        id: 'improvise_jacks',
        label: 'Fabricate Jacking Point',
        cost: { resource: 'focus', amount: 40 },
        consequence:
          'You stack cribbing towers. They feel unstable, trembling with the vibration of the earth.',
      },
      {
        id: 'change_wheels',
        label: 'Mount Spare Assemblies',
        cost: { resource: 'focus', amount: 25 },
        consequence: 'The new wheels feel heavier than they should. Dead weight.',
      },
    ],
  },
  {
    id: 'lightning_damage',
    title: 'Anomalous Discharge Strike',
    description:
      'Lightning struck the radome, but there’s no exit wound. The avionics bay hums even with power disconnected. Static electricity arcs between your fingertips and the fuselage.',
    type: 'lightning_strike',
    actions: [
      {
        id: 'mapping_damage',
        label: 'Map Conductivity Field',
        cost: { resource: 'focus', amount: 20 },
        consequence:
          'The multimeter gives readings that defy Ohm’s law. Infinity and zero simultaneously.',
      },
      {
        id: 'replace_static_wicks',
        label: 'Replace Static Wicks',
        cost: { resource: 'rivets', amount: 10 },
        consequence: 'The old wicks crumble to grey ash in your hands.',
      },
      {
        id: 'reset_computers',
        label: 'Hard Reset Avionics',
        cost: { resource: 'sanity', amount: 10 },
        consequence:
          "The screens flicker with symbols that aren't flight data. You see your own name.",
      },
    ],
  },
  {
    id: 'unknown_interference',
    title: 'Unidentified Signal Interference',
    description:
      'The aircraft is generating a carrier wave on a distress frequency. No power is applied. The sound resonates in your teeth. The skin of the aircraft feels warm to the touch.',
    type: 'unknown_interference',
    actions: [
      {
        id: 'trace_wiring',
        label: 'Trace Wiring Harness',
        cost: { resource: 'focus', amount: 35 },
        consequence: 'The wire bundles look like arteries. They pulse.',
      },
      {
        id: 'shield_components',
        label: 'Apply Lead Shielding',
        cost: { resource: 'alclad', amount: 20 },
        consequence: "You wrap the computer. It muffles the sound, but doesn't stop it.",
      },
    ],
  },
];
