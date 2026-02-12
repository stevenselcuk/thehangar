import { GameEvent, SuitType } from '../types.ts';

// Helper type for event templates (omitting 'timeLeft' as it's set on trigger)
type EventTemplate = Omit<GameEvent, 'timeLeft'>;

export const aircraftEvents: Record<string, EventTemplate[]> = {
  accident: [
    // MD-80
    {
      id: 'MD80_HYDRAULIC_LEAK',
      type: 'accident',
      title: 'MD-80 HYDRAULIC HEMORRHAGE',
      description: "Skydrol is spraying from the tail section. It's hissing like a nest of vipers.",
      totalTime: 35000,
      requiredAction: 'Isolate Hydraulic System B',
      successOutcome: {
        log: 'You cut the line just in time. The hissing stops.',
        effects: { alclad: -5, experience: 150 },
      },
      failureOutcome: {
        log: 'The caustic fluid melts through a wire bundle. The aircraft is grounded.',
        effects: { credits: -300, suspicion: 10 },
      },
    },
    {
      id: 'MD80_SMOKE_IN_CABIN',
      type: 'accident',
      title: 'SMOKE IN CABIN',
      description:
        'Acrid smoke is filling the rear cabin. It smells like burning ozone... and copper.',
      totalTime: 40000,
      requiredAction: 'Locate Source',
      successOutcome: {
        log: 'It was a failing coffee maker. You yank the breaker. Crisis averted.',
        effects: { experience: 200, sanity: -5 },
      },
      failureOutcome: {
        log: "The smoke thickens. Passengers panic. It wasn't just a fire.",
        effects: { suspicion: 20, sanity: -15 },
      },
    },
    // B737-400
    {
      id: 'B734_FUEL_IMBALANCE',
      type: 'accident',
      title: 'SEVERE IMBALANCE',
      description: 'The left wing is heavy. Fuel is not transferring. The pumps are screaming.',
      totalTime: 45000,
      requiredAction: 'Manual valve override',
      successOutcome: {
        log: 'You force the crossfeed valve open with a wrench. Balance restored.',
        effects: { experience: 180, focus: -10 },
      },
      failureOutcome: {
        log: 'The pump burns out. The aircraft lists dangerously on the tarmac.',
        effects: { credits: -400, suspicion: 15 },
      },
    },
    {
      id: 'B734_CABIN_PRESSURE_LOSS',
      type: 'accident',
      title: 'PRESSURE LEAK',
      description:
        'The outflow valve is stuck open. The cabin is depressurizing on the ground test.',
      totalTime: 30000,
      requiredAction: 'Seal the Valve',
      successOutcome: {
        log: 'You hammer the valve shut. It seals with a wet thud.',
        effects: { experience: 200, alclad: -2 },
      },
      failureOutcome: {
        log: 'The test fails spectacularly. Oxygen masks drop in empty seats.',
        effects: { credits: -200, focus: -10 },
      },
    },
    // B737-700 (Special)
    {
      id: 'B737_LOCKDOWN',
      type: 'accident',
      title: 'SECURITY LOCKDOWN',
      description: 'The aircraft system detects an intrusion. Doors are locking. You are inside.',
      totalTime: 25000,
      choices: [
        {
          id: 'override',
          label: 'Hack Door Panel',
          cost: { resource: 'focus', amount: 25 },
          log: 'You short the keypad. The door slides open. You leave before they arrive.',
          effects: { experience: 300, suspicion: 10 },
        },
      ],
      failureOutcome: {
        log: 'You are trapped until security arrives. They interrogate you for hours.',
        effects: { sanity: -20, suspicion: 40 },
      },
    },
    // A330
    {
      id: 'A330_BULK_CARGO_SHIFT',
      type: 'accident',
      title: 'CARGO SHIFT',
      description:
        'A heavy pallet in the bulk hold has broken loose. It is sliding towards the pressure bulkhead.',
      totalTime: 40000,
      requiredAction: 'Secure Cargo',
      successOutcome: {
        log: 'You strap it down. The crate is labelled "DO NOT TILT". It is warm.',
        effects: { experience: 250, sanity: -5 },
      },
      failureOutcome: {
        log: 'The pallet slams into the bulkhead. Structural damage confirmed.',
        effects: { credits: -1000, suspicion: 20 },
      },
    },
    // B777
    {
      id: 'B777_CARGO_TEMP_DROP',
      type: 'accident',
      title: 'CRITICAL TEMP DROP',
      description:
        'The aft cargo hold temperature is dropping to absolute zero. Sensors are freezing.',
      totalTime: 35000,
      requiredAction: 'Reset Climate Control',
      successOutcome: {
        log: 'You cycle the system. The temperature rises, but frost covers everything.',
        effects: { experience: 300, sanity: -10 },
      },
      failureOutcome: {
        log: 'The sensors shatter. The cargo in that hold is lost to the cold.',
        effects: { credits: -500, suspicion: 15 },
      },
    },
    // A300
    {
      id: 'A300_CARGO_SHIFT',
      type: 'accident',
      title: 'MAIN DECK SHIFT',
      description: 'A noise from the main deck. A container has moved on its own.',
      totalTime: 30000,
      choices: [
        {
          id: 'investigate',
          label: 'Check Locks',
          cost: { resource: 'sanity', amount: 10 },
          log: 'The locks were engaged. The container moved anyway.',
          effects: { experience: 200, sanity: -5 },
        },
      ],
      failureOutcome: {
        log: 'You ignore it. Later, the loadmaster reports the container is missing entirely.',
        effects: { suspicion: 25 },
      },
    },
    {
      id: 'A300_DOOR_SEAL_FAIL',
      type: 'accident',
      title: 'DOOR SEAL FAILURE',
      description:
        'The main cargo door seal is screaming. Air is escaping... or something is trying to get in.',
      totalTime: 25000,
      requiredAction: 'Pressurize Seal',
      successOutcome: {
        log: 'The seal inflates. The screaming stops.',
        effects: { experience: 150, focus: -5 },
      },
      failureOutcome: {
        log: 'The seal bursts. The noise alerts the entire hangar.',
        effects: { credits: -300, suspicion: 10 },
      },
    },
  ],
  incident: [
    // MD-80
    {
      id: 'MD80_STUCK_FLAP',
      type: 'incident',
      title: 'FLAP ASYMMETRY',
      description: 'Left flap at 15, right flap at 5. The mechanism is jammed with... bone?',
      totalTime: 50000,
      choices: [
        {
          id: 'force',
          label: 'Clear Blockage',
          cost: { resource: 'sanity', amount: 15 },
          log: 'You pull out the obstruction. It looks like a bird, but it has teeth.',
          effects: { experience: 200, sanity: -10 },
        },
      ],
      failureOutcome: {
        log: 'You write it up as a mechanical fault. The next shift will deal with it.',
        effects: { suspicion: 5 },
      },
    },
    {
      id: 'MD80_ENGINE_VIBRATION',
      type: 'incident',
      title: 'VIBRATION DETECTED',
      description: '#1 Engine has a vibration that matches a human heartbeat.',
      totalTime: 40000,
      choices: [
        {
          id: 'trim',
          label: 'Balance Fan',
          cost: { resource: 'focus', amount: 20 },
          log: 'You add weights. The heartbeat stops. The engine hums normally.',
          effects: { experience: 200 },
        },
      ],
      failureOutcome: {
        log: 'The vibration persists. The pilot refuses the aircraft.',
        effects: { credits: -200 },
      },
    },
    // B737-400
    {
      id: 'B734_PACK_FAILURE',
      type: 'incident',
      title: 'PACK TRIP OFF',
      description: 'AC Pack L keeps tripping off. The heat exchanger is clogged with grey slime.',
      totalTime: 45000,
      choices: [
        {
          id: 'clean',
          label: 'Clean Exchanger',
          cost: { resource: 'sanity', amount: 10 },
          log: 'You scrape out the slime. It quivers.',
          effects: { experience: 250, sanity: -5 },
        },
      ],
      failureOutcome: {
        log: 'You defer the pack. The passengers will complain of the heat.',
        effects: { credits: -100 },
      },
    },
    {
      id: 'B734_CORROSION_WARNING',
      type: 'incident',
      title: 'SURFACE CORROSION',
      description: 'A patch of skin near the door is bubbling. The paint is moving.',
      totalTime: 50000,
      choices: [
        {
          id: 'sand',
          label: 'Sand it Down',
          cost: { resource: 'focus', amount: 15 },
          log: 'You sand down to bare metal. The metal screams.',
          effects: { experience: 200, sanity: -5 },
        },
      ],
      failureOutcome: {
        log: 'You spray over it. It will come back.',
        effects: { suspicion: 10 },
      },
    },
    // B737-700
    {
      id: 'B737_CRYPTONYMS',
      type: 'incident',
      title: 'CLASSIFIED COMMS',
      description: 'The ACARS printer starts printing code names. "BLUE SUN". "RED KING".',
      totalTime: 30000,
      choices: [
        {
          id: 'burn',
          label: 'Burn the Output',
          cost: { resource: 'focus', amount: 5 },
          log: 'You burn the paper. Best not to know.',
          effects: { suspicion: -5 },
        },
        {
          id: 'read',
          label: 'Decipher',
          cost: { resource: 'sanity', amount: 20 },
          log: 'You recognize a name. It is yours.',
          effects: { experience: 400, sanity: -20 },
        },
      ],
      failureOutcome: {
        log: 'You leave the printout. Security confiscates it.',
        effects: { suspicion: 20 },
      },
    },
    // A330
    {
      id: 'A330_ETOPS_ANXIETY',
      type: 'incident',
      title: 'ETOPS VIOLATION',
      description: 'The paperwork says the plane is ETOPS certified. The plane says it is not.',
      totalTime: 40000,
      choices: [
        {
          id: 'certify',
          label: 'Re-certify',
          cost: { resource: 'focus', amount: 30 },
          log: 'You double check the systems. Everything is nominal... theoretically.',
          effects: { experience: 300 },
        },
      ],
      failureOutcome: {
        log: 'The flight is downgraded to non-ETOPS. Major delay.',
        effects: { credits: -500 },
      },
    },
    {
      id: 'A330_FDR_GLITCH',
      type: 'incident',
      title: 'DATA CORRUPTION',
      description:
        "The Flight Data Recorder is recording data from a flight that hasn't happened yet.",
      totalTime: 35000,
      choices: [
        {
          id: 'erase',
          label: 'Wipe Buffer',
          cost: { resource: 'focus', amount: 10 },
          log: 'You clear the buffer. The future is erased.',
          effects: { experience: 200, sanity: -5 },
        },
      ],
      failureOutcome: {
        log: 'The data uploads to the server. Someone will notice.',
        effects: { suspicion: 15 },
      },
    },
    // B777
    {
      id: 'B777_ETOPS_PAPERWORK',
      type: 'incident',
      title: 'PAPERWORK ANOMALY',
      description: "The maintenance logs are written in ink that hasn't dried, dated 1999.",
      totalTime: 30000,
      choices: [
        {
          id: 'correct',
          label: 'Update Date',
          cost: { resource: 'sanity', amount: 5 },
          log: 'You correct the date. The ink turns into blood.',
          effects: { sanity: -10, experience: 150 },
        },
      ],
      failureOutcome: {
        log: 'You file it as is. The archives accept it.',
        effects: { suspicion: 5 },
      },
    },
    {
      id: 'B777_GHOST_IN_THE_FMC',
      type: 'incident',
      title: 'FMC ROUTE ERR',
      description: 'The Flight Management Computer keeps entering a waypoint at null coordinates.',
      totalTime: 40000,
      choices: [
        {
          id: 'reboot',
          label: 'Hard Reboot',
          cost: { resource: 'focus', amount: 15 },
          log: 'System rebooted. Waypoint deleted.',
          effects: { experience: 200 },
        },
      ],
      failureOutcome: {
        log: 'The route activates. The autopilot tries to turn the plane on the ground.',
        effects: { credits: -200, suspicion: 10 },
      },
    },
    // A300
    {
      id: 'A300_METAL_FATIGUE',
      type: 'incident',
      title: 'STRUCTURAL CREAK',
      description:
        'The entire airframe creates a low groan when the wind blows. It sounds like weeping.',
      totalTime: 50000,
      choices: [
        {
          id: 'inspect',
          label: 'Inspect Stringers',
          cost: { resource: 'focus', amount: 25 },
          log: 'No cracks found. The metal is just... tired.',
          effects: { experience: 250, sanity: -5 },
        },
      ],
      failureOutcome: {
        log: 'You ignore the sound. It follows you home.',
        effects: { sanity: -10 },
      },
    },
  ],
  eldritch_manifestation: [
    // MD-80
    {
      id: 'MD80_ELECTRICAL_GHOST',
      type: 'eldritch_manifestation',
      title: 'THE GHOST OF TWA',
      description: 'The cockpit displays light up with flight data from a defunct airline.',
      totalTime: 30000,
      choices: [
        {
          id: 'watch',
          label: 'Watch the sequence',
          cost: { resource: 'sanity', amount: 20 },
          log: 'The ghost flight lands safely. The screens go dark.',
          effects: { experience: 500, sanity: -10 },
        },
        {
          id: 'breaker',
          label: 'Pull Battery',
          cost: { resource: 'focus', amount: 10 },
          log: 'You kill the power. The presence fades.',
          effects: { experience: 150 },
        },
      ],
      failureOutcome: {
        log: 'The displays scream. You blackout.',
        effects: { sanity: -30, suspicion: 10 },
      },
    },
    // B737-400
    {
      id: 'B734_STATIC_DISCHARGE',
      type: 'eldritch_manifestation',
      title: 'LIVING STATIC',
      description: 'Ball lightning is rolling down the aisle of the empty plane.',
      totalTime: 25000,
      choices: [
        {
          id: 'ground',
          label: 'Attach Ground Wire',
          cost: { resource: 'focus', amount: 20 },
          log: 'The lightning flows into the earth. The smell of ozone is overwhelming.',
          effects: { experience: 300, alclad: 5 },
        },
      ],
      failureOutcome: {
        log: 'The ball passes through you. You know how you die.',
        effects: { sanity: -50 },
      },
    },
    // B737-700
    {
      id: 'B737_DATA_SURGE',
      type: 'eldritch_manifestation',
      title: 'DATA SURGE',
      description:
        'The datalaoder is uploading a file that is 400TB in size. The drive is only 1GB.',
      totalTime: 40000,
      choices: [
        {
          id: 'allow',
          label: 'Allow Upload',
          cost: { resource: 'sanity', amount: 30 },
          log: 'The upload finishes. The file size is now 0 bytes.',
          effects: { experience: 1000, suspicion: 20 },
        },
        {
          id: 'sever',
          label: 'Cut the Cable',
          cost: { resource: 'focus', amount: 10 },
          log: 'You sever the connection. The cable bleeds.',
          effects: { suspicion: 5 },
        },
      ],
      failureOutcome: {
        log: 'The system crashes. The screen displays your home address.',
        effects: { suspicion: 50, sanity: -20 },
      },
    },
    {
      id: 'B737_MIMIC',
      type: 'eldritch_manifestation',
      title: 'MIMIC',
      description: 'You perform a tap test on the fuselage. The fuselage taps back.',
      totalTime: 30000,
      choices: [
        {
          id: 'communicate',
          label: 'Tap a Rhythm',
          cost: { resource: 'sanity', amount: 20 },
          log: 'It mimics your rhythm perfectly. Then it adds a beat.',
          effects: { experience: 400, sanity: -15 },
        },
      ],
      failureOutcome: {
        log: 'The tapping gets louder. And faster. You run.',
        effects: { sanity: -20 },
      },
    },
    // A330
    {
      id: 'A330_GHOST_CALL',
      type: 'eldritch_manifestation',
      title: 'SATCOM CALL',
      description: 'The SatCom phone rings. It is unplugged.',
      totalTime: 25000,
      choices: [
        {
          id: 'answer',
          label: 'Answer',
          cost: { resource: 'sanity', amount: 25 },
          log: 'It is your voice on the other end. Screaming.',
          effects: { sanity: -30, experience: 500 },
        },
        {
          id: 'ignore',
          label: 'Walk Away',
          cost: { resource: 'focus', amount: 10 },
          log: 'You walk away. The ringing follows you.',
          effects: { sanity: -10 },
        },
      ],
      failureOutcome: {
        log: 'The phone answers itself on speaker. Static fills the cabin.',
        effects: { sanity: -20 },
      },
    },
    {
      id: 'A330_TIME_DILATION',
      type: 'eldritch_manifestation',
      title: 'TIME SKIP',
      description: 'You enter the cockpit. Your watch advances 4 hours instantly.',
      totalTime: 30000,
      choices: [
        {
          id: 'sync',
          label: 'Sync Time',
          cost: { resource: 'sanity', amount: 10 },
          log: 'You reset your watch. You have lost those 4 hours forever.',
          effects: { experience: 100 },
        },
      ],
      failureOutcome: {
        log: 'You leave the cockpit. It is night outside. It was morning a second ago.',
        effects: { sanity: -20 },
      },
    },
    // B777
    {
      id: 'B777_ENGINE_HARMONICS',
      type: 'eldritch_manifestation',
      title: 'GE90 HYPNOSIS',
      description: 'The fan blades are spinning in the wind. Looking at them creates a trance.',
      totalTime: 35000,
      choices: [
        {
          id: 'stare',
          label: 'Gaze into the Void',
          cost: { resource: 'sanity', amount: 30 },
          log: 'You see the patterns in the rotation. They are beautiful.',
          effects: { sanity: -40, experience: 600, focus: 20 },
        },
        {
          id: 'look_away',
          label: 'break',
          cost: { resource: 'focus', amount: 20 },
          log: 'You snap out of it just before you stepped into the intake.',
          effects: { sanity: -10 },
        },
      ],
      failureOutcome: {
        log: 'You wake up hours later sleeping in the intake cowl.',
        effects: { suspicion: 20, sanity: -20 },
      },
    },
    {
      id: 'B777_VOYAGEUR_SIGNAL',
      type: 'eldritch_manifestation',
      title: 'VOYAGEUR SIGNAL',
      description: "The ADF needle swings to a beacon that doesn't exist.",
      totalTime: 30000,
      choices: [
        {
          id: 'track',
          label: 'Triangulate',
          cost: { resource: 'sanity', amount: 15 },
          log: 'The signal is coming from beneath the tarmac.',
          effects: { experience: 300, suspicion: 10 },
        },
      ],
      failureOutcome: {
        log: 'The needle spins wildly then snaps off.',
        effects: { credits: -50 },
      },
    },
    // A300
    {
      id: 'A300_SOMETHING_AWAKE',
      type: 'eldritch_manifestation',
      title: 'IT IS AWAKE',
      description: 'There is something in the cargo hold. It is breathing.',
      totalTime: 20000,
      choices: [
        {
          id: 'run',
          label: 'Seal the Hatch',
          cost: { resource: 'focus', amount: 10 },
          log: 'You slam the hatch and spin the wheel. The breathing stops.',
          effects: { sanity: -10 },
        },
        {
          id: 'feed',
          label: 'Throw in a Sandwich',
          cost: { resource: 'credits', amount: 15 },
          log: 'You toss your lunch in. Chewing sounds ensue.',
          effects: { sanity: 10, experience: 200 },
        },
      ],
      failureOutcome: {
        log: 'You stare into the dark. Two yellow eyes open.',
        effects: { sanity: -50 },
      },
    },
    {
      id: 'A300_MANIFEST_LIE',
      type: 'eldritch_manifestation',
      title: 'MANIFEST ERROR',
      description: 'The manifest lists "Live Animals". The boxes are coffin-sized.',
      totalTime: 30000,
      choices: [
        {
          id: 'ignore',
          label: 'Do Not Ask',
          cost: { resource: 'sanity', amount: 5 },
          log: 'You sign off the load. You hear scratching.',
          effects: { suspicion: -5 },
        },
      ],
      failureOutcome: {
        log: 'You ask the loadmaster. He smiles too wide.',
        effects: { suspicion: 20, sanity: -10 },
      },
    },
  ],
  audit: [
    // B737-700
    {
      id: 'B737_SUIT_INSPECTION',
      type: 'audit',
      suitType: SuitType.CORPORATE,
      title: 'PROJECT AUDIT',
      description: 'Men in unmarked suits are here to check the "Special Modifications".',
      totalTime: 50000,
      choices: [
        {
          id: 'silence',
          label: 'Maintain Silence',
          cost: { resource: 'focus', amount: 30 },
          log: 'You stand at attention. You say nothing. They approve.',
          effects: { suspicion: -10, experience: 300 },
        },
      ],
      failureOutcome: {
        log: 'You ask a question. They mark your file.',
        effects: { suspicion: 30, credits: -500 },
      },
    },
  ],
};
