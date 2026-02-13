export interface ItemDescription {
  normal: string;
  unsettled: string;
  madness: string;
}

export interface Item {
  id: string;
  label: string;
  cost?: number; // Optional for rotables/items that might not be bought directly
  category?: 'tool' | 'line' | 'carried' | 'consumable' | 'rotable';
  pn: string;
  unit?: string; // For consumables
  key?: string; // For toolroom items mapping to inventory keys
  description: ItemDescription;
}

export const itemsData: Record<string, Item[]> = {
  shop: [
    {
      id: 'laser_pointer',
      label: 'Laser Pointer',
      cost: 25,
      category: 'tool',
      pn: 'LSR-PNT-RED',
      description: {
        normal: 'Red laser pointer. Technically for presentations.',
        unsettled: "The dot doesn't always go where I point it.",
        madness: 'It burns. It burns holes in the fabric of the night.',
      },
    },
    {
      id: 'ruler',
      label: '6in Steel Ruler',
      cost: 15,
      category: 'tool',
      pn: 'MEAS-STD-001',
      description: {
        normal: 'Standard 6-inch stainless steel ruler. Metric and imperial markings.',
        unsettled: 'The markings seem slightly off today. Is an inch getting longer?',
        madness:
          "It measures things that aren't there. The space between the millimeters is infinite.",
      },
    },
    {
      id: 'leatherman',
      label: 'Multi-tool',
      cost: 50,
      category: 'tool',
      pn: 'OMNI-TOOL-99',
      description: {
        normal: 'A reliable multi-tool with pliers, knife, and screwdrivers.',
        unsettled: 'The blade feels sharper than it should be. It wants to cut.',
        madness: 'Every time I open it, there is a new tool. One of them is for removing teeth.',
      },
    },
    {
      id: 'torxScrewdriver',
      label: 'Torx Screwdriver Set',
      cost: 40,
      category: 'tool',
      pn: 'TRX-SET-ISO',
      description: {
        normal: 'Standard set of Torx drivers, sizes T10-T40.',
        unsettled: 'They only turn counter-clockwise now. Tightening is impossible.',
        madness:
          'The tips are shaped like stars, but the stars are wrong. They whisper when I turn them.',
      },
    },
    {
      id: 'snapOnWrenchSet',
      label: 'Snap-On Wrench Set',
      cost: 250,
      category: 'tool',
      pn: 'SO-PRO-WRNCH',
      description: {
        normal: 'Professional grade combination wrenches. Chrome finish.',
        unsettled: 'Reference chrome reflects things that are not in the room.',
        madness: 'They are made of bone. Polished, chrome-plated bone. Whose bone?',
      },
    },
    {
      id: 'hammer',
      label: 'Ball-peen Hammer',
      cost: 25,
      category: 'tool',
      pn: 'PERCUSS-01',
      description: {
        normal: '16oz ball-peen hammer. Hickory handle.',
        unsettled: 'It feels heavy. Heavier than gravity allows.',
        madness: 'It sings when it strikes. A beautiful, wet thud. It wants to strike everything.',
      },
    },
    {
      id: 'rivetGun',
      label: 'Pneumatic Rivet Gun',
      cost: 150,
      category: 'tool',
      pn: 'PNEU-RIV-4X',
      description: {
        normal: '4X pneumatic rivet gun for structural repairs.',
        unsettled: 'The exhaust air smells like stale breath.',
        madness: "It doesn't shoot rivets. It injects silence into the metal. The metal screams.",
      },
    },
    {
      id: 'atlasCopcoDrill',
      label: 'Atlas Copco Drill',
      cost: 300,
      category: 'tool',
      pn: 'AC-D-PNEU-X',
      description: {
        normal: 'High-torque pneumatic drill. Industrial standard.',
        unsettled: 'The vibration travels up my arm and into my teeth.',
        madness: 'It is drilling holes in reality. I can see the static through the aluminum.',
      },
    },
    {
      id: 'orbitalSander',
      label: 'Orbital Sander',
      cost: 120,
      category: 'tool',
      pn: 'ABR-VIBE-GEN',
      description: {
        normal: 'Random orbit sander for surface preparation.',
        unsettled: 'It removes more than just paint. It removes the surface of now.',
        madness: 'I sanded the floor for an hour. I am now standing on the sky.',
      },
    },
    {
      id: 'irLamp',
      label: 'IR Curing Lamp',
      cost: 400,
      category: 'tool',
      pn: 'NON-ION-OPTIC-X',
      description: {
        normal: 'Infrared heat lamp for curing composites and sealants.',
        unsettled: 'The red light reveals writing on the walls that disappears when I turn it off.',
        madness: 'It warms the cold spots. The ghosts hate it. I love it.',
      },
    },
    {
      id: 'technicianToolbox',
      label: 'Technician Toolbox',
      cost: 150,
      category: 'tool',
      pn: 'CONT-UNIT-BLK',
      description: {
        normal: 'Heavy-duty steel cantilever toolbox.',
        unsettled: 'I hear shuffling inside when it is closed.',
        madness: 'It contains my past. It contains my future. It is locked from the inside.',
      },
    },
    {
      id: 'flashlight',
      label: 'Utility Flashlight',
      cost: 20,
      category: 'tool',
      pn: 'LUM-EMIT-MAX',
      description: {
        normal: 'LED flashlight. Ruggedized aluminum body.',
        unsettled: 'The beam flickers in Morse code. I am afraid to translate it.',
        madness: "It casts shadows of people who aren't there.",
      },
    },
    {
      id: 'radio',
      label: 'Portable Radio',
      cost: 80,
      category: 'tool',
      pn: 'FREQ-MOD-RX',
      description: {
        normal: 'Handheld transceiver for ground communications.',
        unsettled: "I pick up stations that shouldn't exist. Numbers stations. Crying.",
        madness: 'The radio speaks with my voice. It tells me to do things.',
      },
    },
    {
      id: 'ford150',
      label: 'Fleet Key Access',
      cost: 2500,
      category: 'line',
      pn: 'AUTH-VEH-K1',
      description: {
        normal: 'Keys to the company utility truck.',
        unsettled:
          'The keychain is warm. The truck is always parked slightly differently than you left it.',
        madness: 'The odometer moves backwards when I drive west.',
      },
    },
    {
      id: 'tireKit',
      label: 'Tire Change Kit',
      cost: 200,
      category: 'line',
      pn: 'WHEEL-MAINT-SYS',
      description: {
        normal: 'Jack, torque wrench, and safety cage for wheel changes.',
        unsettled: 'The tires scream when I inflate them.',
        madness: 'Round is not a shape. It is a trap. The wheels must not turn.',
      },
    },
    {
      id: 'wrench',
      label: '10mm Wrench',
      cost: 30,
      category: 'tool',
      pn: 'TOOL-10MM',
      description: {
        normal: 'A standard 10mm wrench. Essential.',
        unsettled: 'It feels heavier than it should.',
        madness: 'I can use this to unbolt the sky.',
      },
    },
  ],
  toolroom: [
    {
      id: 'T-990',
      key: 'torquemeter',
      label: 'Precision Torquemeter',
      pn: 'T-990-PREC-ISO',
      description: {
        normal: 'Calibrated torque measuring device.',
        unsettled: 'The needle follows my eyes.',
        madness: "It measures the torque of the earth's rotation. We are slowing down.",
      },
    },
    {
      id: 'M-JACK',
      key: 'malabar',
      label: 'Malabar Jack Stand',
      pn: 'MJ-800-HYD',
      description: {
        normal: 'Hydraulic received for aircraft lifting.',
        unsettled: 'It groans under the weight of nothing.',
        madness: 'It wants to lift the sky. We must help it.',
      },
    },
    {
      id: 'AD-400',
      key: 'airDataTestBox',
      label: 'Air Data Test Box',
      pn: 'AD-400-X-DIG',
      description: {
        normal: 'Pitot-static system tester.',
        unsettled: "It simulates altitudes that don't exist.",
        madness: 'It says we are currently at -20,000 feet. We are underground.',
      },
    },
    {
      id: 'HF-EC1',
      key: 'hfecDevice',
      label: 'HFEC Scanner',
      pn: 'EC-UNIT-SCAN-1',
      description: {
        normal: 'High Frequency Eddy Current scanner for crack detection.',
        unsettled: 'It detects cracks in the air.',
        madness: 'The cracks are everywhere. They are widening.',
      },
    },
    {
      id: 'ROT-X',
      key: 'rototestDevice',
      label: 'Rototest Unit',
      pn: 'ROT-X-66-SEQ',
      description: {
        normal: 'Electrical system rotation tester.',
        unsettled: 'The phases are wrong. A, B, C... D?',
        madness: 'It rotates time. Forward, backward. I am dizzy.',
      },
    },
    {
      id: 'SONIC',
      key: 'sonicCleaner',
      label: 'Sonic Cleaning Tank',
      pn: 'SNC-ULTRA-BATH',
      description: {
        normal: 'Ultrasonic cleaning bath for small parts.',
        unsettled: 'The fluid ripples when I am not looking.',
        madness: 'It screams at a frequency only my fillings can hear.',
      },
    },
  ],
  consumables: [
    {
      id: 'skydrol',
      label: 'Skydrol LD-4',
      cost: 45,
      unit: 'Liter',
      pn: 'HYD-FLUID-LD4',
      description: {
        normal: 'Fire-resistant hydraulic fluid. Highly irritating to skin.',
        unsettled: "It smells faintly of lavender. That's not right.",
        madness: 'It burns. Even through the gloves, it burns. Why does it smell like lavender?',
      },
    },
    {
      id: 'mek',
      label: 'MEK Solvent',
      cost: 25,
      unit: 'Gallon',
      pn: 'SOL-MEK-PURE',
      description: {
        normal: 'Methyl Ethyl Ketone. Strong solvent.',
        unsettled: 'The fumes show me shapes in the air.',
        madness: "It dissolves memories. I drank it and forgot my mother's name.",
      },
    },
    {
      id: 'grease',
      label: 'Aeroshell 33',
      cost: 15,
      unit: 'Tube',
      pn: 'LUB-AS33-GEN',
      description: {
        normal: 'General purpose airframe grease.',
        unsettled: 'It is too viscous. It moves like slime.',
        madness: 'It is the blood of the machine. I must anoint the gears.',
      },
    },
    {
      id: 'sealant',
      label: 'BMS 5-95 Sealant',
      cost: 60,
      unit: 'Cartridge',
      pn: 'SEAL-BMS-CHEM',
      description: {
        normal: 'Fuel tank sealant. Two-part mix.',
        unsettled: 'It cures too fast. It knows I am watching.',
        madness: 'It seals the cracks in reality. Keep them out.',
      },
    },
    {
      id: 'earmuffs',
      label: 'Earmuffs',
      cost: 75,
      unit: 'Set',
      pn: 'HEAR-PRO-X1',
      description: {
        normal: 'Industrial hearing protection.',
        unsettled: 'They muffle everything except the voices.',
        madness: 'I hear them better when I wear them. They are inside the cups.',
      },
    },
    {
      id: 'canned_tuna',
      label: 'Canned Tuna',
      cost: 5,
      unit: 'Can',
      pn: 'FOOD-TUNA',
      description: {
        normal: 'A can of tuna. Good for protein.',
        unsettled: 'The expiration date is in the future.',
        madness: 'It smells like the ocean on a planet that died.',
      },
    },
    {
      id: 'paracetamol',
      label: 'Paracetamol',
      cost: 15,
      unit: 'Pack',
      pn: 'MED-PARA-500',
      description: {
        normal: 'Standard pain relief. 500mg tablets.',
        unsettled: 'The pills rattle like teeth in the bottle.',
        madness: 'They are not pills. They are eggs. I must not swallow them.',
      },
    },
    {
      id: 'ibuprofen',
      label: 'Ibuprofen',
      cost: 20,
      unit: 'Pack',
      pn: 'MED-IBU-400',
      description: {
        normal: 'Anti-inflammatory. 400mg.',
        unsettled: 'Red coated tablets. They look like drops of blood.',
        madness: 'They stop the swelling in my brain. The voices get quieter.',
      },
    },
    {
      id: 'naproxen',
      label: 'Naproxen',
      cost: 35,
      unit: 'Pack',
      pn: 'MED-NAP-500',
      description: {
        normal: 'Strong NSAID. For joint pain.',
        unsettled: 'The bottle is heavy. Gravity pulls harder on it.',
        madness: 'It dissolves the pain. It dissolves the joints. It dissolves me.',
      },
    },
    {
      id: 'ketamine',
      label: 'Ketamine Solution',
      cost: 200,
      unit: 'Vial',
      pn: 'MED-KET-10ML',
      description: {
        normal: 'Anesthetic agent. Veterinary grade.',
        unsettled: 'The liquid moves on its own inside the vial.',
        madness: 'The dissociate key. It unlocks the door between here and... there.',
      },
    },
    {
      id: 'firstAidKit',
      label: 'First Aid Kit',
      cost: 100,
      unit: 'Kit',
      pn: 'SAFETY-MED-KIT',
      description: {
        normal: 'Standard industrial first aid kit.',
        unsettled: 'Some of the bandages are already stained.',
        madness: 'It contains the tools to sew the soul back into the body.',
      },
    },
  ],
  carried: [
    {
      id: 'wallet',
      label: 'Leather Wallet',
      cost: 0,
      category: 'carried',
      pn: 'PERSONAL-ID',
      description: {
        normal: 'Contains your ID and licenses.',
        unsettled: 'The photo on my ID... is he smiling?',
        madness: 'The name on the license is not mine. Who am I?',
      },
    },
    {
      id: 'cigarettes',
      label: 'Cigarettes',
      cost: 15,
      category: 'carried',
      pn: 'NIC-DELIV-SYS',
      description: {
        normal: 'Pack of cheap smokes.',
        unsettled: 'The smoke forms symbols.',
        madness: 'Each puff takes a minute off my life. I watch the minutes float away.',
      },
    },
    {
      id: 'lighter',
      label: 'Zippo Lighter',
      cost: 10,
      category: 'carried',
      pn: 'IGN-SRC-PORT',
      description: {
        normal: 'Brushed steel lighter.',
        unsettled: 'The flame is cold.',
        madness: 'I see faces in the fire. They are screaming.',
      },
    },
    {
      id: 'pcAssembled',
      label: 'Assembled PC',
      category: 'carried',
      pn: 'PC-WX-XP',
      description: {
        normal: 'A functional workstation running Windows XP.',
        unsettled: "The screen flickers with images of a hangar that doesn't exist.",
        madness: 'It knows my search history from before I was born.',
      },
    },
  ],
  rotables: [
    {
      id: 'idg',
      label: 'Integrated Drive Gen',
      pn: 'IDG-757-PWR-A',
      description: {
        normal: 'Integrated Drive Generator. Provides AC power.',
        unsettled: 'It hums even when disconnected.',
        madness: 'It hums tunes for dead dogs.',
      },
    },
    {
      id: 'adirs',
      label: 'Air Data Inertial Reference',
      pn: 'ADIRS-NAV-HG2030',
      description: {
        normal: 'Navigation and air data computer.',
        unsettled: 'It knows where we are. We are not where we think we are.',
        madness: "It is navigating to a place that doesn't exist on any map. Kadath?",
      },
    },
    {
      id: 'hp_valve',
      label: 'HP Shutoff Valve',
      pn: 'PRV-ENG-HP1-ISO',
      description: {
        normal: 'High pressure bleed air valve.',
        unsettled: 'It hisses. It sounds like a snake.',
        madness: 'It is holding back the pressure of the void. Do not open it.',
      },
    },
    {
      id: 'csd',
      label: 'Constant Speed Drive',
      pn: 'CSD-A320-9-HYD',
      description: {
        normal: 'Mechanical drive to maintain generator frequency.',
        unsettled: 'It spins too perfectly. Unnatural.',
        madness: 'Constant speed. Constant time. Loops within loops.',
      },
    },
    {
      id: 'apu',
      label: 'Aux Power Unit',
      pn: 'APU-131-9B-TURB',
      description: {
        normal: 'Small gas turbine for ground power.',
        unsettled: 'It breathes. I can hear it inhaling.',
        madness: 'It is the heart of the beast. It must simply be fed.',
      },
    },
    {
      id: 'nose_cowl',
      label: 'Nose Cowl Assy',
      pn: 'COWL-737-MAX-AERO',
      description: {
        normal: 'Engine inlet cowling.',
        unsettled: 'The intake looks like a mouth.',
        madness: 'It will swallow me whole. I will become thrust.',
      },
    },
    {
      id: 'coffee_maker',
      label: 'Galley Coffee Maker',
      pn: 'BREW-MASTER-ISO',
      description: {
        normal: 'Standard aircraft coffee maker.',
        unsettled: 'The coffee tastes like iron. Like blood.',
        madness: 'It brews memories. Bitter, black memories.',
      },
    },
    {
      id: 'toilet_assy',
      label: 'Vacuum Toilet Assy',
      pn: 'WASTE-VAC-1-SYS',
      description: {
        normal: 'Vacuum waste system assembly.',
        unsettled: 'The suction is too strong.',
        madness: 'It leads to the void. If I fall in, I will fall forever.',
      },
    },
    {
      id: 'metallicSphere',
      label: 'Metallic Sphere',
      pn: 'UNKNOWN-ORIGIN',
      category: 'rotable',
      description: {
        normal: 'A heavy, perfectly smooth sphere. It feels warm.',
        unsettled: 'It vibrates slightly when I hold it. Is it... purring?',
        madness: 'It speaks to me in geometry. I must bring it to the end.',
      },
    },
  ],
};
